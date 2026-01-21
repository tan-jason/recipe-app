# Recipe Generator API - Backend

FastAPI-powered backend service that uses Google Gemini AI to generate personalized recipes from ingredient photos.

## 🚀 Quick Start

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Google API key

# Run development server
python run.py
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## 🔑 Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Model Configuration
LLM_MODEL=gemini-3-flash-preview

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,exp://192.168.1.100:8081
```

### Getting Google API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

## 🏗 Architecture

### Tech Stack
- **FastAPI** - Modern Python web framework
- **Google Gemini AI** - Vision and text generation
- **Pydantic** - Data validation and serialization
- **PIL (Pillow)** - Image processing
- **Uvicorn** - ASGI web server

### Project Structure
```
core/
├── app/
│   └── main.py           # FastAPI application and routes
├── services/
│   └── gemini_service.py # Google Gemini AI integration
├── models/
│   └── recipe.py         # Pydantic data models
├── utils/
│   └── config.py         # Configuration management
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
└── run.py               # Development server entry point
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```
Returns API health status and configuration info.

### Recipe Generation (JSON)
```http
POST /api/generate-recipes-json
Content-Type: application/json

{
  "image": "base64_encoded_image_data",
  "exclude_recipe_ids": ["recipe_1", "recipe_2"]
}
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "recipe_1",
      "title": "Sesame Ginger Tofu & Mushroom Stir-Fry",
      "summary": "A quick and savory weeknight stir-fry...",
      "ingredients": [
        "14 oz block extra firm tofu, pressed and cubed",
        "8 oz sliced cremini mushrooms"
      ],
      "instructions": [
        "Toss the cubed tofu in cornstarch until lightly coated",
        "Heat vegetable oil in a large wok..."
      ],
      "cookingTime": 20,
      "servings": 2,
      "difficulty": "Easy",
      "tags": ["Asian", "Dairy-Free", "Quick"]
    }
  ],
  "identifiedIngredients": ["tofu", "cremini mushrooms", "ginger"]
}
```

### Legacy File Upload Endpoint
```http
POST /api/generate-recipes
Content-Type: multipart/form-data

image: [image file]
exclude_recipe_ids: "recipe_1,recipe_2"
```

## 🤖 AI Integration

### Gemini Service Architecture

The `GeminiService` class handles all AI interactions:

1. **Ingredient Identification**
   - Processes uploaded images using Gemini Vision
   - Identifies food ingredients with confidence scoring
   - Filters out non-food items and kitchen utensils

2. **Recipe Generation**
   - Generates exactly 5 recipes using identified ingredients
   - Ensures variety in difficulty levels (2 Easy, 2 Medium, 1 Hard)
   - Includes diverse cuisine types and cooking methods
   - Excludes previously generated recipes when requested

### Prompt Engineering

#### Ingredient Identification Prompt
```
Identify ONLY cooking ingredients visible in this image.

Return JSON:
{
    "ingredients": ["tomato", "onion", "garlic"],
    "confidence": 0.8
}

Rules:
- Only list food items suitable for cooking
- Be specific (e.g. "red bell pepper" not "vegetable")
- If no clear food ingredients visible, return empty array with confidence < 0.3
```

#### Recipe Generation Prompt
```
Generate exactly 5 recipes using: [ingredients]

Requirements:
- Use 2-3 main ingredients from the list
- Mix difficulties: 2 Easy, 2 Medium, 1 Hard
- Vary cuisines (Italian, Asian, American, etc.)
- Clear quantities in ingredients
- Step-by-step instructions

JSON format: [recipe schema example]
```

### Image Processing

- **Format Support**: JPEG, PNG, HEIC
- **Size Limits**: Up to 10MB per image
- **Preprocessing**: RGBA→RGB conversion for JPEG compatibility
- **Encoding**: Base64 for JSON API transmission

## 🔧 Configuration Management

### Settings Class
The `Settings` class in `utils/config.py` manages all configuration:

```python
class Settings:
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3-flash-preview")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
```

### Model Configuration
Currently supports:
- `gemini-3-flash-preview` (recommended for 2026)
- `gemini-1.5-pro-latest` (fallback)

## 📝 Data Models

### Recipe Model
```python
class Recipe(BaseModel):
    id: str = Field(..., description="Unique identifier for the recipe")
    title: str = Field(..., description="Recipe name/title")
    summary: str = Field(..., description="Brief description")
    ingredients: List[str] = Field(..., description="Ingredients with quantities")
    instructions: List[str] = Field(..., description="Step-by-step instructions")
    cookingTime: int = Field(..., description="Total cooking time in minutes")
    servings: int = Field(..., description="Number of servings")
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(..., description="Difficulty level")
    tags: Optional[List[str]] = Field(default=[], description="Recipe categories/tags")
```

### Response Models
```python
class RecipeGenerationResponse(BaseModel):
    recipes: List[Recipe] = Field(..., description="Generated recipes")
    identifiedIngredients: List[str] = Field(..., description="Identified ingredients")

class IngredientIdentificationResponse(BaseModel):
    ingredients: List[str] = Field(..., description="List of identified ingredients")
    confidence: float = Field(..., description="Confidence score")
```

## ⚡ Performance Optimizations

### Token Efficiency
- **Compact prompts**: Reduced token usage by ~30%
- **Structured outputs**: Clear JSON schema examples
- **Example-driven**: Concrete examples to reduce hallucination

### Fallback System
When AI generation fails, the system provides 5 diverse fallback recipes:
- Stir-fry (Easy)
- Roasted vegetables (Easy)
- Soup (Medium)
- Salad (Medium)
- Casserole (Hard)

### Error Handling
- **Image processing errors**: RGBA format handling
- **API timeouts**: Graceful degradation
- **Invalid responses**: JSON parsing with fallbacks
- **Rate limiting**: Built-in Google API handling

## 🔒 Security Features

### CORS Configuration
- Configurable allowed origins
- Development and production settings
- Mobile app support (exp:// protocol)

### Input Validation
- Image format validation
- File size limits
- Request payload validation with Pydantic

### Error Sanitization
- No sensitive data in error responses
- Generic error messages for production
- Detailed logging for debugging

## 📊 Monitoring & Logging

### Debug Mode
Enable detailed logging with `DEBUG=True`:
- Request/response logging
- Image processing details
- AI model responses
- Performance metrics

### Health Monitoring
The `/health` endpoint provides:
- Service status
- Model configuration
- Environment info
- Configuration validation

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production with Gunicorn
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
```env
GOOGLE_API_KEY=your_production_api_key
LLM_MODEL=gemini-3-flash-preview
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
ALLOWED_ORIGINS=https://your-app-domain.com
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Recipe generation with base64 image
curl -X POST "http://localhost:8000/api/generate-recipes-json" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image", "exclude_recipe_ids": []}'
```

### Load Testing
- Test with various image sizes and formats
- Verify timeout handling (120 second limit)
- Monitor memory usage with large images

## 📋 Requirements

- Python 3.11+
- Google API key with Gemini access
- 512MB+ RAM for image processing
- 1GB+ storage for dependencies

## 🚨 Common Issues

### "Model not found" Error
- Verify `LLM_MODEL` name in `.env`
- Check Google API key permissions
- Try fallback model: `gemini-1.5-pro-latest`

### Image Processing Errors
- Ensure PIL/Pillow is properly installed
- Check image file format support
- Verify image size limits (10MB max)

### CORS Issues
- Add your client URL to `ALLOWED_ORIGINS`
- Include port numbers for development
- Use `exp://` protocol for Expo apps

## 📚 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These provide complete API schemas, example requests, and testing interfaces.