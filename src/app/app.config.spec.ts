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

  describe('appConfig', () => {
    it('should define providers with correct configurations', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig).toHaveProperty('providers');
      expect(Array.isArray(appConfig.providers)).toBe(true);
      expect(appConfig.providers.length).toBeGreaterThan(0);

      // Test provideZoneChangeDetection
      const zoneConfig = appConfig.providers.find(
        (provider) => provider === provideZoneChangeDetection({ eventCoalescing: true })
      );
      expect(zoneConfig).toBeDefined();
      expect(zoneConfig).toEqual(provideZoneChangeDetection({ eventCoalescing: true }));

      // Test provideRouter
      const routerConfig = appConfig.providers.find(
        (provider) => provider === provideRouter(routes)
      );
      expect(routerConfig).toBeDefined();
      expect(routerConfig).toEqual(provideRouter(routes));

      // Test provideHttpClient
      const httpClientConfig = appConfig.providers.find(
        (provider) => provider === provideHttpClient()
      );
      expect(httpClientConfig).toBeDefined();
      expect(httpClientConfig).toEqual(provideHttpClient());

      // Test provideAnimations
      const animationsConfig = appConfig.providers.find(
        (provider) => provider === provideAnimations()
      );
      expect(animationsConfig).toBeDefined();
      expect(animationsConfig).toEqual(provideAnimations());

      // Test provideToastr
      const toastrConfig = provideToastr({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      });
      expect(appConfig.providers).toContainEqual(toastrConfig);

      // Test TranslateModule configuration
      const translateConfig = appConfig.providers.find(
        (provider) =>
          provider &&
          typeof provider === 'object' &&
          'provide' in provider &&
          provider.provide === TranslateLoader
      );
      expect(translateConfig).toBeDefined();
      expect(translateConfig).toMatchObject({
        provide: TranslateLoader,
        useFactory: expect.any(Function),
        deps: [HttpClient],
      });

      // Verify TranslateModule.forRoot providers
      const translateModuleProviders = TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }).providers;
      expect(translateModuleProviders).toBeDefined();
      expect(appConfig.providers).toContainEqual(
        expect.objectContaining({
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        })
      );
    });
  });
});