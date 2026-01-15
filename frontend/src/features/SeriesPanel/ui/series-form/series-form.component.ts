import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ISeries, SeriesActions } from 'src/entities/Series';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-series-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
  ],
  templateUrl: './series-form.component.html',
  styleUrl: './series-form.component.scss',
})
export class SeriesFormComponent implements OnInit {
  @Input() series$: BehaviorSubject<ISeries | null> = new BehaviorSubject<ISeries | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  seriesForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.seriesForm = this.fb.group({
      name: new FormControl(),
      active: new FormControl(),
      comment: new FormControl(),
    });
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    if (this.isCreate) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    const series: ISeries = this.seriesForm.value;
    this.store.dispatch(SeriesActions.createSeries({ series }));
  }

  update() {
    const series: ISeries = this.seriesForm.value;
    series.id = this.series$.value?.id;
    this.store.dispatch(SeriesActions.updateSeries({ series }));
  }

  delete() {
    const series = this.series$.value;
    if (series) {
      this.store.dispatch(SeriesActions.deleteSeries({ id: series.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.series$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.seriesForm.get('name')?.setValue(item.name);
        this.seriesForm.get('active')?.setValue(item.active);
        this.seriesForm.get('comment')?.setValue(item.comment);
      } else {
        this.seriesForm.reset({
          active: true
        });
      }
    });

    this.actions$.pipe(ofType(SeriesActions.createSeriesSuccess)).subscribe(() => {
      this.seriesForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(SeriesActions.updateSeriesSuccess)).subscribe(() => {
      this.seriesForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(SeriesActions.deleteSeriesSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
