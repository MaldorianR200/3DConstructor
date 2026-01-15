import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SeriesService } from '../api/series.service';
import * as SeriesActions from './series.actions';
import { selectAllSeriess } from './series.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class SeriesEffects {
  constructor(
    private actions$: Actions,
    private seriesService: SeriesService,
    private store: Store<AppState>,
  ) {}

  getSeriess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeriesActions.getSeriess),
      withLatestFrom(this.store.select(selectAllSeriess)),
      mergeMap(([action, seriess]) => {
        if (seriess.length > 0) {
          return of(SeriesActions.getSeriessSuccess({ seriess }));
        } else {
          return this.seriesService
            .getAll()
            .pipe(
              map((response) => SeriesActions.getSeriessSuccess({ seriess: response.content })),
            );
        }
      }),
    ),
  );

  createSeries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeriesActions.createSeries),
      mergeMap((action) =>
        this.seriesService.create(action.series).pipe(
          map((series) => SeriesActions.createSeriesSuccess({ series })),
          catchError((error) => of(SeriesActions.createSeriesFailure({ error }))),
        ),
      ),
    ),
  );

  updateSeries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeriesActions.updateSeries),
      mergeMap((action) =>
        this.seriesService.update(action.series).pipe(
          map((series) => SeriesActions.updateSeriesSuccess({ series })),
          catchError((error) => of(SeriesActions.updateSeriesFailure({ error }))),
        ),
      ),
    ),
  );

  deleteSeries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeriesActions.deleteSeries),
      mergeMap((action) =>
        this.seriesService.deleteById(action.id).pipe(
          map(() => SeriesActions.deleteSeriesSuccess({ id: action.id })),
          catchError((error) => of(SeriesActions.deleteSeriesFailure({ error }))),
        ),
      ),
    ),
  );
}
