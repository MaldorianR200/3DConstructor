import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectAuthState = createFeatureSelector<AuthState>(Slices.AUTH);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser,
);

export const selectCurrentUserPermissions = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser?.permissions,
);

export const selectCurrentUserRole = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser?.role,
);

export const selectError = createSelector(selectAuthState, (state: AuthState) => state.error);

export const selectIsAdmin = createSelector(selectAuthState, (state: AuthState) => state.isAdmin);
