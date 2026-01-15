import { createReducer, on } from '@ngrx/store';
import { IEdge } from '../types/edge.model';
import * as EdgeActions from './edge.actions';

export interface EdgeState {
  edges: IEdge[];
  error: any;
}

export const initialState: EdgeState = {
  edges: [],
  error: null
};

export const edgeReducer = createReducer(
  initialState,
  // get
  on(EdgeActions.getEdgesSuccess, (state, { edges }) => ({
    ...state,
    edges
  })),
  on(EdgeActions.getEdgesFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // create
  on(EdgeActions.createEdgeSuccess, (state, { edge }) => ({
    ...state,
    edges: [...state.edges, edge]
  })),
  on(EdgeActions.createEdgeFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // update
  on(EdgeActions.updateEdgeSuccess, (state, { edge }) => ({
    ...state,
    edges: state.edges.map(item => {
      if (item.id === edge.id) {
        const sortedImages = []?.sort((a, b) => a.displayOrder - b.displayOrder);
        // const sortedImages = [...edge.images]?.sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...edge, images: sortedImages };
      } 
      return item;
    })
  })),
  on(EdgeActions.updateEdgeFailure, (state, { error }) => ({
    ...state,
    error
  })),
  // delete
  on(EdgeActions.deleteEdgeSuccess, (state, { id }) => ({
    ...state,
    edges: state.edges.filter(p => p.id !== id)
  })),
  on(EdgeActions.deleteEdgeFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
