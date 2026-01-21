from google import genai
from PIL import Image
import json
import base64
from typing import List, Dict, Any
from io import BytesIO

from utils.config import settings
from models.recipe import Recipe, IngredientIdentificationResponse

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model_name = settings.LLM_MODEL

    async def identify_ingredients(self, image_bytes: bytes) -> IngredientIdentificationResponse:
        """Identify ingredients from an uploaded image using Gemini vision capabilities"""

        # Convert bytes to PIL Image
        image = Image.open(BytesIO(image_bytes))

        prompt = """Identify ONLY cooking ingredients visible in this image.

Return JSON Format:
{
    "ingredients": ["tomato", "onion", "garlic"],
    "confidence": 0.8
}

Rules:
- Only list food items suitable for cooking
- Be specific (e.g. "red bell pepper" not "vegetable")
- Ignore: utensils, plates, non-food items

Examples:
✓ ["carrots", "celery", "onions"]
✗ ["kitchen", "cutting board", "bowl"]"""

        try:
            # Convert PIL Image to base64 for the new API
            img_byte_arr = BytesIO()

            # Handle RGBA images (PNG with transparency) by converting to RGB
            if image.mode == 'RGBA':
                # Create white background and paste the RGBA image on top
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
                image = background
            elif image.mode != 'RGB':
                # Convert any other mode to RGB
                image = image.convert('RGB')

            image.save(img_byte_arr, format='JPEG', quality=95)
            img_bytes = img_byte_arr.getvalue()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": img_base64
                                }
                            }
                        ]
                    }
                ]
            )

            # Extract JSON from response
            response_text = response.candidates[0].content.parts[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()

            result = json.loads(response_text)

            return IngredientIdentificationResponse(
                ingredients=result.get("ingredients", []),
                confidence=result.get("confidence", 0.0)
            )
        except Exception as e:
            print(f"Error identifying ingredients: {e}")
            # Fallback response
            return IngredientIdentificationResponse(
                ingredients=["mixed vegetables"],
                confidence=0.1
            )

    async def generate_recipes(
        self,
        ingredients: List[str],
        exclude_titles: List[str] = None
    ) -> List[Recipe]:
        """Generate 5 recipes based on identified ingredients"""

        ingredients_text = ", ".join(ingredients)

        # Build exclusion text if titles provided
        exclusion_text = ""
        if exclude_titles:
            titles_list = "\n".join(f"- {title}" for title in exclude_titles)
            exclusion_text = f"""
IMPORTANT: Do NOT generate any of these recipes (or similar variations):
{titles_list}
"""

        prompt = f"""Generate exactly 5 recipes using: {ingredients_text}
{exclusion_text}
Requirements:
- Use 2-3 main ingredients from the list
- Mix difficulties: 2 Easy, 2 Medium, 1 Hard
- Vary cuisines (Italian, Asian, American, etc.)
- Clear quantities in ingredients
- Step-by-step instructions

JSON format:
[{{"id":"recipe_1","title":"Dish Name","summary":"Brief description","ingredients":["2 cups tomatoes","1 onion chopped"],"instructions":["Heat oil","Add onions","Cook 5 mins"],"cookingTime":25,"servings":4,"difficulty":"Easy","tags":["quick","healthy"]}}]

Return valid JSON array with exactly 5 recipes."""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            )

            response_text = response.candidates[0].content.parts[0].text.strip()

            # Clean JSON response
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()

            recipes_data = json.loads(response_text)

            # Convert to Recipe objects
            recipes = []
            for recipe_data in recipes_data:
                recipe = Recipe(**recipe_data)
                recipes.append(recipe)

            return recipes

        except Exception as e:
            print(f"Error generating recipes: {e}")
            # Return fallback recipes
            return self._get_fallback_recipes(ingredients)

    def _get_fallback_recipes(self, ingredients: List[str]) -> List[Recipe]:
        """Fallback recipes when LLM fails - always return exactly 5 recipes"""
        main_ingredient = ingredients[0] if ingredients else "mixed vegetables"
        second_ingredient = ingredients[1] if len(ingredients) > 1 else "onion"

        return [
            Recipe(
                id="fallback_1",
                title=f"Simple {main_ingredient.title()} Stir Fry",
                summary="Quick and easy stir-fry with available ingredients",
                ingredients=[f"2 cups {main_ingredient}", "1 onion diced", "2 tbsp oil", "salt and pepper to taste"],
                instructions=["Heat oil in large pan", "Add onion, cook 2 mins", f"Add {main_ingredient}", "Stir fry 5-7 minutes", "Season and serve"],
                cookingTime=15,
                servings=4,
                difficulty="Easy",
                tags=["Quick", "Healthy"]
            ),
            Recipe(
                id="fallback_2",
                title=f"Roasted {main_ingredient.title()} and {second_ingredient.title()}",
                summary="Oven-roasted vegetables with herbs",
                ingredients=[f"3 cups {main_ingredient} chopped", f"2 cups {second_ingredient} chopped", "3 tbsp olive oil", "1 tsp dried herbs", "salt and pepper"],
                instructions=["Preheat oven to 400°F", "Toss vegetables with oil and herbs", "Season with salt and pepper", "Roast 25-30 minutes", "Serve hot"],
                cookingTime=35,
                servings=4,
                difficulty="Easy",
                tags=["Roasted", "Healthy"]
            ),
            Recipe(
                id="fallback_3",
                title=f"{main_ingredient.title()} Soup",
                summary="Comforting homemade soup",
                ingredients=[f"3 cups {main_ingredient} chopped", "4 cups vegetable broth", "1 onion diced", "2 cloves garlic minced", "1 tbsp oil"],
                instructions=["Heat oil in pot", "Sauté onion and garlic 3 mins", f"Add {main_ingredient}", "Add broth, bring to boil", "Simmer 20 minutes", "Season to taste"],
                cookingTime=30,
                servings=4,
                difficulty="Medium",
                tags=["Soup", "Comfort"]
            ),
            Recipe(
                id="fallback_4",
                title=f"Grilled {main_ingredient.title()} Salad",
                summary="Fresh salad with grilled vegetables",
                ingredients=[f"2 cups {main_ingredient}", "4 cups mixed greens", "1/4 cup olive oil", "2 tbsp balsamic vinegar", "salt and pepper"],
                instructions=["Grill or sauté vegetables until tender", "Let cool slightly", "Mix greens in large bowl", "Top with grilled vegetables", "Drizzle with oil and vinegar"],
                cookingTime=20,
                servings=4,
                difficulty="Medium",
                tags=["Salad", "Grilled"]
            ),
            Recipe(
                id="fallback_5",
                title=f"Stuffed {main_ingredient.title()} Casserole",
                summary="Hearty baked casserole dish",
                ingredients=[f"4 cups {main_ingredient} chopped", "1 cup rice or quinoa", "2 cups broth", "1 cup cheese shredded", "1 onion diced"],
                instructions=["Preheat oven to 375°F", "Cook rice according to package directions", "Mix all ingredients except cheese", "Transfer to baking dish", "Top with cheese", "Bake 25-30 minutes"],
                cookingTime=45,
                servings=6,
                difficulty="Hard",
                tags=["Casserole", "Baked"]
            )
        ]