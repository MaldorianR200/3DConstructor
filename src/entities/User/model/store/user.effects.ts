import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import * as UserActions from './user.actions';
import { catchError, first, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { UserService } from '../api/user.service';
import { selectAllUsers } from './user.selectors';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private store: Store<AppState>,
  ) {}

  getUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.getUsers),
      withLatestFrom(this.store.select(selectAllUsers)),
      mergeMap(([actions, users]) => {
        if (users.length > 0) {
          return of(UserActions.getUsersSuccess({ users }));
        } else {
          return this.userService.getAll().pipe(
            map((users) => UserActions.getUsersSuccess({ users })),
            catchError((error) => of(UserActions.getUsersFailure({ error }))),
          );
        }
      }),
    ),
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap((action) =>
        this.userService.create(action.user).pipe(
          map((user) => UserActions.createUserSuccess({ user })),
          catchError((error) => of(UserActions.createUserFailure({ error }))),
        ),
      ),
    ),
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap((action) =>
        this.userService.update(action.user).pipe(
          map((user) => UserActions.updateUserSuccess({ user })),
          catchError((error) => of(UserActions.updateUserFailure({ error }))),
        ),
      ),
    ),
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap((action) =>
        this.userService.deleteById(action.id).pipe(
          map(() => UserActions.deleteUserSuccess({ id: action.id })),
          catchError((error) => of(UserActions.deleteUserFailure({ error }))),
        ),
      ),
    ),
  );
}
