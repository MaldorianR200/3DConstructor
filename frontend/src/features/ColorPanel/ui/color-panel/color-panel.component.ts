import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IColor, ColorSelectors } from 'src/entities/Color';
import { StackComponent } from 'src/shared/ui/app';
import { ColorFormComponent } from '../color-form/color-form.component';
import { ColorsEditListComponent } from '../color-edit-list/color-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-color-panel',
  standalone: true,
  imports: [
    ColorFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    ColorsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './color-panel.component.html',
  styleUrl: './color-panel.component.scss',
})
export class ColorPanelComponent implements OnInit {
  isEdit: boolean = false;
  colors$: Observable<IColor[]>;
  curEditColor$ = new BehaviorSubject<IColor | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.colors$ = this.store.select(ColorSelectors.selectAllColors);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const colorId = parseInt(queryParams['id'], 0);
      if (this.isEdit && colorId) {
        this.store.select(ColorSelectors.selectColorById(colorId)).subscribe((color) => {
          if (color) {
            this.curEditColor$.next(color);
          }
        });
      } else {
        this.curEditColor$.next(null);
      }
    });

    this.curEditColor$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
