import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IMilling, MillingSelectors } from 'src/entities/Milling';
import { StackComponent } from "src/shared/ui/app";
import { MillingFormComponent } from "../milling-form/milling-form.component";
import { MillingsEditListComponent } from "../milling-edit-list/milling-edit-list.component";
import { AdminChangeActionComponent } from "src/shared/ui/admin/admin-change-action/admin-change-action.component";

@Component({
  selector: 'app-milling-panel',
  standalone: true,
  imports: [MillingFormComponent, CommonModule, ReactiveFormsModule, StackComponent, MillingsEditListComponent, AdminChangeActionComponent],
  templateUrl: './milling-panel.component.html',
  styleUrl: './milling-panel.component.scss'
})
export class MillingPanelComponent implements OnInit {
  isEdit: boolean = false;
  millings$: Observable<IMilling[]>
  curEditMilling$ = new BehaviorSubject<IMilling | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<AppState>) {
    this.millings$ = this.store.select(MillingSelectors.selectAllMillings);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const millingId = parseInt(queryParams['id'], 0)
      if (this.isEdit && millingId) {
        this.store.select(MillingSelectors.selectMillingById(millingId)).subscribe(milling => {
          if (milling) {
            this.curEditMilling$.next(milling);
          }
        });
      } else {
        this.curEditMilling$.next(null);
      }
    });

    this.curEditMilling$.subscribe(item => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    })
  }
}

