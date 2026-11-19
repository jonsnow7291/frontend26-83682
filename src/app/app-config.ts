import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withEnabledBlockingInitialNavigation, withHashLocation, withInMemoryScrolling, withRouterConfig, withViewTransitions } from "@angular/router";
import { routes } from './app-routing.module';
import { HeadersInterceptor } from "./interceptors/headers.interceptor";
import { AuthInterceptor } from "./interceptors/auth.interceptor";

/**
 * Configuración de la aplicación: enrutamiento con hash, cliente HTTP, animaciones
 * e interceptores de encabezados y autenticación.
 */
export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter(routes,
        withRouterConfig({
          onSameUrlNavigation: 'reload'
        }),
        withInMemoryScrolling({
          scrollPositionRestoration: 'top',
          anchorScrolling: 'enabled'
        }),
        withEnabledBlockingInitialNavigation(),
        withViewTransitions(),
        withHashLocation()
      ),
      provideHttpClient(),
      provideAnimations(),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: HeadersInterceptor,
        multi: true
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ]
  };