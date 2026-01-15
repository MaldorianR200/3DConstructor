import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import { LOCAL_STORAGE_AUTH_TOKEN } from 'src/shared/const/localstorage';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const checkPlatformService = inject(CheckPlatformService);
  const token = checkPlatformService.isBrowser
    ? (localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN) ?? '')
    : '';

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: token },
      })
    : req;

  return next(authReq);
};
