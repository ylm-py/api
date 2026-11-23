import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { PantryService } from '../../services/pantry-service';
import { PantryProduct, LOCATIONS, UNITS } from '../../models/pantry-product';
import { parseLocalDate, toInputDate } from '../../utils/dates';

@Component({
  selector: 'app-stock',
  imports: [AsyncPipe, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './stock.html',
})
export class Stock {
  private readonly auth = inject(AuthService);
  private readonly pantryService = inject(PantryService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly locations = LOCATIONS;
  readonly units = UNITS;
  readonly locationFilter = signal('');                    // Mini défi S2-7
  readonly categoryFilter = signal('');                    // Mini défi S2-6
  readonly pendingDelete = signal<string | null>(null);    // Mini défi S2-5
  readonly editingId = signal<string | null>(null);        // Mini défi S2-1
  readonly error = signal<string | null>(null);            // Mini défi S2-3

  // Mini défi S2-1 : formulaire de modification (Mini défi S2-2 : validation)
  readonly editForm = this.fb.group({
    name: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    unit: ['piece', Validators.required],
    expirationDate: [''],
    minQuantity: [0, [Validators.required, Validators.min(0)]],
    location: ['placard', Validators.required],
  });

  // S2 / S3 : le stock de l'utilisateur connecté, lu depuis Firestore
  readonly products$ = this.auth.user$.pipe(
    switchMap(user => user ? this.pantryService.getProducts(user.uid) : of([])),
    // Mini défi S2-8 : tri par date d'expiration
    map(products => [...products].sort((a, b) =>
      (a.expirationDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.expirationDate?.getTime() ?? Number.MAX_SAFE_INTEGER))),
    catchError(() => {
      this.error.set('Impossible de charger votre stock.');
      return of([] as PantryProduct[]);
    }),
    shareReplay({ bufferSize: 1, refCount: true })   // une seule écoute Firestore pour les deux async pipes
  );

  // Mini défi S2-6 : catégories présentes dans le stock
  categories(products: PantryProduct[]): string[] {
    return [...new Set(products.map(p => p.category).filter((c): c is string => !!c))].sort();
  }

  // Mini défis S2-6 et S2-7 : filtres
  visible(products: PantryProduct[]): PantryProduct[] {
    const location = this.locationFilter();
    const category = this.categoryFilter();
    return products
      .filter(p => !location || p.location === location)
      .filter(p => !category || p.category === category);
  }

  changeQuantity(p: PantryProduct, delta: number) {
    return this.pantryService.updateProduct(p.id!, { quantity: Math.max(0, p.quantity + delta) });
  }

  // Mini défi S2-1 : ouvrir le formulaire prérempli
  startEdit(p: PantryProduct) {
    this.editForm.setValue({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      expirationDate: p.expirationDate ? toInputDate(p.expirationDate) : '',
      minQuantity: p.minQuantity,
      location: p.location,
    });
    this.editingId.set(p.id!);
  }

  // Mini défi S2-1 : enregistrer avec updateProduct()
  async saveEdit(p: PantryProduct) {
    if (this.editForm.invalid) return;
    const { expirationDate, ...values } = this.editForm.getRawValue();
    try {
      await this.pantryService.updateProduct(p.id!, {
        ...values,
        ...(expirationDate ? { expirationDate: parseLocalDate(expirationDate) } : {}),
      });
      this.editingId.set(null);
    } catch {
      this.error.set('La modification a échoué.');
    }
  }

  async remove(p: PantryProduct) {
    await this.pantryService.deleteProduct(p.id!);
    this.pendingDelete.set(null);
  }
}
