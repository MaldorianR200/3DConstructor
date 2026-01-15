import { createAction, props } from '@ngrx/store';
import { ILog } from '../types/log.model';

export const getLogs = createAction('[Log] Get Logs');
export const getLogsSuccess = createAction('[Log] Get Logs Success', props<{ logs: ILog[] }>());
export const getLogsFailure = createAction('[Log] Get Logs Failure', props<{ error: any }>());
