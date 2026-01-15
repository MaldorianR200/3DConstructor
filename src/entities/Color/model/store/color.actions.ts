import { createAction, props } from '@ngrx/store';
import { IColor } from '../types/color.model';

export const getColors = createAction('[Color] Get Colors');
export const getColorsSuccess = createAction(
  '[Color] Get Colors Success',
  props<{ colors: IColor[] }>(),
);
export const getColorsFailure = createAction('[Color] Get Colors Failure', props<{ error: any }>());

export const createColor = createAction('[Color] Create Color', props<{ color: IColor }>());
export const createColorSuccess = createAction(
  '[Color] Create Color Success',
  props<{ color: IColor }>(),
);
export const createColorFailure = createAction(
  '[Color] Create Color Failure',
  props<{ error: any }>(),
);

export const updateColor = createAction('[Color] Update Color', props<{ color: IColor }>());
export const updateColorSuccess = createAction(
  '[Color] Update Color Success',
  props<{ color: IColor }>(),
);
export const updateColorFailure = createAction(
  '[Color] Update Color Failure',
  props<{ error: any }>(),
);

export const deleteColor = createAction('[Color] Delete Color', props<{ id: number }>());
export const deleteColorSuccess = createAction(
  '[Color] Delete Color Success',
  props<{ id: number }>(),
);
export const deleteColorFailure = createAction(
  '[Color] Delete Color Failure',
  props<{ error: any }>(),
);
