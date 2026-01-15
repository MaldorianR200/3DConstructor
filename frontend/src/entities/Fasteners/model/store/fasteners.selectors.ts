import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FastenersState } from './fasteners.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectFastenersState = createFeatureSelector<FastenersState>(Slices.FASTENERS);

export const selectAllFastenerss = createSelector(
  selectFastenersState,
  (state: FastenersState) => state.fastenerss,
);

export const selectFastenersById = (fastenersId: number) =>
  createSelector(selectFastenersState, (state: FastenersState) =>
    state.fastenerss.find((fasteners) => fasteners.id === fastenersId),
  );

export const selectFastenerssCount = createSelector(
  selectFastenersState,
  (state: FastenersState) => state.fastenerss.length,
);

export const selectFastenersError = createSelector(
  selectFastenersState,
  (state: FastenersState) => state.error,
);
