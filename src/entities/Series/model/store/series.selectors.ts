import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SeriesState } from './series.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
export const selectSeriesState = createFeatureSelector<SeriesState>(Slices.SERIES);

export const selectAllSeriess = createSelector(
  selectSeriesState,
  (state: SeriesState) => state.seriess,
);

export const selectSeriesOption = createSelector(selectAllSeriess, (series) =>
  series.map((serie) => ({
    value: serie.name,
    label: serie.name,
  })),
);

export const selectSeriesById = (seriesId: number) =>
  createSelector(selectSeriesState, (state: SeriesState) =>
    state.seriess.find((series) => series.id === seriesId),
  );

export const selectSeriessCount = createSelector(
  selectSeriesState,
  (state: SeriesState) => state.seriess.length,
);

export const selectSeriesError = createSelector(
  selectSeriesState,
  (state: SeriesState) => state.error,
);
