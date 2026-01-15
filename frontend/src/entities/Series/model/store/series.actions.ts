import { createAction, props } from '@ngrx/store';
import { ISeries } from '../types/series.model';

export const getSeriess = createAction('[Series] Get Seriess');
export const getSeriessSuccess = createAction(
  '[Series] Get Seriess Success',
  props<{ seriess: ISeries[] }>(),
);
export const getSeriessFailure = createAction(
  '[Series] Get Seriess Failure',
  props<{ error: any }>(),
);

export const createSeries = createAction('[Series] Create Series', props<{ series: ISeries }>());
export const createSeriesSuccess = createAction(
  '[Series] Create Series Success',
  props<{ series: ISeries }>(),
);
export const createSeriesFailure = createAction(
  '[Series] Create Series Failure',
  props<{ error: any }>(),
);

export const updateSeries = createAction('[Series] Update Series', props<{ series: ISeries }>());
export const updateSeriesSuccess = createAction(
  '[Series] Update Series Success',
  props<{ series: ISeries }>(),
);
export const updateSeriesFailure = createAction(
  '[Series] Update Series Failure',
  props<{ error: any }>(),
);

export const deleteSeries = createAction('[Series] Delete Series', props<{ id: number }>());
export const deleteSeriesSuccess = createAction(
  '[Series] Delete Series Success',
  props<{ id: number }>(),
);
export const deleteSeriesFailure = createAction(
  '[Series] Delete Series Failure',
  props<{ error: any }>(),
);
