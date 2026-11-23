import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { OpenFoodFactsService } from '../../services/open-food-facts-service';
import { PantryService } from '../../services/pantry-service';
import { AuthService } from '../../services/auth-service';
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
  private readonly pantry = inject(PantryService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly units = UNITS;
  readonly locations = LOCATIONS;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly offProduct = signal<OpenFoodFactsProduct | null>(null);

  readonly barcode = this.fb.control('', [Validators.required, Validators.pattern(/^\d{8,14}$/)]);

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

  search(): void {
    if (this.barcode.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.offProduct.set(null);

    this.off.findProduct(this.barcode.value.trim())
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
        error: () => this.error.set('Impossible de contacter Open Food Facts. Vérifiez votre connexion.'),
      });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      const userId = await this.auth.getUid();
      await this.pantry.addProduct({
        ...v,
        userId,
        purchaseDate: new Date(),
        expirationDate: v.expirationDate ? parseLocalDate(v.expirationDate) : undefined,
      });
      await this.router.navigate(['/stock']);
    } catch {
      this.error.set("L'enregistrement a échoué. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }
}
