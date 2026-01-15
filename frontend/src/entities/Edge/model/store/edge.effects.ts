import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EdgeService } from '../api/edge.service';
import * as EdgeActions from './edge.actions';
import { selectAllEdges } from './edge.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';

@Injectable()
export class EdgeEffects {
  constructor(
    private actions$: Actions,
    private edgeService: EdgeService,
    private store: Store<AppState>
  ) { }

  getEdges$ = createEffect(() => this.actions$.pipe(
    ofType(EdgeActions.getEdges),
    withLatestFrom(this.store.select(selectAllEdges)),
    mergeMap(([action, edges]) => {
      if (edges.length > 0) {
        return of(EdgeActions.getEdgesSuccess({ edges }));
      } else {
        return this.edgeService
          .getAll()
          .pipe(
            map((response) => EdgeActions.getEdgesSuccess({ edges: response.content}),
          ),
        );
      }
    })
  ));

  createEdge$ = createEffect(() => this.actions$.pipe(
    ofType(EdgeActions.createEdge),
    mergeMap(action => this.edgeService.create(action.edge).pipe(
      map(edge => EdgeActions.createEdgeSuccess({ edge })),
      catchError(error => of(EdgeActions.createEdgeFailure({ error })))
    ))
  ));

  updateEdge$ = createEffect(() => this.actions$.pipe(
    ofType(EdgeActions.updateEdge),
    mergeMap(action => this.edgeService.update(action.edge).pipe(
      map(edge => EdgeActions.updateEdgeSuccess({ edge })),
      catchError(error => of(EdgeActions.updateEdgeFailure({ error })))
    ))
  ));

  deleteEdge$ = createEffect(() => this.actions$.pipe(
    ofType(EdgeActions.deleteEdge),
    mergeMap(action => this.edgeService.deleteById(action.id).pipe(
      map(() => EdgeActions.deleteEdgeSuccess({ id: action.id })),
      catchError(error => of(EdgeActions.deleteEdgeFailure({ error })))
    ))
  ));
}
