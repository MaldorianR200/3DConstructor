import { createReducer, on } from '@ngrx/store';
import { ICombineMaterial } from '../types/combineMaterial.model';
import * as CombineMaterialActions from './combineMaterial.actions';

export interface CombineMaterialState {
  combineMaterials: ICombineMaterial[];
  error: any;
}

export const initialState: CombineMaterialState = {
  combineMaterials: [],
  error: null
};

export const combineMaterialReducer = createReducer(
  initialState,
  // get
  on(CombineMaterialActions.getCombineMaterialsSuccess, (state, { combineMaterials }) => ({
    ...state,
    combineMaterials
  })),
  on(CombineMaterialActions.getCombineMaterialsFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // create
  on(CombineMaterialActions.createCombineMaterialSuccess, (state, { combineMaterial }) => ({
    ...state,
    combineMaterials: [...state.combineMaterials, combineMaterial]
  })),
  on(CombineMaterialActions.createCombineMaterialFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // update
  on(CombineMaterialActions.updateCombineMaterialSuccess, (state, { combineMaterial }) => ({
    ...state,
    combineMaterials: state.combineMaterials.map(item => {
      if (item.id === combineMaterial.id) {
        const sortedImages = []?.sort((a, b) => a.displayOrder - b.displayOrder);
        // const sortedImages = [...combineMaterial.images]?.sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...combineMaterial, images: sortedImages };
      } 
      return item;
    })
  })),
  on(CombineMaterialActions.updateCombineMaterialFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // delete
  on(CombineMaterialActions.deleteCombineMaterialSuccess, (state, { id }) => ({
    ...state,
    combineMaterials: state.combineMaterials.filter(p => p.id !== id)
  })),
  on(CombineMaterialActions.deleteCombineMaterialFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
