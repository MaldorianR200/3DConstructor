import { createReducer, on } from '@ngrx/store';
import * as LogActions from './log.actions';
import { ILog } from '../types/log.model';

export interface LogState {
  logs: ILog[];
  error: any;
}

export const initialState: LogState = {
  logs: [],
  error: null,
};

export const logReducer = createReducer(
  initialState,
  // get
  on(LogActions.getLogsSuccess, (state, { logs }) => ({
    ...state,
    logs,
  })),
  on(LogActions.getLogsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
