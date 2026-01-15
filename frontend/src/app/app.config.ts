import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'environments/environment';
import { provideStore } from '@ngrx/store';
import { appEffects, reducers } from './providers/StoreProvider/app.store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ModalInterceptor } from './providers/HttpProvider/modal.interceptor';
import { AuthInterceptor } from './providers/HttpProvider/auth.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(reducers),
    provideEffects(...appEffects),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([AuthInterceptor, ModalInterceptor]), withFetch()),
    provideStoreDevtools({
      maxAge: 50,
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true,
    }),
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.captchaToken,
    },
    provideClientHydration(),
  ],
};
