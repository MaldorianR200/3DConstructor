import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LogState } from './log.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selecLogState = createFeatureSelector<LogState>(Slices.LOG);

export const selectAllLogs = createSelector(selecLogState, (state: LogState) => state.logs);
