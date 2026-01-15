import { createReducer, on } from '@ngrx/store';
import { ITypes } from '../types/types.model';
import * as TypesActions from './types.actions';

export interface TypesState {
  typess: ITypes[];
  error: any;
}

export const initialState: TypesState = {
  typess: [],
  error: null,
};

export const typesReducer = createReducer(
  initialState,
  // get
  on(TypesActions.getTypessSuccess, (state, { typess }) => ({
    ...state,
    typess,
  })),
  on(TypesActions.getTypessFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(TypesActions.createTypesSuccess, (state, { types }) => ({
    ...state,
    typess: [...state.typess, types],
  })),
  on(TypesActions.createTypesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(TypesActions.updateTypesSuccess, (state, { types }) => ({
    ...state,
    typess: state.typess.map((item) => {
      if (item.id === types.id) {
        const sortedImages = [].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...types, images: sortedImages };
      }
      return item;
    }),
  })),
  on(TypesActions.updateTypesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(TypesActions.deleteTypesSuccess, (state, { id }) => ({
    ...state,
    typess: state.typess.filter((p) => p.id !== id),
  })),
  on(TypesActions.deleteTypesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
