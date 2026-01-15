import { createReducer, on } from '@ngrx/store';
import { IColor } from '../types/color.model';
import * as ColorActions from './color.actions';

export interface ColorState {
  colors: IColor[];
  error: any;
}

export const initialState: ColorState = {
  colors: [],
  error: null,
};

export const colorReducer = createReducer(
  initialState,
  on(ColorActions.getColorsSuccess, (state, { colors }) => ({
    ...state,
    colors,
  })),
  on(ColorActions.getColorsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(ColorActions.createColorSuccess, (state, { color }) => ({
    ...state,
    colors: [...state.colors, color],
  })),
  on(ColorActions.createColorFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(ColorActions.updateColorSuccess, (state, { color }) => ({
    ...state,
    colors: state.colors.map((item) => (item.id == color.id ? { ...item, ...color } : item)),
  })),
  on(ColorActions.updateColorFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(ColorActions.deleteColorSuccess, (state, { id }) => ({
    ...state,
    colors: state.colors.filter((p) => p.id !== id),
  })),
  on(ColorActions.deleteColorFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
