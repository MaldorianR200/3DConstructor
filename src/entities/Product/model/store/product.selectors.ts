import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectProductState = createFeatureSelector<ProductState>(Slices.PRODUCT);

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products,
);

export const selectProductById = (productId: number) =>
  createSelector(selectProductState, (state: ProductState) =>
    state.products.find((product) => product.id === productId),
  );

export const selectProductsCount = createSelector(
  selectProductState,
  (state: ProductState) => state.products.length,
);

export const selectProductError = createSelector(
  selectProductState,
  (state: ProductState) => state.error,
);
