# Recipe Generator App

🍽️ AI-powered recipe generation app that creates personalized recipes from photos of ingredients using Google Gemini AI.

## 📱 Features

- **📷 Smart Ingredient Recognition**: Take photos of ingredients and get AI-powered identification
- **🤖 AI Recipe Generation**: Generate 5 personalized recipes instantly
- **📖 Detailed Recipes**: Complete recipes with ingredients, instructions, cooking time, and difficulty
- **🔄 Recipe Refresh**: Generate new recipes using the same ingredients
- **📱 Cross-Platform**: React Native app for iOS and Android
- **⚡ Fast API**: Optimized FastAPI backend with Google Gemini integration

## 🏗 Architecture

This is a full-stack application with two main components:

### Frontend (`/client`)
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Camera** for photo capture
- Native mobile app for iOS and Android

### Backend (`/core`)
- **FastAPI** Python web framework
- **Google Gemini AI** for vision and text generation
- **Pydantic** for data validation
- RESTful API with automatic documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.11+
- Google API key ([Get one here](https://makersuite.google.com/app/apikey))
- iOS Simulator or Android Emulator (for mobile development)

### 1. Backend Setup

```bash
cd core

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Run backend server
python run.py
```

The API will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS/Android
npx expo run:ios
npx expo run:android
```

## 📡 API Endpoints

### Health Check
```http
GET http://localhost:8000/health
```

### Generate Recipes
```http
POST http://localhost:8000/api/generate-recipes-json
Content-Type: application/json

{
  "image": "base64_encoded_image_data",
  "exclude_recipe_ids": ["recipe_1"]
}
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "recipe_1",
      "title": "Sesame Ginger Tofu Stir-Fry",
      "summary": "Quick and savory stir-fry...",
      "ingredients": ["14 oz tofu", "8 oz mushrooms"],
      "instructions": ["Heat oil", "Add ingredients"],
      "cookingTime": 20,
      "servings": 2,
      "difficulty": "Easy",
      "tags": ["Asian", "Quick"]
    }
  ],
  "identifiedIngredients": ["tofu", "mushrooms"]
}
```

## 🔧 Configuration

### Backend Configuration
Edit `/core/.env`:

```env
GOOGLE_API_KEY=your_google_api_key_here
LLM_MODEL=gemini-3-flash-preview
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,exp://192.168.1.100:8081
```

### Frontend Configuration
Edit `/client/services/config.ts`:

```typescript
export const apiConfig = {
  baseURL: 'http://localhost:8000', // Backend URL
  timeout: 120000, // 2 minutes for image processing
};
```

## 📱 Mobile App Features

### Camera Integration
- Built-in camera interface
- Gallery photo selection
- Automatic image optimization
- Base64 encoding for API transmission

### Recipe Display
- Grid layout with recipe cards
- Detailed recipe views with ingredients and instructions
- Cooking time, servings, and difficulty indicators
- Tag-based categorization

### Navigation
- File-based routing with Expo Router
- Smooth transitions between screens
- Back button and navigation controls

## 🤖 AI Integration

### Ingredient Identification
- Gemini Vision API for image analysis
- Confidence scoring for ingredient recognition
- Filtering of non-food items
- Specific ingredient naming (e.g., "cremini mushrooms" not "mushrooms")

### Recipe Generation
- Exactly 5 recipes per request
- Difficulty variety (2 Easy, 2 Medium, 1 Hard)
- Diverse cuisines (Italian, Asian, American, etc.)
- Complete recipes with measured ingredients
- Step-by-step cooking instructions

### Prompt Engineering
- Optimized prompts for token efficiency
- Structured JSON outputs
- Example-driven responses
- Error handling with fallback recipes

## 🎨 User Interface

### Design System
- Clean, modern interface
- Consistent typography and spacing
- Platform-specific styling (iOS/Android)
- Responsive layouts for different screen sizes

### User Experience
- Intuitive camera-first workflow
- Loading states with progress indicators
- Error handling with helpful messages
- Smooth animations and transitions

## 🔒 Security Features

### Backend Security
- Input validation with Pydantic
- CORS configuration for mobile apps
- Environment variable management
- Error sanitization

### Data Privacy
- No recipe data storage
- Temporary image processing
- No user tracking
- API key protection

## 📊 Performance

### Optimizations
- ~30% token reduction in AI prompts
- Base64 image encoding for mobile compatibility
- Efficient JSON API design
- Optimized image processing (RGBA→RGB conversion)

### Response Times
- Ingredient identification: ~2-5 seconds
- Recipe generation: ~5-15 seconds
- Total processing: ~10-20 seconds
- API timeout: 120 seconds

## 🧪 Testing

### Backend Testing
```bash
cd core

# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs
```

### Frontend Testing
- Test on iOS Simulator and Android Emulator
- Real device testing for camera functionality
- Network connectivity testing
- Error scenario testing

## 🚀 Deployment

### Backend Deployment
- Docker containerization support
- Gunicorn for production WSGI
- Environment-specific configuration
- Health monitoring endpoints

### Frontend Deployment
- Expo EAS Build for app stores
- Over-the-air updates
- Platform-specific builds
- Development and production variants

## 📚 Documentation

- **Frontend**: [`/client/README.md`](./client/README.md) - React Native app documentation
- **Backend**: [`/core/README.md`](./core/README.md) - FastAPI server documentation
- **API Docs**: `http://localhost:8000/docs` - Interactive API documentation

## 🐛 Troubleshooting

### Common Issues

**"Model not found" Error**
- Check Google API key in `/core/.env`
- Verify model name: `gemini-3-flash-preview`
- Ensure API key has Gemini access

**Camera Not Working**
- Check device permissions for camera access
- Test on physical device (camera doesn't work in all simulators)
- Verify Expo Camera installation

**API Connection Failed**
- Ensure backend is running on `localhost:8000`
- Check CORS configuration for mobile app URLs
- Verify network connectivity

**Image Processing Errors**
- Check image format (JPEG, PNG supported)
- Verify image size (under 10MB)
- Test with different images

## 📈 Roadmap

- [ ] User accounts and recipe saving
- [ ] Recipe sharing and social features
- [ ] Dietary restrictions and preferences
- [ ] Nutritional information
- [ ] Shopping list generation
- [ ] Recipe rating and reviews
- [ ] Offline recipe storage
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for vision and text generation capabilities
- **Expo** for React Native development tools
- **FastAPI** for the excellent Python web framework
- **React Native** community for mobile development resources

---

**Built with ❤️ using React Native, FastAPI, and Google Gemini AI**