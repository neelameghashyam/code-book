import { Routes } from '@angular/router';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { LoginComponent } from './login/login/login.component';
import { AuthGuard } from './auth.guard';
import { MainDashboard2Component } from './main-dashboard-2/main-dashboard-2.component';

export const routes: Routes = [
  {
    path: 'dashboard-selector',
    component: DashboardSelectorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'main-dashboard',
    component: MainDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'dashboard-1',
        loadComponent: () => import('./pages/dashboard-1/dashboard-1.component').then(m => m.Dashboard1Component),
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: 'sub-categories',
        loadComponent: () => import('./pages/subcategories/subcategories.component').then(m => m.SubcategoriesComponent),
      },
      {
        path: 'pincode',
        loadComponent: () => import('./pages/pincodes/pincodes.component').then(m => m.PincodesComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'business',
        loadComponent: () => import('./pages/business/business.component').then(m => m.BusinessComponent),
      },
      {
        path: 'business-list',
        loadComponent: () => import('./pages/business/list-businesses/list-businesses.component').then(m => m.ListBusinessesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'main-dashboard-2',
    component: MainDashboard2Component,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'pincode',
        loadComponent: () => import('./pages/pincodes/pincodes.component').then(m => m.PincodesComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: 'sub-categories',
        loadComponent: () => import('./pages/subcategories/subcategories.component').then(m => m.SubcategoriesComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'business',
        loadComponent: () => import('./pages/business/business.component').then(m => m.BusinessComponent),
      },
      {
        path: 'business-list',
        loadComponent: () => import('./pages/business/list-businesses/list-businesses.component').then(m => m.ListBusinessesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard-selector', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard-selector' },
];