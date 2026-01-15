import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TypesState } from './types.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectTypesState = createFeatureSelector<TypesState>(Slices.TYPES);

export const selectAllTypess = createSelector(
  selectTypesState,
  (state: TypesState) => state.typess,
);

export const selectTypesById = (typesId: number) =>
  createSelector(selectTypesState, (state: TypesState) =>
    state.typess.find((types) => types.id === typesId),
  );

export const selectTypessCount = createSelector(
  selectTypesState,
  (state: TypesState) => state.typess.length,
);

export const selectTypesError = createSelector(
  selectTypesState,
  (state: TypesState) => state.error,
);
