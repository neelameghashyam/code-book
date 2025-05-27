import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { BusinessComponent } from './pages/business/business.component';
import { ListBusinessesComponent } from './pages/business/list-businesses/list-businesses.component';
import { LoginComponent } from './login/login/login.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { AuthGuard } from './auth.guard';
import { PincodesComponent } from './pages/pincodes/pincodes.component';
import { Dashboard1Component } from './pages/dashboard-1/dashboard-1.component';
import { MainDashboard2Component } from './main-dashboard-2/main-dashboard-2.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SubcategoriesComponent } from './pages/subcategories/subcategories.component';

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
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dashboard-1', component: Dashboard1Component },
      { path: 'categories', component: CategoriesComponent },
      { path: 'sub-categories', component: SubcategoriesComponent},
      { path: 'pincode', component: PincodesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'business', component: BusinessComponent },
      { path: 'business-list', component: ListBusinessesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'main-dashboard-2',
    component: MainDashboard2Component,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pincode', component: PincodesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'sub-categories', component: SubcategoriesComponent},
      { path: 'users', component: UsersComponent },
      { path: 'business', component: BusinessComponent },
      { path: 'business-list', component: ListBusinessesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard-selector', pathMatch: 'full' }, // Updated redirect
  { path: '**', redirectTo: 'dashboard-selector' }, // Updated wildcard redirect
];