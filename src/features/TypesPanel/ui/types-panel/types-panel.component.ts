import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ITypes, TypesSelectors } from 'src/entities/Types';
import { StackComponent } from 'src/shared/ui/app';
import { TypesFormComponent } from '../types-form/types-form.component';
import { TypessEditListComponent } from '../types-edit-list/types-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-types-panel',
  standalone: true,
  imports: [
    TypesFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    TypessEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './types-panel.component.html',
  styleUrl: './types-panel.component.scss',
})
export class TypesPanelComponent implements OnInit {
  isEdit: boolean = false;
  typess$: Observable<ITypes[]>;
  curEditTypes$ = new BehaviorSubject<ITypes | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.typess$ = this.store.select(TypesSelectors.selectAllTypess);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const typesId = parseInt(queryParams['id'], 0);
      if (this.isEdit && typesId) {
        this.store.select(TypesSelectors.selectTypesById(typesId)).subscribe((types) => {
          if (types) {
            this.curEditTypes$.next(types);
          }
        });
      } else {
        this.curEditTypes$.next(null);
      }
    });

    this.curEditTypes$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
