import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '@angular/fire/auth';
import { BehaviorSubject, catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { DashboardService } from '../../services/dashboard-service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DatePipe, DecimalPipe, KeyValuePipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly retry$ = new BehaviorSubject<void>(undefined);   // bouton « Réessayer »

  // S4 étape 2 : récupérer l'utilisateur connecté
  readonly user$ = this.auth.user$;

  // S4 : combineLatest des indicateurs + états chargement / erreur
  readonly state$ = this.retry$.pipe(
    switchMap(() => this.user$),
    filter((user): user is User => !!user),
    switchMap(user => combineLatest({
      productCount: this.dashboardService.getProductCount(user.uid),
      expiredProducts: this.dashboardService.getExpiredProducts(user.uid),
      expiringProducts: this.dashboardService.getExpiringProducts(user.uid),
      lowStockProducts: this.dashboardService.getLowStockProducts(user.uid),
      totalQuantities: this.dashboardService.getTotalQuantities(user.uid),
      emptyProducts: this.dashboardService.getEmptyProducts(user.uid),       // Mini défi S4-3
      totalWeight: this.dashboardService.getTotalWeight(user.uid),           // Mini défi S4-2
      countByLocation: this.dashboardService.getCountByLocation(user.uid),   // Mini défi S4-5
    }).pipe(
      map(stats => ({ loading: false, error: false, stats })),
      startWith({ loading: true, error: false, stats: null }),
      catchError(() => of({ loading: false, error: true, stats: null })),
    )),
  );

  retry() { this.retry$.next(); }

  // Mini défi S4-5 : largeur d'une barre du graphique, en % du plus grand emplacement
  barWidth(count: number, all: { count: number }[]): number {
    const max = Math.max(...all.map(item => item.count), 1);
    return (count / max) * 100;
  }
}
