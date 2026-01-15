import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MetaTagsProviderComponent } from '../../MetaTagsProvider/meta-tags-provider.component';
import { HeaderComponent } from 'src/widgets/header';
import { FooterComponent } from 'src/widgets/footer';
import { AdminToAdminComponent } from 'src/shared/ui/admin';
import { AuthService } from 'src/features/Auth';
import { AppState } from '../../StoreProvider/app.store';
import { Store } from '@ngrx/store';
import { getGrids } from 'src/entities/Grid/model/store/grid.actions';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-app-pages',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    HeaderComponent,
    FooterComponent,
    MetaTagsProviderComponent,
    AdminToAdminComponent,
  ],
  templateUrl: './app-pages.component.html',
  styleUrl: './app-pages.component.scss',
})
export class AppPagesComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private router: Router,
    public authService: AuthService,
  ) {
    this.store.dispatch(getGrids());
  }
  isAuth: boolean = false;

  ngOnInit(): void {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });

    this.authService.isAuth().subscribe((e) => {
      this.isAuth = e;
    });
  }
}
