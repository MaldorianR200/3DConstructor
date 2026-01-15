import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ISpecification, SpecificationSelectors } from 'src/entities/Specification';
import { StackComponent } from 'src/shared/ui/app';
import { SpecificationFormComponent } from '../specification-form/specification-form.component';
import { SpecificationsEditListComponent, ISpecificationWithNames } from '../specification-edit-list/specification-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-specification-panel',
  standalone: true,
  imports: [
    SpecificationFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    SpecificationsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './specification-panel.component.html',
  styleUrl: './specification-panel.component.scss',
})
export class SpecificationPanelComponent implements OnInit {
  isEdit: boolean = false;
  specifications$: Observable<ISpecification[]>;
  curEditSpecification$ = new BehaviorSubject<ISpecification | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.specifications$ = this.store.select(SpecificationSelectors.selectAllSpecifications);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const specificationId = parseInt(queryParams['id'], 0);
      if (this.isEdit && specificationId) {
        this.store
          .select(SpecificationSelectors.selectSpecificationById(specificationId))
          .subscribe((specification) => {
            if (specification) {
              this.curEditSpecification$.next(specification);
            }
          });
      } else {
        this.curEditSpecification$.next(null);
      }
    });

    this.curEditSpecification$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
