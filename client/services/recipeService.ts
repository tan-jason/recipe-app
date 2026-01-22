import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import { Recipe, RecipeGenerationResponse } from '@/types/recipe';

export interface GenerateRecipesParams {
  imageUri: string;
  excludeRecipeIds?: string[];
}

class RecipeService {
  /**
   * Generate recipes from an uploaded ingredient image
   * This automatically identifies ingredients and generates recipes in a single API call
   */
  async generateRecipes(params: GenerateRecipesParams): Promise<RecipeGenerationResponse> {
    try {
      // Convert image to base64 and send as JSON (much simpler for React Native)
      const base64Image = await this.convertImageToBase64(params.imageUri);

      const payload = {
        image: base64Image,
        exclude_recipe_ids: params.excludeRecipeIds || []
      };

      const response = await apiClient.post<RecipeGenerationResponse>(
        '/api/generate-recipes-json',
        payload
      );

      console.log('✨ Generated recipes:', response.recipes.length);
      console.log('🥬 Identified ingredients:', response.identifiedIngredients);

      return response;

    } catch (error) {
      console.error('❌ Error generating recipes:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Regenerate recipes using known ingredients (no image processing)
   * Used for the "New recipes" refresh functionality
   */
  async regenerateRecipes(params: {
    ingredients: string[];
    excludeTitles: string[];
  }): Promise<{ recipes: Recipe[] }> {
    try {

      const response = await apiClient.post<{ recipes: Recipe[] }>(
        '/api/regenerate-recipes',
        {
          ingredients: params.ingredients,
          exclude_titles: params.excludeTitles,
        }
      );

      console.log('✨ Regenerated recipes:', response.recipes.length);
      return response;

    } catch (error) {
      console.error('❌ Error regenerating recipes:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Send message to cooking assistant
   */
  async cookingAssistant(params: {
    recipe: Recipe;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    userMessage: string;
  }): Promise<{ response: string }> {
    try {
      const response = await apiClient.post<{ response: string }>(
        '/api/cooking-assistant',
        {
          recipe: params.recipe,
          conversation_history: params.conversationHistory,
          user_message: params.userMessage,
        }
      );
      return response;
    } catch (error) {
      console.error('Error in cooking assistant:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   * Returns audio data as ArrayBuffer
   */
  async textToSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await apiClient.postForBinary('/api/text-to-speech', { text });
      return response;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Convert speech to text using Gemini
   * Returns transcript string
   */
  async speechToText(audioBase64: string, mimeType: string = 'audio/wav'): Promise<string> {
    try {
      const response = await apiClient.post<{ transcript: string }>(
        '/api/speech-to-text',
        { audio: audioBase64, mime_type: mimeType }
      );
      return response.transcript;
    } catch (error) {
      console.error('Error in speech-to-text:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<{ status: string; model?: string }> {
    try {
      return await apiClient.get(API_ENDPOINTS.HEALTH);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Convert image URI to base64 string
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // For React Native, we need to read the file and convert to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any): Error {
    // Check for backend error detail first (FastAPI returns errors in this format)
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }

    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      return new Error('Unable to connect to the recipe service. Please check your internet connection and try again.');
    }

    if (error.response?.status === 413) {
      return new Error('Image file is too large. Please try with a smaller image.');
    }

    if (error.response?.status === 415) {
      return new Error('Invalid image format. Please use JPEG or PNG images.');
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred while processing your request. Please try again.');
  }
}

export const recipeService = new RecipeService();