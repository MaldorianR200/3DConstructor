import { createAction, props } from '@ngrx/store';
import { ITypes } from '../types/types.model';

export const getTypess = createAction('[Types] Get Typess');
export const getTypessSuccess = createAction(
  '[Types] Get Typess Success',
  props<{ typess: ITypes[] }>(),
);
export const getTypessFailure = createAction('[Types] Get Typess Failure', props<{ error: any }>());

export const createTypes = createAction('[Types] Create Types', props<{ types: ITypes }>());
export const createTypesSuccess = createAction(
  '[Types] Create Types Success',
  props<{ types: ITypes }>(),
);
export const createTypesFailure = createAction(
  '[Types] Create Types Failure',
  props<{ error: any }>(),
);

export const updateTypes = createAction('[Types] Update Types', props<{ types: ITypes }>());
export const updateTypesSuccess = createAction(
  '[Types] Update Types Success',
  props<{ types: ITypes }>(),
);
export const updateTypesFailure = createAction(
  '[Types] Update Types Failure',
  props<{ error: any }>(),
);

export const deleteTypes = createAction('[Types] Delete Types', props<{ id: number }>());
export const deleteTypesSuccess = createAction(
  '[Types] Delete Types Success',
  props<{ id: number }>(),
);
export const deleteTypesFailure = createAction(
  '[Types] Delete Types Failure',
  props<{ error: any }>(),
);
