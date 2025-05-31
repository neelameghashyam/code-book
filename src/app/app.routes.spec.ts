// app.routes.spec.ts
import { Routes } from '@angular/router';
import { routes } from './app.routes';
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

// Mock all components and AuthGuard to avoid importing actual implementations
jest.mock('./pages/dashboard/dashboard.component', () => ({ DashboardComponent: {} }));
jest.mock('./pages/users/users.component', () => ({ UsersComponent: {} }));
jest.mock('./pages/business/business.component', () => ({ BusinessComponent: {} }));
jest.mock('./pages/business/list-businesses/list-businesses.component', () => ({
  ListBusinessesComponent: {},
}));
jest.mock('./login/login/login.component', () => ({ LoginComponent: {} }));
jest.mock('./main-dashboard/main-dashboard.component', () => ({ MainDashboardComponent: {} }));
jest.mock('./auth.guard', () => ({ AuthGuard: {} }));
jest.mock('./pages/pincodes/pincodes.component', () => ({ PincodesComponent: {} }));
jest.mock('./pages/dashboard-1/dashboard-1.component', () => ({ Dashboard1Component: {} }));
jest.mock('./main-dashboard-2/main-dashboard-2.component', () => ({ MainDashboard2Component: {} }));
jest.mock('./dashboard-selector/dashboard-selector.component', () => ({
  DashboardSelectorComponent: {},
}));
jest.mock('./pages/categories/categories.component', () => ({ CategoriesComponent: {} }));
jest.mock('./pages/subcategories/subcategories.component', () => ({
  SubcategoriesComponent: {},
}));

describe('App Routes', () => {
  it('should define routes with correct configurations', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(6); // 3 main routes + login + wildcard

    // Test dashboard-selector route
    const dashboardSelectorRoute = routes.find((route) => route.path === 'dashboard-selector');
    expect(dashboardSelectorRoute).toBeDefined();
    expect(dashboardSelectorRoute).toMatchObject({
      path: 'dashboard-selector',
      component: DashboardSelectorComponent,
      canActivate: [AuthGuard],
    });

    // Test main-dashboard route and its children
    const mainDashboardRoute = routes.find((route) => route.path === 'main-dashboard');
    expect(mainDashboardRoute).toBeDefined();
    expect(mainDashboardRoute).toMatchObject({
      path: 'main-dashboard',
      component: MainDashboardComponent,
      canActivate: [AuthGuard],
    });
    expect(mainDashboardRoute?.children).toBeDefined();
    expect(mainDashboardRoute?.children?.length).toBe(9); // 8 components + 1 redirect
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'dashboard', component: DashboardComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'dashboard-1', component: Dashboard1Component });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'categories', component: CategoriesComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'sub-categories', component: SubcategoriesComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'pincode', component: PincodesComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'users', component: UsersComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'business', component: BusinessComponent });
    expect(mainDashboardRoute?.children).toContainEqual({ path: 'business-list', component: ListBusinessesComponent });
    expect(mainDashboardRoute?.children).toContainEqual({
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    });

    // Test main-dashboard-2 route and its children
    const mainDashboard2Route = routes.find((route) => route.path === 'main-dashboard-2');
    expect(mainDashboard2Route).toBeDefined();
    expect(mainDashboard2Route).toMatchObject({
      path: 'main-dashboard-2',
      component: MainDashboard2Component,
      canActivate: [AuthGuard],
    });
    expect(mainDashboard2Route?.children).toBeDefined();
    expect(mainDashboard2Route?.children?.length).toBe(8); // 7 components + 1 redirect
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'dashboard', component: DashboardComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'pincode', component: PincodesComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'categories', component: CategoriesComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'sub-categories', component: SubcategoriesComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'users', component: UsersComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'business', component: BusinessComponent });
    expect(mainDashboard2Route?.children).toContainEqual({ path: 'business-list', component: ListBusinessesComponent });
    expect(mainDashboard2Route?.children).toContainEqual({
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    });

    // Test login route
    const loginRoute = routes.find((route) => route.path === 'login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute).toMatchObject({
      path: 'login',
      component: LoginComponent,
    });

    // Test default redirect
    const defaultRoute = routes.find((route) => route.path === '');
    expect(defaultRoute).toBeDefined();
    expect(defaultRoute).toMatchObject({
      path: '',
      redirectTo: 'dashboard-selector',
      pathMatch: 'full',
    });

    // Test wildcard route
    const wildcardRoute = routes.find((route) => route.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute).toMatchObject({
      path: '**',
      redirectTo: 'dashboard-selector',
    });
  });
});