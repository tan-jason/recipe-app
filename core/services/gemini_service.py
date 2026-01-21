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

        prompt = """
        Analyze this image and identify all visible food ingredients.
        Return a JSON object with the following structure:
        {
            "ingredients": ["ingredient1", "ingredient2", ...],
            "confidence": 0.95
        }

        Focus only on ingredients that can be used for cooking. Be specific but concise.
        If you can't clearly identify ingredients, set confidence lower.
        """

        try:
            # Convert PIL Image to base64 for the new API
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='JPEG')
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
        exclude_recipe_ids: List[str] = None
    ) -> List[Recipe]:
        """Generate 5 recipes based on identified ingredients"""

        exclude_ids = exclude_recipe_ids or []
        ingredients_text = ", ".join(ingredients)

        prompt = f"""
        Generate exactly 5 unique recipes using these ingredients: {ingredients_text}

        Requirements:
        - Each recipe must use at least 2-3 of the provided ingredients
        - Provide complete recipes with all required fields
        - Make recipes practical and achievable
        - Vary difficulty levels (mix of Easy, Medium, Hard)
        - Include diverse cuisine types

        {"Exclude any recipes similar to these IDs: " + ", ".join(exclude_ids) if exclude_ids else ""}

        Return a JSON array with this exact structure:
        [
            {{
                "id": "unique_recipe_id_1",
                "title": "Recipe Name",
                "summary": "Brief description of the dish",
                "ingredients": ["ingredient with quantity", "another ingredient"],
                "instructions": ["Step 1", "Step 2", "Step 3"],
                "cookingTime": 30,
                "servings": 4,
                "difficulty": "Easy",
                "tags": ["tag1", "tag2"]
            }}
        ]

        Ensure ingredients include quantities and instructions are clear step-by-step directions.
        """

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
        """Fallback recipes when LLM fails"""
        return [
            Recipe(
                id="fallback_1",
                title=f"Simple {ingredients[0] if ingredients else 'Vegetable'} Stir Fry",
                summary="Quick and easy stir-fry with available ingredients",
                ingredients=[f"2 cups {ingredients[0] if ingredients else 'mixed vegetables'}", "2 tbsp oil", "salt and pepper"],
                instructions=["Heat oil in pan", "Add ingredients", "Stir fry for 5-7 minutes", "Season and serve"],
                cookingTime=15,
                servings=2,
                difficulty="Easy",
                tags=["Quick", "Easy"]
            )
        ]