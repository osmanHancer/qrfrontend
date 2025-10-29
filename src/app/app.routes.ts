import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'persons', canActivate: [authGuard], loadComponent: () => import('./pages/persons/persons.component').then(m => m.PersonsComponent) },

  // 👇 Artık korumasız
  { 
    path: 'person/:tcno',
    loadComponent: () => import('./pages/person/person').then(m => m.Person)
  },

  { path: '**', redirectTo: 'dashboard' },
];
