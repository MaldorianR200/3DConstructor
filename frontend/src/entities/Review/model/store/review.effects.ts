import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ReviewService } from '../api/review.service';
import * as ReviewActions from './review.actions';
import { selectAllReviews } from './review.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class ReviewEffects {
  constructor(
    private actions$: Actions,
    private reviewService: ReviewService,
    private store: Store<AppState>,
  ) {}

  getReviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewActions.getReviews),
      withLatestFrom(this.store.select(selectAllReviews)),
      mergeMap(([action, reviews]) => {
        if (reviews.length > 0) {
          return of(ReviewActions.getReviewsSuccess({ reviews }));
        } else {
          return this.reviewService.getAll().pipe(
            map((reviews) => ReviewActions.getReviewsSuccess({ reviews })),
            catchError((error) => of(ReviewActions.getReviewsFailure({ error }))),
          );
        }
      }),
    ),
  );

  createReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewActions.createReview),
      mergeMap((action) =>
        this.reviewService.create(action.review).pipe(
          map((review) => ReviewActions.createReviewSuccess({ review })),
          catchError((error) => of(ReviewActions.createReviewFailure({ error }))),
        ),
      ),
    ),
  );

  updateReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewActions.updateReview),
      mergeMap((action) =>
        this.reviewService.update(action.review).pipe(
          map((review) => ReviewActions.updateReviewSuccess({ review })),
          catchError((error) => of(ReviewActions.updateReviewFailure({ error }))),
        ),
      ),
    ),
  );

  deleteReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewActions.deleteReview),
      mergeMap((action) =>
        this.reviewService.deleteById(action.id).pipe(
          map(() => ReviewActions.deleteReviewSuccess({ id: action.id })),
          catchError((error) => of(ReviewActions.deleteReviewFailure({ error }))),
        ),
      ),
    ),
  );
}
