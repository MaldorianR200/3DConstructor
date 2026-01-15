import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CategoryService } from '../api/category.service';
import * as CategoryActions from './category.actions';
import { selectAllCategories } from './category.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class CategoryEffects {
  constructor(
    private actions$: Actions,
    private categoryService: CategoryService,
    private store: Store<AppState>,
  ) {}

  getCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.getCategories),
      withLatestFrom(this.store.select(selectAllCategories)),
      mergeMap(([action, categories]) => {
        if (categories.length > 0) {
          return of(CategoryActions.getCategoriesSuccess({ categories }));
        } else {
          return this.categoryService.getAll().pipe(
            map((categories) => CategoryActions.getCategoriesSuccess({ categories })),
            catchError((error) => of(CategoryActions.getCategoriesFailure({ error }))),
          );
        }
      }),
    ),
  );

  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.createCategory),
      mergeMap((action) =>
        this.categoryService.create(action.category).pipe(
          map((category) => CategoryActions.createCategorySuccess({ category })),
          catchError((error) => of(CategoryActions.createCategoryFailure({ error }))),
        ),
      ),
    ),
  );

  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.updateCategory),
      mergeMap((action) =>
        this.categoryService.update(action.category).pipe(
          map((category) => CategoryActions.updateCategorySuccess({ category })),
          catchError((error) => of(CategoryActions.updateCategoryFailure({ error }))),
        ),
      ),
    ),
  );

  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.deleteCategory),
      mergeMap((action) =>
        this.categoryService.deleteById(action.id).pipe(
          map(() => CategoryActions.deleteCategorySuccess({ id: action.id })),
          catchError((error) => of(CategoryActions.deleteCategoryFailure({ error }))),
        ),
      ),
    ),
  );
}
