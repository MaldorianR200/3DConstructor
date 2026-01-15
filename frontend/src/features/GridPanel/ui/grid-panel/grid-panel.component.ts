import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGrid, GridSelectors } from 'src/entities/Grid';
import { StackComponent } from 'src/shared/ui/app';
import { GridFormComponent } from '../grid-form/grid-form.component';
import { GridsEditListComponent } from '../grid-edit-list/grid-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-grid-panel',
  standalone: true,
  imports: [
    GridFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    GridsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './grid-panel.component.html',
  styleUrl: './grid-panel.component.scss',
})
export class GridPanelComponent implements OnInit {
  isEdit: boolean = false;
  grids$: Observable<IGrid[]>;
  curEditGrid$ = new BehaviorSubject<IGrid | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.grids$ = this.store.select(GridSelectors.selectAllGrids);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const gridId = parseInt(queryParams['id'], 0);
      if (this.isEdit && gridId) {
        this.store.select(GridSelectors.selectGridById(gridId)).subscribe((grid) => {
          if (grid) {
            this.curEditGrid$.next(grid);
          }
        });
      } else {
        this.curEditGrid$.next(null);
      }
    });

    this.curEditGrid$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
