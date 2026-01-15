import { createReducer, on } from '@ngrx/store';
import { IProduct } from '../types/product.model';
import * as ProductActions from './product.actions';

export interface ProductState {
  products: IProduct[];
  error: any;
}

export const initialState: ProductState = {
  products: [],
  error: null,
};

export const productReducer = createReducer(
  initialState,
  // get
  on(ProductActions.getProductsSuccess, (state, { products }) => ({
    ...state,
    products,
  })),
  on(ProductActions.getProductsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
  })),
  on(ProductActions.createProductFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map((item) => {
      if (item.id === product.id) {
        // const sortedImages = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
        // return { ...product, images: sortedImages };
      }
      return item;
    }),
  })),
  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter((p) => p.id !== id),
  })),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
