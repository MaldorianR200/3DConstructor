import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ISpecification, SpecificationActions } from 'src/entities/Specification';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import {
  selectColorCategoryOptions,
  selectColorOptions, selectCombineMaterialOptions,
  selectFastenerOptions,
  selectFurnitureOptions, selectMaterialOptions,
  // selectLdspOptions,
  // selectMdfOptions,
  selectMillingOptions,
  // selectMirrorOptions,
  selectOperationOptions,
  selectTypesExecution,
  selectTypesProduct,
} from 'src/entities/Specification/model/store/specification.selectors';
import { selectAllTypess } from 'src/entities/Types/model/store/types.selectors';
import { selectAllMaterials } from 'src/entities/Material/model/store/material.selectors';
import { selectAllFurnitures } from 'src/entities/Furniture/model/store/furniture.selectors';
import { selectAllColors } from 'src/entities/Color/model/store/color.selectors';
import { selectAllActionsss } from 'src/entities/Actionss/model/store/actionss.selectors';
import { selectAllFastenerss } from 'src/entities/Fasteners/model/store/fasteners.selectors';
import { ITypes } from '../../../../entities/Types';
import { IMaterial } from '../../../../entities/Material';
import { IFurniture } from '../../../../entities/Furniture';
import { IColor } from '../../../../entities/Color';
import { IActionss } from '../../../../entities/Actionss';
import { IFasteners } from '../../../../entities/Fasteners';
import { SpecificationRowComponent } from '../../../../shared/ui/app/specification-row/specification-row.component';
import { HeaderTableComponent } from '../../../../shared/ui/app/header-table/header-table.component';
import { selectSeriesOption, } from '../../../../entities/Series/model/store/series.selectors';
import { selectAllMillings } from '../../../../entities/Milling/model/store/milling.selectors';
import { IMilling } from '../../../../entities/Milling';
import { CalculationService } from '../../../../shared/services/calculation.service';
import { ICombineMaterial } from '../../../../entities/CombineMaterial';
import { selectAllCombineMaterials } from '../../../../entities/CombineMaterial/model/store/combineMaterial.selectors';

interface ArrayFormGroup {
  objectId: FormControl<number>;
  coefficient: FormControl<number>;
  price?: FormControl<number>;
}

interface OptionWithPrice {
  value: number;
  label: string;
  price: number;
}

interface OptionWithoutPrice {
  value: number;
  label: string;
}

interface Series {
  value: string;
  label: string;
}

@Component({
  selector: 'app-specification-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    NgForOf,
    SpecificationRowComponent,
    HeaderTableComponent,
    DecimalPipe,
  ],
  templateUrl: './specification-form.component.html',
  styleUrl: './specification-form.component.scss',
})
export class SpecificationFormComponent implements OnInit {
  @Input() specification$: BehaviorSubject<ISpecification | null> =
    new BehaviorSubject<ISpecification | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  specificationForm: FormGroup;
  optionsLoaded = false;

  // Полные массивы из стора
  allTypes: ITypes[] = [];
  allMaterials: IMaterial[] = [];
  allFurnitures: IFurniture[] = [];
  allMillings: IMilling[] = [];
  allColorCategories: ITypes[] = [];
  allColors: IColor[] = [];
  allActionsss: IActionss[] = [];
  allFastenerss: IFasteners[] = [];
  allCombineMaterials: ICombineMaterial[] = [];

  // Кэш для стоимости фрезеровок
  millingCostsCache = new Map<number, number>();

  // Опции для формы
  typesProduct: OptionWithoutPrice[] = [];
  typesExecution: OptionWithoutPrice[] = [];
  furnitureOptions: OptionWithPrice[] = [];
  millingOptions: OptionWithPrice[] = [];
  colorCategoryOptions: OptionWithoutPrice[] = [];
  colorOptions: OptionWithoutPrice[] = [];
  operationOptions: OptionWithPrice[] = [];
  fastenerOptions: OptionWithPrice[] = [];
  materialOptions?: OptionWithPrice[] = [];
  combineMaterialOptions?: OptionWithoutPrice[] = [];

  bulkCoefficientControl = new FormControl<number>(0);
  selectedItems: FormGroup[] = [];
  series: Series[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
    private calculationService: CalculationService,
  ) {
    this.specificationForm = this.fb.group({
      typeProduct: new FormControl(null, [Validators.required]),
      typeExecution: new FormControl(null, [Validators.required]),
      series: new FormControl('', [Validators.required]),
      furnitureIds: new FormControl([]),
      furnitureArray: this.fb.array([]),
      materialIds: new FormControl([]),
      materialArray: this.fb.array([]),
      combineMaterialIds: new FormControl([]),
      combineMaterialArray: this.fb.array([]),
      millingIds: new FormControl([]),
      millingArray: this.fb.array([]),
      colorCategoryIds: new FormControl([]),
      colorCategoryArray: this.fb.array([]),
      colorIds: new FormControl([]),
      colorArray: this.fb.array([]),
      operationIds: new FormControl([]),
      operationArray: this.fb.array([]),
      fastenerIds: new FormControl([]),
      fastenerArray: this.fb.array([]),
      active: new FormControl(true, [Validators.required]),
      comment: new FormControl(''),
    });
  }

  // Синхронный метод для получения стоимости фрезеровки
  getMillingCost(millingId: number): number {
    if (!millingId) return 0;

    // Если уже есть в кэше, возвращаем из кэша
    if (this.millingCostsCache.has(millingId)) {
      return this.millingCostsCache.get(millingId)!;
    }

    // Ищем фрезеровку и вычисляем стоимость
    const milling = this.allMillings.find(m => m.id === millingId);
    if (!milling) return 0;

    const cost = this.calculationService.calculateTotalCost(milling);
    this.millingCostsCache.set(millingId, cost);
    return cost;
  }

  // Асинхронный метод (если нужен)
  getMillingCostById(millingId: number): Observable<number> {
    if (!millingId) return of(0);
    return this.calculationService.calculateTotalCostByMillingId(millingId);
  }

  getMaterialArray(): FormArray {
    return this.specificationForm.get('materialArray') as FormArray;
  }

  getCombineMaterialArray(): FormArray {
    const array = this.specificationForm.get('combineMaterialArray') as FormArray;
    return array;
  }

  getFurnitureArray(): FormArray {
    return this.specificationForm.get('furnitureArray') as FormArray;
  }

  getMillingArray(): FormArray {
    return this.specificationForm.get('millingArray') as FormArray;
  }

  getColorCategoryArray(): FormArray {
    return this.specificationForm.get('colorCategoryArray') as FormArray;
  }

  getColorArray(): FormArray {
    return this.specificationForm.get('colorArray') as FormArray;
  }

  getOperationArray(): FormArray {
    return this.specificationForm.get('operationArray') as FormArray;
  }

  getFastenerArray(): FormArray {
    return this.specificationForm.get('fastenerArray') as FormArray;
  }

  calculateTotal(group: AbstractControl): number {
    const coeff = group.get('coefficient')?.value || 0;
    const price = group.get('price')?.value || 0;
    return coeff * price;
  }

  updateArray(
    fieldIds: string,
    fieldArray: string,
    selectedIds: number[] = [],
    existingData?: Array<{ objectId: number; coefficient: number }>,
  ) {
    const array = this.specificationForm.get(fieldArray) as FormArray;
    const currentControls = array.controls.map((control) => ({
      objectId: control.get('objectId')?.value,
      coefficient: control.get('coefficient')?.value || 0,
    }));

    array.clear();

    let allItems: any[] = [];
    let hasPrice = true;

    switch (fieldArray) {
      case 'materialArray':
        allItems = this.allMaterials?.filter((item) => item.active) || [];
        break;
      case 'combineMaterialArray':
        allItems = this.allCombineMaterials?.filter((item) => item.active) || [];
        hasPrice = false;
        break;
      case 'furnitureArray':
        allItems = this.allFurnitures?.filter((item) => item.active) || [];
        break;
      case 'millingArray':
        allItems = this.allMillings?.filter((item) => item.active) || [];
        break;
      case 'colorCategoryArray':
        allItems = this.allColorCategories?.filter((item) => item.active) || [];
        hasPrice = false;
        break;
      case 'colorArray':
        allItems = this.allColors?.filter((item) => item.active) || [];
        hasPrice = false;
        break;
      case 'operationArray':
        allItems = this.allActionsss?.filter((item) => item.active) || [];
        break;
      case 'fastenerArray':
        allItems = this.allFastenerss?.filter((item) => item.active) || [];
        break;
      default:
        return;
    }

    if (selectedIds?.length === 0 || allItems.length === 0) {
      return;
    }

    selectedIds.forEach((id) => {
      const item = allItems.find((obj) => obj.id === id);
      if (!id || !item) {
        return;
      }

      const coeff =
        (existingData || currentControls).find((ex) => ex.objectId === id)?.coefficient || 0;

      const group = this.fb.group<ArrayFormGroup>({
        objectId: new FormControl<number>(id, [Validators.required]),
        coefficient: new FormControl<number>(coeff, [Validators.required, Validators.min(0)]),
      });

      if (hasPrice) {
        // Для фрезеровок используем вычисленную стоимость
        let priceValue = item.price || 0;
        if (fieldArray === 'millingArray') {
          priceValue = this.getMillingCost(id);
        }
        group.addControl('price', new FormControl<number>(priceValue, [Validators.required]));
      }

      array.push(group);
    });

    // Отладка ошибок и установка touched
    array.controls.forEach((control, index) => {
      const coeffControl = control.get('coefficient');
      if (coeffControl?.hasError('min') && !coeffControl.touched) {
        coeffControl.markAsTouched();
      }
    });

    this.specificationForm.updateValueAndValidity();
  }

  getColorHex(objectId: number): string {
    const colorObject = this.allColors.find(item => item.id === objectId);
    return colorObject?.hex || ''; // цвет по умолчанию
  }

  getOptionLabel(value: number, field: string): string {
    let allItems: any[] = [];
    switch (field) {
      case 'material':
        allItems = this.allMaterials.filter((item) => item.active);
        break;
      case 'combineMaterial':
        allItems = this.allCombineMaterials.filter((item) => item.active);
        break;
      case 'furniture':
        allItems = this.allFurnitures.filter((item) => item.active);
        break;
      case 'milling':
        allItems = this.allMillings.filter((item) => item.active);
        break;
      case 'colorCategory':
        allItems = this.allColorCategories.filter((item) => item.active);
        break;
      case 'color':
        allItems = this.allColors.filter((item) => item.active);
        break;
      case 'operation':
        allItems = this.allActionsss.filter((item) => item.active);
        break;
      case 'fastener':
        allItems = this.allFastenerss.filter((item) => item.active);
        break;
      default:
        return '';
    }
    return allItems.find((obj) => obj.id === value)?.name || '';
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    if (this.specificationForm.invalid) {
      this.specificationForm.markAllAsTouched();
      return;
    }
    if (this.isCreate) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    const specification: ISpecification = this.prepareFormData();
    this.store.dispatch(SpecificationActions.createSpecification({ specification }));
  }

  update() {
    const specification: ISpecification = this.prepareFormData();
    specification.id = this.specification$.value?.id;
    this.store.dispatch(SpecificationActions.updateSpecification({ specification }));
  }

  delete() {
    const specification = this.specification$.value;
    if (specification) {
      this.store.dispatch(SpecificationActions.deleteSpecification({ id: specification.id! }));
      this.isOpenDelete = false;
    }
  }

  private prepareFormData(): ISpecification {
    const formValue = this.specificationForm.value;
    return {
      typeProductId: formValue.typeProduct,
      typeExecutionId: formValue.typeExecution,
      series: formValue.series,
      material: formValue.materialArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      combineMaterial: formValue.combineMaterialArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      furniture: formValue.furnitureArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      milling: formValue.millingArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      colorCategory: formValue.colorCategoryArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      color: formValue.colorArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      operation: formValue.operationArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      fastener: formValue.fastenerArray.map((it: any) => ({
        objectId: it.objectId,
        coefficient: Number(it.coefficient),
      })),
      active: formValue.active,
      comment: formValue.comment,
    };
  }

  ngOnInit(): void {
    this.store.select(selectSeriesOption).subscribe((series) => {
      this.series = [{ value: 'not_series', label: 'Без серии' }, ...(series || [])];
    });

    // Подписка на изменения в bulkCoefficientControl
    this.bulkCoefficientControl.valueChanges.subscribe((value) => {
      if (value !== null && value < 0) {
        this.bulkCoefficientControl.setValue(0, { emitEvent: false });
      }
    });

    // Подписка на полные массивы из стора
    this.store.select(selectAllTypess).subscribe((types) => {
      this.allTypes = types || [];
      // Фильтруем категории цветов
      this.allColorCategories = this.allTypes.filter(type =>
        type.type === 'COLOR_CATEGORY' && type.active
      );
    });

    this.store
      .select(selectAllMaterials)
      .subscribe((materials) => (this.allMaterials = materials || []));
    this.store
      .select(selectAllCombineMaterials)
      .subscribe((combineMaterials) => (this.allCombineMaterials = combineMaterials || []));
    this.store
      .select(selectAllFurnitures)
      .subscribe((furnitures) => (this.allFurnitures = furnitures || []));
    this.store.select(selectAllColors).subscribe((colors) => (this.allColors = colors || []));
    this.store
      .select(selectAllActionsss)
      .subscribe((actionsss) => (this.allActionsss = actionsss || []));
    this.store
      .select(selectAllFastenerss)
      .subscribe((fastenerss) => (this.allFastenerss = fastenerss || []));
    this.store
      .select(selectAllMillings)
      .subscribe((millings) => {
        this.allMillings = millings || [];
        // Предварительно вычисляем стоимости фрезеровок при загрузке
        this.precalculateMillingCosts();
      });

    // Ожидание загрузки опций
    combineLatest([
      this.store.select(selectTypesProduct),
      this.store.select(selectTypesExecution),
      this.store.select(selectMaterialOptions),
      this.store.select(selectCombineMaterialOptions),
      this.store.select(selectFurnitureOptions),
      this.store.select(selectMillingOptions),
      this.store.select(selectColorCategoryOptions),
      this.store.select(selectColorOptions),
      this.store.select(selectOperationOptions),
      this.store.select(selectFastenerOptions),
    ]).subscribe(
      ([
         typesProduct,
         typesExecution,
         materialOptions,
         combineMaterialOptions,
         furnitureOptions,
         millingOptions,
         colorCategoryOptions,
         colorOptions,
         operationOptions,
         fastenerOptions,
       ]) => {
        this.typesProduct = typesProduct || [];
        this.typesExecution = typesExecution || [];
        this.materialOptions = materialOptions || [];
        this.combineMaterialOptions = combineMaterialOptions || [];
        this.furnitureOptions = furnitureOptions || [];
        this.millingOptions = millingOptions || [];
        this.colorCategoryOptions = colorCategoryOptions || [];
        this.colorOptions = colorOptions || [];
        this.operationOptions = operationOptions || [];
        this.fastenerOptions = fastenerOptions || [];

        this.optionsLoaded = true;

        const spec = this.specification$.value;
        this.isCreate = !spec;
        if (spec) {
          this.specificationForm.patchValue({
            typeProduct: spec.typeProductId,
            typeExecution: spec.typeExecutionId,
            series: spec.series || 'not_series',
            materialIds: spec.material?.map((it) => it.objectId) || [],
            combineMaterialIds: spec.combineMaterial?.map((it) => it.objectId) || [],
            furnitureIds: spec.furniture?.map((it) => it.objectId) || [],
            millingIds: spec.milling?.map((it) => it.objectId) || [],
            colorCategoryIds: spec.colorCategory?.map((it) => it.objectId) || [],
            colorIds: spec.color?.map((it) => it.objectId) || [],
            operationIds: spec.operation?.map((it) => it.objectId) || [],
            fastenerIds: spec.fastener?.map((it) => it.objectId) || [],
            active: spec.active,
            comment: spec.comment,
          });

          this.updateArray(
            'materialIds',
            'materialArray',
            spec.material?.map((it) => it.objectId) || [],
            spec.material || [],
          );
          this.updateArray(
            'combineMaterialIds',
            'combineMaterialArray',
            spec.combineMaterial?.map((it) => it.objectId) || [],
            spec.combineMaterial || [],
          );
          this.updateArray(
            'furnitureIds',
            'furnitureArray',
            spec.furniture?.map((it) => it.objectId) || [],
            spec.furniture || [],
          );
          this.updateArray(
            'millingIds',
            'millingArray',
            spec.milling?.map((it) => it.objectId) || [],
            spec.milling || [],
          );
          this.updateArray(
            'colorCategoryIds',
            'colorCategoryArray',
            spec.colorCategory?.map((it) => it.objectId) || [],
            spec.colorCategory || [],
          );
          this.updateArray(
            'colorIds',
            'colorArray',
            spec.color?.map((it) => it.objectId) || [],
            spec.color || [],
          );
          this.updateArray(
            'operationIds',
            'operationArray',
            spec.operation?.map((it) => it.objectId) || [],
            spec.operation || [],
          );
          this.updateArray(
            'fastenerIds',
            'fastenerArray',
            spec.fastener?.map((it) => it.objectId) || [],
            spec.fastener || [],
          );
        } else {
          this.specificationForm.reset({ active: true, comment: '' });
        }
      },
    );

    // Подписка на изменения выбранных элементов
    [
      'materialIds',
      'combineMaterialIds',
      'furnitureIds',
      'millingIds',
      'colorCategoryIds',
      'colorIds',
      'operationIds',
      'fastenerIds',
    ].forEach((field) => {
      this.specificationForm.get(field)?.valueChanges.subscribe((selectedIds: number[]) => {
        const arrayField = field.replace('Ids', 'Array');
        const currentArray = this.specificationForm.get(arrayField) as FormArray;
        const existingData = currentArray.controls.map((control) => ({
          objectId: control.get('objectId')?.value,
          coefficient: control.get('coefficient')?.value || 0,
        }));
        this.updateArray(field, arrayField, selectedIds, existingData);
      });
    });

    this.actions$.pipe(ofType(SpecificationActions.createSpecificationSuccess)).subscribe(() => {
      this.specificationForm.reset({ active: true, comment: '' });
    });
    this.actions$.pipe(ofType(SpecificationActions.updateSpecificationSuccess)).subscribe(() => {
      this.specificationForm.reset({ active: true, comment: '' });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(SpecificationActions.deleteSpecificationSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }

  // Предварительное вычисление стоимости фрезеровок
  private precalculateMillingCosts(): void {
    this.millingCostsCache.clear();
    this.allMillings.forEach(milling => {
      if (milling.id) {
        this.millingCostsCache.set(
          milling.id,
          this.calculationService.calculateTotalCost(milling)
        );
      }
    });
  }

  toggleSelection(control: AbstractControl, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const formGroup = control as FormGroup;
    if (checkbox.checked) {
      this.selectedItems.push(formGroup);
    } else {
      this.selectedItems = this.selectedItems.filter((item) => item !== formGroup);
    }
  }

  applyBulkCoefficient(): void {
    const newCoefficient = this.bulkCoefficientControl.value || 0;
    this.selectedItems.forEach((control) => {
      control.get('coefficient')?.setValue(newCoefficient);
    });
    this.bulkCoefficientControl.reset();
    this.selectedItems = [];
  }

  isSelected(control: AbstractControl): boolean {
    return this.selectedItems.includes(control as FormGroup);
  }
}
