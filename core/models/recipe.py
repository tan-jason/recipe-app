from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Recipe(BaseModel):
    id: str = Field(..., description="Unique identifier for the recipe")
    title: str = Field(..., description="Recipe name/title")
    summary: str = Field(..., description="Brief description of the recipe")
    ingredients: List[str] = Field(..., description="List of ingredients with quantities")
    instructions: List[str] = Field(..., description="Step-by-step cooking instructions")
    cookingTime: int = Field(..., description="Total cooking time in minutes")
    servings: int = Field(..., description="Number of servings this recipe makes")
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(..., description="Difficulty level")
    tags: Optional[List[str]] = Field(default=[], description="Recipe categories/tags")

class RecipeGenerationRequest(BaseModel):
    excludeRecipeIds: Optional[List[str]] = Field(default=[], description="Recipe IDs to exclude from generation")

class RecipeGenerationResponse(BaseModel):
    recipes: List[Recipe] = Field(..., description="Generated recipes")
    identifiedIngredients: List[str] = Field(..., description="Ingredients identified from the image")

class IngredientIdentificationResponse(BaseModel):
    ingredients: List[str] = Field(..., description="List of identified ingredients")
    confidence: float = Field(..., description="Confidence score for ingredient identification")