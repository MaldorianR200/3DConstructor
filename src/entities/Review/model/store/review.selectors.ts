import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReviewState } from './review.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectReviewState = createFeatureSelector<ReviewState>(Slices.REVIEW);

export const selectAllReviews = createSelector(
  selectReviewState,
  (state: ReviewState) => state.reviews,
);

export const selectReviewById = (reviewId: number) =>
  createSelector(selectReviewState, (state: ReviewState) =>
    state.reviews.find((review) => review.id === reviewId),
  );

export const selectReviewsCount = createSelector(
  selectReviewState,
  (state: ReviewState) => state.reviews.length,
);

export const selectReviewError = createSelector(
  selectReviewState,
  (state: ReviewState) => state.error,
);
