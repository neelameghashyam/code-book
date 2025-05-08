import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDark = false;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.isDark = savedMode ? savedMode === 'true' : systemPrefersDark;
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDark = !this.isDark;
    localStorage.setItem('darkMode', String(this.isDark));
    this.applyTheme();
  }

  get isDarkMode(): boolean {
    return this.isDark;
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDark);
    document.body.classList.toggle('light-theme', !this.isDark);
    
    // Update Material theme class
    const themeClass = this.isDark ? 'dark-theme' : 'light-theme';
    document.body.setAttribute('data-theme', themeClass);
  }
}