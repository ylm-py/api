export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  // signature d'index : permet meal[`strIngredient${i}`] sans erreur TS7053
  [key: string]: string | null | undefined;
}

export interface MealDbResponse {
  meals: Meal[] | null;
}
