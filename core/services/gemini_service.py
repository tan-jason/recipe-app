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

    async def cooking_assistant(
        self,
        recipe: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_message: str
    ) -> str:
        """Chat with user about a recipe - for voice cooking assistant"""

        # Format recipe context
        ingredients_text = "\n".join(f"- {ing}" for ing in recipe.get('ingredients', []))
        instructions_text = "\n".join(
            f"{i+1}. {step}" for i, step in enumerate(recipe.get('instructions', []))
        )

        # Format conversation history
        history_text = ""
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                role = "User" if msg['role'] == 'user' else "Assistant"
                history_text += f"{role}: {msg['content']}\n"

        prompt = f"""You are a friendly cooking assistant helping someone cook this recipe.

RECIPE: {recipe.get('title', 'Unknown Recipe')}

INGREDIENTS:
{ingredients_text}

INSTRUCTIONS:
{instructions_text}

COOKING TIME: {recipe.get('cookingTime', 'Unknown')} minutes
SERVINGS: {recipe.get('servings', 'Unknown')}

CONVERSATION SO FAR:
{history_text}

USER'S QUESTION: {user_message}

Respond naturally and helpfully. Keep responses concise (1-3 sentences) since they will be spoken aloud.
If asked about a step, provide clear guidance. If asked about substitutions or techniques, give practical advice.
Be encouraging and friendly."""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[{"parts": [{"text": prompt}]}]
            )
            return response.candidates[0].content.parts[0].text.strip()
        except Exception as e:
            print(f"Error in cooking assistant: {e}")
            return "Sorry, I had trouble understanding. Could you ask that again?"

    async def speech_to_text(self, audio_base64: str, mime_type: str = "audio/wav") -> str:
        """Transcribe audio to text using Google Cloud Speech-to-Text v2 API"""
        from google.cloud.speech_v2 import SpeechClient
        from google.cloud.speech_v2.types import cloud_speech
        import base64

        try:
            client = SpeechClient()

            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_base64)

            # Configure for LINEAR16 WAV audio at 16kHz
            config = cloud_speech.RecognitionConfig(
                explicit_decoding_config=cloud_speech.ExplicitDecodingConfig(
                    encoding=cloud_speech.ExplicitDecodingConfig.AudioEncoding.LINEAR16,
                    sample_rate_hertz=16000,
                    audio_channel_count=1,
                ),
                language_codes=["en-US"],
                model="short",  # Optimized for short audio < 1 min
            )

            # Build the recognizer path
            project_id = settings.GOOGLE_CLOUD_PROJECT
            recognizer = f"projects/{project_id}/locations/global/recognizers/_"

            request = cloud_speech.RecognizeRequest(
                recognizer=recognizer,
                config=config,
                content=audio_bytes,
            )

            response = client.recognize(request=request)

            # Extract transcript
            if response.results:
                transcript = response.results[0].alternatives[0].transcript
                return transcript.strip()

            return ""
        except Exception as e:
            print(f"Error in speech to text: {e}")
            return ""