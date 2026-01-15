import { createReducer, on } from '@ngrx/store';
import { ISeries } from '../types/series.model';
import * as SeriesActions from './series.actions';

export interface SeriesState {
  seriess: ISeries[];
  error: any;
}

export const initialState: SeriesState = {
  seriess: [],
  error: null,
};

export const seriesReducer = createReducer(
  initialState,
  // get
  on(SeriesActions.getSeriessSuccess, (state, { seriess }) => ({
    ...state,
    seriess,
  })),
  on(SeriesActions.getSeriessFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(SeriesActions.createSeriesSuccess, (state, { series }) => ({
    ...state,
    seriess: [...state.seriess, series],
  })),
  on(SeriesActions.createSeriesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(SeriesActions.updateSeriesSuccess, (state, { series }) => ({
    ...state,
    seriess: state.seriess.map((item) => {
      if (item.id === series.id) {
        const sortedImages = [].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...series, images: sortedImages };
      }
      return item;
    }),
  })),
  on(SeriesActions.updateSeriesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(SeriesActions.deleteSeriesSuccess, (state, { id }) => ({
    ...state,
    seriess: state.seriess.filter((p) => p.id !== id),
  })),
  on(SeriesActions.deleteSeriesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
