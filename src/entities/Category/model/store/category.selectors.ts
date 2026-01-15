import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectCategoryState = createFeatureSelector<CategoryState>(Slices.CATEGORY);

export const selectAllCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories,
);

export const selectCategoryById = (categoryId: number) =>
  createSelector(selectCategoryState, (state: CategoryState) =>
    state.categories.find((category) => category.id === categoryId),
  );

export const selectCategoriesCount = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories.length,
);

export const selectCategoryError = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.error,
);
