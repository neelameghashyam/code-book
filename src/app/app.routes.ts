import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { BusinessComponent } from './pages/business/business.component';
import { ListBusinessesComponent } from './pages/business/list-businesses/list-businesses.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'users', component: UsersComponent },
    { path: 'business', component: BusinessComponent },
    { path: 'business-list', component: ListBusinessesComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
