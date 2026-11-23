import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PantryService } from './pantry-service';
import { LOCATIONS, PantryProduct } from '../models/pantry-product';
import { addDays, startOfToday } from '../utils/dates';

// S4 : transformer les données du stock en informations utiles pour le dashboard
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly pantryService = inject(PantryService);

  getProductCount(userId: string): Observable<number> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.length)
    );
  }

  getExpiredProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.filter(product => this.isExpired(product)))
    );
  }

  getExpiringProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products
        .filter(product => this.isExpiringSoon(product))
        // Mini défi S4-1 : tri par date d'expiration
        .sort((a, b) => a.expirationDate!.getTime() - b.expirationDate!.getTime()))
    );
  }

  // Mini défi S4-3 : indicateur de stock vide (produits à quantité 0)
  getEmptyProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.filter(product => product.quantity === 0))
    );
  }

  // Mini défi S4-2 : compteur de poids total en kg (seules les unités g et kg sont des poids)
  getTotalWeight(userId: string): Observable<number> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.reduce((kg, product) => {
        if (product.unit === 'kg') return kg + product.quantity;
        if (product.unit === 'g') return kg + product.quantity / 1000;
        return kg;
      }, 0))
    );
  }

  // Mini défi S4-5 : nombre de produits par emplacement, pour le graphique
  getCountByLocation(userId: string): Observable<{ location: string; count: number }[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => LOCATIONS.map(location => ({
        location,
        count: products.filter(product => product.location === location).length,
      })))
    );
  }

  getLowStockProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.filter(product => product.quantity < product.minQuantity))
    );
  }

  // Quantité totale en respectant les unités : g -> kg, mL -> L, les autres unités à part
  getTotalQuantities(userId: string): Observable<Record<string, number>> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.reduce((totals, product) => {
        let unit = product.unit;
        let quantity = product.quantity;
        if (unit === 'g') { unit = 'kg'; quantity = quantity / 1000; }
        if (unit === 'mL') { unit = 'L'; quantity = quantity / 1000; }
        totals[unit] = (totals[unit] ?? 0) + quantity;
        return totals;
      }, {} as Record<string, number>))
    );
  }

  // Règle métier : périmé si expirationDate < aujourd'hui
  isExpired(product: PantryProduct): boolean {
    return !!product.expirationDate && product.expirationDate < startOfToday();
  }

  // Règle métier : bientôt périmé s'il expire dans les 3 prochains jours
  isExpiringSoon(product: PantryProduct): boolean {
    if (!product.expirationDate) return false;
    const today = startOfToday();
    return product.expirationDate >= today && product.expirationDate <= addDays(today, 3);
  }
}
