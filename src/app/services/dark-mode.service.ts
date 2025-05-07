import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode.next(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }

  toggleDarkMode(): void {
    const newMode = !this.isDarkMode.value;
    this.isDarkMode.next(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  }

  getCurrentTheme(): boolean {
    return this.isDarkMode.value;
  }
}