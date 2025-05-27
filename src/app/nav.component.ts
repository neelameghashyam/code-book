import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './login/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav>
      <ul>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/dashboard">Dashboard</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/categories">Categories</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/categories">Categories</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/pincode">Pincodes</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/users">Users</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/business">Business</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard/business-list">Business List</a>
        </li>
        <li *ngIf="!isAuthenticated()">
          <a routerLink="/login">Login</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/dashboard">Dashboard</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/pincode">Pincodes</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/users">Users</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/business">Business</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/main-dashboard-2/business-list">Business List</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <a routerLink="/dashboard-selector">Dashboard-Selector</a>
        </li>
        <li *ngIf="isAuthenticated()">
          <button (click)="signout()">Sign Out</button>
        </li>
      </ul>
    </nav>
  `,
  styles: [`nav ul { list-style: none; display: flex; gap: 1rem; }`],
})
export class NavComponent {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.getIsAuthenticated;

  signout() {
    this.authService.signout();
  }
}