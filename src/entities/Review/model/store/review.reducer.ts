import { createReducer, on } from '@ngrx/store';
import { IReview } from '../types/review.model';
import * as ReviewActions from './review.actions';

export interface ReviewState {
  reviews: IReview[];
  error: any;
}

export const initialState: ReviewState = {
  reviews: [],
  error: null,
};

export const reviewReducer = createReducer(
  initialState,
  // get
  on(ReviewActions.getReviewsSuccess, (state, { reviews }) => ({
    ...state,
    reviews,
  })),
  on(ReviewActions.getReviewsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(ReviewActions.createReviewSuccess, (state, { review }) => ({
    ...state,
    reviews: [...state.reviews, review],
  })),
  on(ReviewActions.createReviewFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(ReviewActions.updateReviewSuccess, (state, { review }) => ({
    ...state,
    reviews: state.reviews.map((item) => {
      if (item.id === review.id) {
        const sortedImages = [...review.images].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...review, images: sortedImages };
      }
      return item;
    }),
  })),
  on(ReviewActions.updateReviewFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(ReviewActions.deleteReviewSuccess, (state, { id }) => ({
    ...state,
    reviews: state.reviews.filter((p) => p.id !== id),
  })),
  on(ReviewActions.deleteReviewFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
