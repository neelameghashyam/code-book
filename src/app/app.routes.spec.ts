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

// Mock all components and AuthGuard
jest.mock('./pages/dashboard/dashboard.component', () => ({ DashboardComponent: class {} }));
jest.mock('./pages/users/users.component', () => ({ UsersComponent: class {} }));
jest.mock('./pages/business/business.component', () => ({ BusinessComponent: class {} }));
jest.mock('./pages/business/list-businesses/list-businesses.component', () => ({
  ListBusinessesComponent: class {},
}));
jest.mock('./login/login/login.component', () => ({ LoginComponent: class {} }));
jest.mock('./main-dashboard/main-dashboard.component', () => ({ MainDashboardComponent: class {} }));
jest.mock('./auth.guard', () => ({ AuthGuard: class {} }));
jest.mock('./pages/pincodes/pincodes.component', () => ({ PincodesComponent: class {} }));
jest.mock('./pages/dashboard-1/dashboard-1.component', () => ({ Dashboard1Component: class {} }));
jest.mock('./main-dashboard-2/main-dashboard-2.component', () => ({ MainDashboard2Component: class {} }));
jest.mock('./dashboard-selector/dashboard-selector.component', () => ({
  DashboardSelectorComponent: class {},
}));
jest.mock('./pages/categories/categories.component', () => ({ CategoriesComponent: class {} }));
jest.mock('./pages/subcategories/subcategories.component', () => ({
  SubcategoriesComponent: class {},
}));

describe('App Routes', () => {
  it('should define routes with correct configurations', async () => {
    // Verify routes array
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(6); // dashboard-selector, main-dashboard, main-dashboard-2, login, default, wildcard

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

    // Test lazy-loaded components in main-dashboard
    const mainDashboardChildren = mainDashboardRoute?.children || [];
    const dashboardRoute = mainDashboardChildren.find((route) => route.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.loadComponent).toBeDefined();
    const DashboardComponentResult = await dashboardRoute!.loadComponent!();
    expect(DashboardComponentResult).toBe(DashboardComponent);

    const dashboard1Route = mainDashboardChildren.find((route) => route.path === 'dashboard-1');
    expect(dashboard1Route).toBeDefined();
    const Dashboard1ComponentResult = await dashboard1Route!.loadComponent!();
    expect(Dashboard1ComponentResult).toBe(Dashboard1Component);

    const categoriesRoute = mainDashboardChildren.find((route) => route.path === 'categories');
    expect(categoriesRoute).toBeDefined();
    const CategoriesComponentResult = await categoriesRoute!.loadComponent!();
    expect(CategoriesComponentResult).toBe(CategoriesComponent);

    const subcategoriesRoute = mainDashboardChildren.find((route) => route.path === 'sub-categories');
    expect(subcategoriesRoute).toBeDefined();
    const SubcategoriesComponentResult = await subcategoriesRoute!.loadComponent!();
    expect(SubcategoriesComponentResult).toBe(SubcategoriesComponent);

    const pincodeRoute = mainDashboardChildren.find((route) => route.path === 'pincode');
    expect(pincodeRoute).toBeDefined();
    const PincodesComponentResult = await pincodeRoute!.loadComponent!();
    expect(PincodesComponentResult).toBe(PincodesComponent);

    const usersRoute = mainDashboardChildren.find((route) => route.path === 'users');
    expect(usersRoute).toBeDefined();
    const UsersComponentResult = await usersRoute!.loadComponent!();
    expect(UsersComponentResult).toBe(UsersComponent);

    const businessRoute = mainDashboardChildren.find((route) => route.path === 'business');
    expect(businessRoute).toBeDefined();
    const BusinessComponentResult = await businessRoute!.loadComponent!();
    expect(BusinessComponentResult).toBe(BusinessComponent);

    const businessListRoute = mainDashboardChildren.find((route) => route.path === 'business-list');
    expect(businessListRoute).toBeDefined();
    const ListBusinessesComponentResult = await businessListRoute!.loadComponent!();
    expect(ListBusinessesComponentResult).toBe(ListBusinessesComponent);

    const mainDashboardRedirect = mainDashboardChildren.find((route) => route.path === '' && route.redirectTo === 'dashboard');
    expect(mainDashboardRedirect).toBeDefined();
    expect(mainDashboardRedirect).toMatchObject({
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

    // Test lazy-loaded components in main-dashboard-2
    const mainDashboard2Children = mainDashboard2Route?.children || [];
    const dashboard2Route = mainDashboard2Children.find((route) => route.path === 'dashboard');
    expect(dashboard2Route).toBeDefined();
    const Dashboard2ComponentResult = await dashboard2Route!.loadComponent!();
    expect(Dashboard2ComponentResult).toBe(DashboardComponent);

    const pincode2Route = mainDashboard2Children.find((route) => route.path === 'pincode');
    expect(pincode2Route).toBeDefined();
    const Pincodes2ComponentResult = await pincode2Route!.loadComponent!();
    expect(Pincodes2ComponentResult).toBe(PincodesComponent);

    const categories2Route = mainDashboard2Children.find((route) => route.path === 'categories');
    expect(categories2Route).toBeDefined();
    const Categories2ComponentResult = await categories2Route!.loadComponent!();
    expect(Categories2ComponentResult).toBe(CategoriesComponent);

    const subcategories2Route = mainDashboard2Children.find((route) => route.path === 'sub-categories');
    expect(subcategories2Route).toBeDefined();
    const Subcategories2ComponentResult = await subcategories2Route!.loadComponent!();
    expect(Subcategories2ComponentResult).toBe(SubcategoriesComponent);

    const users2Route = mainDashboard2Children.find((route) => route.path === 'users');
    expect(users2Route).toBeDefined();
    const Users2ComponentResult = await users2Route!.loadComponent!();
    expect(Users2ComponentResult).toBe(UsersComponent);

    const business2Route = mainDashboard2Children.find((route) => route.path === 'business');
    expect(business2Route).toBeDefined();
    const Business2ComponentResult = await business2Route!.loadComponent!();
    expect(Business2ComponentResult).toBe(BusinessComponent);

    const businessList2Route = mainDashboard2Children.find((route) => route.path === 'business-list');
    expect(businessList2Route).toBeDefined();
    const ListBusinesses2ComponentResult = await businessList2Route!.loadComponent!();
    expect(ListBusinesses2ComponentResult).toBe(ListBusinessesComponent);

    const mainDashboard2Redirect = mainDashboard2Children.find((route) => route.path === '' && route.redirectTo === 'dashboard');
    expect(mainDashboard2Redirect).toBeDefined();
    expect(mainDashboard2Redirect).toMatchObject({
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