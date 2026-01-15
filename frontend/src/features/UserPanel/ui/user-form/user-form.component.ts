import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { AuthSelectors } from 'src/features/Auth';
import { IUser, IUserForm, UserRoles, UserActions } from 'src/entities/User';
import {
  AdminInputComponent,
  AdminButtonComponent,
  AdminSelectComponent,
  AdminModalComponent,
  AdminFormComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    AdminFormComponent,
    StackComponent,
    AdminInputComponent,
    AdminButtonComponent,
    AdminSelectComponent,
    AdminModalComponent,
    NgIf,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  @Input() user$: BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(null);
  userForm: FormGroup;
  curRole$: Observable<UserRoles | undefined>;
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  isOpenBan: boolean = false;
  roles: string[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.userForm = this.fb.group({
      email: new FormControl(),
      password: new FormControl(),
      role: new FormControl(),
    });
    this.curRole$ = this.store.select(AuthSelectors.selectCurrentUserRole);
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  banChangeOpen() {
    this.isOpenBan = !this.isOpenBan;
  }

  setRoles(role: UserRoles) {
    const rolesAsString = Object.keys(UserRoles);
    const roleIndex = rolesAsString.findIndex((r) => r === role);
    this.roles = rolesAsString.slice(roleIndex + 1, rolesAsString.length);
  }

  submit() {
    if (this.isCreate) {
      this.create();
    } else {
      this.update();
    }
  }
  update() {
    const user: IUserForm = {
      ...this.userForm.value,
      id: this.user$.value?.id,
      email: this.user$.value?.email,
    };
    this.store.dispatch(UserActions.updateUser({ user }));
  }

  create() {
    const user: IUserForm = this.userForm.value;
    this.store.dispatch(UserActions.createUser({ user }));
  }

  delete() {
    const user = this.user$.value;
    if (user) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.curRole$.subscribe((role) => {
      if (role) this.setRoles(role);
    });

    this.user$.subscribe((user) => {
      this.isCreate = !user;
      if (user) {
        this.userForm.get('role')?.setValue(user.role);
      } else {
        this.userForm.reset();
      }
    });

    this.actions$.pipe(ofType(UserActions.createUserSuccess)).subscribe(() => {
      this.userForm.reset();
    });
    this.actions$.pipe(ofType(UserActions.updateUserSuccess)).subscribe(() => {
      this.userForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(UserActions.deleteUserSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
