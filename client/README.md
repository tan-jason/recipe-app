# Recipe Generator App - Frontend

AI-powered recipe generation app built with React Native and Expo. Take a photo of ingredients and get personalized recipes instantly.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## 📱 Features

- **AI Recipe Generation**: Take photos of ingredients and get 5 personalized recipes
- **Ingredient Recognition**: Automatically identifies food ingredients from photos
- **Recipe Details**: Complete recipes with ingredients, instructions, cooking time, and difficulty
- **Camera Integration**: Built-in camera with image capture and gallery selection
- **Responsive Design**: Optimized for both iOS and Android devices
- **Error Handling**: Graceful error handling with user-friendly messages

## 🏗 Architecture

### Tech Stack
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for file-based routing
- **Expo Camera** for photo capture
- **Axios** for API communication

### Project Structure
```
client/
├── app/                    # App screens (Expo Router)
│   ├── index.tsx          # Main camera screen
│   ├── generated-recipes.tsx  # Recipe results screen
│   ├── recipe-detail.tsx  # Individual recipe view
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── recipe/
│       └── RecipeCard.tsx # Recipe card component
├── services/             # API and external services
│   ├── recipeService.ts  # Recipe API client
│   ├── apiClient.ts      # HTTP client wrapper
│   └── config.ts         # API configuration
└── types/                # TypeScript type definitions
    └── recipe.ts         # Recipe data types
```

## 🔌 API Integration

### Recipe Service
The app communicates with a FastAPI backend for recipe generation:

```typescript
// Generate recipes from ingredient photo
const response = await recipeService.generateRecipes({
  imageUri: 'file://path/to/image.jpg',
  excludeRecipeIds: ['recipe_1'] // Optional
});
```

### API Configuration
Configure the backend URL in `services/config.ts`:

```typescript
export const apiConfig = {
  baseURL: 'http://localhost:8000', // Development
  timeout: 120000, // 2 minutes for image processing
};
```

## 📸 Camera Features

### Image Capture
- Built-in camera interface with capture button
- Gallery selection for existing photos
- Automatic image optimization for API processing

### Image Processing
- Converts images to base64 for JSON API transmission
- Handles various image formats (JPEG, PNG, HEIC)
- Proper error handling for invalid images

## 📱 Screen Flow

1. **Camera Screen** (`index.tsx`)
   - Take photo or select from gallery
   - Shows loading state during API call
   - Navigates to results on success

2. **Generated Recipes** (`generated-recipes.tsx`)
   - Displays 5 AI-generated recipes
   - Recipe cards with title, summary, and metadata
   - Refresh button for new recipes

3. **Recipe Detail** (`recipe-detail.tsx`)
   - Complete recipe view with ingredients and instructions
   - Cooking time, servings, and difficulty level
   - Step-by-step instructions with numbering

## 🎨 UI Components

### RecipeCard
Reusable recipe card component with:
- Recipe title and summary
- Cooking time and difficulty badges
- Touch interaction for navigation

### Styling
- Consistent design system with custom StyleSheet
- Responsive layouts for different screen sizes
- iOS and Android platform-specific styling

## 🔧 Configuration

### Environment Setup
1. Install Expo CLI: `npm install -g @expo/cli`
2. Install dependencies: `npm install`
3. Configure backend URL in `services/config.ts`

### Development
```bash
# Start with specific platform
npx expo start --ios
npx expo start --android

# Clear cache if needed
npx expo start --clear
```

### Building for Production
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## 🐛 Error Handling

### API Errors
- Network connectivity issues
- Backend server errors
- Invalid image format handling
- Timeout handling for long requests

### User Experience
- Loading states with progress indicators
- Clear error messages with retry options
- Graceful fallbacks for failed operations

## 📝 Type Safety

The app uses TypeScript throughout with defined interfaces:

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
  tags?: string[];
}
```

## 🔄 State Management

### Local State
- React hooks (useState, useEffect) for component state
- Navigation parameters for data passing between screens
- Local storage for app preferences

### Data Flow
1. Camera captures image
2. Image sent to API via recipeService
3. Response parsed and stored in component state
4. Recipe data passed between screens via navigation params

## 🧪 Testing

### Development Testing
- Test on iOS simulator and Android emulator
- Real device testing for camera functionality
- API integration testing with backend

### Key Test Cases
- Camera permission handling
- Image capture and processing
- API error scenarios
- Navigation between screens
- Recipe data display

## 📱 Platform-Specific Notes

### iOS
- Camera permissions handled automatically
- Optimized for iPhone and iPad layouts
- Native navigation feel with iOS styling

### Android
- Camera permissions requested at runtime
- Material Design components
- Back button handling

## 🚀 Deployment

### Development
- Expo development builds for testing
- Hot reloading for rapid development

### Production
- EAS Build for app store deployment
- Environment-specific configurations
- Over-the-air updates capability

## 📋 Requirements

- Node.js 16+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Physical device with camera (recommended for testing)