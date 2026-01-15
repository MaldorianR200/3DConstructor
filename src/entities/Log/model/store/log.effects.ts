import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as LogActions from './log.actions';
import { of } from 'rxjs';
import { LogService } from '../api/log.service';

@Injectable()
export class LogEffects {
  constructor(
    private actions$: Actions,
    private logService: LogService,
  ) {}

  getLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogActions.getLogs),
      mergeMap(() => {
        return this.logService.getAll().pipe(
          map((logs) => LogActions.getLogsSuccess({ logs })),
          catchError((error) => of(LogActions.getLogsFailure({ error }))),
        );
      }),
    ),
  );
}
