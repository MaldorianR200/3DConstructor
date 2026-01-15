import { createAction, props } from '@ngrx/store';
import { IProduct } from '../types/product.model';

export const getProducts = createAction('[Product] Get Products');
export const getProductsSuccess = createAction(
  '[Product] Get Products Success',
  props<{ products: IProduct[] }>(),
);
export const getProductsFailure = createAction(
  '[Product] Get Products Failure',
  props<{ error: any }>(),
);

export const createProduct = createAction(
  '[Product] Create Product',
  props<{ product: IProduct }>(),
);
export const createProductSuccess = createAction(
  '[Product] Create Product Success',
  props<{ product: IProduct }>(),
);
export const createProductFailure = createAction(
  '[Product] Create Product Failure',
  props<{ error: any }>(),
);

export const updateProduct = createAction(
  '[Product] Update Product',
  props<{ product: IProduct }>(),
);
export const updateProductSuccess = createAction(
  '[Product] Update Product Success',
  props<{ product: IProduct }>(),
);
export const updateProductFailure = createAction(
  '[Product] Update Product Failure',
  props<{ error: any }>(),
);

export const deleteProduct = createAction('[Product] Delete Product', props<{ id: number }>());
export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ id: number }>(),
);
export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: any }>(),
);
