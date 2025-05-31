// app.config.spec.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { appConfig, HttpLoaderFactory } from './app.config';
import { routes } from './app.routes';

// Mock the app.routes to avoid importing actual routes
jest.mock('./app.routes', () => ({
  routes: [],
}));

describe('AppConfig', () => {
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    // Mock HttpClient
    mockHttpClient = {
      get: jest.fn(),
    } as any;
  });

  describe('HttpLoaderFactory', () => {
    it('should return a TranslateHttpLoader instance', () => {
      const loader = HttpLoaderFactory(mockHttpClient);
      expect(loader).toBeInstanceOf(TranslateHttpLoader);
    });
  });

 
});