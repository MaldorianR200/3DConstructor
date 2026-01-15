import { createReducer, on } from '@ngrx/store';
import { ISpecification } from '../types/specification.model';
import * as SpecificationActions from './specification.actions';

export interface SpecificationState {
  specifications: ISpecification[];
  error: any;
}

export const initialState: SpecificationState = {
  specifications: [],
  error: null,
};

export const specificationReducer = createReducer(
  initialState,
  // get
  on(SpecificationActions.getSpecificationsSuccess, (state, { specifications }) => ({
    ...state,
    specifications,
  })),
  on(SpecificationActions.getSpecificationsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(SpecificationActions.createSpecificationSuccess, (state, { specification }) => ({
    ...state,
    specifications: [...state.specifications, specification],
  })),
  on(SpecificationActions.createSpecificationFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(SpecificationActions.updateSpecificationSuccess, (state, { specification }) => ({
    ...state,
    specifications: state.specifications.map((item) => {
      if (item.id === specification.id) {
        return { ...specification };
      }
      return item;
    }),
  })),
  on(SpecificationActions.updateSpecificationFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(SpecificationActions.deleteSpecificationSuccess, (state, { id }) => ({
    ...state,
    specifications: state.specifications.filter((p) => p.id !== id),
  })),
  on(SpecificationActions.deleteSpecificationFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
