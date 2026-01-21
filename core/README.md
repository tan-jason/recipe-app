# Recipe Generator API

Python FastAPI service for AI-powered recipe generation using Google's Gemini Pro model with the modern google-genai library.

## Features

- 🖼️ **Image Analysis**: Identify ingredients from photos using Gemini vision capabilities
- 🍳 **Recipe Generation**: Generate 5 unique recipes based on identified ingredients
- 🔄 **Refresh Functionality**: Exclude previous recipes when generating new ones
- 🚀 **FastAPI**: Modern, fast API with automatic documentation
- 🧪 **Type Safety**: Fully typed with Pydantic models

## Setup

1. **Install Dependencies**
```bash
cd core
pip install -r requirements.txt
```

> **Note**: This project uses the modern `google-genai` library instead of the deprecated `google-generativeai` package for better performance and latest features.

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your Google API key
```

3. **Get Google API Key**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key for Gemini
- Add it to your `.env` file

## Running the Server

```bash
cd core/app
python main.py
```

Server will start on `http://localhost:8000`

## API Endpoints

### 🏥 Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### 🖼️ Image Processing
- `POST /api/identify-ingredients` - Identify ingredients from image
- `POST /api/generate-recipes` - Generate recipes from ingredient image

### 📚 Documentation
- `GET /docs` - Interactive Swagger UI
- `GET /redoc` - ReDoc documentation

## API Usage

### Generate Recipes
```bash
curl -X POST "http://localhost:8000/api/generate-recipes" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@ingredients.jpg" \
  -F "exclude_recipe_ids=recipe_1,recipe_2"
```

### Response Format
```json
{
  "recipes": [
    {
      "id": "recipe_1",
      "title": "Tomato Basil Pasta",
      "summary": "Classic Italian pasta with fresh ingredients",
      "ingredients": ["400g pasta", "3 tomatoes", "fresh basil"],
      "instructions": ["Boil pasta", "Prepare sauce", "Combine and serve"],
      "cookingTime": 25,
      "servings": 4,
      "difficulty": "Easy",
      "tags": ["Italian", "Quick"]
    }
  ],
  "identifiedIngredients": ["tomatoes", "basil", "pasta"]
}
```

## Project Structure

```
core/
├── app/
│   └── main.py              # FastAPI application
├── models/
│   └── recipe.py            # Pydantic data models
├── services/
│   └── gemini_service.py    # Gemini AI integration
├── utils/
│   └── config.py            # Configuration management
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google AI API key (required) | - |
| `LLM_MODEL` | Gemini model to use | `gemini-1.5-pro-latest` |
| `API_HOST` | Server host | `0.0.0.0` |
| `API_PORT` | Server port | `8000` |
| `DEBUG` | Enable debug mode | `True` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

## Error Handling

The API includes comprehensive error handling:
- Image validation (file type, size)
- Graceful LLM failures with fallback responses
- Structured error responses with proper HTTP status codes

## Next Steps

- [ ] Add image preprocessing and optimization
- [ ] Implement caching for repeated requests
- [ ] Add recipe difficulty scoring
- [ ] Include nutritional information
- [ ] Add user preferences and dietary restrictions