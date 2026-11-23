import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '@angular/fire/auth';
import { BehaviorSubject, catchError, filter, map, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { DashboardService } from '../../services/dashboard-service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DatePipe, DecimalPipe, KeyValuePipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly dashboard = inject(DashboardService);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly user$ = this.auth.user$;

  readonly state$ = this.reload$.pipe(
    switchMap(() => this.auth.user$),
    filter((user): user is User => !!user),        // ici, filter RxJS : filtre les émissions
    switchMap(user => this.dashboard.getStats(user.uid).pipe(
      map(stats => ({ loading: false, error: false, stats })),
      startWith({ loading: true, error: false, stats: null }),
      catchError(() => of({ loading: false, error: true, stats: null })),
    )),
  );

  retry() { this.reload$.next(); }
}
