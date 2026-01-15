import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MaterialState } from './material.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import {selectAllTypess} from "../../../Types/model/store/types.selectors";

export const selectMaterialState = createFeatureSelector<MaterialState>(Slices.MATERIAL);

export const selectAllMaterials = createSelector(
  selectMaterialState,
  (state: MaterialState) => state.materials,
);

export const selectMaterialById = (materialId: number) =>
  createSelector(selectMaterialState, (state: MaterialState) =>
    state.materials.find((material) => material.id === materialId),
  );

export const selectMaterialsCount = createSelector(
  selectMaterialState,
  (state: MaterialState) => state.materials.length,
);

export const selectMaterialError = createSelector(
  selectMaterialState,
  (state: MaterialState) => state.error,
);

export const selectTypeMaterial = createSelector(selectAllTypess, (types) =>
  types
    .filter((type) => type.type === 'MATERIAL' && type.active)
    .map((type) => ({
      value: type.id,
      label: type.name,
      texture: type.texture,
    })),
);
export const selectMaterial = createSelector(
  selectMaterialState,
  (state: MaterialState) => state.materials
    .filter((type) => type.active)
    .map((type) => ({
      value: type.id,
      label: type.name,
    })),
);
