import { Injectable, signal, effect } from '@angular/core';
import { DarkModeService } from '../dark-mode.service';

export interface Theme {
  id: string;
  primary: string;
  displayName: string;
  darkModeClass: string;
  lightModeClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themes: Theme[] = [
    {
      id: 'deep-blue',
      primary: '#1976D2',
      displayName: 'Deep-Blue',
      darkModeClass: 'deep-blue-dark-theme',
      lightModeClass: 'deep-blue-light-theme'
    },
    { 
      id: 'green', 
      primary: '#00796B', 
      displayName: 'Green',
      darkModeClass: 'green-dark-theme',
      lightModeClass: 'green-light-theme'
    },
    { 
      id: 'orange', 
      primary: '#E65100', 
      displayName: 'Orange',
      darkModeClass: 'orange-dark-theme',
      lightModeClass: 'orange-light-theme'
    },
    { 
      id: 'purple', 
      primary: '#6200EE', 
      displayName: 'Purple',
      darkModeClass: 'purple-dark-theme',
      lightModeClass: 'purple-light-theme'
    },
    { 
      id: 'red', 
      primary: '#C2185B', 
      displayName: 'Red',
      darkModeClass: 'red-dark-theme',
      lightModeClass: 'red-light-theme'
    },
    { 
      id: 'charcoal', 
      primary: '#333333', 
      displayName: 'Charcoal',
      darkModeClass: 'gray-dark-theme',
      lightModeClass: 'gray-light-theme'
    },
  ];

  currentTheme = signal<Theme>(this.themes[0]);

  constructor(private darkModeService: DarkModeService) {
    // Load theme from local storage
    const storedThemeId = localStorage.getItem('theme') || 'deep-blue';
    const theme = this.themes.find(t => t.id === storedThemeId) || this.themes[0];
    this.currentTheme.set(theme);

    // Set up an effect to apply theme whenever dark mode or theme changes
    effect(() => {
      this.applyCurrentTheme();
    });
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find((t) => t.id === themeId);
    if (theme) {
      this.currentTheme.set(theme);
      localStorage.setItem('theme', theme.id); // Persist theme selection
      this.applyCurrentTheme();
    }
  }

  private applyCurrentTheme(): void {
    // Remove all theme classes first
    document.body.classList.remove(
      ...this.themes
        .map(t => [t.darkModeClass, t.lightModeClass])
        .reduce((acc, curr) => acc.concat(curr), [])
    );
    
    // Add the appropriate theme class based on dark mode
    const currentTheme = this.currentTheme();
    const isDarkMode = this.darkModeService.isDarkMode();
    const themeClass = isDarkMode ? currentTheme.darkModeClass : currentTheme.lightModeClass;
    
    document.body.classList.add(themeClass);
    
    // Set CSS variables for icons and other theme properties
    document.body.style.setProperty('--mat-icon-color', 'var(--mat-sys-on-surface)');
    document.body.style.setProperty('--mat-sys-primary', currentTheme.primary);
  }
}