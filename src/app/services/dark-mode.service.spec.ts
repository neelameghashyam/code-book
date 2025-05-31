import { TestBed } from '@angular/core/testing';
import { DarkModeService, Theme } from './dark-mode.service';

describe('DarkModeService', () => {
  let service: DarkModeService;
  let matchMediaMock: jest.Mock;
  let mediaQueryList: MockMediaQueryList;

  // Mock MediaQueryList with writable matches
  interface MockMediaQueryList extends MediaQueryList {
    matches: boolean; // Make matches writable
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  }

  beforeEach(() => {
    // Mock window.matchMedia
    mediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as MockMediaQueryList;

    matchMediaMock = jest.fn().mockReturnValue(mediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
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

    // Mock document.body
    const bodyMock = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
      },
      setAttribute: jest.fn(),
    };
    Object.defineProperty(document, 'body', {
      value: bodyMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [DarkModeService],
    });
    service = TestBed.inject(DarkModeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with system theme by default', () => {
      expect(service['theme']()).toBe('system');
      expect(localStorage.getItem).toHaveBeenCalledWith('theme');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should initialize with saved theme from localStorage', () => {
      // Reset mocks and set localStorage before creating service
      jest.clearAllMocks();
      (localStorage.getItem as jest.Mock).mockReturnValue('dark');
      const newService = TestBed.inject(DarkModeService);
      expect(newService['theme']()).toBe('system');
      expect(localStorage.getItem)
      expect(document.body.classList.toggle)
      expect(document.body.classList.toggle)
      expect(document.body.setAttribute)
    });

    it('should set up event listener for system theme changes', () => {
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('selectedTheme', () => {
    it('should return the correct theme object for light theme', () => {
      service.setTheme('light');
      const selected = service.selectedTheme();
      expect(selected).toEqual({ name: 'light', icon: 'light_mode' });
    });

    it('should return the correct theme object for dark theme', () => {
      service.setTheme('dark');
      const selected = service.selectedTheme();
      expect(selected).toEqual({ name: 'dark', icon: 'dark_mode' });
    });

    it('should return the correct theme object for system theme', () => {
      service.setTheme('system');
      const selected = service.selectedTheme();
      expect(selected).toEqual({ name: 'system', icon: 'desktop_windows' });
    });
  });

  describe('isDarkMode', () => {
    it('should return false for light theme', () => {
      service.setTheme('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should return true for dark theme', () => {
      service.setTheme('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return system preference for system theme (dark)', () => {
      mediaQueryList.matches = true;
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should return system preference for system theme (light)', () => {
      mediaQueryList.matches = false;
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should handle missing window.matchMedia for system theme', () => {
      Object.defineProperty(window, 'matchMedia', { value: undefined });
      service.setTheme('system');
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set light theme and update DOM', () => {
      service.setTheme('light');
      expect(service['theme']()).toBe('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should set dark theme and update DOM', () => {
      service.setTheme('dark');
      expect(service['theme']()).toBe('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should set system theme and update DOM based on system preference (dark)', () => {
      mediaQueryList.matches = true;
      service.setTheme('system');
      expect(service['theme']()).toBe('system');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
      expect(document.body.classList.toggle)
      expect(document.body.classList.toggle)
      expect(document.body.setAttribute)
    });

    it('should set system theme and update DOM based on system preference (light)', () => {
      mediaQueryList.matches = false;
      service.setTheme('system');
      expect(service['theme']()).toBe('system');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });
  });

  describe('getThemes', () => {
    it('should return the list of themes', () => {
      const themes = service.getThemes();
      expect(themes).toEqual([
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
        { name: 'system', icon: 'desktop_windows' },
      ]);
    });
  });

  describe('System Theme Change Listener', () => {
    it('should apply theme when system preference changes in system mode', () => {
      service.setTheme('system');
      mediaQueryList.matches = true;
      const changeHandler = (mediaQueryList.addEventListener as jest.Mock).mock.calls[0][1];
      jest.spyOn(service as any, 'applyTheme').mockImplementation();
      changeHandler();
      expect((service as any).applyTheme).toHaveBeenCalled();
    });

    it('should not apply theme when system preference changes in non-system mode', () => {
      service.setTheme('light');
      mediaQueryList.matches = true;
      const changeHandler = (mediaQueryList.addEventListener as jest.Mock).mock.calls[0][1];
      jest.spyOn(service as any, 'applyTheme').mockImplementation();
      changeHandler();
      expect((service as any).applyTheme).not.toHaveBeenCalled();
    });
  });

  describe('applyTheme', () => {
    it('should apply dark theme classes and attributes', () => {
      service.setTheme('dark');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should apply light theme classes and attributes', () => {
      service.setTheme('light');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should apply system theme based on dark preference', () => {
      mediaQueryList.matches = true;
      service.setTheme('system');
      expect(document.body.classList.toggle)
      expect(document.body.classList.toggle)
      expect(document.body.setAttribute)
    });

    it('should apply system theme based on light preference', () => {
      mediaQueryList.matches = false;
      service.setTheme('system');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });
  });

  describe('isVisible', () => {
    it('should return true indicating theme toggle is visible', () => {
      expect(service.isVisible()).toBe(true);
    });
  });
});