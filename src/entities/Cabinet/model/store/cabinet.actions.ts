import { createAction, props } from '@ngrx/store';
import { ICabinet } from '../types/cabinet.model';
import { Shelves } from 'src/pages/calculator-page/ui/сabinet/model/Shelf';
import { DrawerBlocks } from 'src/pages/calculator-page/ui/сabinet/model/Drawers';
import { Facades } from 'src/pages/calculator-page/ui/сabinet/model/Facade';
import { Mullion } from 'src/pages/calculator-page/ui/сabinet/model/Mullion';

export const getCabinets = createAction('[Cabinet] Get Cabinets');
export const getCabinetsSuccess = createAction(
  '[Cabinet] Get Cabinets Success',
  props<{ cabinets: ICabinet[] }>(),
);
export const getCabinetsFailure = createAction(
  '[Cabinet] Get Cabinets Failure',
  props<{ error: any }>(),
);

export const createCabinet = createAction(
  '[Cabinet] Create Cabinet',
  props<{ cabinet: ICabinet }>(),
);
export const createCabinetSuccess = createAction(
  '[Cabinet] Create Cabinet Success',
  props<{ cabinet: ICabinet }>(),
);
export const createCabinetFailure = createAction(
  '[Cabinet] Create Cabinet Failure',
  props<{ error: any }>(),
);

export const updateCabinet = createAction(
  '[Cabinet] Update Cabinet',
  props<{ cabinet: ICabinet }>(),
);
export const updateCabinetSuccess = createAction(
  '[Cabinet] Update Cabinet Success',
  props<{ cabinet: ICabinet }>(),
);
export const updateCabinetFailure = createAction(
  '[Cabinet] Update Cabinet Failure',
  props<{ error: any }>(),
);
export const updateShelf = createAction(
  '[Cabinet] Update Shelf',
  props<{ cabinetId: number; shelf: Shelves }>(),
);

export const updateDrawer = createAction(
  '[Cabinet] Update Drawer',
  props<{ cabinetId: number; drawer: DrawerBlocks }>(),
);

export const updateDoor = createAction(
  '[Cabinet] Update Door',
  props<{ cabinetId: number; door: Facades }>(),
);

export const updateMullion = createAction(
  '[Cabinet] Update Mullion',
  props<{ cabinetId: number; mullion: Mullion }>(),
);

export const deleteCabinet = createAction('[Cabinet] Delete Cabinet', props<{ id: number }>());
export const deleteCabinetSuccess = createAction(
  '[Cabinet] Delete Cabinet Success',
  props<{ id: number }>(),
);
export const deleteCabinetFailure = createAction(
  '[Cabinet] Delete Cabinet Failure',
  props<{ error: any }>(),
);
