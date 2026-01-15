import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FurnitureState } from './furniture.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { selectAllTypess } from 'src/entities/Types/model/store/types.selectors';

export const selectFurnitureState = createFeatureSelector<FurnitureState>(Slices.FURNITURE);

export const selectAllFurnitures = createSelector(
  selectFurnitureState,
  (state: FurnitureState) => state.Furnitures,
);

export const selectFurnitureById = (FurnitureId: number) =>
  createSelector(selectFurnitureState, (state: FurnitureState) =>
    state.Furnitures.find((Furniture) => Furniture.id === FurnitureId),
  );

export const selectFurnituresCount = createSelector(
  selectFurnitureState,
  (state: FurnitureState) => state.Furnitures.length,
);

export const selectFurnitureError = createSelector(
  selectFurnitureState,
  (state: FurnitureState) => state.error,
);

export const selectTypesFurniture = createSelector(
  selectAllTypess, (types) =>
    types
      .filter((type) => type.type === 'FURNITURE' && type.active)
      .map((type) => ({
        value: type.id!,
        label: type.name,
      })),
);
