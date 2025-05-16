import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ResponsiveService } from './responsive.service';
import { Breakpoints } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('ResponsiveService', () => {
  let service: ResponsiveService;
  let breakpointObserverMock: Partial<BreakpointObserver>;

  beforeEach(() => {
    breakpointObserverMock = {
      observe: jest.fn(),
      isMatched: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ResponsiveService,
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    });

    service = TestBed.inject(ResponsiveService);
  });

  describe('currentBreakpoint', () => {
    it('should return "xsmall" when XSmall breakpoint is matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: true,
          breakpoints: {
            [Breakpoints.XSmall]: true,
            [Breakpoints.Small]: false,
            [Breakpoints.Medium]: false,
            [Breakpoints.Large]: false,
            [Breakpoints.XLarge]: false,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('xsmall');
        done();
      });
    });

    it('should return "small" when Small breakpoint is matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: true,
          breakpoints: {
            [Breakpoints.XSmall]: false,
            [Breakpoints.Small]: true,
            [Breakpoints.Medium]: false,
            [Breakpoints.Large]: false,
            [Breakpoints.XLarge]: false,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('small');
        done();
      });
    });

    it('should return "medium" when Medium breakpoint is matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: true,
          breakpoints: {
            [Breakpoints.XSmall]: false,
            [Breakpoints.Small]: false,
            [Breakpoints.Medium]: true,
            [Breakpoints.Large]: false,
            [Breakpoints.XLarge]: false,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('medium');
        done();
      });
    });

    it('should return "large" when Large breakpoint is matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: true,
          breakpoints: {
            [Breakpoints.XSmall]: false,
            [Breakpoints.Small]: false,
            [Breakpoints.Medium]: false,
            [Breakpoints.Large]: true,
            [Breakpoints.XLarge]: false,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('large');
        done();
      });
    });

    it('should return "xlarge" when XLarge breakpoint is matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: true,
          breakpoints: {
            [Breakpoints.XSmall]: false,
            [Breakpoints.Small]: false,
            [Breakpoints.Medium]: false,
            [Breakpoints.Large]: false,
            [Breakpoints.XLarge]: true,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('xlarge');
        done();
      });
    });

    it('should return "xlarge" when no breakpoints are matched', (done) => {
      (breakpointObserverMock.observe as jest.Mock).mockReturnValue(
        of({
          matches: false,
          breakpoints: {
            [Breakpoints.XSmall]: false,
            [Breakpoints.Small]: false,
            [Breakpoints.Medium]: false,
            [Breakpoints.Large]: false,
            [Breakpoints.XLarge]: false,
          },
        })
      );

      service.currentBreakpoint().subscribe((breakpoint) => {
        expect(breakpoint).toBe('xlarge');
        done();
      });
    });
  });

  describe('isMobile', () => {
    it('should return true when XSmall breakpoint is matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockImplementation(
        (query) => query === Breakpoints.XSmall
      );
      expect(service.isMobile()).toBe(true);
    });

    it('should return false when XSmall breakpoint is not matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockReturnValue(false);
      expect(service.isMobile()).toBe(false);
    });
  });

  describe('isTablet', () => {
    it('should return true when Small breakpoint is matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockImplementation(
        (query) => query === Breakpoints.Small
      );
      expect(service.isTablet()).toBe(true);
    });

    it('should return true when Medium breakpoint is matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockImplementation(
        (query) => query === Breakpoints.Medium
      );
      expect(service.isTablet()).toBe(true);
    });

    it('should return false when neither Small nor Medium breakpoints are matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockReturnValue(false);
      expect(service.isTablet()).toBe(false);
    });
  });

  describe('isDesktop', () => {
    it('should return true when Large breakpoint is matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockImplementation(
        (query) => query === Breakpoints.Large
      );
      expect(service.isDesktop()).toBe(true);
    });

    it('should return true when XLarge breakpoint is matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockImplementation(
        (query) => query === Breakpoints.XLarge
      );
      expect(service.isDesktop()).toBe(true);
    });

    it('should return false when neither Large nor XLarge breakpoints are matched', () => {
      (breakpointObserverMock.isMatched as jest.Mock).mockReturnValue(false);
      expect(service.isDesktop()).toBe(false);
    });
  });
});