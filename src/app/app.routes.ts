import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Stock } from './pages/stock/stock';
import { AddProduct } from './pages/add-product/add-product';
import { Recipes } from './pages/recipes/recipes';
import { ShoppingList } from './pages/shopping-list/shopping-list';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'stock', component: Stock, canActivate: [authGuard] },
  { path: 'add', component: AddProduct, canActivate: [authGuard] },
  { path: 'recipes', component: Recipes, canActivate: [authGuard] },
  { path: 'shopping-list', component: ShoppingList, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
