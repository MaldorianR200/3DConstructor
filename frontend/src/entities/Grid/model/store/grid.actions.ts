import { createAction, props } from '@ngrx/store';
import { IGrid, IIGrid, IGridItem, IGridSettings } from '../types/grid.model';

export const getGrids = createAction('[Grid] Get Grids');
export const getGridsSuccess = createAction(
  '[Grid] Get Grids Success',
  props<{ grids: IGrid[] }>(),
);
export const getGridsFailure = createAction('[Grid] Get Grids Failure', props<{ error: any }>());

export const createGrid = createAction('[Grid] Create Grid', props<{ grid: IGrid }>());
export const createGridSuccess = createAction(
  '[Grid] Create Grid Success',
  props<{ grid: IGrid }>(),
);
export const createGridFailure = createAction(
  '[Grid] Create Grid Failure',
  props<{ error: any }>(),
);

export const createGridItem = createAction(
  '[GridItem] Create GridItem',
  props<{ id: number; item: IGridItem }>(),
);
export const updateGridItem = createAction(
  '[GridItem] Update GridItem',
  props<{ id: number; item: IGridItem }>(),
);
export const deleteGridItem = createAction(
  '[GridItem] Delete GridItem',
  props<{ id: number; item: IGridItem }>(),
);

export const loadGridSettingsFromLocalStorage = createAction(
  '[GridSettings] Load From Localstorage GridSettings',
);

export const getGridSettings = createAction('[GridSettings] Get GridSettings');
export const getGridSettingsSuccess = createAction(
  '[GridSettings] Get GridSettings Success',
  props<{ settings: IGridSettings }>(),
);
export const getGridSettingsFailure = createAction(
  '[GridSettings] Get GridSettings Failure',
  props<{ error: any }>(),
);

export const setGridSettings = createAction(
  '[GridSettings] Set GridSettings',
  props<{ settings: IGridSettings }>(),
);
export const setGridSettingsSuccess = createAction(
  '[GridSettings] Set GridSettings Success',
  props<{ settings: IGridSettings }>(),
);
export const setGridSettingsFailure = createAction(
  '[GridSettings] Set GridSettings Failure',
  props<{ error: any }>(),
);

export const updateGrid = createAction('[Grid] Update Grid', props<{ grid: IGrid }>());
export const updateGridSuccess = createAction(
  '[Grid] Update Grid Success',
  props<{ grid: IGrid }>(),
);
export const updateGridFailure = createAction(
  '[Grid] Update Grid Failure',
  props<{ error: any }>(),
);

export const deleteGrid = createAction('[Grid] Delete Grid', props<{ id: number }>());
export const deleteGridSuccess = createAction(
  '[Grid] Delete Grid Success',
  props<{ id: number }>(),
);
export const deleteGridFailure = createAction(
  '[Grid] Delete Grid Failure',
  props<{ error: any }>(),
);
