import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Stock } from './pages/stock/stock';
import { AddProduct } from './pages/add-product/add-product';
import { Recipes } from './pages/recipes/recipes';

// S3 : pages publiques (/login, /register) et pages protégées par le route guard
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'stock', component: Stock, canActivate: [authGuard] },
  { path: 'add', component: AddProduct, canActivate: [authGuard] },
  { path: 'recipes', component: Recipes, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
