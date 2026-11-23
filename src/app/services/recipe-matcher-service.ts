import { Injectable, inject } from '@angular/core';
import { PantryProduct } from '../models/pantry-product';
import { Recipe, RecipeMatch } from '../models/recipe';
import { DashboardService } from './dashboard-service';

// S5 : normalisation simple
export function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase();
}

// S5 : compare les recettes avec le stock (niveau 1 : présent / absent)
// Ne connaît ni Angular Material, ni le HTML, ni le router.
@Injectable({ providedIn: 'root' })
export class RecipeMatcherService {
  // Mini défi S5-2 : on réutilise la règle « bientôt périmé » du dashboard (S4)
  private readonly dashboardService = inject(DashboardService);

  match(recipe: Recipe, products: PantryProduct[]): RecipeMatch {
    const inStock = (name: string) =>
      products.some(product => normalize(product.name) === normalize(name));

    const availableIngredients = recipe.ingredients.filter(ingredient => inStock(ingredient.name));
    const missingIngredients = recipe.ingredients.filter(ingredient => !inStock(ingredient.name));
    const availability = recipe.ingredients.length
      ? Math.round((availableIngredients.length / recipe.ingredients.length) * 100)
      : 0;

    // Mini défi S5-2 : ingrédients de la recette qui sont dans le stock et bientôt périmés
    const expiringNames = products
      .filter(product => this.dashboardService.isExpiringSoon(product))
      .map(product => normalize(product.name));
    const expiringIngredients = availableIngredients
      .filter(ingredient => expiringNames.includes(normalize(ingredient.name)));

    return { recipe, availableIngredients, missingIngredients, availability, expiringIngredients };
  }

  // Mini défi S5-2 : d'abord les recettes qui utilisent des produits bientôt périmés
  // Mini défi S5-1 : puis les recettes les plus compatibles
  matchAll(recipes: Recipe[], products: PantryProduct[]): RecipeMatch[] {
    return recipes
      .map(recipe => this.match(recipe, products))
      .sort((a, b) =>
        b.expiringIngredients.length - a.expiringIngredients.length
        || b.availability - a.availability);
  }
}
