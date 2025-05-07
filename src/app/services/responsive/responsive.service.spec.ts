import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ResponsiveService } from './responsive.service';
import { of } from 'rxjs';

describe('ResponsiveService', () => {
  let service: ResponsiveService;
  let breakpointObserver: BreakpointObserver;
  let mockObserverSubscribe: jest.Mock;

  beforeEach(() => {
    mockObserverSubscribe = jest.fn();
    const breakpointObserverMock = {
      observe: jest.fn().mockReturnValue({
        subscribe: mockObserverSubscribe
      })
    };

    TestBed.configureTestingModule({
      providers: [
        ResponsiveService,
        { provide: BreakpointObserver, useValue: breakpointObserverMock }
      ]
    });

    service = TestBed.inject(ResponsiveService);
    breakpointObserver = TestBed.inject(BreakpointObserver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize breakpointObserver with all breakpoints', () => {
      expect(breakpointObserver.observe).toHaveBeenCalledWith([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ]);
    });

    it('should update breakpointState when breakpointObserver emits', () => {
      const mockBreakpointState = {
        breakpoints: {
          [Breakpoints.XSmall]: true,
          [Breakpoints.Small]: false,
          [Breakpoints.Medium]: false,
          [Breakpoints.Large]: false,
          [Breakpoints.XLarge]: false
        }
      };

      // Simulate the subscription callback
      const subscribeCallback = mockObserverSubscribe.mock.calls[0][0];
      subscribeCallback(mockBreakpointState);

      expect(service['breakpointState']).toEqual({
        isXSmall: true,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      });
    });
  });

  describe('isMobile', () => {
    it('should return true when isXSmall is true', () => {
      service['breakpointState'] = {
        isXSmall: true,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isMobile()).toBe(true);
    });

    it('should return false when isXSmall is false', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isMobile()).toBe(false);
    });
  });

  describe('isTablet', () => {
    it('should return true when isSmall is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: true,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isTablet()).toBe(true);
    });

    it('should return true when isMedium is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: true,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isTablet()).toBe(true);
    });

    it('should return false when neither isSmall nor isMedium is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isTablet()).toBe(false);
    });
  });

  describe('isDesktop', () => {
    it('should return true when isLarge is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: true,
        isXLarge: false
      };
      expect(service.isDesktop()).toBe(true);
    });

    it('should return true when isXLarge is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: true
      };
      expect(service.isDesktop()).toBe(true);
    });

    it('should return false when neither isLarge nor isXLarge is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.isDesktop()).toBe(false);
    });
  });

  describe('currentBreakpoint', () => {
    it('should return "xsmall" when isXSmall is true', () => {
      service['breakpointState'] = {
        isXSmall: true,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.currentBreakpoint()).toBe('xsmall');
    });

    it('should return "small" when isSmall is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: true,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.currentBreakpoint()).toBe('small');
    });

    it('should return "medium" when isMedium is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: true,
        isLarge: false,
        isXLarge: false
      };
      expect(service.currentBreakpoint()).toBe('medium');
    });

    it('should return "large" when isLarge is true', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: true,
        isXLarge: false
      };
      expect(service.currentBreakpoint()).toBe('large');
    });

    it('should return "xlarge" when isXLarge is true or no other breakpoint is active', () => {
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: true
      };
      expect(service.currentBreakpoint()).toBe('xlarge');

      // Test default case when no breakpoints are active
      service['breakpointState'] = {
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: false
      };
      expect(service.currentBreakpoint()).toBe('xlarge');
    });
  });
});