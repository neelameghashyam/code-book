import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  constructor(private breakpointObserver: BreakpointObserver) {}

  currentBreakpoint(): Observable<string> {
    return this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) return 'xsmall';
        if (result.breakpoints[Breakpoints.Small]) return 'small';
        if (result.breakpoints[Breakpoints.Medium]) return 'medium';
        if (result.breakpoints[Breakpoints.Large]) return 'large';
        return 'xlarge';
      })
    );
  }

  isMobile(): boolean {
    return this.breakpointObserver.isMatched(Breakpoints.XSmall);
  }

  isTablet(): boolean {
    return this.breakpointObserver.isMatched(Breakpoints.Small) || this.breakpointObserver.isMatched(Breakpoints.Medium);
  }

  isDesktop(): boolean {
    return this.breakpointObserver.isMatched(Breakpoints.Large) || this.breakpointObserver.isMatched(Breakpoints.XLarge);
  }
}