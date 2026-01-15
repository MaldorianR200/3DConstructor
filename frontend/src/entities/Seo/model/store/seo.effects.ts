import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import * as SeoActions from './seo.actions';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { SeoService } from '../api/seo.service';

@Injectable()
export class SeoEffects {
  constructor(
    private actions$: Actions,
    private seoService: SeoService,
    private store: Store<AppState>,
  ) {}

  getRobots$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeoActions.getRobots),
      mergeMap(() => {
        return this.seoService.getRobots().pipe(
          map((robots) => SeoActions.getRobotsSuccess({ robots })),
          catchError((error) => of(SeoActions.getRobotsFailure({ error }))),
        );
      }),
    ),
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeoActions.updateRobots),
      mergeMap((action) =>
        this.seoService.updateRobots(action.robots).pipe(
          map((robots) => SeoActions.updateRobotsSuccess({ robots })),
          catchError((error) => of(SeoActions.updateRobotsFailure({ error }))),
        ),
      ),
    ),
  );

  generateSiteMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeoActions.generateSiteMap),
      mergeMap((action) =>
        this.seoService.generateSiteMap().pipe(
          map(() => SeoActions.generateSiteMapSuccess()),
          catchError((error) => of(SeoActions.generateSiteMapFailure({ error }))),
        ),
      ),
    ),
  );
}
