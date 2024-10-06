import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor, responseTimeInterceptor } from './shared/auth.interceptor';
import { ProvidersStore } from './core/signal-states/providers.state';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes), 
    provideAnimationsAsync(), 
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        responseTimeInterceptor,
      ])
    ),
  ],
};
