import { createReducer, on } from '@ngrx/store';
import { IMilling } from '../types/milling.model';
import * as MillingActions from './milling.actions';

export interface MillingState {
  millings: IMilling[];
  error: any;
}

export const initialState: MillingState = {
  millings: [],
  error: null
};

export const millingReducer = createReducer(
  initialState,
  // get
  on(MillingActions.getMillingsSuccess, (state, { millings }) => ({
    ...state,
    millings
  })),
  on(MillingActions.getMillingsFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // create
  on(MillingActions.createMillingSuccess, (state, { milling }) => ({
    ...state,
    millings: [...state.millings, milling]
  })),
  on(MillingActions.createMillingFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // update
  on(MillingActions.updateMillingSuccess, (state, { milling }) => ({
    ...state,
    millings: state.millings.map(item => {
      if (item.id === milling.id) {
        const sortedImages = []?.sort((a, b) => a.displayOrder - b.displayOrder);
        // const sortedImages = [...milling.images]?.sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...milling, images: sortedImages };
      } 
      return item;
    })
  })),
  on(MillingActions.updateMillingFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // delete
  on(MillingActions.deleteMillingSuccess, (state, { id }) => ({
    ...state,
    millings: state.millings.filter(p => p.id !== id)
  })),
  on(MillingActions.deleteMillingFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
