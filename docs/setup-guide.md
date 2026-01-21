# Setup and Development Guide

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - Install via npm: `npm install -g @expo/cli`
- **iOS Development**:
  - **Xcode** (latest version from Mac App Store)
  - **iOS Simulator** (included with Xcode)
- **Optional**: Physical iOS device for testing

### Accounts Setup
- **Expo Account** - [Sign up at expo.dev](https://expo.dev/)
- **Apple Developer Account** (for deployment) - [Sign up here](https://developer.apple.com/)

## Project Initialization

### 1. Create New Expo Project
```bash
# Navigate to your development folder
cd /path/to/your/projects

# Create new Expo app with TypeScript template
npx create-expo-app recipe-app --template blank-typescript

# Navigate to project directory
cd recipe-app
```

### 2. Install Required Dependencies
```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Expo specific packages
npx expo install expo-camera expo-image-picker expo-media-library
npx expo install expo-file-system expo-sharing

# UI and utilities
npm install react-native-elements react-native-vector-icons
npm install @types/react-native-vector-icons --save-dev

# State management (choose one)
npm install @reduxjs/toolkit react-redux  # OR
npm install zustand  # Simpler alternative

# HTTP client
npm install axios

# Development dependencies
npm install --save-dev @types/react @types/react-native
```

### 3. Configure Expo App
Update `app.json`:
```json
{
  "expo": {
    "name": "Recipe App",
    "slug": "recipe-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.recipeapp",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to capture images of ingredients for recipe suggestions.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photo library to select images of ingredients for recipe suggestions."
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Recipe App to access your camera to capture ingredient photos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Recipe App to access your photos to select ingredient images."
        }
      ]
    ]
  }
}
```

## Development Workflow

### 1. Start Development Server
```bash
# Start Expo development server
npx expo start

# Or for iOS simulator specifically
npx expo start --ios
```

### 2. Code Organization
Create the following folder structure:
```bash
mkdir -p src/{components,screens,services,types,navigation,utils}
mkdir -p assets/{images,icons}
```

### 3. Environment Setup
Create `.env` file in project root:
```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=10000

# Development flags
EXPO_PUBLIC_DEBUG_MODE=true
```

### 4. TypeScript Configuration
Update `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/screens/*": ["src/screens/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

## Backend Setup (Optional for Initial Development)

### 1. Create Backend Project
```bash
# In separate terminal/directory
mkdir recipe-app-backend
cd recipe-app-backend

# Initialize Node.js project
npm init -y

# Install backend dependencies
npm install express cors dotenv multer sharp
npm install @types/express @types/cors @types/multer --save-dev
npm install typescript ts-node nodemon --save-dev

# Create TypeScript config
npx tsc --init
```

### 2. Mock API for Development
Create simple mock endpoints:
```typescript
// server.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock recipe generation endpoint
app.post('/api/recipes/generate', (req, res) => {
  // Return mock recipes
  res.json({ recipes: mockRecipes });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Testing Setup

### 1. Install Testing Dependencies
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev @types/jest
```

### 2. Configure Jest
Update `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"]
  }
}
```

## Build and Preview

### 1. Development Build
```bash
# Create development build
npx expo build:ios --type simulator

# Or for device testing
npx expo build:ios --type archive
```

### 2. EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create preview build
eas build --platform ios --profile preview
```

## Troubleshooting

### Common Issues

#### Expo CLI Issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache
```

#### iOS Simulator Issues
```bash
# Reset iOS Simulator
xcrun simctl erase all

# Open iOS Simulator manually
open -a Simulator
```

#### Permission Issues
- Ensure camera and photo permissions are properly configured in `app.json`
- Test permissions on physical device, not just simulator

### Development Tips

1. **Use Expo Go App**: Install on your phone for quick testing
2. **Hot Reload**: Enable for faster development iteration
3. **Flipper Integration**: For advanced debugging
4. **EAS Update**: For over-the-air updates during development

## Next Steps

1. Set up the basic project structure
2. Implement camera functionality
3. Create mock recipe data
4. Build the main screen UI
5. Add navigation between screens
6. Integrate with backend API
7. Add error handling and loading states
8. Test on physical devices
9. Prepare for deployment