import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CombineMaterialState } from './combineMaterial.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectCombineMaterialState = createFeatureSelector<CombineMaterialState>(Slices.COMBINE_MATERIALS);

export const selectAllCombineMaterials = createSelector(
  selectCombineMaterialState,
  (state: CombineMaterialState) => state.combineMaterials
);

export const selectCombineMaterialById = (combineMaterialId: number) => createSelector(
  selectCombineMaterialState,
  (state: CombineMaterialState) => state.combineMaterials.find(combineMaterial => combineMaterial.id === combineMaterialId)
);

export const selectCombineMaterialsCount = createSelector(
  selectCombineMaterialState,
  (state: CombineMaterialState) => state.combineMaterials.length
);

export const selectCombineMaterialError = createSelector(
  selectCombineMaterialState,
  (state: CombineMaterialState) => state.error
);
