import Constants from 'expo-constants';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_HOST ?? "http://localhost:8000"
};

export const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 1200000, // 120 seconds for image processing
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
} as const;