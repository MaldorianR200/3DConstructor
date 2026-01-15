import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IMaterial, MaterialSelectors } from 'src/entities/Material';
import { StackComponent } from 'src/shared/ui/app';
import { MaterialFormComponent } from '../material-form/material-form.component';
import { MaterialsEditListComponent } from '../material-edit-list/material-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-material-panel',
  standalone: true,
  imports: [
    MaterialFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    MaterialsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './material-panel.component.html',
  styleUrl: './material-panel.component.scss',
})
export class MaterialPanelComponent implements OnInit {
  isEdit: boolean = false;
  materials$: Observable<IMaterial[]>;
  curEditMaterial$ = new BehaviorSubject<IMaterial | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.materials$ = this.store.select(MaterialSelectors.selectAllMaterials);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const materialId = parseInt(queryParams['id'], 0);
      if (this.isEdit && materialId) {
        this.store
          .select(MaterialSelectors.selectMaterialById(materialId))
          .subscribe((material) => {
            if (material) {
              this.curEditMaterial$.next(material);
            }
          });
      } else {
        this.curEditMaterial$.next(null);
      }
    });

    this.curEditMaterial$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
