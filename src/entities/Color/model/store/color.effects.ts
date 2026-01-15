import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ColorService } from '../api/color.service';
import * as ColorActions from './color.actions';
import { selectAllColors } from './color.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class ColorEffects {
  constructor(
    private actions$: Actions,
    private colorService: ColorService,
    private store: Store<AppState>,
  ) {}
  getColors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColorActions.getColors),
      withLatestFrom(this.store.select(selectAllColors)),
      mergeMap(([action, colors]) => {
        if (colors.length > 0) {
          return of(ColorActions.getColorsSuccess({ colors }));
        } else {
          return this.colorService.getAll().pipe(
            map((response) =>
              ColorActions.getColorsSuccess({
                colors: response.content,
              }),
            ),
          );
        }
      }),
    ),
  );

  createColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColorActions.createColor),
      mergeMap((action) =>
        this.colorService.create(action.color).pipe(
          map((color) => ColorActions.createColorSuccess({ color })),
          catchError((error) => of(ColorActions.createColorFailure({ error }))),
        ),
      ),
    ),
  );

  updateColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColorActions.updateColor),
      mergeMap((action) =>
        this.colorService.update(action.color).pipe(
          map((color) => ColorActions.updateColorSuccess({ color })),
          catchError((error) => of(ColorActions.updateColorFailure({ error }))),
        ),
      ),
    ),
  );

  deleteColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ColorActions.deleteColor),
      mergeMap((action) =>
        this.colorService.deleteById(action.id).pipe(
          map(() => ColorActions.deleteColorSuccess({ id: action.id })),
          catchError((error) => of(ColorActions.deleteColorFailure({ error }))),
        ),
      ),
    ),
  );
}
