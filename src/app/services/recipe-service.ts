import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Meal, MealDbResponse } from '../models/mealdb';
import { Recipe, RecipeIngredient } from '../models/recipe';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  // réponse brute, comme sur la slide 195
  searchMeals(name: string): Observable<MealDbResponse> {
    return this.http.get<MealDbResponse>(`${this.baseUrl}/search.php`, { params: { s: name } });
  }

  // réponse adaptée au modèle métier
  searchRecipes(name: string): Observable<Recipe[]> {
    return this.searchMeals(name).pipe(
      map(response => (response.meals ?? []).map(meal => this.toRecipe(meal)))
    );
  }

  getRecipe(id: string): Observable<Recipe | null> {
    return this.http.get<MealDbResponse>(`${this.baseUrl}/lookup.php`, { params: { i: id } }).pipe(
      map(response => response.meals?.[0] ? this.toRecipe(response.meals[0]) : null)
    );
  }

  // format TheMealDB -> format MyPantry
  toRecipe(meal: Meal): Recipe {
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient?.trim()) {
        ingredients.push({ name: ingredient.trim(), measure: measure?.trim() ?? '' });
      }
    }
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory ?? undefined,
      area: meal.strArea ?? undefined,
      instructions: meal.strInstructions ?? undefined,
      ingredients,
    };
  }
}
