import { Injectable } from '@angular/core';
import { PantryProduct } from '../models/pantry-product';
import { Recipe, RecipeMatch } from '../models/recipe';

export function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// Ne connaît ni Angular Material, ni le HTML, ni le router.
@Injectable({ providedIn: 'root' })
export class RecipeMatcherService {
  match(recipe: Recipe, products: PantryProduct[]): RecipeMatch {
    const stock = products.filter(p => p.quantity > 0);
    const has = (name: string) => stock.some(p => normalize(p.name) === normalize(name));

    const availableIngredients = recipe.ingredients.filter(i => has(i.name));
    const missingIngredients = recipe.ingredients.filter(i => !has(i.name));
    const total = recipe.ingredients.length;
    const availability = total ? Math.round((availableIngredients.length / total) * 100) : 0;

    return { recipe, availableIngredients, missingIngredients, availability };
  }

  // mini-défi 1 : les plus compatibles d'abord
  matchAll(recipes: Recipe[], products: PantryProduct[]): RecipeMatch[] {
    return recipes
      .map(recipe => this.match(recipe, products))
      .sort((a, b) => b.availability - a.availability);
  }
}
