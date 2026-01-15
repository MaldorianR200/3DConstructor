import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { IUser } from 'src/entities/User/model/types/user';

export interface AuthState {
  currentUser: IUser | null;
  error: any;
  sessionTime: number | null;
  isAdmin: boolean;
}

export const initialState: AuthState = {
  currentUser: null,
  error: null,
  sessionTime: null,
  isAdmin: false,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.loginSuccess, (state, { user, sessionTime }) => ({
    currentUser: user,
    error: null,
    sessionTime: sessionTime,
    isAdmin: user.role === 'SUPER_ADMIN',
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    currentUser: null,
    error: error,
    sessionTime: null,
    isAdmin: false,
  })),

  on(AuthActions.updateProfileSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAdmin: user.role === 'SUPER_ADMIN',
  })),

  on(AuthActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),

  on(AuthActions.deleteProfileSuccess, () => ({
    currentUser: null,
    error: null,
    sessionTime: null,
    isAdmin: false,
  })),

  on(AuthActions.deleteProfileFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),

  on(AuthActions.logout, () => ({
    currentUser: null,
    error: null,
    sessionTime: null,
    isAdmin: false,
  })),
);
