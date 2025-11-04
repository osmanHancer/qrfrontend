import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tanitim' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'persons', 
    canActivate: [authGuard], 
    loadComponent: () => import('./pages/persons/persons.component').then(m => m.PersonsComponent) 
  },
  { 
    path: 'person/:tcno',
    loadComponent: () => import('./pages/person/person').then(m => m.Person)
  },
  { 
    path: 'tanitim',
    loadComponent: () => import('./pages/tanitim/tanitim.component').then(m => m.TanitimComponent)
  },
  { path: '**', redirectTo: 'tanitim' },
];
