import { createAction, props } from '@ngrx/store';
import { ICategory } from '../types/category.model';

export const getCategories = createAction('[Category] Get Categories');
export const getCategoriesSuccess = createAction(
  '[Category] Get Categories Success',
  props<{ categories: ICategory[] }>(),
);
export const getCategoriesFailure = createAction(
  '[Category] Get Categories Failure',
  props<{ error: any }>(),
);

export const createCategory = createAction(
  '[Category] Create Category',
  props<{ category: ICategory }>(),
);
export const createCategorySuccess = createAction(
  '[Category] Create Category Success',
  props<{ category: ICategory }>(),
);
export const createCategoryFailure = createAction(
  '[Category] Create Category Failure',
  props<{ error: any }>(),
);

export const updateCategory = createAction(
  '[Category] Update Category',
  props<{ category: ICategory }>(),
);
export const updateCategorySuccess = createAction(
  '[Category] Update Category Success',
  props<{ category: ICategory }>(),
);
export const updateCategoryFailure = createAction(
  '[Category] Update Category Failure',
  props<{ error: any }>(),
);

export const deleteCategory = createAction('[Category] Delete Category', props<{ id: number }>());
export const deleteCategorySuccess = createAction(
  '[Category] Delete Category Success',
  props<{ id: number }>(),
);
export const deleteCategoryFailure = createAction(
  '[Category] Delete Category Failure',
  props<{ error: any }>(),
);

export const updateCategoryGrid = createAction(
  '[Category] Update Category Grid',
  props<{ category: ICategory }>(),
);
