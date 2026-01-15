import { Component } from '@angular/core';
import { AdminWidgetTemplateComponent } from '../../../shared/ui/admin/admin-widget-template/admin-widget-template.component';
import { Store } from '@ngrx/store';
import { Routes } from 'src/shared/config/routes';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { GridSelectors } from 'src/entities/Grid';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-super-page',
  standalone: true,
  imports: [AdminWidgetTemplateComponent, CommonModule, RouterOutlet],
  templateUrl: './admin-super-page.component.html',
  styleUrl: './admin-super-page.component.scss',
})
export class AdminSuperPageComponent {
  routes = Routes;
  gridsCount$: Observable<number>;

  constructor(private store: Store<AppState>) {
    this.gridsCount$ = this.store.select(GridSelectors.selectGridsCount);
  }
}
