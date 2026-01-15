import { createAction, props } from '@ngrx/store';
import { IActionss } from '../types/actionss.model';

export const getActionsss = createAction('[Actionss] Get Actionsss');
export const getActionsssSuccess = createAction(
  '[Actionss] Get Actionsss Success',
  props<{ actionsss: IActionss[] }>(),
);
export const getActionsssFailure = createAction(
  '[Actionss] Get Actionsss Failure',
  props<{ error: any }>(),
);

export const createActionss = createAction(
  '[Actionss] Create Actionss',
  props<{ actionss: IActionss }>(),
);
export const createActionssSuccess = createAction(
  '[Actionss] Create Actionss Success',
  props<{ actionss: IActionss }>(),
);
export const createActionssFailure = createAction(
  '[Actionss] Create Actionss Failure',
  props<{ error: any }>(),
);

export const updateActionss = createAction(
  '[Actionss] Update Actionss',
  props<{ actionss: IActionss }>(),
);
export const updateActionssSuccess = createAction(
  '[Actionss] Update Actionss Success',
  props<{ actionss: IActionss }>(),
);
export const updateActionssFailure = createAction(
  '[Actionss] Update Actionss Failure',
  props<{ error: any }>(),
);

export const deleteActionss = createAction('[Actionss] Delete Actionss', props<{ id: number }>());
export const deleteActionssSuccess = createAction(
  '[Actionss] Delete Actionss Success',
  props<{ id: number }>(),
);
export const deleteActionssFailure = createAction(
  '[Actionss] Delete Actionss Failure',
  props<{ error: any }>(),
);

export const addTestActionss = createAction(
  '[Actionss] Add Test Actionss',
  props<{ actionss: IActionss }>(),
);
