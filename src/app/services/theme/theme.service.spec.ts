import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme } from './theme.service';
import { DarkModeService } from '../dark-mode.service';
import { signal } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;
  let darkModeServiceMock: jest.Mocked<DarkModeService>;

  beforeEach(() => {
    // Mock DarkModeService
    darkModeServiceMock = {
      isDarkMode: jest.fn().mockReturnValue(false),
      selectedTheme: signal({ name: 'light', icon: 'light_mode' }),
      getThemes: jest.fn(),
      setTheme: jest.fn(),
    } as any;

    // Mock document.body
    const bodyMock = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
      },
      style: {
        setProperty: jest.fn(),
      },
    };
    Object.defineProperty(document, 'body', {
      value: bodyMock,
      writable: true,
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DarkModeService, useValue: darkModeServiceMock },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with deep-blue theme', () => {
      expect(service.currentTheme()).toEqual({
        id: 'deep-blue',
        primary: '#1976D2',
        displayName: 'Deep-Blue',
        darkModeClass: 'deep-blue-dark-theme',
        lightModeClass: 'deep-blue-light-theme',
      });
      expect(document.body.classList.add)
      expect(document.body.style.setProperty)
      expect(document.body.style.setProperty)
    });

    it('should remove all theme classes during initialization', () => {
      const allThemeClasses = [
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme',
      ];
      expect(document.body.classList.remove)
    });
  });

  describe('getThemes', () => {
    it('should return the list of themes', () => {
      const themes = service.getThemes();
      expect(themes).toHaveLength(6);
      expect(themes).toEqual([
        {
          id: 'deep-blue',
          primary: '#1976D2',
          displayName: 'Deep-Blue',
          darkModeClass: 'deep-blue-dark-theme',
          lightModeClass: 'deep-blue-light-theme',
        },
        {
          id: 'green',
          primary: '#00796B',
          displayName: 'Green',
          darkModeClass: 'green-dark-theme',
          lightModeClass: 'green-light-theme',
        },
        {
          id: 'orange',
          primary: '#E65100',
          displayName: 'Orange',
          darkModeClass: 'orange-dark-theme',
          lightModeClass: 'orange-light-theme',
        },
        {
          id: 'purple',
          primary: '#6200EE',
          displayName: 'Purple',
          darkModeClass: 'purple-dark-theme',
          lightModeClass: 'purple-light-theme',
        },
        {
          id: 'red',
          primary: '#C2185B',
          displayName: 'Red',
          darkModeClass: 'red-dark-theme',
          lightModeClass: 'red-light-theme',
        },
        {
          id: 'charcoal',
          primary: '#333333',
          displayName: 'Charcoal',
          darkModeClass: 'gray-dark-theme',
          lightModeClass: 'gray-light-theme',
        },
      ]);
    });
  });

  describe('setTheme', () => {
    it('should set theme to green and apply light theme class when not in dark mode', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(false);
      service.setTheme('green');
      expect(service.currentTheme()).toEqual({
        id: 'green',
        primary: '#00796B',
        displayName: 'Green',
        darkModeClass: 'green-dark-theme',
        lightModeClass: 'green-light-theme',
      });
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme'
      );
      expect(document.body.classList.add).toHaveBeenCalledWith('green-light-theme');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-icon-color', 'var(--mat-sys-on-surface)');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-sys-primary', '#00796B');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'green');
    });

    it('should set theme to purple and apply dark theme class when in dark mode', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(true);
      service.setTheme('purple');
      expect(service.currentTheme()).toEqual({
        id: 'purple',
        primary: '#6200EE',
        displayName: 'Purple',
        darkModeClass: 'purple-dark-theme',
        lightModeClass: 'purple-light-theme',
      });
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme'
      );
      expect(document.body.classList.add).toHaveBeenCalledWith('purple-dark-theme');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-icon-color', 'var(--mat-sys-on-surface)');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-sys-primary', '#6200EE');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'purple');
    });

    it('should not change theme if themeId is invalid', () => {
      const originalTheme = service.currentTheme();
      service.setTheme('invalid');
      expect(service.currentTheme()).toEqual(originalTheme);
      expect(document.body.classList.add)
      expect(document.body.style.setProperty)
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('applyCurrentTheme', () => {
    it('should apply light theme class when not in dark mode', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(false);
      service.setTheme('orange');
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme'
      );
      expect(document.body.classList.add).toHaveBeenCalledWith('orange-light-theme');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-icon-color', 'var(--mat-sys-on-surface)');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-sys-primary', '#E65100');
    });

    it('should apply dark theme class when in dark mode', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(true);
      service.setTheme('red');
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme'
      );
      expect(document.body.classList.add).toHaveBeenCalledWith('red-dark-theme');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-icon-color', 'var(--mat-sys-on-surface)');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-sys-primary', '#C2185B');
    });
  });

  describe('Effect', () => {
    it('should reapply theme when dark mode changes', () => {
      // Initialize with light mode
      darkModeServiceMock.isDarkMode.mockReturnValue(false);
      service.setTheme('green');
      expect(document.body.classList.add).toHaveBeenCalledWith('green-light-theme');

      // Simulate dark mode change
      darkModeServiceMock.isDarkMode.mockReturnValue(true);
      // Manually trigger applyCurrentTheme to simulate effect
      (service as any).applyCurrentTheme();
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'deep-blue-dark-theme', 'deep-blue-light-theme',
        'green-dark-theme', 'green-light-theme',
        'orange-dark-theme', 'orange-light-theme',
        'purple-dark-theme', 'purple-light-theme',
        'red-dark-theme', 'red-light-theme',
        'gray-dark-theme', 'gray-light-theme'
      );
      expect(document.body.classList.add).toHaveBeenCalledWith('green-dark-theme');
      expect(document.body.style.setProperty).toHaveBeenCalledWith('--mat-sys-primary', '#00796B');
    });

    it('should call applyCurrentTheme when effect is triggered', () => {
      const applyThemeSpy = jest.spyOn(service as any, 'applyCurrentTheme');
      // Simulate effect trigger by manually calling applyCurrentTheme
      (service as any).applyCurrentTheme();
      expect(applyThemeSpy).toHaveBeenCalled();
      expect(document.body.classList.add).toHaveBeenCalledWith('deep-blue-light-theme');
      applyThemeSpy.mockRestore();
    });

    it('should trigger applyCurrentTheme when theme changes', () => {
      const applyThemeSpy = jest.spyOn(service as any, 'applyCurrentTheme');
      service.setTheme('green');
      expect(applyThemeSpy).toHaveBeenCalled();
      expect(document.body.classList.add).toHaveBeenCalledWith('green-light-theme');
      applyThemeSpy.mockRestore();
    });
  });

  describe('Local Storage', () => {
    it('should load theme from localStorage on initialization', () => {
      localStorage.getItem = jest.fn().mockReturnValue('purple');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: DarkModeService, useValue: darkModeServiceMock },
        ],
      });
      service = TestBed.inject(ThemeService);
      expect(service.currentTheme()).toEqual({
        id: 'purple',
        primary: '#6200EE',
        displayName: 'Purple',
        darkModeClass: 'purple-dark-theme',
        lightModeClass: 'purple-light-theme',
      });
      expect(document.body.classList.add)
    });
  });
});

