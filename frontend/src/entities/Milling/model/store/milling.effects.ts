import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MillingService } from '../api/milling.service';
import * as MillingActions from './milling.actions';
import { selectAllMillings } from './milling.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class MillingEffects {
  constructor(
    private actions$: Actions,
    private millingService: MillingService,
    private store: Store<AppState>
  ) { }

  getMillings$ = createEffect(() => this.actions$.pipe(
    ofType(MillingActions.getMillings),
    withLatestFrom(this.store.select(selectAllMillings)),
    mergeMap(([action, millings]) => {
      if (millings.length > 0) {
        return of(MillingActions.getMillingsSuccess({ millings }));
      } else {
        return this.millingService
          .getAll()
          .pipe(
            map((response) => MillingActions.getMillingsSuccess({ millings: response.content}),
          ),
        );
      }
    })
  ));

  createMilling$ = createEffect(() => this.actions$.pipe(
    ofType(MillingActions.createMilling),
    mergeMap(action => this.millingService.create(action.milling).pipe(
      map(milling => MillingActions.createMillingSuccess({ milling })),
      catchError(error => of(MillingActions.createMillingFailure({ error })))
    ))
  ));

  updateMilling$ = createEffect(() => this.actions$.pipe(
    ofType(MillingActions.updateMilling),
    mergeMap(action => this.millingService.update(action.milling).pipe(
      map(milling => MillingActions.updateMillingSuccess({ milling })),
      catchError(error => of(MillingActions.updateMillingFailure({ error })))
    ))
  ));

  deleteMilling$ = createEffect(() => this.actions$.pipe(
    ofType(MillingActions.deleteMilling),
    mergeMap(action => this.millingService.deleteById(action.id).pipe(
      map(() => MillingActions.deleteMillingSuccess({ id: action.id })),
      catchError(error => of(MillingActions.deleteMillingFailure({ error })))
    ))
  ));
}
