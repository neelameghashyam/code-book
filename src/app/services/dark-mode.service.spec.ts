import { TestBed } from '@angular/core/testing';
import { DarkModeService, Theme } from './dark-mode.service';

describe('DarkModeService', () => {
  let service: DarkModeService;
  let matchMediaMock: jest.Mock;
  let localStorageMock: { getItem: jest.Mock; setItem: jest.Mock };
  let mediaQueryListMock: { matches: boolean; addEventListener: jest.Mock; removeEventListener: jest.Mock };

  beforeEach(() => {
    // Mock window.matchMedia
    mediaQueryListMock = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    matchMediaMock = jest.fn().mockImplementation((query) => ({
      ...mediaQueryListMock,
      matches: query === '(prefers-color-scheme: dark)' ? mediaQueryListMock.matches : true,
    }));
    window.matchMedia = matchMediaMock;

    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock document.body
    const bodyClassList = {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
    };
    Object.defineProperty(document, 'body', {
      value: {
        classList: bodyClassList,
        setAttribute: jest.fn(),
      },
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [DarkModeService],
    });
    service = TestBed.inject(DarkModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with system theme if no saved theme in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const newService = TestBed.inject(DarkModeService);
      expect(newService.selectedTheme()?.name).toBe('system');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      const newService = TestBed.inject(DarkModeService);
      expect(newService.selectedTheme()?.name).toBe('dark');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should set up system theme change listener', () => {
      const addEventListenerSpy = jest.fn();
      matchMediaMock.mockReturnValueOnce({
        matches: false,
        addEventListener: addEventListenerSpy,
        removeEventListener: jest.fn(),
      });
      const newService = TestBed.inject(DarkModeService);
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('getThemes', () => {
    it('should return all available themes', () => {
      const themes = service.getThemes();
      expect(themes).toEqual([
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
        { name: 'system', icon: 'desktop_windows' },
      ]);
    });
  });

  describe('setTheme', () => {
    it('should set light theme and update localStorage and DOM', () => {
      service.setTheme('light');
      expect(service.selectedTheme()?.name).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should set dark theme and update localStorage and DOM', () => {
      service.setTheme('dark');
      expect(service.selectedTheme()?.name).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should set system theme and update based on system preference', () => {
      mediaQueryListMock.matches = true;
      service.setTheme('system');
      expect(service.selectedTheme()?.name).toBe('system');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'system');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });
  });

  describe('isDarkMode', () => {
    it('should return true for dark theme', () => {
      service.setTheme('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return false for light theme', () => {
      service.setTheme('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should return system preference for system theme (dark)', () => {
      mediaQueryListMock.matches = true;
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return system preference for system theme (light)', () => {
      mediaQueryListMock.matches = false;
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should handle missing window.matchMedia for system theme', () => {
      window.matchMedia = undefined as any;
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('selectedTheme', () => {
    it('should return correct theme object for light theme', () => {
      service.setTheme('light');
      expect(service.selectedTheme()).toEqual({ name: 'light', icon: 'light_mode' });
    });

    it('should return correct theme object for dark theme', () => {
      service.setTheme('dark');
      expect(service.selectedTheme()).toEqual({ name: 'dark', icon: 'dark_mode' });
    });

    it('should return correct theme object for system theme', () => {
      service.setTheme('system');
      expect(service.selectedTheme()).toEqual({ name: 'system', icon: 'desktop_windows' });
    });
  });

  describe('System theme change listener', () => {
    let changeHandler: (event: { matches: boolean }) => void;

    beforeEach(() => {
      mediaQueryListMock.addEventListener.mockImplementation((_, handler) => {
        changeHandler = handler;
      });
      matchMediaMock.mockReturnValue(mediaQueryListMock);
      TestBed.inject(DarkModeService); // Initialize service to set up listener
    });

    it('should apply dark theme when system preference changes to dark in system mode', () => {
      service.setTheme('system');
      mediaQueryListMock.matches = true;
      changeHandler({ matches: true });
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should apply light theme when system preference changes to light in system mode', () => {
      service.setTheme('system');
      mediaQueryListMock.matches = false;
      changeHandler({ matches: false });
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should handle multiple system preference changes in system mode', () => {
      service.setTheme('system');
      mediaQueryListMock.matches = true;
      changeHandler({ matches: true }); // Dark
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');

      mediaQueryListMock.matches = false;
      changeHandler({ matches: false }); // Light
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should not apply theme when system preference changes in light mode', () => {
      const applyThemeSpy = jest.spyOn(service as any, 'applyTheme');
      service.setTheme('light');
      mediaQueryListMock.matches = true;
      changeHandler({ matches: true });
      expect(applyThemeSpy).not.toHaveBeenCalled();
    });

    it('should not apply theme when system preference changes in dark mode', () => {
      const applyThemeSpy = jest.spyOn(service as any, 'applyTheme');
      service.setTheme('dark');
      mediaQueryListMock.matches = false;
      changeHandler({ matches: false });
      expect(applyThemeSpy).not.toHaveBeenCalled();
    });

    it('should handle theme change from system to non-system and back during listener', () => {
      const applyThemeSpy = jest.spyOn(service as any, 'applyTheme');
      service.setTheme('system');
      mediaQueryListMock.matches = true;
      changeHandler({ matches: true }); // Apply dark theme
      expect(applyThemeSpy).toHaveBeenCalledTimes(1);

      service.setTheme('light'); // Switch to light mode
      mediaQueryListMock.matches = false;
      changeHandler({ matches: false }); // System changes to light
      expect(applyThemeSpy).toHaveBeenCalledTimes(1); // No additional calls

      service.setTheme('system'); // Switch back to system mode
      mediaQueryListMock.matches = false;
      changeHandler({ matches: false }); // System still light
      expect(applyThemeSpy).toHaveBeenCalledTimes(2); // Apply light theme
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should handle initial system mode with immediate preference change', () => {
      mediaQueryListMock.addEventListener.mockImplementation((_, handler) => {
        handler({ matches: true }); // Immediate change to dark
      });
      const newService = TestBed.inject(DarkModeService);
      expect(newService.selectedTheme()?.name).toBe('system');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });
  });
});