import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ICombineMaterial, CombineMaterialSelectors } from 'src/entities/CombineMaterial';
import { StackComponent } from "src/shared/ui/app";
import { CombineMaterialFormComponent } from "../combineMaterial-form/combineMaterial-form.component";
import { CombineMaterialsEditListComponent } from "../combineMaterial-edit-list/combineMaterial-edit-list.component";
import { AdminChangeActionComponent } from "src/shared/ui/admin/admin-change-action/admin-change-action.component";

@Component({
  selector: 'app-combineMaterial-panel',
  standalone: true,
  imports: [CombineMaterialFormComponent, CommonModule, ReactiveFormsModule, StackComponent, CombineMaterialsEditListComponent, AdminChangeActionComponent],
  templateUrl: './combineMaterial-panel.component.html',
  styleUrl: './combineMaterial-panel.component.scss'
})

export class CombineMaterialPanelComponent implements OnInit {
  isEdit: boolean = false;
  combineMaterials$: Observable<ICombineMaterial[]>
  curEditCombineMaterial$ = new BehaviorSubject<ICombineMaterial | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<AppState>) {
    this.combineMaterials$ = this.store.select(CombineMaterialSelectors.selectAllCombineMaterials);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const combineMaterialId = parseInt(queryParams['id'], 0)
      if (this.isEdit && combineMaterialId) {
        this.store.select(CombineMaterialSelectors.selectCombineMaterialById(combineMaterialId)).subscribe(combineMaterial => {
          if (combineMaterial) {
            this.curEditCombineMaterial$.next(combineMaterial);
          }
        });
      } else {
        this.curEditCombineMaterial$.next(null);
      }
    });

    this.curEditCombineMaterial$.subscribe(item => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    })
  }
}

