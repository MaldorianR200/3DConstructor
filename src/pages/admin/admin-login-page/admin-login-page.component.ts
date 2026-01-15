import { Component } from '@angular/core';
import { LoginFormComponent } from 'src/features/Auth';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
})
export class AdminLoginPageComponent {}
