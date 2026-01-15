import { createAction, props } from '@ngrx/store';
import { IMilling } from '../types/milling.model';

export const getMillings = createAction('[Milling] Get Millings');
export const getMillingsSuccess = createAction('[Milling] Get Millings Success', props<{ millings: IMilling[] }>());
export const getMillingsFailure = createAction('[Milling] Get Millings Failure', props<{ error: any }>());

export const createMilling = createAction('[Milling] Create Milling', props<{ milling: IMilling }>());
export const createMillingSuccess = createAction('[Milling] Create Milling Success', props<{ milling: IMilling }>());
export const createMillingFailure = createAction('[Milling] Create Milling Failure', props<{ error: any }>());

export const updateMilling = createAction('[Milling] Update Milling', props<{ milling: IMilling }>());
export const updateMillingSuccess = createAction('[Milling] Update Milling Success', props<{ milling: IMilling }>());
export const updateMillingFailure = createAction('[Milling] Update Milling Failure', props<{ error: any }>());

export const deleteMilling = createAction('[Milling] Delete Milling', props<{ id: number }>());
export const deleteMillingSuccess = createAction('[Milling] Delete Milling Success', props<{ id: number }>());
export const deleteMillingFailure = createAction('[Milling] Delete Milling Failure', props<{ error: any }>());
