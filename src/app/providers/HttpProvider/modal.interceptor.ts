import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ModalResponseService } from 'src/features/ModalResponse/model/modal-response.service';

export const ModalInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const modalResponseService = inject(ModalResponseService);

  if (req.method !== 'GET') {
    modalResponseService.start();
  }

  return next(req).pipe(
    tap((event) => {
      if (req.method !== 'GET' && event instanceof HttpResponse) {
        modalResponseService.setStatus({ status: 200 });
      }
    }),
    catchError((error) => {
      if (req.method !== 'GET') {
        modalResponseService.setStatus(error);
      }
      return throwError(() => new Error(error.message));
    }),
  );
};
