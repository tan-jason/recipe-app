# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack mobile app that uses Google Gemini AI to generate recipes from photos of ingredients. React Native frontend (Expo) + Python FastAPI backend.

## Commands

### Backend (core/)

```bash
cd core
source .venv/bin/activate      # Activate Python venv (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
python run.py                   # Start server on port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend (client/)

```bash
cd client
npm install
npx expo start                  # Start dev server
npx expo run:ios                # Run on iOS simulator
npx expo run:android            # Run on Android emulator
npm run lint                    # Run ESLint
```

## Architecture

```
recipe-app/
├── client/                     # React Native + Expo frontend
│   ├── app/                    # Expo Router screens (file-based routing)
│   │   ├── index.tsx          # Camera/home screen
│   │   ├── generated-recipes.tsx
│   │   └── recipe-detail.tsx
│   ├── services/              # API communication (Axios)
│   │   ├── recipeService.ts   # Recipe API calls
│   │   ├── apiClient.ts       # HTTP client
│   │   └── config.ts          # API URL config
│   ├── components/            # Reusable UI components
│   └── types/                 # TypeScript interfaces
│
└── core/                       # FastAPI backend
    ├── app/main.py            # FastAPI app, all routes
    ├── services/gemini_service.py  # Gemini AI integration
    ├── models/recipe.py       # Pydantic models
    └── utils/config.py        # Settings from .env
```

## Key Patterns

- **Frontend routing**: File-based via Expo Router in `app/` directory
- **API calls**: Service layer pattern - all API logic in `client/services/`
- **Backend**: Single FastAPI app in `core/app/main.py` with service layer for Gemini
- **Data flow**: Image capture → Base64 encode → POST to `/api/generate-recipes-json` → JSON response with recipes
- **State**: React hooks (useState/useEffect), data passed between screens via route params

## API Endpoints

- `GET /health` - Health check
- `POST /api/generate-recipes-json` - Main endpoint: accepts `{image: "base64...", exclude_recipe_ids: []}`
- `POST /api/identify-ingredients-json` - Identify ingredients only

## Configuration

- Backend env vars in `core/.env` (requires `GOOGLE_API_KEY`)
- Frontend API URL in `client/services/config.ts` (defaults to `localhost:8000` in dev)
- LLM model configured via `LLM_MODEL` env var (default: `gemini-3-flash-preview`)
