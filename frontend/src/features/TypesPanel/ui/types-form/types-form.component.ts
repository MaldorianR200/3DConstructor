import { Component, Input, OnInit } from '@angular/core';
import { NgIf, DecimalPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ITypes, TypesActions } from 'src/entities/Types';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-types-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
  ],
  templateUrl: './types-form.component.html',
  styleUrl: './types-form.component.scss',
})
export class TypesFormComponent implements OnInit {
  @Input() types$: BehaviorSubject<ITypes | null> = new BehaviorSubject<ITypes | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  isOpenAreaCalculator: boolean = false;
  typesForm: FormGroup;
  areaCalculatorForm: FormGroup;

  calculatedArea: number = 0;
  calculatedAreaInMeters: number = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.typesForm = this.fb.group({
      name: new FormControl(),
      type: new FormControl(),
      facade: new FormControl(),
      body: new FormControl(),
      additionFacade: new FormControl(),
      backWall: new FormControl(),
      texture: new FormControl(),
      active: new FormControl(),
      comment: new FormControl(),
      other: new FormControl(),
    });

    // Форма для калькулятора площади с кастомными валидаторами
    this.areaCalculatorForm = this.fb.group({
      length: new FormControl(null, [
        Validators.required,
        Validators.min(0),
        this.positiveNumberValidator
      ]),
      width: new FormControl(null, [
        Validators.required,
        Validators.min(0),
        this.positiveNumberValidator
      ]),
    });
  }

  // Кастомный валидатор для положительных чисел
  private positiveNumberValidator(control: FormControl) {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return { positiveNumber: true };
    }
    return null;
  }

  types = [
    { label: 'Фурнитура', value: 'FURNITURE' },
    { label: 'Тип изделия', value: 'PRODUCT' },
    { label: 'Вид изделия', value: 'EXECUTION' },
    // { label: 'Типоразмер', value: 'TYPESIZE' },
    { label: 'Задача фрезеровки', value: 'STEP' },
    { label: 'Категория цвета', value: 'COLOR_CATEGORY' },
    { label: 'Тип материала', value: 'MATERIAL' },
  ];

  // Методы для калькулятора площади
  openAreaCalculator(): void {
    this.isOpenAreaCalculator = true;
    this.resetAreaCalculator();
  }

  closeAreaCalculator(): void {
    this.isOpenAreaCalculator = false;
    this.resetAreaCalculator();
  }

  resetAreaCalculator(): void {
    this.areaCalculatorForm.reset({
          active: true
        });
    this.calculatedArea = 0;
    this.calculatedAreaInMeters = 0;
  }

  calculateArea(): void {
    const length = this.areaCalculatorForm.get('length')?.value;
    const width = this.areaCalculatorForm.get('width')?.value;

    // Проверяем, что значения валидны и положительны
    if (length !== null && width !== null &&
      this.areaCalculatorForm.get('length')?.valid &&
      this.areaCalculatorForm.get('width')?.valid &&
      length > 0 && width > 0) {

      // Площадь в мм²
      this.calculatedArea = length * width;
      // Площадь в м² (1 м² = 1,000,000 мм²)
      this.calculatedAreaInMeters = this.calculatedArea / 1000000;
    } else {
      this.calculatedArea = 0;
      this.calculatedAreaInMeters = 0;
    }
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
    const types: ITypes = this.typesForm.value;
    this.store.dispatch(TypesActions.createTypes({ types }));
  }

  update() {
    const types: ITypes = this.typesForm.value;
    types.id = this.types$.value?.id;
    this.store.dispatch(TypesActions.updateTypes({ types }));
  }

  delete() {
    const types = this.types$.value;
    if (types) {
      this.store.dispatch(TypesActions.deleteTypes({ id: types.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.types$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.typesForm.get('name')?.setValue(item.name);
        this.typesForm.get('type')?.setValue(item.type);
        this.typesForm.get('facade')?.setValue(item.facade);
        this.typesForm.get('backWall')?.setValue(item.backWall);
        this.typesForm.get('body')?.setValue(item.body);
        this.typesForm.get('additionFacade')?.setValue(item.additionFacade);
        this.typesForm.get('texture')?.setValue(item.texture);
        this.typesForm.get('active')?.setValue(item.active);
        this.typesForm.get('comment')?.setValue(item.comment);
        this.typesForm.get('other')?.setValue(item.other);
      } else {
        this.typesForm.reset({
          active: true,
          facade: false,
          backWall: false,
          body: false,
          additionFacade: false,
          texture: false
        });
      }
    });

    this.actions$.pipe(ofType(TypesActions.createTypesSuccess)).subscribe(() => {
      this.typesForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(TypesActions.updateTypesSuccess)).subscribe(() => {
      this.typesForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(TypesActions.deleteTypesSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
