import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { AuthService, AuthActions } from 'src/features/Auth';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent implements OnInit {
  routes = Routes;
  isSeo: boolean = false;
  isSuperAdmin: boolean = false;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
  ) {}

  handleLogout() {
    this.store.dispatch(AuthActions.logout());
  }

  ngOnInit(): void {
    this.authService.isSeo().subscribe((isSeo) => {
      this.isSeo = isSeo;
    });
    this.authService.isSuperAdmin().subscribe((isSuperAdmin) => {
      this.isSuperAdmin = isSuperAdmin;
    });
  }
}
