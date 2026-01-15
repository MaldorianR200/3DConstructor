import { Inject, Injectable, OnInit, PLATFORM_ID } from '@angular/core';
import { ILogin, ILoginResponse } from '../types/auth';
import { BaseService } from 'src/shared/api/base.service';
import { BehaviorSubject, Observable, defaultIfEmpty, filter, firstValueFrom, map } from 'rxjs';
import { UserPermission } from 'src/entities/User/model/consts/userPermission';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { selectCurrentUser, selectCurrentUserPermissions } from '../store/auth.selectors';
import { IUser } from 'src/entities/User/model/types/user';
import { loadLoginFromLocalStorage } from '../store/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  private currentUserPermissionsSubject = new BehaviorSubject<UserPermission[] | undefined>(
    undefined,
  );

  currentUser$: Observable<IUser | null> = this.currentUserSubject.asObservable();
  currentUserpermissions$: Observable<UserPermission[] | undefined> =
    this.currentUserPermissionsSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private store: Store<AppState>,
  ) {
    super(httpClient);

    this.store.select(selectCurrentUser).subscribe((user) => {
      this.currentUserSubject.next(user);
    });

    this.store.select(selectCurrentUserPermissions).subscribe((permissions) => {
      this.currentUserPermissionsSubject.next(permissions);
    });

    this.store.dispatch(loadLoginFromLocalStorage());
  }

  login(user: ILogin): Observable<ILoginResponse> {
    const formData = this.convertToFormData(user);
    return this.http.post<ILoginResponse>(`${this.apiUrl}/login`, formData);
  }

  updateProfile(newData: { password: string }): Observable<IUser> {
    const formData = this.convertToFormData(newData);
    return this.http.patch<IUser>(`${this.apiUrl}/user/self`, formData);
  }

  deleteProfile(): Observable<null> {
    return this.http.delete<null>(`${this.apiUrl}/user/self`);
  }

  isAuth(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user !== null));
  }

  isSuperAdmin(): Observable<boolean> {
    return this.currentUserpermissions$.pipe(
      map((permissions: UserPermission[] | undefined) => {
        if (permissions === undefined) return true;
        return permissions.includes(UserPermission.SUPER_ADMIN_PERMISSION);
      }),
    );
  }

  isAdmin(): Observable<boolean> {
    return this.currentUserpermissions$.pipe(
      map((permissions: UserPermission[] | undefined) => {
        if (permissions === undefined) return true;
        return permissions.includes(UserPermission.ADMIN_PERMISSION);
      }),
    );
  }

  isSeo(): Observable<boolean> {
    return this.currentUserpermissions$.pipe(
      map((permissions: UserPermission[] | undefined) => {
        if (permissions === undefined) return true;
        return permissions.includes(UserPermission.ADMIN_PERMISSION);
      }),
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    this.currentUserPermissionsSubject.next(undefined);
  }
}
