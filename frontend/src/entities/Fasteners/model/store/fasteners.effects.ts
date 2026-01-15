import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FastenersService } from '../api/fasteners.service';
import * as FastenersActions from './fasteners.actions';
import { selectAllFastenerss } from './fasteners.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import * as MaterialActions from '../../../Material/model/store/material.actions';

@Injectable()
export class FastenersEffects {
  constructor(
    private actions$: Actions,
    private fastenersService: FastenersService,
    private store: Store<AppState>,
  ) {}

  getFastenerss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FastenersActions.getFastenerss),
      withLatestFrom(this.store.select(selectAllFastenerss)),
      mergeMap(([action, fastenerss]) => {
        if (fastenerss.length > 0) {
          return of(FastenersActions.getFastenerssSuccess({ fastenerss }));
        } else {
          return this.fastenersService
            .getAll()
            .pipe(
              map((response) =>
                FastenersActions.getFastenerssSuccess({ fastenerss: response.content }),
              ),
            );
        }
      }),
    ),
  );

  createFasteners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FastenersActions.createFasteners),
      mergeMap((action) =>
        this.fastenersService.create(action.fasteners).pipe(
          map((fasteners) => FastenersActions.createFastenersSuccess({ fasteners })),
          catchError((error) => of(FastenersActions.createFastenersFailure({ error }))),
        ),
      ),
    ),
  );

  updateFasteners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FastenersActions.updateFasteners),
      mergeMap((action) =>
        this.fastenersService.update(action.fasteners).pipe(
          map((fasteners) => FastenersActions.updateFastenersSuccess({ fasteners })),
          catchError((error) => of(FastenersActions.updateFastenersFailure({ error }))),
        ),
      ),
    ),
  );

  deleteFasteners$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FastenersActions.deleteFasteners),
      mergeMap((action) =>
        this.fastenersService.deleteById(action.id).pipe(
          map(() => FastenersActions.deleteFastenersSuccess({ id: action.id })),
          catchError((error) => of(FastenersActions.deleteFastenersFailure({ error }))),
        ),
      ),
    ),
  );
}
