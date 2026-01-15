import { createAction, props } from '@ngrx/store';
import { IMaterial } from '../types/material.model';

export const getMaterials = createAction('[Material] Get Materials');
export const getMaterialsSuccess = createAction(
  '[Material] Get Materials Success',
  props<{ materials: IMaterial[] }>(),
);
export const getMaterialsFailure = createAction(
  '[Material] Get Materials Failure',
  props<{ error: any }>(),
);

export const createMaterial = createAction(
  '[Material] Create Material',
  props<{ material: IMaterial }>(),
);
export const createMaterialSuccess = createAction(
  '[Material] Create Material Success',
  props<{ material: IMaterial }>(),
);
export const createMaterialFailure = createAction(
  '[Material] Create Material Failure',
  props<{ error: any }>(),
);

export const updateMaterial = createAction(
  '[Material] Update Material',
  props<{ material: IMaterial }>(),
);
export const updateMaterialSuccess = createAction(
  '[Material] Update Material Success',
  props<{ material: IMaterial }>(),
);
export const updateMaterialFailure = createAction(
  '[Material] Update Material Failure',
  props<{ error: any }>(),
);

export const deleteMaterial = createAction('[Material] Delete Material', props<{ id: number }>());
export const deleteMaterialSuccess = createAction(
  '[Material] Delete Material Success',
  props<{ id: number }>(),
);
export const deleteMaterialFailure = createAction(
  '[Material] Delete Material Failure',
  props<{ error: any }>(),
);

// material.actions.ts
export const addTestMaterial = createAction(
  '[Material] Add Test Material',
  props<{ material: IMaterial }>(),
);
