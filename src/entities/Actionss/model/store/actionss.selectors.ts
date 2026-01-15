import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActionssState } from './actionss.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectActionssState = createFeatureSelector<ActionssState>(Slices.ACTIONSS);

export const selectAllActionsss = createSelector(
  selectActionssState,
  (state: ActionssState) => state.actionsss,
);

export const selectActionssById = (actionssId: number) =>
  createSelector(selectActionssState, (state: ActionssState) =>
    state.actionsss.find((actionss) => actionss.id === actionssId),
  );

export const selectActionsssCount = createSelector(
  selectActionssState,
  (state: ActionssState) => state.actionsss.length,
);

export const selectActionssError = createSelector(
  selectActionssState,
  (state: ActionssState) => state.error,
);
