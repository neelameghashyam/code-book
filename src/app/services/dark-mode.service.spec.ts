import { DarkModeService } from './dark-mode.service';

describe('DarkModeService', () => {
  let service: DarkModeService;
  let mockLocalStorage: { [key: string]: string };
  let originalLocalStorage: Storage;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) => mockLocalStorage[key] = value,
      },
      writable: true
    });

    // Mock matchMedia
    originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock document.body.classList
    document.body.classList.toggle = jest.fn();
    document.body.setAttribute = jest.fn();

    service = new DarkModeService();
  });

  afterEach(() => {
    // Restore original implementations
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia });
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeTheme', () => {
    it('should initialize with dark mode if localStorage is true', () => {
      mockLocalStorage['darkMode'] = 'true';
      new DarkModeService();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should initialize with light mode if localStorage is false', () => {
      mockLocalStorage['darkMode'] = 'false';
      new DarkModeService();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });

    it('should initialize with system preference (dark) when no localStorage value', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
      }));
      new DarkModeService();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should initialize with system preference (light) when no localStorage value', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: false,
      }));
      new DarkModeService();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle from light to dark mode', () => {
      service['isDark'] = false;
      service.toggleDarkMode();
      expect(service['isDark']).toBe(true);
      expect(mockLocalStorage['darkMode']).toBe('true');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should toggle from dark to light mode', () => {
      service['isDark'] = true;
      service.toggleDarkMode();
      expect(service['isDark']).toBe(false);
      expect(mockLocalStorage['darkMode']).toBe('false');
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });
  });

  describe('isDarkMode', () => {
    it('should return true when in dark mode', () => {
      service['isDark'] = true;
      expect(service.isDarkMode).toBe(true);
    });

    it('should return false when in light mode', () => {
      service['isDark'] = false;
      expect(service.isDarkMode).toBe(false);
    });
  });

  describe('applyTheme', () => {
    it('should apply dark theme', () => {
      service['isDark'] = true;
      service['applyTheme']();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', false);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark-theme');
    });

    it('should apply light theme', () => {
      service['isDark'] = false;
      service['applyTheme']();
      expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);
      expect(document.body.classList.toggle).toHaveBeenCalledWith('light-theme', true);
      expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light-theme');
    });
  });
});