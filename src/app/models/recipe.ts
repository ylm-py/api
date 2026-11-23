export interface RecipeIngredient {
  name: string;
  measure: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  category?: string;
  area?: string;
  instructions?: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeMatch {
  recipe: Recipe;
  availableIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
  availability: number;   // pourcentage 0..100
}
