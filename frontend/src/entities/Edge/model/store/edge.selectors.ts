import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EdgeState } from './edge.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectEdgeState = createFeatureSelector<EdgeState>(Slices.EDGE);

export const selectAllEdges = createSelector(
  selectEdgeState,
  (state: EdgeState) => state.edges
);

export const selectEdgeById = (edgeId: number) => createSelector(
  selectEdgeState,
  (state: EdgeState) => state.edges.find(edge => edge.id === edgeId)
);

export const selectEdgesCount = createSelector(
  selectEdgeState,
  (state: EdgeState) => state.edges.length
);

export const selectEdgeError = createSelector(
  selectEdgeState,
  (state: EdgeState) => state.error
);
