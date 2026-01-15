import { createReducer, on } from '@ngrx/store';
import { IGrid, IIGrid, IGridSettings, IGridItem } from '../types/grid.model';
import * as GridActions from './grid.actions';

export interface GridState {
  grids: IGrid[];
  settings: IGridSettings | null;
  error: any;
}

export const initialState: GridState = {
  grids: [],
  settings: null,
  error: null,
};

export const gridReducer = createReducer(
  initialState,
  // get
  on(GridActions.getGridsSuccess, (state, { grids }) => ({
    ...state,
    grids,
  })),
  on(GridActions.getGridsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(GridActions.createGridSuccess, (state, { grid }) => ({
    ...state,
    // grids: [...state.grids, grid],
    grids: [...state.grids, grid],
  })),
  on(GridActions.createGridFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(GridActions.updateGridItem, (state, { id, item }) => ({
    ...state,
    grids: state.grids.map((grid) => (grid.id === id ? updateGridItems(grid, item) : grid)),
  })),
  // on(GridActions.updateGridSuccess, (state, { grid }) => ({
  //   ...state,
  //   grids: state.grids.map((item) => {
  //     if (item.id === grid.id) return grid;
  //     return item;
  //   }),
  // })),
  on(GridActions.updateGridFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(GridActions.deleteGridSuccess, (state, { id }) => ({
    ...state,
    grids: state.grids.filter((p) => p.id !== id),
  })),
  on(GridActions.deleteGridFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create GridItem
  on(GridActions.createGridItem, (state, { id, item }) => ({
    ...state,
    grids: state.grids.map((grid) => {
      if (grid.id === id) {
        if (!grid.items) {
          return {
            ...grid,
            items: [item],
          };
        }

        return {
          ...grid,
          items: [...grid.items, item],
        };
      }
      return grid;
    }),
  })),
  // update GridItem
  on(GridActions.updateGridItem, (state, { id, item }) => ({
    ...state,
    grids: state.grids.map((grid) => {
      if (grid.id === id) {
        return {
          ...grid,
          items: grid.items.map((gridItem) => {
            // if (item.entityId == gridItem.entityId) return gridItem;
            if (gridItem.entityId == item.entityId) return item;
            else return gridItem;
          }),
        };
      }
      return grid;
    }),
  })),
  // delete GridItem
  on(GridActions.deleteGridItem, (state, { id, item }) => ({
    ...state,
    grids: state.grids.map((grid) => {
      console.log(grid.id, id, '<- delete');
      if (grid.id === id) {
        console.log('Delete GridItem:');
        console.log(grid.items.filter((gridItem) => gridItem.entityId != item.entityId));
        return {
          ...grid,
          // gridItems: grid.gridItems.filter((item) => item.entityId != gridItem.entityId),

          items: grid.items.filter((gridItem) => gridItem.entityId != item.entityId),
        };
      }
      return grid;
    }),
  })),
  // get settings
  on(GridActions.getGridSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings: settings,
  })),
  on(GridActions.getGridSettingsFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),
  // set settings
  on(GridActions.setGridSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings: settings,
  })),
  on(GridActions.setGridSettingsFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),
);
function updateGridItems(grid: IGrid, item: IGridItem): IGrid {
  // Находим индекс элемента, который нужно обновить
  const index = grid.items.findIndex((gridItem) => gridItem.entityId === item.entityId);

  // Если элемент найден, обновляем его
  if (index !== -1) {
    const updatedItems = [...grid.items];
    updatedItems[index] = item;
    console.log(updatedItems[index]);
    return { ...grid, items: updatedItems };
  }

  // Если элемент не найден, возвращаем оригинальную сетку
  return grid;
}
