from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn
import httpx
from typing import Optional, List
import sys
import os

# Add the core directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.config import settings
from services.gemini_service import GeminiService
from models.recipe import RecipeGenerationResponse, RecipeGenerationRequest

app = FastAPI(
    title="Recipe Generator API",
    description="AI-powered recipe generation from ingredient images",
    version="1.0.0"
)

# Configure CORS for React Native development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize services
gemini_service = GeminiService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Recipe Generator API is running", "version": "1.0.0"}

@app.options("/api/generate-recipes")
async def options_generate_recipes():
    """Handle CORS preflight requests"""
    return {"message": "OK"}

@app.get("/health")
async def health():
    """Detailed health check"""
    try:
        # Validate configuration
        settings.validate()
        return {
            "status": "healthy",
            "model": settings.LLM_MODEL,
            "debug": settings.DEBUG
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.post("/api/generate-recipes", response_model=RecipeGenerationResponse)
async def generate_recipes(
    request: Request,
    image: UploadFile = File(..., description="Image file containing ingredients"),
    exclude_recipe_ids: Optional[str] = Form(default="", description="Comma-separated recipe IDs to exclude")
):
    """
    Generate recipes from an uploaded image of ingredients

    - **image**: Upload an image file (JPEG, PNG) containing ingredients
    - **exclude_recipe_ids**: Optional comma-separated list of recipe IDs to exclude
    """
    try:
        # Validate image file
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read image bytes
        image_bytes = await image.read()

        # Parse exclude IDs
        exclude_ids = []
        if exclude_recipe_ids:
            exclude_ids = [id.strip() for id in exclude_recipe_ids.split(",") if id.strip()]

        # Step 1: Identify ingredients from image
        ingredient_result = await gemini_service.identify_ingredients(image_bytes)

        # Step 2: Generate recipes based on ingredients
        recipes = await gemini_service.generate_recipes(
            ingredients=ingredient_result.ingredients,
            exclude_titles=[]  # Initial generation has no exclusions
        )

        return RecipeGenerationResponse(
            recipes=recipes,
            identifiedIngredients=ingredient_result.ingredients
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_recipes: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/generate-recipes-json")
async def generate_recipes_json(
    request: Request,
    data: dict
):
    """
    Generate recipes from a base64 encoded image (JSON endpoint)

    Expected payload:
    {
        "image": "base64_encoded_image_data",
        "exclude_recipe_ids": ["id1", "id2"]
    }
    """
    try:
        # Extract base64 image data
        image_data = data.get('image', '')
        exclude_ids = data.get('exclude_recipe_ids', [])

        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")

        # Decode base64 image
        import base64
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")

        print(f"Image size: {len(image_bytes)} bytes")
        print(f"Exclude recipe IDs: {exclude_ids}")

        # Step 1: Identify ingredients from image
        ingredient_result = await gemini_service.identify_ingredients(image_bytes)

        if not ingredient_result.ingredients or len(ingredient_result.ingredients) == 0:
            raise HTTPException(
                status_code=400,
                detail="No ingredients detected in the image. Please take a clearer photo of your ingredients."
            )


        # Step 2: Generate recipes based on ingredients
        recipes = await gemini_service.generate_recipes(
            ingredients=ingredient_result.ingredients,
            exclude_titles=[]  # Initial generation has no exclusions
        )

        return RecipeGenerationResponse(
            recipes=recipes,
            identifiedIngredients=ingredient_result.ingredients
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_recipes_json: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/identify-ingredients")
async def identify_ingredients(
    image: UploadFile = File(..., description="Image file containing ingredients")
):
    """
    Identify ingredients from an uploaded image

    - **image**: Upload an image file (JPEG, PNG) containing ingredients
    """
    try:
        # Validate image file
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read image bytes
        image_bytes = await image.read()

        # Identify ingredients
        result = await gemini_service.identify_ingredients(image_bytes)

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in identify_ingredients: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/identify-ingredients-json")
async def identify_ingredients_json(
    request: Request,
    data: dict
):
    """
    Identify ingredients from a base64 encoded image (JSON endpoint)

    Expected payload:
    {
        "image": "base64_encoded_image_data"
    }
    """
    try:
        print("🔥 JSON INGREDIENT IDENTIFICATION ENDPOINT HIT")
        print(f"📱 Request headers: {dict(request.headers)}")
        print(f"🌐 Client host: {request.client.host if request.client else 'N/A'}")
        print(f"📦 Data keys: {list(data.keys())}")

        # Extract base64 image data
        image_data = data.get('image', '')

        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")

        # Decode base64 image
        import base64
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")

        print(f"📷 Image size: {len(image_bytes)} bytes")

        # Identify ingredients from image
        result = await gemini_service.identify_ingredients(image_bytes)

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in identify_ingredients_json: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/regenerate-recipes")
async def regenerate_recipes(data: dict):
    """
    Regenerate recipes from known ingredients (no image processing needed)

    Expected payload:
    {
        "ingredients": ["tomato", "onion", "garlic"],
        "exclude_titles": ["Tomato Soup", "Garlic Bread"]
    }
    """
    try:
        print("🔄 REGENERATE RECIPES ENDPOINT HIT")

        ingredients = data.get('ingredients', [])
        exclude_titles = data.get('exclude_titles', [])

        print(f"🥬 Ingredients: {ingredients}")
        print(f"🚫 Excluding {len(exclude_titles)} recipes")

        if not ingredients:
            raise HTTPException(status_code=400, detail="No ingredients provided")

        recipes = await gemini_service.generate_recipes(
            ingredients=ingredients,
            exclude_titles=exclude_titles
        )

        return {"recipes": recipes}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in regenerate_recipes: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/cooking-assistant")
async def cooking_assistant(data: dict):
    """
    Voice cooking assistant - chat about a recipe

    Payload:
    {
        "recipe": { title, ingredients, instructions, ... },
        "conversation_history": [
            {"role": "user", "content": "What's step one?"},
            {"role": "assistant", "content": "First, bring water to boil..."}
        ],
        "user_message": "How much salt should I add?"
    }
    """
    try:
        recipe = data.get('recipe')
        history = data.get('conversation_history', [])
        user_message = data.get('user_message', '')

        print(f"USER MESSAGE {user_message}")

        if not recipe:
            raise HTTPException(status_code=400, detail="Recipe is required")
        if not user_message:
            raise HTTPException(status_code=400, detail="User message is required")

        response = await gemini_service.cooking_assistant(
            recipe=recipe,
            conversation_history=history,
            user_message=user_message
        )

        return {"response": response}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in cooking_assistant: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/text-to-speech")
async def text_to_speech(data: dict):
    """
    Convert text to speech using ElevenLabs API

    Payload:
    {
        "text": "Hello, how can I help you today?"
    }

    Returns: MP3 audio data
    """
    try:
        text = data.get('text', '')

        print("BOT RESPONSE", text)
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        if not settings.ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        voice_id = settings.ELEVENLABS_VOICE_ID
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": settings.ELEVENLABS_API_KEY,
        }

        payload = {
            "text": text,
            "model_id": "eleven_flash_v2_5",
            "voice_settings": {
                "stability": 0.8,
                "similarity_boost": 0.9,
                "style": 0.5,
                "speed": 1.1,
                "use_speaker_boost": True,
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)

            if response.status_code != 200:
                print(f"ElevenLabs API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"ElevenLabs API error: {response.text}"
                )

            return Response(
                content=response.content,
                media_type="audio/mpeg",
                headers={"Content-Disposition": "inline; filename=speech.mp3"}
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/speech-to-text")
async def speech_to_text(data: dict):
    """
    Convert speech to text using Gemini's audio capabilities

    Payload:
    {
        "audio": "base64_encoded_audio_data",
        "mime_type": "audio/wav"  // optional, defaults to audio/wav
    }

    Returns: { "transcript": "transcribed text" }
    """
    try:
        audio_data = data.get('audio', '')
        mime_type = data.get('mime_type', 'audio/wav')

        if not audio_data:
            raise HTTPException(status_code=400, detail="Audio data is required")

        import time
        start_time = time.time()
        transcript = await gemini_service.speech_to_text(audio_data, mime_type)
        print(f"STT TIME {time.time() - start_time}")

        return {"transcript": transcript}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in speech_to_text: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )