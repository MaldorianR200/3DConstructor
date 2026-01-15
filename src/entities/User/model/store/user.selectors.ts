import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectUserState = createFeatureSelector<UserState>(Slices.USER);

export const selectAllUsers = createSelector(selectUserState, (state: UserState) => state.users);
export const selectUserById = (userId: number) =>
  createSelector(selectUserState, (state: UserState) =>
    state.users.find((user) => user.id === userId),
  );

export const selectUsersError = createSelector(selectUserState, (state: UserState) => state.error);
