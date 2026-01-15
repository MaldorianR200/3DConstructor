import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IFasteners, FastenersActions } from 'src/entities/Fasteners';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-fasteners-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    AdminImagesLoaderMultipleComponent,
  ],
  templateUrl: './fasteners-form.component.html',
  styleUrl: './fasteners-form.component.scss',
})
export class FastenersFormComponent implements OnInit {
  @Input() fasteners$: BehaviorSubject<IFasteners | null> = new BehaviorSubject<IFasteners | null>(
    null,
  );
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  fastenersForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.fastenersForm = this.fb.group({
      name: new FormControl(),
      price: new FormControl(),
      active: new FormControl(),
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
    const fasteners: IFasteners = this.fastenersForm.value;
    this.store.dispatch(FastenersActions.createFasteners({ fasteners }));
  }

  update() {
    const fasteners: IFasteners = this.fastenersForm.value;
    fasteners.id = this.fasteners$.value?.id;
    this.store.dispatch(FastenersActions.updateFasteners({ fasteners }));
  }

  delete() {
    const fasteners = this.fasteners$.value;
    if (fasteners) {
      this.store.dispatch(FastenersActions.deleteFasteners({ id: fasteners.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.fasteners$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.fastenersForm.get('name')?.setValue(item.name);
        this.fastenersForm.get('active')?.setValue(item.active ?? true);
        this.fastenersForm.get('price')?.setValue(item.price);
        this.fastenersForm.get('comment')?.setValue(item.comment);
      } else {
        this.fastenersForm.reset({
          active: true
        });
      }
    });

    this.actions$.pipe(ofType(FastenersActions.createFastenersSuccess)).subscribe(() => {
      this.fastenersForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(FastenersActions.updateFastenersSuccess)).subscribe(() => {
      this.fastenersForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(FastenersActions.deleteFastenersSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
