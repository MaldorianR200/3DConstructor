import { createAction, props } from '@ngrx/store';
import { ICombineMaterial } from '../types/combineMaterial.model';

export const getCombineMaterials = createAction('[CombineMaterial] Get CombineMaterials');
export const getCombineMaterialsSuccess = createAction('[CombineMaterial] Get CombineMaterials Success', props<{ combineMaterials: ICombineMaterial[] }>());
export const getCombineMaterialsFailure = createAction('[CombineMaterial] Get CombineMaterials Failure', props<{ error: any }>());

export const createCombineMaterial = createAction('[CombineMaterial] Create CombineMaterial', props<{ combineMaterial: ICombineMaterial }>());
export const createCombineMaterialSuccess = createAction('[CombineMaterial] Create CombineMaterial Success', props<{ combineMaterial: ICombineMaterial }>());
export const createCombineMaterialFailure = createAction('[CombineMaterial] Create CombineMaterial Failure', props<{ error: any }>());

export const updateCombineMaterial = createAction('[CombineMaterial] Update CombineMaterial', props<{ combineMaterial: ICombineMaterial }>());
export const updateCombineMaterialSuccess = createAction('[CombineMaterial] Update CombineMaterial Success', props<{ combineMaterial: ICombineMaterial }>());
export const updateCombineMaterialFailure = createAction('[CombineMaterial] Update CombineMaterial Failure', props<{ error: any }>());

export const deleteCombineMaterial = createAction('[CombineMaterial] Delete CombineMaterial', props<{ id: number }>());
export const deleteCombineMaterialSuccess = createAction('[CombineMaterial] Delete CombineMaterial Success', props<{ id: number }>());
export const deleteCombineMaterialFailure = createAction('[CombineMaterial] Delete CombineMaterial Failure', props<{ error: any }>());
