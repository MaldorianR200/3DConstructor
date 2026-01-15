import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FurnitureService } from '../api/furniture.service';
import * as FurnitureActions from './furniture.actions';
import { selectAllFurnitures } from './furniture.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class FurnitureEffects {
  constructor(
    private actions$: Actions,
    private FurnitureService: FurnitureService,
    private store: Store<AppState>,
  ) {}

  getFurnitures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FurnitureActions.getFurnitures),
      withLatestFrom(this.store.select(selectAllFurnitures)),
      mergeMap(([action, furnitures]) => {
        if (furnitures.length > 0) {
          return of(FurnitureActions.getFurnituresSuccess({ furnitures }));
        } else {
          return this.FurnitureService.getAll().pipe(
            map((response) =>
              FurnitureActions.getFurnituresSuccess({ furnitures: response.content }),
            ),
          );
        }
      }),
    ),
  );

  createFurniture$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FurnitureActions.createFurniture),
      mergeMap((action) =>
        this.FurnitureService.create(action.furniture).pipe(
          map((furniture) => FurnitureActions.createFurnitureSuccess({ furniture })),
          catchError((error) => of(FurnitureActions.createFurnitureFailure({ error }))),
        ),
      ),
    ),
  );

  updateFurniture$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FurnitureActions.updateFurniture),
      mergeMap((action) =>
        this.FurnitureService.update(action.furniture).pipe(
          map((furniture) => FurnitureActions.updateFurnitureSuccess({ furniture })),
          catchError((error) => of(FurnitureActions.updateFurnitureFailure({ error }))),
        ),
      ),
    ),
  );

  deleteFurniture$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FurnitureActions.deleteFurniture),
      mergeMap((action) =>
        this.FurnitureService.deleteById(action.id).pipe(
          map(() => FurnitureActions.deleteFurnitureSuccess({ id: action.id })),
          catchError((error) => of(FurnitureActions.deleteFurnitureFailure({ error }))),
        ),
      ),
    ),
  );
}
