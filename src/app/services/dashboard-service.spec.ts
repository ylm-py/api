import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { DashboardService } from './dashboard-service';
import { PantryService } from './pantry-service';
import { PantryProduct } from '../models/pantry-product';
import { addDays, startOfToday } from '../utils/dates';

function product(overrides: Partial<PantryProduct>): PantryProduct {
  return {
    userId: 'u1', name: 'Produit', quantity: 2, unit: 'piece',
    location: 'placard', minQuantity: 1, ...overrides,
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  const today = startOfToday();

  const products: PantryProduct[] = [
    product({ id: 'a', name: 'Yaourt', expirationDate: addDays(today, -1) }),          // périmé
    product({ id: 'b', name: 'Lait', expirationDate: today }),                         // expire aujourd'hui
    product({ id: 'c', name: 'Beurre', expirationDate: addDays(today, 3) }),           // limite J+3
    product({ id: 'd', name: 'Riz', expirationDate: addDays(today, 4), unit: 'g', quantity: 500 }),
    product({ id: 'e', name: 'Pâtes', unit: 'g', quantity: 250, minQuantity: 500 }),  // stock bas
    product({ id: 'f', name: 'Huile', unit: 'mL', quantity: 750, minQuantity: 750 }), // = seuil, pas bas
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PantryService, useValue: { getProducts: () => of(products) } }],
    });
    service = TestBed.inject(DashboardService);
  });

  it('isExpired : date strictement avant aujourd\'hui', () => {
    expect(service.isExpired(products[0])).toBeTrue();
    expect(service.isExpired(products[1])).toBeFalse();
    expect(service.isExpired(product({}))).toBeFalse();   // pas de date
  });

  it('isExpiringSoon : entre aujourd\'hui et J+3 inclus', () => {
    expect(service.isExpiringSoon(products[1])).toBeTrue();
    expect(service.isExpiringSoon(products[2])).toBeTrue();
    expect(service.isExpiringSoon(products[3])).toBeFalse();
    expect(service.isExpiringSoon(products[0])).toBeFalse();
  });

  it('isLowStock : quantity < minQuantity (strict)', () => {
    expect(service.isLowStock(products[4])).toBeTrue();
    expect(service.isLowStock(products[5])).toBeFalse();
  });

  it('totalsByUnit convertit g en kg et mL en L', () => {
    const totals = service.totalsByUnit(products);
    expect(totals['kg']).toBeCloseTo(0.75);
    expect(totals['L']).toBeCloseTo(0.75);
    expect(totals['piece']).toBe(6);
  });

  it('getStats combine tous les indicateurs', async () => {
    const stats = await firstValueFrom(service.getStats('u1'));
    expect(stats.productCount).toBe(6);
    expect(stats.expired.map(p => p.id)).toEqual(['a']);
    expect(stats.expiring.map(p => p.id)).toEqual(['b', 'c']);
    expect(stats.lowStock.map(p => p.id)).toEqual(['e']);
  });
});
