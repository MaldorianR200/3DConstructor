import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IUser } from 'src/entities/User';
import { StackComponent } from 'src/shared/ui/app';
import { AdminInputComponent, AdminButtonComponent, AdminFormComponent } from 'src/shared/ui/admin';
import * as AuthActions from '../../model/store/auth.actions';
import * as AuthSelectors from '../../model/store/auth.selectors';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [AdminFormComponent, AdminButtonComponent, StackComponent, AdminInputComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  curUser$: Observable<IUser | null>;
  user: IUser | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
  ) {
    this.profileForm = this.fb.group({
      password: new FormControl(),
    });
    this.curUser$ = this.store.select(AuthSelectors.selectCurrentUser);
  }

  updateProfile() {
    const newData: { password: string } = this.profileForm.value;
    this.store.dispatch(AuthActions.updateProfile({ newData }));
  }

  deleteProfile() {
    this.store.dispatch(AuthActions.deleteProfile());
  }

  ngOnInit(): void {
    this.curUser$.subscribe((item) => {
      this.user = item;
    });
  }
}
