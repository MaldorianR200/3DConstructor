import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TypesService } from '../api/types.service';
import * as TypesActions from './types.actions';
import { selectAllTypess } from './types.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class TypesEffects {
  constructor(
    private actions$: Actions,
    private typesService: TypesService,
    private store: Store<AppState>,
  ) {}

  getTypess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypesActions.getTypess),
      withLatestFrom(this.store.select(selectAllTypess)),
      mergeMap(([action, typess]) => {
        if (typess.length > 0) {
          return of(TypesActions.getTypessSuccess({ typess }));
        } else {
          return this.typesService
            .getAll()
            .pipe(map((response) => TypesActions.getTypessSuccess({ typess: response.content })));
        }
      }),
    ),
  );

  createTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypesActions.createTypes),
      mergeMap((action) =>
        this.typesService.create(action.types).pipe(
          map((types) => TypesActions.createTypesSuccess({ types })),
          catchError((error) => of(TypesActions.createTypesFailure({ error }))),
        ),
      ),
    ),
  );

  updateTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypesActions.updateTypes),
      mergeMap((action) =>
        this.typesService.update(action.types).pipe(
          map((types) => TypesActions.updateTypesSuccess({ types })),
          catchError((error) => of(TypesActions.updateTypesFailure({ error }))),
        ),
      ),
    ),
  );

  deleteTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypesActions.deleteTypes),
      mergeMap((action) =>
        this.typesService.deleteById(action.id).pipe(
          map(() => TypesActions.deleteTypesSuccess({ id: action.id })),
          catchError((error) => of(TypesActions.deleteTypesFailure({ error }))),
        ),
      ),
    ),
  );
}
