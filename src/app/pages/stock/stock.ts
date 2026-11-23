import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { PantryService } from '../../services/pantry-service';
import { PantryProduct, LOCATIONS } from '../../models/pantry-product';

const time = (p: PantryProduct) => p.expirationDate?.getTime() ?? Number.MAX_SAFE_INTEGER;

@Component({
  selector: 'app-stock',
  imports: [AsyncPipe, DatePipe, RouterLink],
  templateUrl: './stock.html',
})
export class Stock {
  private readonly auth = inject(AuthService);
  private readonly pantry = inject(PantryService);

  readonly locations = LOCATIONS;
  readonly locationFilter = signal('');
  readonly pendingDelete = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly products$ = this.auth.user$.pipe(
    switchMap(user => user ? this.pantry.getProducts(user.uid) : of([])),
    map(products => [...products].sort((a, b) => time(a) - time(b))),   // tri par expiration
    catchError(() => {
      this.error.set('Impossible de charger votre stock.');
      return of([] as PantryProduct[]);
    })
  );

  visible(products: PantryProduct[]): PantryProduct[] {
    const loc = this.locationFilter();
    return loc ? products.filter(p => p.location === loc) : products;
  }

  async changeQuantity(p: PantryProduct, delta: number) {
    await this.pantry.updateProduct(p.id!, { quantity: Math.max(0, p.quantity + delta) });
  }

  async remove(p: PantryProduct) {
    await this.pantry.deleteProduct(p.id!);
    this.pendingDelete.set(null);
  }

  isLow(p: PantryProduct) { return p.quantity < p.minQuantity; }
}
