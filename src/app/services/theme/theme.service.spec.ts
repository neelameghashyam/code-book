import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme } from './theme.service';
import { DarkModeService } from '../dark-theme/dark-mode.service';
import { signal, effect } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;
  let darkModeService: DarkModeService;
  let mockDarkModeSignal: any;

  // Mock document.body.classList and style
  let classListAddSpy: jest.SpyInstance;
  let classListRemoveSpy: jest.SpyInstance;
  let styleSetPropertySpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock DarkModeService
    mockDarkModeSignal = signal(false);
    const darkModeServiceMock = {
      darkMode: jest.fn().mockReturnValue(mockDarkModeSignal),
    };

    // Mock document.body
    const mockClassList = {
      add: jest.fn(),
      remove: jest.fn(),
    };
    const mockStyle = {
      setProperty: jest.fn(),
    };
    jest.spyOn(document, 'body', 'get').mockReturnValue({
      classList: mockClassList,
      style: mockStyle,
    } as any);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DarkModeService, useValue: darkModeServiceMock },
      ],
    });

    service = TestBed.inject(ThemeService);
    darkModeService = TestBed.inject(DarkModeService);

    // Store spies
    classListAddSpy = jest.spyOn(mockClassList, 'add');
    classListRemoveSpy = jest.spyOn(mockClassList, 'remove');
    styleSetPropertySpy = jest.spyOn(mockStyle, 'setProperty');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor and effect', () => {
    it('should initialize with default theme (deep-blue)', () => {
      expect(service.currentTheme().id).toBe('deep-blue');
      expect(service.currentTheme().lightModeClass).toBe('deep-blue-light-theme');
    });

    it('should call applyCurrentTheme on initialization via effect', () => {
      const applyCurrentThemeSpy = jest.spyOn(service as any, 'applyCurrentTheme');
      TestBed.inject(ThemeService); // Trigger effect
      expect(applyCurrentThemeSpy).toHaveBeenCalled();
    });

    it('should re-apply theme when darkMode or currentTheme signal changes', () => {
      const applyCurrentThemeSpy = jest.spyOn(service as any, 'applyCurrentTheme');
      applyCurrentThemeSpy.mockClear(); // Clear initial call

      // Run effect in injection context to ensure synchronous execution
      TestBed.runInInjectionContext(() => {
        // Initial effect run
        effect(() => {
          service['applyCurrentTheme'](); // Access private method
        });

        // Change darkMode signal
        mockDarkModeSignal.set(true);
        expect(applyCurrentThemeSpy).toHaveBeenCalledTimes(1);

        // Change currentTheme signal
        service.setTheme('green');
        expect(applyCurrentThemeSpy).toHaveBeenCalledTimes(2);

        // Change darkMode signal again
        mockDarkModeSignal.set(false);
        expect(applyCurrentThemeSpy).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('getThemes', () => {
    it('should return all themes', () => {
      const themes = service.getThemes();
      expect(themes.length).toBe(5);
      expect(themes.map((t) => t.id)).toEqual(['deep-blue', 'green', 'orange', 'purple', 'red']);
    });
  });

  describe('setTheme', () => {
    it.each([
      ['deep-blue', 'deep-blue-light-theme', '#1976D2'],
      ['green', 'green-light-theme', '#00796B'],
      ['orange', 'orange-light-theme', '#E65100'],
      ['purple', 'purple-light-theme', '#6200EE'],
      ['red', 'red-light-theme', '#C2185B'],
    ])('should set theme %s and apply lightModeClass', (themeId, lightModeClass, primary) => {
      service.setTheme(themeId);
      expect(service.currentTheme().id).toBe(themeId);
      expect(service.currentTheme().lightModeClass).toBe(lightModeClass);
      expect(service.currentTheme().primary).toBe(primary);
      expect(classListAddSpy).toHaveBeenCalledWith(lightModeClass);
    });

    it('should not change theme if themeId is invalid', () => {
      const initialTheme = service.currentTheme();
      service.setTheme('invalid');
      expect(service.currentTheme()).toBe(initialTheme);
      expect(classListAddSpy).not.toHaveBeenCalledWith('invalid');
    });
  });

  describe('applyCurrentTheme', () => {
    it('should remove all theme classes', () => {
      (service as any).applyCurrentTheme();
      expect(classListRemoveSpy).toHaveBeenCalledWith(
        'deep-blue-dark-theme',
        'deep-blue-light-theme',
        'green-dark-theme',
        'green-light-theme',
        'orange-dark-theme',
        'orange-light-theme',
        'purple-dark-theme',
        'purple-light-theme',
        'red-dark-theme',
        'red-light-theme'
      );
    });

    it.each([
      ['deep-blue', 'deep-blue-light-theme', 'deep-blue-dark-theme', '#1976D2'],
      ['green', 'green-light-theme', 'green-dark-theme', '#00796B'],
      ['orange', 'orange-light-theme', 'orange-dark-theme', '#E65100'],
      ['purple', 'purple-light-theme', 'purple-dark-theme', '#6200EE'],
      ['red', 'red-light-theme', 'red-dark-theme', '#C2185B'],
    ])(
      'should apply lightModeClass for %s when darkMode is false',
      (themeId, lightModeClass, darkModeClass, primary) => {
        service.setTheme(themeId);
        mockDarkModeSignal.set(false);
        (service as any).applyCurrentTheme();
        expect(classListAddSpy).toHaveBeenCalledWith(lightModeClass);
        expect(classListAddSpy).not.toHaveBeenCalledWith(darkModeClass);
        expect(styleSetPropertySpy).toHaveBeenCalledWith('--mat-sys-primary', primary);
      }
    );

    it.each([
      ['deep-blue', 'deep-blue-dark-theme', 'deep-blue-light-theme', '#1976D2'],
      ['green', 'green-dark-theme', 'green-light-theme', '#00796B'],
      ['orange', 'orange-dark-theme', 'orange-light-theme', '#E65100'],
      ['purple', 'purple-dark-theme', 'purple-light-theme', '#6200EE'],
      ['red', 'red-dark-theme', 'red-light-theme', '#C2185B'],
    ])(
      'should apply darkModeClass for %s when darkMode is true',
      (themeId, darkModeClass, lightModeClass, primary) => {
        service.setTheme(themeId);
        mockDarkModeSignal.set(true);
        (service as any).applyCurrentTheme();
        expect(classListAddSpy).toHaveBeenCalledWith(darkModeClass);
        expect(classListAddSpy).not.toHaveBeenCalledWith(lightModeClass);
        expect(styleSetPropertySpy).toHaveBeenCalledWith('--mat-sys-primary', primary);
      }
    );

    it('should set CSS variables for icon and primary colors', () => {
      (service as any).applyCurrentTheme();
      expect(styleSetPropertySpy).toHaveBeenCalledWith('--mat-icon-color', 'var(--mat-sys-on-surface)');
      expect(styleSetPropertySpy).toHaveBeenCalledWith('--mat-sys-primary', '#1976D2');
    });
  });
});