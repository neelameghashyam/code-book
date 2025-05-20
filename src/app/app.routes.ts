import { Routes } from '@angular/router';
   import { DashboardComponent } from './pages/dashboard/dashboard.component';
   import { UsersComponent } from './pages/users/users.component';
   import { BusinessComponent } from './pages/business/business.component';
   import { ListBusinessesComponent } from './pages/business/list-businesses/list-businesses.component';
   import { LoginComponent } from './login/login/login.component';
   import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
   import { AuthGuard } from './auth.guard';

   export const routes: Routes = [
     {
       path: 'main-dashboard',
       component: MainDashboardComponent,
       canActivate: [AuthGuard],
       children: [
         { path: 'dashboard', component: DashboardComponent },
         { path: 'users', component: UsersComponent },
         { path: 'business', component: BusinessComponent },
         { path: 'business-list', component: ListBusinessesComponent },
         { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
       ],
     },
     { path: 'login', component: LoginComponent },
     { path: '', redirectTo: 'login', pathMatch: 'full' },
     { path: '**', redirectTo: 'login' },
   ];