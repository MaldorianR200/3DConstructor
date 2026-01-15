import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from 'src/features/Auth/model/api/auth.service';
import { Routes } from 'src/shared/config/routes';

@Injectable({
  providedIn: 'root',
})
export class SeoGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isSeo().pipe(
      map((isSeo: boolean | undefined) => {
        if (isSeo || isSeo === undefined) {
          return true;
        } else {
          return this.router.createUrlTree([Routes.ADMIN, Routes.ADMIN_MAIN]);
        }
      }),
    );
  }
}
