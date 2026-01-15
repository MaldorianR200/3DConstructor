import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IFurniture, FurnitureSelectors } from 'src/entities/Furniture';
import { StackComponent } from 'src/shared/ui/app';
import { FurnitureFormComponent } from '../furniture-form/furniture-form.component';
import { FurnituresEditListComponent } from '../furniture-edit-list/furniture-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-furniture-panel',
  standalone: true,
  imports: [
    FurnitureFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    FurnituresEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './furniture-panel.component.html',
  styleUrl: './furniture-panel.component.scss',
})
export class FurniturePanelComponent implements OnInit {
  isEdit: boolean = false;
  furnitures$: Observable<IFurniture[]>;
  curEditFurniture$ = new BehaviorSubject<IFurniture | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.furnitures$ = this.store.select(FurnitureSelectors.selectAllFurnitures);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const furnitureId = parseInt(queryParams['id'], 0);
      if (this.isEdit && furnitureId) {
        this.store
          .select(FurnitureSelectors.selectFurnitureById(furnitureId))
          .subscribe((furniture) => {
            if (furniture) {
              this.curEditFurniture$.next(furniture);
            }
          });
      } else {
        this.curEditFurniture$.next(null);
      }
    });

    this.curEditFurniture$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
