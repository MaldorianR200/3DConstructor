import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CabinetState } from './cabinet.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectCabinetState = createFeatureSelector<CabinetState>(Slices.CABINET);

export const selectAllCabinets = createSelector(
  selectCabinetState,
  (state: CabinetState) => state.cabinets,
);

export const selectCabinetById = (cabinetId: number) =>
  createSelector(selectCabinetState, (state: CabinetState) =>
    state.cabinets.find((cabinet) => cabinet.id === cabinetId),
  );

export const selectCabinetsCount = createSelector(
  selectCabinetState,
  (state: CabinetState) => state.cabinets.length,
);

export const selectCabinetError = createSelector(
  selectCabinetState,
  (state: CabinetState) => state.error,
);
