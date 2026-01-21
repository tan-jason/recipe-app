export interface Recipe {
  id: string;
  title: string;
  summary: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl?: string;
  tags?: string[];
}

export interface RecipeGenerationRequest {
  imageData: string; // base64 encoded image
  excludeRecipeIds?: string[]; // for refresh functionality
}

export interface RecipeGenerationResponse {
  recipes: Recipe[];
  identifiedIngredients: string[];
}

export interface ImageData {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}