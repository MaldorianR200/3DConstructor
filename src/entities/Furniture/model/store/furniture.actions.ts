import { createAction, props } from '@ngrx/store';
import { IFurniture } from '../types/furniture.model';

export const getFurnitures = createAction('[Furniture] Get Furnitures');
export const getFurnituresSuccess = createAction(
  '[Furniture] Get Furnitures Success',
  props<{ furnitures: IFurniture[] }>(),
);
export const getFurnituresFailure = createAction(
  '[Furniture] Get Furnitures Failure',
  props<{ error: any }>(),
);

export const createFurniture = createAction(
  '[Furniture] Create Furniture',
  props<{ furniture: IFurniture }>(),
);
export const createFurnitureSuccess = createAction(
  '[Furniture] Create Furniture Success',
  props<{ furniture: IFurniture }>(),
);
export const createFurnitureFailure = createAction(
  '[Furniture] Create Furniture Failure',
  props<{ error: any }>(),
);

export const updateFurniture = createAction(
  '[Furniture] Update Furniture',
  props<{ furniture: IFurniture }>(),
);
export const updateFurnitureSuccess = createAction(
  '[Furniture] Update Furniture Success',
  props<{ furniture: IFurniture }>(),
);
export const updateFurnitureFailure = createAction(
  '[Furniture] Update Furniture Failure',
  props<{ error: any }>(),
);

export const deleteFurniture = createAction(
  '[Furniture] Delete Furniture',
  props<{ id: number }>(),
);
export const deleteFurnitureSuccess = createAction(
  '[Furniture] Delete Furniture Success',
  props<{ id: number }>(),
);
export const deleteFurnitureFailure = createAction(
  '[Furniture] Delete Furniture Failure',
  props<{ error: any }>(),
);

export const addTestFurniture = createAction(
  '[Furniture] Add Test Furniture',
  props<{ furniture: IFurniture }>(),
);
