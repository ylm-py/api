import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { OpenFoodFactsProduct, OpenFoodFactsResponse } from '../models/open-food-facts';

// mini-défi 6 : ne récupérer que les champs utiles
const FIELDS = 'code,product_name,brands,image_front_url,categories,nutriscore_grade';

@Injectable({ providedIn: 'root' })
export class OpenFoodFactsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v3/product';

  getProduct(barcode: string): Observable<OpenFoodFactsResponse> {
    return this.http.get<OpenFoodFactsResponse>(`${this.baseUrl}/${barcode}`, {
      params: { fields: FIELDS }
    });
  }

  // null = produit inconnu ; erreur = problème réseau / API
  findProduct(barcode: string): Observable<OpenFoodFactsProduct | null> {
    return this.getProduct(barcode).pipe(
      map(response => response.product ?? null),
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of(null) : throwError(() => err)
      )
    );
  }

  // format externe -> format MyPantry
  toPantryDraft(p: OpenFoodFactsProduct) {
    return {
      name: p.product_name ?? '',
      brand: p.brands ?? '',
      image: p.image_front_url ?? '',
      category: p.categories?.split(',')[0]?.trim() ?? '',
    };
  }
}
