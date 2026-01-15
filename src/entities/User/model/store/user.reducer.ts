// user.reducer.ts

import { createReducer, on, Action } from '@ngrx/store';
import { IUser } from '../types/user';
import * as UserActions from './user.actions';

export interface UserState {
  users: IUser[];
  error: any;
}

const initialState: UserState = {
  users: [],
  error: null,
};

export const userReducer = createReducer(
  initialState,

  // get
  on(UserActions.getUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
  })),
  on(UserActions.getUsersFailure, (state, { error }) => ({
    ...state,
    users: [],
    error: error,
  })),

  // create
  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),
  on(UserActions.createUserFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),

  // update
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map((u) => (u.id === user.id ? user : u)),
  })),
  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),

  // delete
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map((u) => (u.id === user.id ? user : u)),
  })),
  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),
);
