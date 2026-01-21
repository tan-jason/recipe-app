import Constants from 'expo-constants';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envApiUrl) {
    return envApiUrl;
  }

  if (__DEV__) {
    return 'http://localhost:8000';
  }

  // Production URL (update this when deploying)
  return 'https://your-api-domain.com';
};

export const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds for image processing
};

export const API_ENDPOINTS = {
  GENERATE_RECIPES: '/api/generate-recipes',
  IDENTIFY_INGREDIENTS: '/api/identify-ingredients',
  HEALTH: '/health',
} as const;