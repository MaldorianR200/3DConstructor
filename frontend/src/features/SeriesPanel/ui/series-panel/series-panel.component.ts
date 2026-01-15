import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ISeries, SeriesSelectors } from 'src/entities/Series';
import { StackComponent } from 'src/shared/ui/app';
import { SeriesFormComponent } from '../series-form/series-form.component';
import { SeriessEditListComponent } from '../series-edit-list/series-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-series-panel',
  standalone: true,
  imports: [
    SeriesFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    SeriessEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './series-panel.component.html',
  styleUrl: './series-panel.component.scss',
})
export class SeriesPanelComponent implements OnInit {
  isEdit: boolean = false;
  seriess$: Observable<ISeries[]>;
  curEditSeries$ = new BehaviorSubject<ISeries | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.seriess$ = this.store.select(SeriesSelectors.selectAllSeriess);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const seriesId = parseInt(queryParams['id'], 0);
      if (this.isEdit && seriesId) {
        this.store.select(SeriesSelectors.selectSeriesById(seriesId)).subscribe((series) => {
          if (series) {
            this.curEditSeries$.next(series);
          }
        });
      } else {
        this.curEditSeries$.next(null);
      }
    });

    this.curEditSeries$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
