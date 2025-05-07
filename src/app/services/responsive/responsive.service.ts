import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private breakpointState = {
    isXSmall: false,
    isSmall: false,
    isMedium: false,
    isLarge: false,
    isXLarge: false
  };

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      this.breakpointState = {
        isXSmall: result.breakpoints[Breakpoints.XSmall],
        isSmall: result.breakpoints[Breakpoints.Small],
        isMedium: result.breakpoints[Breakpoints.Medium],
        isLarge: result.breakpoints[Breakpoints.Large],
        isXLarge: result.breakpoints[Breakpoints.XLarge]
      };
    });
  }

  isMobile(): boolean {
    return this.breakpointState.isXSmall;
  }

  isTablet(): boolean {
    return this.breakpointState.isSmall || this.breakpointState.isMedium;
  }

  isDesktop(): boolean {
    return this.breakpointState.isLarge || this.breakpointState.isXLarge;
  }

  currentBreakpoint(): string {
    if (this.breakpointState.isXSmall) return 'xsmall';
    if (this.breakpointState.isSmall) return 'small';
    if (this.breakpointState.isMedium) return 'medium';
    if (this.breakpointState.isLarge) return 'large';
    return 'xlarge';
  }
}