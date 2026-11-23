import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { OpenFoodFactsService } from '../../services/open-food-facts-service';
import { PantryService } from '../../services/pantry-service';
import { OpenFoodFactsProduct } from '../../models/open-food-facts';
import { LOCATIONS, UNITS } from '../../models/pantry-product';
import { parseLocalDate } from '../../utils/dates';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, UpperCasePipe],
  templateUrl: './add-product.html',
})
export class AddProduct {
  private readonly off = inject(OpenFoodFactsService);
  private readonly pantryService = inject(PantryService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly units = UNITS;
  readonly locations = LOCATIONS;

  readonly loading = signal(false);       // Mini défi S1-3
  readonly notFound = signal(false);      // Mini défi S1-2
  readonly error = signal<string | null>(null);
  readonly offProduct = signal<OpenFoodFactsProduct | null>(null);

  readonly barcode = this.fb.control('');

  // Mini défi S2-2 : validation des champs
  readonly form = this.fb.group({
    name: ['', Validators.required],
    brand: [''],
    category: [''],
    image: [''],
    quantity: [1, [Validators.required, Validators.min(0)]],
    unit: ['piece', Validators.required],
    expirationDate: [''],
    location: ['placard', Validators.required],
    minQuantity: [1, [Validators.required, Validators.min(0)]],
  });

  // S1 : recherche Open Food Facts puis préremplissage du formulaire
  search(): void {
    const code = this.barcode.value.trim();
    if (!code || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.offProduct.set(null);

    this.off.findProduct(code)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: product => {
          if (!product) {
            this.notFound.set(true);
            return;
          }
          this.offProduct.set(product);
          this.form.patchValue(this.off.toPantryDraft(product));
        },
        error: () => this.error.set('Impossible de contacter Open Food Facts.'),
      });
  }

  // S2 : Open Food Facts -> PantryProduct -> PantryService -> Firestore, puis « Mon stock »
  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { expirationDate, ...values } = this.form.getRawValue();
    try {
      await this.pantryService.addProduct({
        ...values,
        purchaseDate: new Date(),
        // Firestore refuse les champs undefined : on n'ajoute la date que si elle est saisie
        ...(expirationDate ? { expirationDate: parseLocalDate(expirationDate) } : {}),
      });
      await this.router.navigate(['/stock']);
    } catch {
      this.error.set("L'enregistrement a échoué.");   // Mini défi S2-3 : erreurs Firestore
    }
  }
}
