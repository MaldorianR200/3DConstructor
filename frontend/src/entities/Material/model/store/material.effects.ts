import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MaterialService } from '../api/material.service';
import * as MaterialActions from './material.actions';
import { selectAllMaterials } from './material.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class MaterialEffects {
  constructor(
    private actions$: Actions,
    private materialService: MaterialService,
    private store: Store<AppState>,
  ) {}
  getMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialActions.getMaterials),
      withLatestFrom(this.store.select(selectAllMaterials)),
      mergeMap(([action, materials]) => {
        if (materials.length > 0) {
          return of(MaterialActions.getMaterialsSuccess({ materials }));
        } else {
          return this.materialService
            .getAll()
            .pipe(
              map((response) =>
                MaterialActions.getMaterialsSuccess({ materials: response.content }),
              ),
            );
        }
      }),
    ),
  );

  createMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialActions.createMaterial),
      mergeMap((action) =>
        this.materialService.create(action.material).pipe(
          map((material) => MaterialActions.createMaterialSuccess({ material })),
          catchError((error) => of(MaterialActions.createMaterialFailure({ error }))),
        ),
      ),
    ),
  );

  updateMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialActions.updateMaterial),
      mergeMap((action) =>
        this.materialService.update(action.material).pipe(
          map((material) => MaterialActions.updateMaterialSuccess({ material })),
          catchError((error) => of(MaterialActions.updateMaterialFailure({ error }))),
        ),
      ),
    ),
  );

  deleteMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialActions.deleteMaterial),
      mergeMap((action) =>
        this.materialService.deleteById(action.id).pipe(
          map(() => MaterialActions.deleteMaterialSuccess({ id: action.id })),
          catchError((error) => of(MaterialActions.deleteMaterialFailure({ error }))),
        ),
      ),
    ),
  );
}
