import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SpecificationService } from '../api/specification.service';
import * as SpecificationActions from './specification.actions';
import { selectAllSpecifications } from './specification.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class SpecificationEffects {
  constructor(
    private actions$: Actions,
    private specificationService: SpecificationService,
    private store: Store<AppState>,
  ) {}

  getSpecifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpecificationActions.getSpecifications),
      mergeMap(() =>
        this.specificationService.getAll().pipe(
          map((response) =>
            SpecificationActions.getSpecificationsSuccess({ specifications: response.content }),
          ),
          catchError((error) => of(SpecificationActions.getSpecificationsFailure({ error }))),
        ),
      ),
    ),
  );

  createSpecification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpecificationActions.createSpecification),
      mergeMap((action) =>
        this.specificationService.create(action.specification).pipe(
          map((specification) =>
            SpecificationActions.createSpecificationSuccess({ specification }),
          ),
          catchError((error) => of(SpecificationActions.createSpecificationFailure({ error }))),
        ),
      ),
    ),
  );

  updateSpecification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpecificationActions.updateSpecification),
      mergeMap((action) =>
        this.specificationService.update(action.specification).pipe(
          map((specification) =>
            SpecificationActions.updateSpecificationSuccess({ specification }),
          ),
          catchError((error) => of(SpecificationActions.updateSpecificationFailure({ error }))),
        ),
      ),
    ),
  );

  deleteSpecification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpecificationActions.deleteSpecification),
      mergeMap((action) =>
        this.specificationService.deleteById(action.id).pipe(
          map(() => SpecificationActions.deleteSpecificationSuccess({ id: action.id })),
          catchError((error) => of(SpecificationActions.deleteSpecificationFailure({ error }))),
        ),
      ),
    ),
  );
}
