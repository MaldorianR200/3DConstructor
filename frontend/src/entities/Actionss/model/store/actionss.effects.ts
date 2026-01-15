import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ActionssService } from '../api/actionss.service';
import * as ActionssActions from './actionss.actions';
import { selectAllActionsss } from './actionss.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class ActionssEffects {
  constructor(
    private actions$: Actions,
    private actionssService: ActionssService,
    private store: Store<AppState>,
  ) {}

  getActionsss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionssActions.getActionsss),
      withLatestFrom(this.store.select(selectAllActionsss)),
      mergeMap(([action, actionsss]) => {
        if (actionsss.length > 0) {
          return of(ActionssActions.getActionsssSuccess({ actionsss }));
        } else {
          return this.actionssService
            .getAll()
            .pipe(
              map((response) =>
                ActionssActions.getActionsssSuccess({ actionsss: response.content }),
              ),
            );
        }
      }),
    ),
  );

  createActionss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionssActions.createActionss),
      mergeMap((action) =>
        this.actionssService.create(action.actionss).pipe(
          map((actionss) => ActionssActions.createActionssSuccess({ actionss })),
          catchError((error) => of(ActionssActions.createActionssFailure({ error }))),
        ),
      ),
    ),
  );

  updateActionss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionssActions.updateActionss),
      mergeMap((action) =>
        this.actionssService.update(action.actionss).pipe(
          map((actionss) => ActionssActions.updateActionssSuccess({ actionss })),
          catchError((error) => of(ActionssActions.updateActionssFailure({ error }))),
        ),
      ),
    ),
  );

  deleteActionss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionssActions.deleteActionss),
      mergeMap((action) =>
        this.actionssService.deleteById(action.id).pipe(
          map(() => ActionssActions.deleteActionssSuccess({ id: action.id })),
          catchError((error) => of(ActionssActions.deleteActionssFailure({ error }))),
        ),
      ),
    ),
  );
}
