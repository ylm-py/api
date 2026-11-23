import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Meal, MealDbResponse } from '../models/mealdb';
import { Recipe, RecipeIngredient } from '../models/recipe';

// S5 : communiquer avec TheMealDB
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  searchMeals(name: string): Observable<MealDbResponse> {
    return this.http.get<MealDbResponse>(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
    );
  }

  // format TheMealDB -> Recipe
  searchRecipes(name: string): Observable<Recipe[]> {
    return this.searchMeals(name).pipe(
      map(response => (response.meals ?? []).map(meal => this.toRecipe(meal)))
    );
  }

  toRecipe(meal: Meal): Recipe {
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient?.trim()) {
        ingredients.push({
          name: ingredient,
          measure: measure ?? ''
        });
      }
    }
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      ingredients,
    };
  }
}
