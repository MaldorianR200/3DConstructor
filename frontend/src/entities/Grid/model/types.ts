import { Routes } from 'src/shared/config/routes';

export enum Side {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
}

export enum Pages {
  CATALOG = Routes.CATALOG,
  PHOTOGALLERY = Routes.PHOTOGALLERY,
  REVIEWS = Routes.REVIEWS,
  NEWS = Routes.NEWS,
  DISCOUNTS = Routes.DISCOUNTS,
}

export enum EntityTypes {
  CATEGORY = 'CATEGORY',
  Product = 'Product',
  PHOTOGALLERY = 'PHOTOGALLERY',
  REVIEW = 'REVIEW',
  NEWS = 'NEWS',
  DISCOUNT = 'DISCOUNT',
}

export interface IIntersectionData {
  side: Side;
  position: number;
}

export interface IIntersection {
  zIndex: number;
  data: IIntersectionData[];
}

export interface IGridData {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  intersection: IIntersection;
}

export interface IGridEntity {
  entityType: EntityTypes;
  gridItems: {
    entityId: number;
    desktop: IGridData;
    tablet: IGridData;
    mobile: IGridData;
  }[];
}

export interface IGrid {
  id?: number;
  page: Routes[];
  entities: IGridEntity[];
}

export interface IIGrid {
  id?: number;
  grid: IGrid;
}
