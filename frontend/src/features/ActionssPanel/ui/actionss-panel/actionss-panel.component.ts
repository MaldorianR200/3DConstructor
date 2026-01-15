import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IActionss, ActionssSelectors } from 'src/entities/Actionss';
import { StackComponent } from 'src/shared/ui/app';
import { ActionssFormComponent } from '../actionss-form/actionss-form.component';
import { ActionsssEditListComponent } from '../actionss-edit-list/actionss-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-actionss-panel',
  standalone: true,
  imports: [
    ActionssFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    ActionsssEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './actionss-panel.component.html',
  styleUrl: './actionss-panel.component.scss',
})
export class ActionssPanelComponent implements OnInit {
  isEdit: boolean = false;
  actionsss$: Observable<IActionss[]>;
  curEditActionss$ = new BehaviorSubject<IActionss | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.actionsss$ = this.store.select(ActionssSelectors.selectAllActionsss);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const actionssId = parseInt(queryParams['id'], 0);
      if (this.isEdit && actionssId) {
        this.store
          .select(ActionssSelectors.selectActionssById(actionssId))
          .subscribe((actionss) => {
            if (actionss) {
              this.curEditActionss$.next(actionss);
            }
          });
      } else {
        this.curEditActionss$.next(null);
      }
    });

    this.curEditActionss$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
