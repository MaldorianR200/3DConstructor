import { createReducer, on } from '@ngrx/store';
import { IMaterial } from '../types/material.model';
import * as MaterialActions from './material.actions';

export interface MaterialState {
  materials: IMaterial[];
  error: any;
}

export const initialState: MaterialState = {
  materials: [],
  error: null,
};

export const materialReducer = createReducer(
  initialState,
  // get
  on(MaterialActions.getMaterialsSuccess, (state, { materials }) => ({
    ...state,
    materials,
  })),
  on(MaterialActions.getMaterialsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(MaterialActions.createMaterialSuccess, (state, { material }) => ({
    ...state,
    materials: [...state.materials, material],
  })),
  on(MaterialActions.createMaterialFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(MaterialActions.updateMaterialSuccess, (state, { material }) => ({
    ...state,
    materials: state.materials.map((item) => {
      if (item.id === material.id) {
        // если texture — это объект, просто заменяем его
        return { ...material };
      }
      return item;
    }),
  })),
  on(MaterialActions.updateMaterialFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(MaterialActions.deleteMaterialSuccess, (state, { id }) => ({
    ...state,
    materials: state.materials.filter((p) => p.id !== id),
  })),
  on(MaterialActions.deleteMaterialFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // material.reducer.ts
  on(MaterialActions.addTestMaterial, (state, { material }) => ({
    ...state,
    materials: [...state.materials, material],
  })),
);
