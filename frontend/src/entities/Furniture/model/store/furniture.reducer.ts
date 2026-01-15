import { createReducer, on } from '@ngrx/store';
import { IFurniture } from '../types/furniture.model';
import * as FurnitureActions from './furniture.actions';

export interface FurnitureState {
  Furnitures: IFurniture[];
  error: any;
}

export const initialState: FurnitureState = {
  Furnitures: [],
  error: null,
};

export const furnitureReducer = createReducer(
  initialState,
  // get
  on(FurnitureActions.getFurnituresSuccess, (state, { furnitures }) => ({
    ...state,
    Furnitures: furnitures,
  })),
  on(FurnitureActions.getFurnituresFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(FurnitureActions.createFurnitureSuccess, (state, { furniture }) => ({
    ...state,
    Furnitures: [...state.Furnitures, furniture],
  })),
  on(FurnitureActions.createFurnitureFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(FurnitureActions.updateFurnitureSuccess, (state, { furniture }) => ({
    ...state,
    Furnitures: state.Furnitures.map((item) => {
      if (item.id === furniture.id) {
        const sortedImages = [].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...furniture, images: sortedImages };
      }
      return item;
    }),
  })),
  on(FurnitureActions.updateFurnitureFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(FurnitureActions.deleteFurnitureSuccess, (state, { id }) => ({
    ...state,
    Furnitures: state.Furnitures.filter((p) => p.id !== id),
  })),
  on(FurnitureActions.deleteFurnitureFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(FurnitureActions.addTestFurniture, (state, { furniture }) => ({
    ...state,
    Furnitures: [...state.Furnitures, furniture],
  })),
);
