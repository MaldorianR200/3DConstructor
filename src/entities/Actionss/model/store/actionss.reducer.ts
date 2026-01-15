import { createReducer, on } from '@ngrx/store';
import { IActionss } from '../types/actionss.model';
import * as ActionssActions from './actionss.actions';

export interface ActionssState {
  actionsss: IActionss[];
  error: any;
}

export const initialState: ActionssState = {
  actionsss: [],
  error: null,
};

export const actionssReducer = createReducer(
  initialState,
  // get
  on(ActionssActions.getActionsssSuccess, (state, { actionsss }) => ({
    ...state,
    actionsss,
  })),
  on(ActionssActions.getActionsssFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(ActionssActions.createActionssSuccess, (state, { actionss }) => ({
    ...state,
    actionsss: [...state.actionsss, actionss],
  })),
  on(ActionssActions.createActionssFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(ActionssActions.updateActionssSuccess, (state, { actionss }) => ({
    ...state,
    actionsss: state.actionsss.map((item) => {
      if (item.id === actionss.id) {
        const sortedImages = [].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...actionss, images: sortedImages };
      }
      return item;
    }),
  })),
  on(ActionssActions.updateActionssFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(ActionssActions.deleteActionssSuccess, (state, { id }) => ({
    ...state,
    actionsss: state.actionsss.filter((p) => p.id !== id),
  })),
  on(ActionssActions.deleteActionssFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ActionssActions.addTestActionss, (state, { actionss }) => ({
    ...state,
    actionsss: [...state.actionsss, actionss],
  })),
);
