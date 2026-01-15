import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NewsService } from '../api/news.service';
import * as NewsActions from './news.actions';
import { selectAllNews } from './news.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class NewsEffects {
  constructor(
    private actions$: Actions,
    private newsService: NewsService,
    private store: Store<AppState>,
  ) {}

  getNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.getNews),
      withLatestFrom(this.store.select(selectAllNews)),
      mergeMap(([action, news]) => {
        if (news.length > 0) {
          return of(NewsActions.getNewsSuccess({ news }));
        } else {
          return this.newsService.getAll().pipe(
            map((news) => NewsActions.getNewsSuccess({ news })),
            catchError((error) => of(NewsActions.getNewsFailure({ error }))),
          );
        }
      }),
    ),
  );

  createNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.createNews),
      mergeMap((action) =>
        this.newsService.create(action.news).pipe(
          map((news) => NewsActions.createNewsSuccess({ news })),
          catchError((error) => of(NewsActions.createNewsFailure({ error }))),
        ),
      ),
    ),
  );

  updateNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.updateNews),
      mergeMap((action) =>
        this.newsService.update(action.news).pipe(
          map((news) => NewsActions.updateNewsSuccess({ news })),
          catchError((error) => of(NewsActions.updateNewsFailure({ error }))),
        ),
      ),
    ),
  );

  deleteNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.deleteNews),
      mergeMap((action) =>
        this.newsService.deleteById(action.id).pipe(
          map(() => NewsActions.deleteNewsSuccess({ id: action.id })),
          catchError((error) => of(NewsActions.deleteNewsFailure({ error }))),
        ),
      ),
    ),
  );
}
