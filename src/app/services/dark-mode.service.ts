import { Injectable, computed, signal } from '@angular/core';

export interface Theme {
  name: 'light' | 'dark' | 'system';
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private theme = signal<'light' | 'dark' | 'system'>('system');
  private themes: Theme[] = [
    { name: 'light', icon: 'light_mode' },
    { name: 'dark', icon: 'dark_mode' },
    { name: 'system', icon: 'desktop_windows' }
  ];

  selectedTheme = computed(() => this.themes.find(t => t.name === this.theme())!);
  isDarkMode = computed(() => {
    if (this.theme() === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return this.theme() === 'dark';
  });

  constructor() {
    this.initializeTheme();
    // Listen for system theme changes when in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyTheme();
      }
    });
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    this.theme.set(savedTheme as 'light' | 'dark' | 'system' || 'system');
    this.applyTheme();
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  getThemes() {
    return this.themes;
  }

  public applyTheme() {
    const isDark = this.isDarkMode();
    // Toggle dark/light theme classes on the body
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
    document.body.setAttribute('data-theme', isDark ? 'dark-theme' : 'light-theme');
  }

  isVisible() {
    return true; // Theme toggle is always visible
  }
}