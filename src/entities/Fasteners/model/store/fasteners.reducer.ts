import { createReducer, on } from '@ngrx/store';
import { IFasteners } from '../types/fasteners.model';
import * as FastenersActions from './fasteners.actions';

export interface FastenersState {
  fastenerss: IFasteners[];
  error: any;
}

export const initialState: FastenersState = {
  fastenerss: [],
  error: null,
};

export const fastenersReducer = createReducer(
  initialState,
  // get
  on(FastenersActions.getFastenerssSuccess, (state, { fastenerss }) => ({
    ...state,
    fastenerss,
  })),
  on(FastenersActions.getFastenerssFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(FastenersActions.createFastenersSuccess, (state, { fasteners }) => ({
    ...state,
    fastenerss: [...state.fastenerss, fasteners],
  })),
  on(FastenersActions.createFastenersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(FastenersActions.updateFastenersSuccess, (state, { fasteners }) => ({
    ...state,
    fastenerss: state.fastenerss.map((item) => {
      if (item.id === fasteners.id) {
        const sortedImages = [].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...fasteners, images: sortedImages };
      }
      return item;
    }),
  })),
  on(FastenersActions.updateFastenersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(FastenersActions.deleteFastenersSuccess, (state, { id }) => ({
    ...state,
    fastenerss: state.fastenerss.filter((p) => p.id !== id),
  })),
  on(FastenersActions.deleteFastenersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(FastenersActions.addTestFastener, (state, { fastener }) => ({
    ...state,
    fastenerss: [...state.fastenerss, fastener],
  })),
);
