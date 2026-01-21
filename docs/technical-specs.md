# Technical Specifications

## Frontend (React Native/Expo)

### Technology Stack
- **Framework**: Expo SDK (latest stable version)
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context or Redux Toolkit
- **UI Library**: React Native Elements or NativeBase
- **Camera**: expo-camera
- **Image Picker**: expo-image-picker

### Screen Components

#### 1. Main Screen (`HomeScreen`)
```typescript
interface HomeScreenProps {
  onImageCapture: (imageUri: string) => void;
  onRefresh: () => void;
  recipes: Recipe[];
  loading: boolean;
}
```

**Features:**
- Camera button for taking photos
- Gallery button for uploading from device
- Recipe list component
- Refresh button
- Loading states

#### 2. Recipe Detail Screen (`RecipeDetailScreen`)
```typescript
interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
}
```

**Features:**
- Full recipe display
- Ingredients list
- Instructions
- Back navigation

### Data Models

#### Recipe Interface
```typescript
interface Recipe {
  id: string;
  title: string;
  summary: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl?: string;
}
```

#### Image Processing
```typescript
interface ImageData {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}
```

## Backend API

### Technology Stack
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Image Processing**: Sharp or similar
- **AI Integration**: OpenAI API or similar

### API Endpoints

#### POST `/api/recipes/generate`
```typescript
interface GenerateRecipesRequest {
  imageData: string; // base64 encoded image
  excludeRecipeIds?: string[]; // for refresh functionality
}

interface GenerateRecipesResponse {
  recipes: Recipe[];
  identifiedIngredients: string[];
}
```

#### POST `/api/ingredients/identify`
```typescript
interface IdentifyIngredientsRequest {
  imageData: string;
}

interface IdentifyIngredientsResponse {
  ingredients: string[];
  confidence: number;
}
```

## File Structure

### Frontend Structure
```
src/
├── components/
│   ├── RecipeCard.tsx
│   ├── RecipeList.tsx
│   ├── CameraButton.tsx
│   └── LoadingSpinner.tsx
├── screens/
│   ├── HomeScreen.tsx
│   └── RecipeDetailScreen.tsx
├── services/
│   ├── api.ts
│   ├── camera.ts
│   └── imageProcessor.ts
├── types/
│   └── index.ts
├── navigation/
│   └── AppNavigator.tsx
├── utils/
│   └── helpers.ts
└── App.tsx
```

### Backend Structure
```
src/
├── controllers/
│   ├── recipeController.ts
│   └── ingredientController.ts
├── services/
│   ├── aiService.ts
│   ├── imageService.ts
│   └── recipeService.ts
├── models/
│   └── Recipe.ts
├── middleware/
│   └── validation.ts
├── routes/
│   └── api.ts
└── server.ts
```

## Performance Requirements

### Frontend
- App startup time: < 3 seconds
- Image capture: < 1 second response
- Recipe generation: < 10 seconds (with loading indicator)
- Smooth 60 FPS navigation transitions

### Backend
- Image processing: < 5 seconds
- Recipe generation: < 8 seconds
- API response time: < 2 seconds
- Concurrent users: 100+ simultaneous requests

## Security Considerations

### Image Handling
- Image size limits (max 10MB)
- File type validation (JPEG, PNG only)
- Base64 encoding for transmission
- Temporary storage with automatic cleanup

### API Security
- Rate limiting per device/IP
- Input validation and sanitization
- CORS configuration
- API key authentication for AI services

## Development Environment

### Required Tools
- Node.js (v18+)
- Expo CLI
- iOS Simulator / Physical iOS device
- TypeScript
- Git

### Environment Variables
```bash
# Backend
OPENAI_API_KEY=your_key_here
PORT=3000
NODE_ENV=development

# Frontend
EXPO_PUBLIC_API_URL=http://localhost:3000
```