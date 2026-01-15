import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CombineMaterialService } from '../api/combineMaterial.service';
import * as CombineMaterialActions from './combineMaterial.actions';
import { selectAllCombineMaterials } from './combineMaterial.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class CombineMaterialEffects {
  constructor(
    private actions$: Actions,
    private combineMaterialService: CombineMaterialService,
    private store: Store<AppState>
  ) { }

  getCombineMaterials$ = createEffect(() => this.actions$.pipe(
    ofType(CombineMaterialActions.getCombineMaterials),
    withLatestFrom(this.store.select(selectAllCombineMaterials)),
    mergeMap(([action, combineMaterials]) => {
      if (combineMaterials.length > 0) {
        return of(CombineMaterialActions.getCombineMaterialsSuccess({ combineMaterials }));
      } else {
        return this.combineMaterialService
          .getAll()
          .pipe(
            map((response) => CombineMaterialActions.getCombineMaterialsSuccess({ combineMaterials: response.content}),
          ),
        );
      }
    })
  ));

  createCombineMaterial$ = createEffect(() => this.actions$.pipe(
    ofType(CombineMaterialActions.createCombineMaterial),
    mergeMap(action => this.combineMaterialService.create(action.combineMaterial).pipe(
      map(combineMaterial => CombineMaterialActions.createCombineMaterialSuccess({ combineMaterial })),
      catchError(error => of(CombineMaterialActions.createCombineMaterialFailure({ error })))
    ))
  ));

  updateCombineMaterial$ = createEffect(() => this.actions$.pipe(
    ofType(CombineMaterialActions.updateCombineMaterial),
    mergeMap(action => this.combineMaterialService.update(action.combineMaterial).pipe(
      map(combineMaterial => CombineMaterialActions.updateCombineMaterialSuccess({ combineMaterial })),
      catchError(error => of(CombineMaterialActions.updateCombineMaterialFailure({ error })))
    ))
  ));

  deleteCombineMaterial$ = createEffect(() => this.actions$.pipe(
    ofType(CombineMaterialActions.deleteCombineMaterial),
    mergeMap(action => this.combineMaterialService.deleteById(action.id).pipe(
      map(() => CombineMaterialActions.deleteCombineMaterialSuccess({ id: action.id })),
      catchError(error => of(CombineMaterialActions.deleteCombineMaterialFailure({ error })))
    ))
  ));
}
