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
    path: 'companies', 
    canActivate: [authGuard], 
    loadComponent: () => import('./pages/companies/companies.component').then(m => m.CompaniesComponent) 
  },
  { 
    path: 'company/:companyCode',
    loadComponent: () => import('./pages/company/company').then(m => m.Company)
  },
  { 
    path: 'tanitim',
    loadComponent: () => import('./pages/tanitim/tanitim.component').then(m => m.TanitimComponent)
  },
  { path: '**', redirectTo: 'tanitim' },
];
