import Constants from 'expo-constants';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

const getApiBaseUrl = (): string => {
  return process.env.API_HOST ?? ""
};

export const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 1200000, // 120 seconds for image processing
};

export const API_ENDPOINTS = {
  GENERATE_RECIPES: '/api/generate-recipes',
  IDENTIFY_INGREDIENTS: '/api/identify-ingredients',
  HEALTH: '/health',
} as const;