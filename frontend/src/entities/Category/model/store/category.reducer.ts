import { createReducer, on } from '@ngrx/store';
import { ICategory } from '../types/category.model';
import * as CategoryActions from './category.actions';

export interface CategoryState {
  categories: ICategory[];
  error: any;
}

export const initialState: CategoryState = {
  categories: [],
  error: null,
};

export const categoryReducer = createReducer(
  initialState,
  // get
  on(CategoryActions.getCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
  })),
  on(CategoryActions.getCategoriesFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(CategoryActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
  })),
  on(CategoryActions.createCategoryFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(CategoryActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map((item) => {
      if (item.id === category.id) {
        const sortedImages = [...category.images].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...category, images: sortedImages };
      }
      return item;
    }),
  })),

  on(CategoryActions.updateCategoryGrid, (state, { category }) => ({
    ...state,
    categories: state.categories.map((item) => {
      if (item.id === category.id) {
        return category;
      }
      return item;
    }),
  })),

  on(CategoryActions.updateCategoryFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(CategoryActions.deleteCategorySuccess, (state, { id }) => ({
    ...state,
    categories: state.categories.filter((p) => p.id !== id),
  })),
  on(CategoryActions.deleteCategoryFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
