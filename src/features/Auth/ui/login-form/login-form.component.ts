import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { StackComponent } from 'src/shared/ui/app';
import { AdminFormComponent, AdminButtonComponent, AdminInputComponent } from 'src/shared/ui/admin';
import * as AuthActions from '../../model/store/auth.actions';
import { ILogin } from '../../model/types/auth';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    AdminFormComponent,
    StackComponent,
    AdminInputComponent,
    AdminButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
  ) {
    this.loginForm = this.fb.group({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  login() {
    const user: ILogin = this.loginForm.value;
    this.store.dispatch(AuthActions.login({ user }));
  }
}
