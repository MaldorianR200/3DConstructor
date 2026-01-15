import { createReducer, on } from '@ngrx/store';
import * as SeoActions from './seo.actions';

export interface SeoState {
  robots: string | null;
  error: any;
}

export const initialState: SeoState = {
  robots: null,
  error: null,
};

export const seoReducer = createReducer(
  initialState,
  // get
  on(SeoActions.getRobotsSuccess, (state, { robots }) => ({
    ...state,
    robots,
  })),
  on(SeoActions.getRobotsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(SeoActions.updateRobotsSuccess, (state, { robots }) => ({
    ...state,
    robots,
  })),
  on(SeoActions.updateRobotsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
