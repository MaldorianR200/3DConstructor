import { createAction, props } from '@ngrx/store';
import { IReview } from '../types/review.model';

export const getReviews = createAction('[Review] Get Reviews');
export const getReviewsSuccess = createAction(
  '[Review] Get Reviews Success',
  props<{ reviews: IReview[] }>(),
);
export const getReviewsFailure = createAction(
  '[Review] Get Reviews Failure',
  props<{ error: any }>(),
);

export const createReview = createAction('[Review] Create Review', props<{ review: IReview }>());
export const createReviewSuccess = createAction(
  '[Review] Create Review Success',
  props<{ review: IReview }>(),
);
export const createReviewFailure = createAction(
  '[Review] Create Review Failure',
  props<{ error: any }>(),
);

export const updateReview = createAction('[Review] Update Review', props<{ review: IReview }>());
export const updateReviewSuccess = createAction(
  '[Review] Update Review Success',
  props<{ review: IReview }>(),
);
export const updateReviewFailure = createAction(
  '[Review] Update Review Failure',
  props<{ error: any }>(),
);

export const deleteReview = createAction('[Review] Delete Review', props<{ id: number }>());
export const deleteReviewSuccess = createAction(
  '[Review] Delete Review Success',
  props<{ id: number }>(),
);
export const deleteReviewFailure = createAction(
  '[Review] Delete Review Failure',
  props<{ error: any }>(),
);
