import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IFasteners, FastenersSelectors } from 'src/entities/Fasteners';
import { StackComponent } from 'src/shared/ui/app';
import { FastenersFormComponent } from '../fasteners-form/fasteners-form.component';
import { FastenerssEditListComponent } from '../fasteners-edit-list/fasteners-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-fasteners-panel',
  standalone: true,
  imports: [
    FastenersFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    FastenerssEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './fasteners-panel.component.html',
  styleUrl: './fasteners-panel.component.scss',
})
export class FastenersPanelComponent implements OnInit {
  isEdit: boolean = false;
  fastenerss$: Observable<IFasteners[]>;
  curEditFasteners$ = new BehaviorSubject<IFasteners | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.fastenerss$ = this.store.select(FastenersSelectors.selectAllFastenerss);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const fastenersId = parseInt(queryParams['id'], 0);
      if (this.isEdit && fastenersId) {
        this.store
          .select(FastenersSelectors.selectFastenersById(fastenersId))
          .subscribe((fasteners) => {
            if (fasteners) {
              this.curEditFasteners$.next(fasteners);
            }
          });
      } else {
        this.curEditFasteners$.next(null);
      }
    });

    this.curEditFasteners$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
