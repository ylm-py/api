import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { User } from '@angular/fire/auth';
import { combineLatest, filter, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { DashboardService } from '../../services/dashboard-service';
import { ShoppingListService } from '../../services/shopping-list-service';
import { ShoppingItem } from '../../models/shopping-item';

@Component({
  selector: 'app-shopping-list',
  imports: [AsyncPipe],
  templateUrl: './shopping-list.html',
})
export class ShoppingList {
  private readonly auth = inject(AuthService);
  private readonly dashboard = inject(DashboardService);
  private readonly shopping = inject(ShoppingListService);

  readonly vm$ = this.auth.user$.pipe(
    filter((u): u is User => !!u),
    switchMap(user => combineLatest({
      lowStock: this.dashboard.getLowStockProducts(user.uid),   // automatique
      items: this.shopping.getItems(user.uid),                  // manuel + recettes
    }))
  );

  async add(input: HTMLInputElement) {
    const name = input.value.trim();
    if (!name) return;
    await this.shopping.addItem(await this.auth.getUid(), name);
    input.value = '';
  }

  toggle(item: ShoppingItem) { return this.shopping.toggle(item); }
  remove(item: ShoppingItem) { return this.shopping.remove(item.id!); }
}
