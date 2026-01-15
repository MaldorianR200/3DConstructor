import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { Routes } from 'src/shared/config/routes';

export interface IGridSettings {
  dragging: boolean;
  resizing: boolean;
  zIndex: boolean;
  deleting: boolean;
}

export enum GridTypes {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
}

export enum GridPages {
  CATALOG = Routes.CATALOG,
  PHOTOGALLERY = Routes.PHOTOGALLERY,
  REVIEWS = Routes.REVIEWS,
  NEWS = Routes.NEWS,
  DISCOUNTS = Routes.DISCOUNTS,
}

export enum GridEntity {
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
  // PHOTOGALLERY = 'PHOTOGALLERY',
  // REVIEW = 'REVIEW',
  // NEWS = 'NEWS',
  // DISCOUNT = 'DISCOUNT'
}

export interface IGridConfig {
  selectAll: (state: AppState) => any[];
  getAction: () => any;
}

export interface IIntersectionData {
  elementId: number;
  positionX: number;
  positionY: number;
}

export interface IIntersection {
  id: number;
  gridItemId: number;
  zIndex: number;
  data: IIntersectionData[];
}

export interface IGridItemData {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  intersection: IIntersection;
}

export interface IGridItem {
  entityId: number;
  [GridTypes.DESKTOP]: IGridItemData;
  [GridTypes.TABLET]: IGridItemData;
  [GridTypes.MOBILE]: IGridItemData;
}

export interface IGrid {
  id?: number;
  page: GridPages;
  entityType: GridEntity;
  // gridItems: IGridItem[];
  items: IGridItem[];
}

export interface IIGrid {
  id?: number;
  grid: IGrid;
}
