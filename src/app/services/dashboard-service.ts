import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { PantryService } from './pantry-service';
import { PantryProduct } from '../models/pantry-product';
import { addDays, startOfToday } from '../utils/dates';

export interface DashboardStats {
  productCount: number;
  expired: PantryProduct[];
  expiring: PantryProduct[];
  lowStock: PantryProduct[];
  totals: Record<string, number>;   // quantité totale par unité
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly pantryService = inject(PantryService);

  // ---- règles métier (fonctions pures, faciles à tester) ----
  isExpired(p: PantryProduct): boolean {
    return !!p.expirationDate && p.expirationDate < startOfToday();
  }

  isExpiringSoon(p: PantryProduct, days = 3): boolean {
    if (!p.expirationDate) return false;
    const today = startOfToday();
    return p.expirationDate >= today && p.expirationDate <= addDays(today, days);
  }

  isLowStock(p: PantryProduct): boolean {
    return p.quantity < p.minQuantity;
  }

  // respecter les unités : g -> kg, mL -> L, le reste séparé
  totalsByUnit(products: PantryProduct[]): Record<string, number> {
    return products.reduce((acc, p) => {
      let unit = p.unit;
      let qty = p.quantity;
      if (unit === 'g') { unit = 'kg'; qty = qty / 1000; }
      if (unit === 'mL') { unit = 'L'; qty = qty / 1000; }
      acc[unit] = (acc[unit] ?? 0) + qty;
      return acc;
    }, {} as Record<string, number>);
  }

  // ---- version « cours » : un Observable par indicateur ----
  getProductCount(userId: string): Observable<number> {
    return this.pantryService.getProducts(userId).pipe(map(products => products.length));
  }

  getLowStockProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.filter(p => this.isLowStock(p)))
    );
  }

  getExpiringProducts(userId: string): Observable<PantryProduct[]> {
    return this.pantryService.getProducts(userId).pipe(
      map(products => products.filter(p => this.isExpiringSoon(p)))
    );
  }

  // ---- tout en un : une seule écoute Firestore, plusieurs vues ----
  getStats(userId: string): Observable<DashboardStats> {
    const products$ = this.pantryService.getProducts(userId).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    return combineLatest({
      productCount: products$.pipe(map(p => p.length)),
      expired: products$.pipe(map(p => p.filter(x => this.isExpired(x)))),
      expiring: products$.pipe(map(p => p.filter(x => this.isExpiringSoon(x)))),
      lowStock: products$.pipe(map(p => p.filter(x => this.isLowStock(x)))),
      totals: products$.pipe(map(p => this.totalsByUnit(p))),
    });
  }
}
