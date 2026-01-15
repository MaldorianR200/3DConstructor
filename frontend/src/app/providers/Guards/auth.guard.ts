import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from 'src/features/Auth/model/api/auth.service';
import { Routes } from 'src/shared/config/routes';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuth()) {
      return true;
    } else {
      return this.router.createUrlTree([Routes.LOGIN_FOR_ADMIN]);
    }
  }
}
