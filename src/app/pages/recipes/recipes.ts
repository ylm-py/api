import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { PantryService } from '../../services/pantry-service';
import { RecipeService } from '../../services/recipe-service';
import { RecipeMatcherService } from '../../services/recipe-matcher-service';
import { ShoppingListService } from '../../services/shopping-list-service';
import { Recipe, RecipeMatch } from '../../models/recipe';
import { PantryProduct } from '../../models/pantry-product';

@Component({
  selector: 'app-recipes',
  imports: [AsyncPipe],
  templateUrl: './recipes.html',
})
export class Recipes {
  private readonly auth = inject(AuthService);
  private readonly pantryService = inject(PantryService);
  private readonly recipeService = inject(RecipeService);
  private readonly matcher = inject(RecipeMatcherService);
  private readonly shoppingList = inject(ShoppingListService);

  // Mini défi S5-5 : recherche par nom (« chicken » au départ, comme dans le cours)
  private readonly searchTerm$ = new BehaviorSubject<string>('chicken');
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  // S5 étape 4 : products$
  private readonly products$ = this.auth.user$.pipe(
    switchMap(user => user ? this.pantryService.getProducts(user.uid) : of([] as PantryProduct[]))
  );

  // S5 étape 5 : recipes$
  private readonly recipes$ = this.searchTerm$.pipe(
    switchMap(name => this.recipeService.searchRecipes(name).pipe(
      catchError(() => {
        this.error.set('Impossible de contacter TheMealDB.');
        return of([] as Recipe[]);
      })
    ))
  );

  // S5 étape 6 : combineLatest stock + recettes -> RecipeMatch[]
  readonly matches$ = combineLatest({
    products: this.products$,
    recipes: this.recipes$,
  }).pipe(
    map(({ products, recipes }) => this.matcher.matchAll(recipes, products))   // Mini défi S5-1
  );

  search(name: string) {
    this.error.set(null);
    this.message.set(null);
    this.searchTerm$.next(name.trim());
  }

  // Mini défi S5-3 : ajouter les ingrédients manquants à la liste de courses
  async addMissing(match: RecipeMatch) {
    await this.shoppingList.addItems(match.missingIngredients.map(i => i.name));
    this.message.set(`${match.missingIngredients.length} ingrédient(s) ajouté(s) à la liste de courses.`);
  }
}
