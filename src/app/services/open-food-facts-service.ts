import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { OpenFoodFactsProduct, OpenFoodFactsResponse } from '../models/open-food-facts';

// Mini défi S1-6 : utiliser fields pour limiter les données récupérées
const FIELDS = 'product_name,brands,image_front_url,categories,nutriscore_grade';

@Injectable({ providedIn: 'root' })
export class OpenFoodFactsService {
  private readonly http = inject(HttpClient);

  // S1 : getProduct(barcode: string)
  getProduct(barcode: string): Observable<OpenFoodFactsResponse> {
    return this.http.get<OpenFoodFactsResponse>(
      `https://world.openfoodfacts.org/api/v3/product/${barcode}`,
      { params: { fields: FIELDS } }
    );
  }

  // Mini défi S1-2 : produit trouvé (produit) / produit inconnu (null) ; une autre erreur reste une erreur
  findProduct(barcode: string): Observable<OpenFoodFactsProduct | null> {
    return this.getProduct(barcode).pipe(
      map(response => response.product ?? null),
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of(null) : throwError(() => err)
      )
    );
  }

  // S2 : format Open Food Facts -> format MyPantry (product_name -> name, brands -> brand…)
  toPantryDraft(p: OpenFoodFactsProduct) {
    return {
      name: p.product_name ?? '',
      brand: p.brands ?? '',
      image: p.image_front_url ?? '',
      category: p.categories?.split(',')[0]?.trim() ?? '',
    };
  }
}
