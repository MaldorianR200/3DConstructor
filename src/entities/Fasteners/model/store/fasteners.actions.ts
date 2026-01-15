import { createAction, props } from '@ngrx/store';
import { IFasteners, IFastenersResponse } from '../types/fasteners.model';

export const getFastenerss = createAction('[Fasteners] Get Fastenerss');
export const getFastenerssSuccess = createAction(
  '[Fasteners] Get Fastenerss Success',
  props<{ fastenerss: IFasteners[] }>(),
);
export const getFastenerssFailure = createAction(
  '[Fasteners] Get Fastenerss Failure',
  props<{ error: any }>(),
);

export const createFasteners = createAction(
  '[Fasteners] Create Fasteners',
  props<{ fasteners: IFasteners }>(),
);
export const createFastenersSuccess = createAction(
  '[Fasteners] Create Fasteners Success',
  props<{ fasteners: IFasteners }>(),
);
export const createFastenersFailure = createAction(
  '[Fasteners] Create Fasteners Failure',
  props<{ error: any }>(),
);

export const updateFasteners = createAction(
  '[Fasteners] Update Fasteners',
  props<{ fasteners: IFasteners }>(),
);
export const updateFastenersSuccess = createAction(
  '[Fasteners] Update Fasteners Success',
  props<{ fasteners: IFasteners }>(),
);
export const updateFastenersFailure = createAction(
  '[Fasteners] Update Fasteners Failure',
  props<{ error: any }>(),
);

export const deleteFasteners = createAction(
  '[Fasteners] Delete Fasteners',
  props<{ id: number }>(),
);
export const deleteFastenersSuccess = createAction(
  '[Fasteners] Delete Fasteners Success',
  props<{ id: number }>(),
);
export const deleteFastenersFailure = createAction(
  '[Fasteners] Delete Fasteners Failure',
  props<{ error: any }>(),
);
export const addTestFastener = createAction(
  '[Fasteners] Add Test Fastener',
  props<{ fastener: IFasteners }>(),
);
