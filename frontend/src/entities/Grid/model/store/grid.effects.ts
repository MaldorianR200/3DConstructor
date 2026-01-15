import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GridService } from '../api/grid.service';
import * as GridActions from './grid.actions';
import { selectAllGrids } from './grid.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { create } from 'domain';
import { LOCAL_STORAGE_GRID_SETTINGS } from 'src/shared/const/localstorage';
import { BrowserStorageService } from 'src/shared/lib/providers/localstorage.service';

@Injectable()
export class GridEffects {
  constructor(
    private actions$: Actions,
    private gridService: GridService,
    private store: Store<AppState>,
    private storageService: BrowserStorageService,
  ) {}

  loadGridSettingsFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.loadGridSettingsFromLocalStorage),
      switchMap(() => {
        const settings = JSON.parse(
          this.storageService.getItem(LOCAL_STORAGE_GRID_SETTINGS) || 'null',
        );

        if (settings) {
          return of(GridActions.getGridSettingsSuccess({ settings }));
        } else {
          return of(GridActions.getGridSettingsFailure({ error: new Error('Localstorage empty') }));
        }
      }),
    ),
  );

  getGrids$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.getGrids),
      withLatestFrom(this.store.select(selectAllGrids)),
      mergeMap(([action, grids]) => {
        if (grids.length > 0) {
          return of(GridActions.getGridsSuccess({ grids }));
        } else {
          return this.gridService.getAll().pipe(
            map((grids) => GridActions.getGridsSuccess({ grids })),
            catchError((error) => of(GridActions.getGridsFailure({ error }))),
          );
        }
      }),
    ),
  );

  setGridSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.setGridSettings),
      switchMap(({ settings }) => {
        const jsonString = JSON.stringify(settings);
        if (jsonString) {
          this.storageService.setItem(LOCAL_STORAGE_GRID_SETTINGS, jsonString);
          return of(GridActions.setGridSettingsSuccess({ settings }));
        } else {
          return of(
            GridActions.setGridSettingsFailure({ error: new Error('Error parse JSON.stringify') }),
          );
        }
      }),
    ),
  );

  createGrid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.createGrid),
      mergeMap((action) =>
        this.gridService.create(action.grid).pipe(
          map((grid) => GridActions.createGridSuccess({ grid })),
          catchError((error) => of(GridActions.createGridFailure({ error }))),
        ),
      ),
    ),
  );

  updateGrid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.updateGrid),
      mergeMap((action) =>
        this.gridService.update(action.grid).pipe(
          map((grid) => GridActions.updateGridSuccess({ grid })),
          catchError((error) => of(GridActions.updateGridFailure({ error }))),
        ),
      ),
    ),
  );

  deleteGrid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GridActions.deleteGrid),
      mergeMap((action) =>
        this.gridService.deleteById(action.id).pipe(
          map(() => GridActions.deleteGridSuccess({ id: action.id })),
          catchError((error) => of(GridActions.deleteGridFailure({ error }))),
        ),
      ),
    ),
  );
}
