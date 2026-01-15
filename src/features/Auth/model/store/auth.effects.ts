import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../api/auth.service';
import * as AuthActions from './auth.actions';
import {
  LOCAL_STORAGE_AUTH_TOKEN,
  LOCAL_STORAGE_SESSION_TIME,
  LOCAL_STORAGE_USER,
} from 'src/shared/const/localstorage';
import { Routes } from 'src/shared/config/routes';
import { Router } from '@angular/router';
import { ONE_DAY_IN_MILLISECONDS } from 'src/shared/const/time';
import { BrowserStorageService } from 'src/shared/lib/providers/localstorage.service';
import { BaseService } from 'src/shared/api/base.service';

@Injectable()
export class AuthEffects {
  constructor(
    private router: Router,
    private actions$: Actions,
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private baseService: BaseService,
  ) {}

  loadLoginFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadLoginFromLocalStorage),
      switchMap(() => {
        const user = JSON.parse(this.storageService.getItem(LOCAL_STORAGE_USER) || 'null');
        const token = this.storageService.getItem(LOCAL_STORAGE_AUTH_TOKEN)?.toString();
        const sessionTime = parseInt(
          this.storageService.getItem(LOCAL_STORAGE_SESSION_TIME) || 'null',
        );

        const sessionTimeIsValid = sessionTime > +new Date();

        if (user && token && sessionTimeIsValid) {
          return of(AuthActions.loginSuccess({ user, token, sessionTime }));
        } else {
          return of(AuthActions.logout());
        }
      }),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ user }) =>
        this.authService.login(user).pipe(
          map(({ user, token }) => {
            const sessionTime = +new Date() + ONE_DAY_IN_MILLISECONDS;
            this.router.navigate([Routes.ADMIN]);
            return AuthActions.loginSuccess({ user, token, sessionTime });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token, sessionTime }) => {
          // console.log('Login Success Action:', { user, token, sessionTime });
          console.log('Login Success - User:', user);
          console.log('Login Success - Is Admin:', user.role === 'SUPER_ADMIN');
          this.storageService.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
          this.storageService.setItem(LOCAL_STORAGE_AUTH_TOKEN, token);
          this.storageService.setItem(LOCAL_STORAGE_SESSION_TIME, sessionTime.toString());
          // console.log('Stored user permissions:', user.permissions);
        }),
      ),
    { dispatch: false },
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap(({ newData }) =>
        this.authService.updateProfile(newData).pipe(
          map((user) => AuthActions.updateProfileSuccess({ user })),
          catchError((error) => of(AuthActions.updateProfileFailure({ error }))),
        ),
      ),
    ),
  );

  deleteProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteProfile),
      switchMap(() =>
        this.authService.deleteProfile().pipe(
          map((user) => AuthActions.deleteProfileSuccess()),
          catchError((error) => of(AuthActions.deleteProfileFailure({ error }))),
        ),
      ),
    ),
  );

  deleteProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteProfileSuccess),
      switchMap(() => of(AuthActions.logout())),
    ),
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.storageService.removeItem(LOCAL_STORAGE_AUTH_TOKEN);
          this.storageService.removeItem(LOCAL_STORAGE_USER);
          this.storageService.removeItem(LOCAL_STORAGE_SESSION_TIME);
          this.router.navigate(['/']);
        }),
      ),
    { dispatch: false },
  );
}
