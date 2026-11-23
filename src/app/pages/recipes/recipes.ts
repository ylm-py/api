import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { PantryService } from '../../services/pantry-service';
import { RecipeService } from '../../services/recipe-service';
import { RecipeMatcherService } from '../../services/recipe-matcher-service';
import { ShoppingListService } from '../../services/shopping-list-service';
import { RecipeMatch } from '../../models/recipe';
import { PantryProduct } from '../../models/pantry-product';

@Component({
  selector: 'app-recipes',
  imports: [AsyncPipe],
  templateUrl: './recipes.html',
})
export class Recipes {
  private readonly auth = inject(AuthService);
  private readonly pantry = inject(PantryService);
  private readonly recipes = inject(RecipeService);
  private readonly matcher = inject(RecipeMatcherService);
  private readonly shopping = inject(ShoppingListService);

  private readonly search$ = new BehaviorSubject<string>('chicken');
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  private readonly products$ = this.auth.user$.pipe(
    switchMap(user => user ? this.pantry.getProducts(user.uid) : of([] as PantryProduct[]))
  );

  private readonly recipes$ = this.search$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.recipes.searchRecipes(term).pipe(
      catchError(() => {
        this.error.set('Impossible de contacter TheMealDB.');
        return of([]);
      })
    ))
  );

  // composition : stock + recettes -> RecipeMatch[]
  readonly matches$ = combineLatest({
    products: this.products$,
    recipes: this.recipes$,
  }).pipe(
    map(({ products, recipes }) => this.matcher.matchAll(recipes, products))
  );

  onSearch(term: string) {
    this.error.set(null);
    this.search$.next(term.trim());
  }

  async addMissing(match: RecipeMatch) {
    const userId = await this.auth.getUid();
    await this.shopping.addMany(userId, match.missingIngredients.map(i => i.name));
    this.message.set(`${match.missingIngredients.length} ingrédient(s) ajouté(s) à la liste de courses.`);
  }
}
