import { createAction, props } from '@ngrx/store';
import { IEdge } from '../types/edge.model';

export const getEdges = createAction('[Edge] Get Edges');
export const getEdgesSuccess = createAction('[Edge] Get Edges Success', props<{ edges: IEdge[] }>());
export const getEdgesFailure = createAction('[Edge] Get Edges Failure', props<{ error: any }>());

export const createEdge = createAction('[Edge] Create Edge', props<{ edge: IEdge }>());
export const createEdgeSuccess = createAction('[Edge] Create Edge Success', props<{ edge: IEdge }>());
export const createEdgeFailure = createAction('[Edge] Create Edge Failure', props<{ error: any }>());

export const updateEdge = createAction('[Edge] Update Edge', props<{ edge: IEdge }>());
export const updateEdgeSuccess = createAction('[Edge] Update Edge Success', props<{ edge: IEdge }>());
export const updateEdgeFailure = createAction('[Edge] Update Edge Failure', props<{ error: any }>());

export const deleteEdge = createAction('[Edge] Delete Edge', props<{ id: number }>());
export const deleteEdgeSuccess = createAction('[Edge] Delete Edge Success', props<{ id: number }>());
export const deleteEdgeFailure = createAction('[Edge] Delete Edge Failure', props<{ error: any }>());
