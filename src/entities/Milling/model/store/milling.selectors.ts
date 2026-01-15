import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MillingState } from './milling.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { selectAllTypess } from '../../../Types/model/store/types.selectors';

export const selectMillingState = createFeatureSelector<MillingState>(Slices.MILLING);

export const selectAllMillings = createSelector(
  selectMillingState,
  (state: MillingState) => state.millings
);

export const selectMillingById = (millingId: number) => createSelector(
  selectMillingState,
  (state: MillingState) => state.millings.find(milling => milling.id === millingId)
);

export const selectMillingsCount = createSelector(
  selectMillingState,
  (state: MillingState) => state.millings.length
);

export const selectMillingError = createSelector(
  selectMillingState,
  (state: MillingState) => state.error
);

export const selectTypeSteps = createSelector(selectAllTypess, (types) =>
  types
    .filter((type) => type.type === 'STEP' && type.active)
    .map((type) => ({
      value: type.id,
      label: type.name,
    })),
);

export const selectAllSteps = createSelector(
  selectAllTypess,
  (types) => types.filter((type) => type.type === 'STEP' && type.active)
);

