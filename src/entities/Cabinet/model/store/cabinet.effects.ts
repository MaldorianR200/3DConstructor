import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CabinetService } from '../api/cabinet.service';
import * as CabinetActions from './cabinet.actions';
import { selectAllCabinets } from './cabinet.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class CabinetEffects {
  constructor(
    private actions$: Actions,
    private cabinetService: CabinetService,
    private store: Store<AppState>,
  ) {}

  getCabinets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CabinetActions.getCabinets),
      withLatestFrom(this.store.select(selectAllCabinets)),
      mergeMap(([action, cabinets]) => {
        if (cabinets.length > 0) {
          return of(CabinetActions.getCabinetsSuccess({ cabinets }));
        } else {
          return this.cabinetService.getAll().pipe(
            map((cabinets) => CabinetActions.getCabinetsSuccess({ cabinets })),
            catchError((error) => of(CabinetActions.getCabinetsFailure({ error }))),
          );
        }
      }),
    ),
  );

  createCabinet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CabinetActions.createCabinet),
      mergeMap((action) =>
        this.cabinetService.create(action.cabinet).pipe(
          map((cabinet) => CabinetActions.createCabinetSuccess({ cabinet })),
          catchError((error) => of(CabinetActions.createCabinetFailure({ error }))),
        ),
      ),
    ),
  );

  updateCabinet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CabinetActions.updateCabinet),
      mergeMap((action) =>
        this.cabinetService.update(action.cabinet).pipe(
          map((cabinet) => CabinetActions.updateCabinetSuccess({ cabinet })),
          catchError((error) => of(CabinetActions.updateCabinetFailure({ error }))),
        ),
      ),
    ),
  );

  deleteCabinet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CabinetActions.deleteCabinet),
      mergeMap((action) =>
        this.cabinetService.deleteById(action.id).pipe(
          map(() => CabinetActions.deleteCabinetSuccess({ id: action.id })),
          catchError((error) => of(CabinetActions.deleteCabinetFailure({ error }))),
        ),
      ),
    ),
  );
}
