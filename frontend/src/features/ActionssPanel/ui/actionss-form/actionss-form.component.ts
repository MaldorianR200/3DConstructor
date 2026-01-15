import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IActionss, ActionssActions } from 'src/entities/Actionss';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-actionss-form',
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
  templateUrl: './actionss-form.component.html',
  styleUrl: './actionss-form.component.scss',
})
export class ActionssFormComponent implements OnInit {
  @Input() actionss$: BehaviorSubject<IActionss | null> = new BehaviorSubject<IActionss | null>(
    null,
  );
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  actionssForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.actionssForm = this.fb.group({
      name: new FormControl(),
      price: new FormControl(),
      type: new FormControl(),
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
  types = [
    { label: 'Операция', value: 'OPERATION' },
    { label: 'Услуга', value: 'SERVICE' },
  ];
  create() {
    const actionss: IActionss = this.actionssForm.value;
    this.store.dispatch(ActionssActions.createActionss({ actionss }));
  }

  update() {
    const actionss: IActionss = this.actionssForm.value;
    actionss.id = this.actionss$.value?.id;
    this.store.dispatch(ActionssActions.updateActionss({ actionss }));
  }

  delete() {
    const actionss = this.actionss$.value;
    if (actionss) {
      this.store.dispatch(ActionssActions.deleteActionss({ id: actionss.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.actionss$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.actionssForm.get('name')?.setValue(item.name);
        this.actionssForm.get('price')?.setValue(item.price);
        this.actionssForm.get('type')?.setValue(item.type);
        this.actionssForm.get('active')?.setValue(item.active);
        this.actionssForm.get('comment')?.setValue(item.comment);
      } else {
        this.actionssForm.reset({
          active: true
        });
      }
    });

    this.actions$.pipe(ofType(ActionssActions.createActionssSuccess)).subscribe(() => {
      this.actionssForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(ActionssActions.updateActionssSuccess)).subscribe(() => {
      this.actionssForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(ActionssActions.deleteActionssSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
