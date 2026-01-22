import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiConfig } from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.status, error.message);

        // Handle common error scenarios
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to the server. Please check if the API is running.');
        }

        if (error.response?.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }

        if (error.response?.status === 400) {
          throw new Error(error.response.data?.detail || 'Invalid request. Please check your input.');
        }

        return Promise.reject(error);
      }
    );
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  // Method specifically for file uploads
  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData);
    return response.data;
  }

  // Method for binary responses (e.g., audio files)
  async postForBinary(url: string, data?: any): Promise<ArrayBuffer> {
    const response = await this.client.post(url, data, {
      responseType: 'arraybuffer',
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();