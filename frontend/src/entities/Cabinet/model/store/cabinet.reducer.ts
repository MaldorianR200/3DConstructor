import { createReducer, on } from '@ngrx/store';
import { ICabinet } from '../types/cabinet.model';
import * as CabinetActions from './cabinet.actions';

export interface CabinetState {
  cabinets: ICabinet[];
  error: any;
}

export const initialState: CabinetState = {
  cabinets: [],
  error: null,
};

export const cabinetReducer = createReducer(
  initialState,
  // get
  on(CabinetActions.getCabinetsSuccess, (state, { cabinets }) => ({
    ...state,
    cabinets,
  })),
  on(CabinetActions.getCabinetsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(CabinetActions.createCabinetSuccess, (state, { cabinet }) => ({
    ...state,
    cabinets: [...state.cabinets, cabinet],
  })),
  on(CabinetActions.createCabinetFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(CabinetActions.updateCabinetSuccess, (state, { cabinet }) => ({
    ...state,
    cabinets: state.cabinets.map((item) => {
      if (item.id === cabinet.id) {
        // В будущём нужно будет добавить дополнительную логику
        return { ...item, ...cabinet };
      }
      return item;
    }),
  })),
  on(CabinetActions.updateCabinetFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update Shelf
  on(CabinetActions.updateShelf, (state, { cabinetId, shelf }) => ({
    ...state,
    cabinets: state.cabinets.map((item) => {
      if (item.id === cabinetId) {
        return { ...item, components: { ...item.components, shelfs: shelf } };
      }
      return item;
    }),
  })),
  // update Drawer
  on(CabinetActions.updateDrawer, (state, { cabinetId, drawer }) => ({
    ...state,
    cabinets: state.cabinets.map((item) => {
      if (item.id === cabinetId) {
        return { ...item, components: { ...item.components, drawers: drawer } };
      }
      return item;
    }),
  })),
  // update Door
  on(CabinetActions.updateDoor, (state, { cabinetId, door }) => ({
    ...state,
    cabinets: state.cabinets.map((item) => {
      if (item.id === cabinetId) {
        return { ...item, components: { ...item.components, doors: door } };
      }
      return item;
    }),
  })),
  // update Mullion
  on(CabinetActions.updateMullion, (state, { cabinetId, mullion }) => ({
    ...state,
    cabinets: state.cabinets.map((item) => {
      if (item.id === cabinetId) {
        return { ...item, components: { ...item.components, mullion } };
      }
      return item;
    }),
  })),
  // delete
  on(CabinetActions.deleteCabinetSuccess, (state, { id }) => ({
    ...state,
    cabinets: state.cabinets.filter((p) => p.id !== id),
  })),
  on(CabinetActions.deleteCabinetFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
