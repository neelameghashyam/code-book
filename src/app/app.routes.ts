import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'users', component: UsersComponent },

    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
