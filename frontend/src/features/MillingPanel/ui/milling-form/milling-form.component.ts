import { Component, Input, OnInit } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IMilling, MillingActions } from 'src/entities/Milling';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminModalComponent
} from 'src/shared/ui/admin';
import { StackComponent } from "src/shared/ui/app";
import { HeaderTableComponent } from '../../../../shared/ui/app/header-table/header-table.component';
import { SpecificationRowComponent } from '../../../../shared/ui/app/specification-row/specification-row.component';
import { ITypes } from '../../../../entities/Types';
import { selectAllSteps, selectTypeSteps } from '../../../../entities/Milling/model/store/milling.selectors';
import { CalculationService } from '../../../../shared/services/calculation.service';

@Component({
  selector: 'app-milling-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    HeaderTableComponent,
    SpecificationRowComponent,
    NgForOf,
    DecimalPipe,
  ],
  templateUrl: './milling-form.component.html',
  styleUrl: './milling-form.component.scss',
})
export class MillingFormComponent implements OnInit {
  @Input() milling$: BehaviorSubject<IMilling | null> = new BehaviorSubject<IMilling | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  millingForm: FormGroup;
  steps: Array<{ value: number; label: string }> = [];
  allSteps: ITypes[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
    private calculationService: CalculationService // добавить сервис
  ) {
    this.millingForm = this.fb.group({
      name: new FormControl(),
      steps: new FormControl([]),
      stepArray: this.fb.array([]),
      active: new FormControl(true),
      comment: new FormControl(),
    });
  }

  getStepArray(): FormArray {
    return this.millingForm.get('stepArray') as FormArray;
  }

  getOptionLabel(value: number): string {
    return this.allSteps.find((item) => item.id === value)?.name || '';
  }

  updateStepArray(selectedIds: number[], existingData?: any[]) {
    const array = this.getStepArray();
    const currentControls = array.controls.map((control) => ({
      typeStepId: control.get('typeStepId')?.value,
      price: control.get('price')?.value || 0,
      count: control.get('count')?.value || 0,
    }));
    array.clear();

    selectedIds?.forEach((id) => {
      const existing = (existingData || currentControls).find((c) => c.typeStepId === id);
      array.push(
        this.fb.group({
          typeStepId: [id],
          price: [existing?.price || 0],
          count: [existing?.count || 0],
        }),
      );
    });

    array.updateValueAndValidity();
  }

  get totalCost(): number {
    const stepArray = this.getStepArray().value;
    return this.calculationService.calculateTotalCostFromFormArray(stepArray);
  }

  ngOnInit(): void {
    this.store.select(selectTypeSteps).subscribe((data) => (this.steps = data));
    this.store.select(selectAllSteps).subscribe((data) => (this.allSteps = data || []));

    this.milling$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.millingForm.patchValue({
          name: item.name,
          steps: item.steps?.map((s) => s.typeStepId) || [],
          active: item.active ?? true,
          comment: item.comment,
        });
        this.updateStepArray(item.steps?.map((s) => s.typeStepId) || [], item.steps);
      } else {
        this.millingForm.reset({ active: true });
        this.getStepArray().clear();
      }
    });

    this.millingForm.get('steps')?.valueChanges.subscribe((selected: number[]) => {
      const currentArray = this.getStepArray().controls.map((control) => ({
        typeStepId: control.get('typeStepId')?.value,
        price: control.get('price')?.value,
        count: control.get('count')?.value,
      }));
      this.updateStepArray(selected, currentArray);
    });

    this.actions$.pipe(ofType(MillingActions.createMillingSuccess)).subscribe(() => {
      this.millingForm.reset({ active: true });
      this.getStepArray().clear();
    });

    this.actions$.pipe(ofType(MillingActions.updateMillingSuccess)).subscribe(() => {
      this.millingForm.reset({ active: true });
      this.getStepArray().clear();
      this.router.navigate([], { queryParams: { edit: true } });
    });

    this.actions$.pipe(ofType(MillingActions.deleteMillingSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }

  submit() {
    const formValue = this.millingForm.value;

    // формируем объект без id при создании
    const milling: IMilling = {
      name: formValue.name,
      steps: this.getStepArray().controls.map((control) => ({
        typeStepId: Number(control.get('typeStepId')?.value),
        price: Number(control.get('price')?.value),
        count: Number(control.get('count')?.value),
      })),
      active: formValue.active,
      comment: formValue.comment,
    };

    if (!this.isCreate && this.milling$.value?.id) {
      milling.id = this.milling$.value.id; // только при обновлении
      this.store.dispatch(MillingActions.updateMilling({ milling }));
    } else {
      this.store.dispatch(MillingActions.createMilling({ milling }));
    }
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  delete() {
    const milling = this.milling$.value;
    if (milling) {
      this.store.dispatch(MillingActions.deleteMilling({ id: milling.id! }));
      this.isOpenDelete = false;
    }
  }
}
