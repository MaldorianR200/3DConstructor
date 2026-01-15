import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IColor, ColorActions } from 'src/entities/Color';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import { ITypes } from '../../../../entities/Types';
import { selectTypeColorCategory } from '../../../../entities/Color/model/store/color.selectors';

@Component({
  selector: 'app-color-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
  ],
  templateUrl: './color-form.component.html',
  styleUrl: './color-form.component.scss',
})
export class ColorFormComponent implements OnInit {
  @Input() color$: BehaviorSubject<IColor | null> = new BehaviorSubject<IColor | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  colorForm: FormGroup;
  colorCategories: Array<{ value: number; label: string }> = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.colorForm = this.fb.group({
      name: new FormControl(),
      hex: new FormControl(),
      typeCategoryId: new FormControl(),
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
    const color: IColor = this.colorForm.value;
    color.typeCategoryId = Number(color.typeCategoryId);
    this.store.dispatch(ColorActions.createColor({ color }));
  }

  update() {
    const color: IColor = this.colorForm.value;
    color.typeCategoryId = Number(color.typeCategoryId);
    color.id = this.color$.value?.id;
    this.store.dispatch(ColorActions.updateColor({ color }));
  }

  delete() {
    const color = this.color$.value;
    if (color) {
      this.store.dispatch(ColorActions.deleteColor({ id: color.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.store.select(selectTypeColorCategory).subscribe((data)=>this.colorCategories = data)

    this.color$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.colorForm.get('name')?.setValue(item.name);
        this.colorForm.get('hex')?.setValue(item.hex);
        this.colorForm.get('typeCategoryId')?.setValue(item.typeCategoryId);
        this.colorForm.get('active')?.setValue(item.active);
        this.colorForm.get('comment')?.setValue(item.comment);
      } else {
        this.colorForm.reset({
          active: true
        });
      }
    });

    this.actions$.pipe(ofType(ColorActions.createColorSuccess)).subscribe(() => {
      this.colorForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(ColorActions.updateColorSuccess)).subscribe(() => {
      this.colorForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(ColorActions.deleteColorSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
