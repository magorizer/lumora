import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideClerk } from 'ngx-clerk';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { apiBaseUrlInterceptor } from './app/interceptors/api-base-url.interceptor';
import { clerkAuthInterceptor } from './app/interceptors/clerk-auth.interceptor';
import { environment } from './environments/environment';

function disableConsoleLogging(): void {
  if (environment.enableConsoleLogging) {
    return;
  }

  Object.assign(console, {
    log: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    table: () => undefined,
  });
}

disableConsoleLogging();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideClerk({
      publishableKey: environment.clerkPublishableKey,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    }),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, clerkAuthInterceptor])),
  ],
});
