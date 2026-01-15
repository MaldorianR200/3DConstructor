import { createAction, props } from '@ngrx/store';
import { ILogin } from '../types/auth';
import { IUser } from 'src/entities/User/model/types/user';

export const loadLoginFromLocalStorage = createAction('[Auth] Load Login From Local Storage');

export const login = createAction('[Auth] Login', props<{ user: ILogin }>());
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: IUser; sessionTime: number; token: string }>(),
);
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());

export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ newData: { password: string } }>(),
);
export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: IUser }>(),
);
export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: any }>(),
);

export const deleteProfile = createAction('[Auth] Delete Profile');
export const deleteProfileSuccess = createAction('[Auth] Delete Profile Success');
export const deleteProfileFailure = createAction(
  '[Auth] Delete Profile Failure',
  props<{ error: any }>(),
);

export const logout = createAction('[Auth] Logout');
