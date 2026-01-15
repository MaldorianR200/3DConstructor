import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GridState } from './grid.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { Routes } from 'src/shared/config/routes';

export const selectGridState = createFeatureSelector<GridState>(Slices.GRIDS);

export const selectAllGrids = createSelector(selectGridState, (state: GridState) => state.grids);

export const selectGridById = (gridId: number) =>
  createSelector(selectGridState, (state: GridState) =>
    state.grids.find((grid) => grid.id === gridId),
  );

export const selectGridByPageRoute = (route: Routes) =>
  createSelector(selectGridState, (state: GridState) =>
    state.grids.find((grid) => Routes[grid.page] === route),
  );

export const selectGridsCount = createSelector(
  selectGridState,
  (state: GridState) => state.grids.length,
);

export const selectGridError = createSelector(selectGridState, (state: GridState) => state.error);

export const selectGridSettings = createSelector(
  selectGridState,
  (state: GridState) => state.settings,
);
