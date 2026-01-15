import { createAction, props } from '@ngrx/store';
import { IUser, IUserForm } from '../types/user';

export const getUsers = createAction('[Users] Get Users');
export const getUsersSuccess = createAction(
  '[Users] Get Users Success',
  props<{ users: IUser[] }>(),
);
export const getUsersFailure = createAction('[Users] Get Users Failure', props<{ error: any }>());

export const createUser = createAction('[Users] Create User', props<{ user: IUserForm }>());
export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: IUser }>(),
);
export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: any }>(),
);

export const updateUser = createAction('[Users] Update User', props<{ user: IUserForm }>());
export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: IUser }>(),
);
export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: any }>(),
);

export const deleteUser = createAction('[Users] Delete User', props<{ id: number }>());
export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ id: number }>(),
);
export const deleteUserFailure = createAction(
  '[Users] Delete User Failure',
  props<{ error: any }>(),
);
