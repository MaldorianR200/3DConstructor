import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../api/product.service';
import * as ProductActions from './product.actions';
import { selectAllProducts } from './product.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class ProductEffects {
  constructor(
    private actions$: Actions,
    private productService: ProductService,
    private store: Store<AppState>,
  ) {}

  getProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getProducts),
      withLatestFrom(this.store.select(selectAllProducts)),
      mergeMap(([action, products]) => {
        if (products.length > 0) {
          return of(ProductActions.getProductsSuccess({ products }));
        } else {
          return this.productService.getAll().pipe(
            map((products) => ProductActions.getProductsSuccess({ products })),
            catchError((error) => of(ProductActions.getProductsFailure({ error }))),
          );
        }
      }),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      mergeMap((action) =>
        this.productService.create(action.product).pipe(
          map((product) => ProductActions.createProductSuccess({ product })),
          catchError((error) => of(ProductActions.createProductFailure({ error }))),
        ),
      ),
    ),
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      mergeMap((action) =>
        this.productService.update(action.product).pipe(
          map((product) => ProductActions.updateProductSuccess({ product })),
          catchError((error) => of(ProductActions.updateProductFailure({ error }))),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      mergeMap((action) =>
        this.productService.deleteById(action.id).pipe(
          map(() => ProductActions.deleteProductSuccess({ id: action.id })),
          catchError((error) => of(ProductActions.deleteProductFailure({ error }))),
        ),
      ),
    ),
  );
}
