import { Component, Input, OnInit } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ICombineMaterial, CombineMaterialActions } from 'src/entities/CombineMaterial';
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
import { IMaterial } from '../../../../entities/Material';
import { selectAllSteps, selectTypeSteps } from '../../../../entities/Milling/model/store/milling.selectors';
import {
  selectAllMaterials,
  selectMaterial,
} from '../../../../entities/Material/model/store/material.selectors';

@Component({
  selector: 'app-combineMaterial-form',
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
  templateUrl: './combineMaterial-form.component.html',
  styleUrl: './combineMaterial-form.component.scss',
})
export class CombineMaterialFormComponent implements OnInit {
  @Input() combineMaterial$: BehaviorSubject<ICombineMaterial | null> =
    new BehaviorSubject<ICombineMaterial | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  combineMaterialForm: FormGroup;
  materials: Array<{ value: number; label: string }> = [];
  allMaterials: IMaterial[] = [];

  isOpenDeleteMaterial: boolean = false;
  isOpenDeleteInstance: boolean = false;
  materialToDelete: number | null = null;
  instanceToDelete: { materialIndex: number, instanceIndex: number } | null = null;

  allOperations: ITypes[] = [];
  operationsForSelect: Array<{ value: number; label: string }> = [];

  materialOperations: { [materialIndex: number]: Array<{ value: number; label: string }> } = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.combineMaterialForm = this.fb.group({
      name: new FormControl(''),
      materials: new FormControl([]),
      materialsArray: this.fb.array([]),
      active: new FormControl(true),
      comment: new FormControl(''),
    });
  }

// Добавляем новые методы для управления экземплярами:
  openDeleteMaterialModal(materialIndex: number) {
    this.materialToDelete = materialIndex;
    this.isOpenDeleteMaterial = true;
  }

// Закрыть модалку удаления материала
  closeDeleteMaterialModal() {
    this.isOpenDeleteMaterial = false;
    this.materialToDelete = null;
  }

// Подтвердить удаление материала
  confirmDeleteMaterial() {
    if (this.materialToDelete !== null) {
      this.removeMaterial(this.materialToDelete);
      this.closeDeleteMaterialModal();
    }
  }

// Открыть модалку удаления экземпляра
  openDeleteInstanceModal(materialIndex: number, instanceIndex: number) {
    this.instanceToDelete = { materialIndex, instanceIndex };
    this.isOpenDeleteInstance = true;
  }

// Закрыть модалку удаления экземпляра
  closeDeleteInstanceModal() {
    this.isOpenDeleteInstance = false;
    this.instanceToDelete = null;
  }

// Подтвердить удаление экземпляра
  confirmDeleteInstance() {
    if (this.instanceToDelete) {
      this.removeMaterialInstance(this.instanceToDelete.materialIndex, this.instanceToDelete.instanceIndex);
      this.closeDeleteInstanceModal();
    }
  }

// Добавить экземпляр материала
  addMaterialInstance(materialIndex: number) {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    const instancesArray = materialGroup.get('instancesArray') as FormArray;

    const instanceGroup = this.fb.group({
      selectedOperations: [[]],
      operationsArray: this.fb.array([])
    });

    instancesArray.push(instanceGroup);

    // Подписываемся на изменения операций
    instanceGroup.get('selectedOperations')?.valueChanges.subscribe((selectedOps: number[]) => {
      this.updateInstanceOperationsArray(materialIndex, instancesArray.length - 1, selectedOps);
    });
  }

// Удалить экземпляр материала
  removeMaterialInstance(materialIndex: number, instanceIndex: number) {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    const instancesArray = materialGroup.get('instancesArray') as FormArray;

    instancesArray.removeAt(instanceIndex);
  }

// Получение массива экземпляров материала
  getMaterialInstances(materialIndex: number): any[] {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    const instancesArray = materialGroup.get('instancesArray') as FormArray;
    return instancesArray?.controls || [];
  }

  // Получение FormArray материалов
  getMaterialsArray(): FormArray {
    return this.combineMaterialForm.get('materialsArray') as FormArray;
  }

  // Получение FormArray операций для конкретного материала
  getOperationsArray(materialIndex: number): FormArray {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    return materialGroup.get('operationsArray') as FormArray;
  }

  // Получение названия материала по ID
  getMaterialLabel(materialId: number): string {
    const material = this.allMaterials.find(item => item.id === materialId);
    return material?.name || `Материал ${materialId}`;
  }

  // Получение названия операции по ID
  getOperationLabel(operationId: number): string {
    return this.allOperations.find((item) => item.id === operationId)?.name || '';
  }

  // Получение копии операций для конкретного материала
  getOperationsForMaterial(materialIndex: number): Array<{ value: number; label: string }> {
    if (!this.materialOperations[materialIndex]) {
      // СОЗДАЕМ ГЛУБОКУЮ КОПИЮ МАССИВА ДЛЯ КАЖДОГО МАТЕРИАЛА
      this.materialOperations[materialIndex] = this.operationsForSelect.map(op => ({
        value: op.value,
        label: op.label
      }));
    }
    return this.materialOperations[materialIndex];
  }
  // Расчет общей стоимости по материалу
  calculateMaterialTotal(materialIndex: number): number {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    if (!materialGroup) return 0;

    const instancesArray = materialGroup.get('instancesArray') as FormArray;
    if (!instancesArray) return 0;

    let total = 0;
    instancesArray.controls.forEach((instanceGroup, instanceIndex) => {
      const operationsArray = (instanceGroup as FormGroup).get('operationsArray') as FormArray;
      if (operationsArray) {
        const instanceTotal = operationsArray.value.reduce((sum: number, operation: any) => {
          return sum + (operation.price || 0) * (operation.count || 0);
        }, 0);
        total += instanceTotal;
      }
    });

    return total;
  }

  // Расчет общей стоимости комбинированного материала
  calculateTotalCost(): number {
    const materialsArray = this.getMaterialsArray();
    if (!materialsArray) return 0;

    return materialsArray.controls.reduce((total: number, materialControl, materialIndex) => {
      return total + this.calculateMaterialTotal(materialIndex);
    }, 0);
  }

  // Получение контрола выбора операций для экземпляра
  getOperationsControl(materialIndex: number, instanceIndex: number): FormControl {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    if (!materialGroup) return new FormControl([]);

    const instancesArray = materialGroup.get('instancesArray') as FormArray;
    if (!instancesArray || !instancesArray.at(instanceIndex)) return new FormControl([]);

    const instanceGroup = instancesArray.at(instanceIndex) as FormGroup;
    return instanceGroup.get('selectedOperations') as FormControl;
  }

  getInstanceOperationsArray(materialIndex: number, instanceIndex: number): FormArray | null {
    try {
      const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
      if (!materialGroup) return null;

      const instancesArray = materialGroup.get('instancesArray') as FormArray;
      if (!instancesArray || !instancesArray.at(instanceIndex)) return null;

      const instanceGroup = instancesArray.at(instanceIndex) as FormGroup;
      return instanceGroup.get('operationsArray') as FormArray;
    } catch (error) {
      console.error('Error getting instance operations array:', error);
      return null;
    }
  }

  updateInstanceOperationsArray(materialIndex: number, instanceIndex: number, selectedIds: number[], existingData?: any[]) {
    const array = this.getInstanceOperationsArray(materialIndex, instanceIndex);
    if (!array) return;

    const currentControls = array.controls.map((control) => ({
      typeId: control.get('typeId')?.value,
      price: control.get('price')?.value || 0,
      count: control.get('count')?.value || 0,
    }));

    array.clear();

    selectedIds?.forEach((id) => {
      const existing = (existingData || currentControls).find((c) => c.typeId === id);
      array.push(
        this.fb.group({
          typeId: [id],
          price: [existing?.price || 0],
          count: [existing?.count || 0],
        })
      );
    });

    array.updateValueAndValidity();
  }

  // Обновление количества экземпляров материала
  updateMaterialInstances(materialIndex: number, newCount: number, existingInstancesData?: any[]) {
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    const instancesArray = materialGroup.get('instancesArray') as FormArray;

    // Сохраняем текущие данные
    const currentInstances = instancesArray.controls.map((instanceControl, index) => ({
      selectedOperations: instanceControl.get('selectedOperations')?.value || [],
      operationsArray: this.getInstanceOperationsArray(materialIndex, index).value
    }));

    instancesArray.clear();

    // Создаем новые экземпляры
    for (let i = 0; i < newCount; i++) {
      const existingInstance = existingInstancesData?.[i] || currentInstances[i];

      const instanceGroup = this.fb.group({
        selectedOperations: [existingInstance?.selectedOperations || []],
        operationsArray: this.fb.array([])
      });

      instancesArray.push(instanceGroup);

      // Обновляем операции если они есть
      if (existingInstance?.selectedOperations) {
        this.updateInstanceOperationsArray(
          materialIndex,
          i,
          existingInstance.selectedOperations,
          existingInstance.operationsArray
        );
      }

      // Подписываемся на изменения операций
      instanceGroup.get('selectedOperations')?.valueChanges.subscribe((selectedOps: number[]) => {
        this.updateInstanceOperationsArray(materialIndex, i, selectedOps);
      });
    }

    instancesArray.updateValueAndValidity();
  }

  // Обновление массива материалов при изменении выбора
  updateMaterialsArray(selectedIds: number[], existingData?: any[]) {
    const array = this.getMaterialsArray();

    // Если ничего не выбрано - очищаем и выходим
    if (!selectedIds || selectedIds.length === 0) {
      array.clear();
      array.updateValueAndValidity();
      return;
    }

    // Сохраняем текущие данные операций для каждого материала
    const currentControls = array.controls.map((control, index) => {
      const materialId = control.get('materialId')?.value;
      const instancesArray = control.get('instancesArray') as FormArray;

      const instancesData = instancesArray.controls.map((instanceControl, instanceIndex) => {
        const selectedOperations = instanceControl.get('selectedOperations')?.value || [];

        // Безопасно получаем operationsArray
        const operationsArray = this.getInstanceOperationsArray(index, instanceIndex);
        const operationsValue = operationsArray ? operationsArray.value : [];

        return {
          selectedOperations: selectedOperations,
          operationsArray: operationsValue
        };
      });

      return {
        materialId: materialId,
        instancesData: instancesData
      };
    });

    array.clear();

    selectedIds?.forEach((id, index) => {
      const existing = (existingData || currentControls).find((c) => c.materialId === id);

      // СОЗДАЕМ FormGroup для материала
      const materialGroup = this.fb.group({
        materialId: [id],
        instancesArray: this.fb.array([])
      });

      // Создаем экземпляры материалов
      const instancesArray = materialGroup.get('instancesArray') as FormArray;
      const instancesCount = existing?.instancesData?.length || 1;

      for (let i = 0; i < instancesCount; i++) {
        const existingInstance = existing?.instancesData?.[i];

        const instanceGroup = this.fb.group({
          selectedOperations: [existingInstance?.selectedOperations || []],
          operationsArray: this.fb.array([])
        });

        instancesArray.push(instanceGroup);

        // Обновляем операции для этого экземпляра если они есть
        if (existingInstance?.selectedOperations) {
          // Используем setTimeout чтобы FormArray успел создаться
          setTimeout(() => {
            this.updateInstanceOperationsArray(index, i, existingInstance.selectedOperations, existingInstance.operationsArray);
          }, 0);
        }

        // Подписываемся на изменения выбора операций для этого экземпляра
        instanceGroup.get('selectedOperations')?.valueChanges.subscribe((selectedOps: number[]) => {
          // Добавляем проверку чтобы не вызывать на несуществующих индексах
          if (this.getMaterialsArray().length > index) {
            this.updateInstanceOperationsArray(index, i, selectedOps);
          }
        });
      }

      array.push(materialGroup);
    });

    array.updateValueAndValidity();
  }

  // Обновление массива операций для конкретного материала
  updateOperationsArray(materialIndex: number, selectedIds: number[], existingData?: any[]) {
    const array = this.getOperationsArray(materialIndex);
    const currentControls = array.controls.map((control) => ({
      typeId: control.get('typeId')?.value,
      price: control.get('price')?.value || 0,
      count: control.get('count')?.value || 0,
    }));

    array.clear();

    selectedIds?.forEach((id) => {
      const existing = (existingData || currentControls).find((c) => c.typeId === id);
      array.push(
        this.fb.group({
          typeId: [id],
          price: [existing?.price || 0],
          count: [existing?.count || 0],
        })
      );
    });

    array.updateValueAndValidity();
  }

  // Удаление материала
  removeMaterial(materialIndex: number) {
    const selectedMaterials = this.combineMaterialForm.get('materials')?.value || [];
    const materialGroup = this.getMaterialsArray().at(materialIndex) as FormGroup;
    const materialId = materialGroup.get('materialId')?.value;

    // Просто обновляем выбранные материалы - updateMaterialsArray сделает остальное
    const updatedSelection = selectedMaterials.filter((id: number) => id !== materialId);
    this.combineMaterialForm.get('materials')?.setValue(updatedSelection);
  }



  ngOnInit(): void {
    // Для операций
    this.store.select(selectTypeSteps).subscribe((data) => {
      this.operationsForSelect = data;
      // При изменении операций очищаем кэш
      this.materialOperations = {};
    });
    this.store.select(selectAllSteps).subscribe((data) => (this.allOperations = data || []));

    // Для материалов
    this.store.select(selectMaterial).subscribe((materials) => {
      this.materials = materials || [];
    });
    this.store.select(selectAllMaterials).subscribe((materials) => (this.allMaterials = materials || []));

    this.combineMaterial$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.combineMaterialForm.patchValue({
          name: item.name,
          materials: [...new Set(item.materials?.map(m => m.materialId))] || [], // Уникальные materialId
          active: item.active,
          comment: item.comment,
        });

        // Восстанавливаем данные материалов и операций
        if (item.materials) {
          // Группируем материалы по materialId
          const materialsByType = item.materials.reduce((acc, material) => {
            if (!acc[material.materialId]) {
              acc[material.materialId] = [];
            }
            acc[material.materialId].push(material);
            return acc;
          }, {} as { [key: number]: any[] });

          // Создаем existingData для каждого materialId
          const existingData = Object.entries(materialsByType).map(([materialId, materials]) => {
            const instancesData = materials.map(material => ({
              selectedOperations: material.operations?.map(op => op.typeId) || [],
              operationsArray: material.operations || []
            }));

            return {
              materialId: Number(materialId),
              instancesData: instancesData
            };
          });

          const selectedIds = Object.keys(materialsByType).map(id => Number(id));
          this.updateMaterialsArray(selectedIds, existingData);
        }
      } else {
        this.combineMaterialForm.reset({ active: true });
        this.getMaterialsArray().clear();
        this.materialOperations = {};
      }
    });

    // Подписка на изменения выбранных материалов
    this.combineMaterialForm.get('materials')?.valueChanges.subscribe((selected: number[]) => {

      // Безопасно собираем текущие данные
      const currentArray = this.getMaterialsArray().controls.map((control, index) => {
        const materialId = control.get('materialId')?.value;
        const instancesArray = control.get('instancesArray') as FormArray;

        if (!materialId || !instancesArray) return null;

        const instancesData = instancesArray.controls.map((instanceControl, instanceIndex) => {
          const selectedOperations = instanceControl.get('selectedOperations')?.value || [];

          // Безопасно получаем operationsArray
          const operationsArray = this.getInstanceOperationsArray(index, instanceIndex);
          const operationsValue = operationsArray ? operationsArray.value : [];

          return {
            selectedOperations: selectedOperations,
            operationsArray: operationsValue
          };
        });

        return {
          materialId: materialId,
          instancesData: instancesData
        };
      }).filter(Boolean);

      this.updateMaterialsArray(selected, currentArray);
    });

    this.actions$
      .pipe(ofType(CombineMaterialActions.createCombineMaterialSuccess))
      .subscribe(() => {
        this.combineMaterialForm.reset({ active: true });
        this.getMaterialsArray().clear();
        this.materialOperations = {};
      });

    this.actions$
      .pipe(ofType(CombineMaterialActions.updateCombineMaterialSuccess))
      .subscribe(() => {
        this.combineMaterialForm.reset({ active: true });
        this.getMaterialsArray().clear();
        this.materialOperations = {};
        this.router.navigate([], { queryParams: { edit: true } });
      });

    this.actions$
      .pipe(ofType(CombineMaterialActions.deleteCombineMaterialSuccess))
      .subscribe(() => {
        this.router.navigate([], { queryParams: { edit: true } });
      });
  }

  submit() {
    const formValue = this.combineMaterialForm.value;

    // Собираем материалы только из существующих FormArray
    const materialsData = this.getMaterialsArray().controls.flatMap((materialControl, materialIndex) => {
      const materialId = materialControl.get('materialId')?.value;
      const instancesArray = materialControl.get('instancesArray') as FormArray;

      if (!materialId || !instancesArray) return [];

      return instancesArray.controls.map((instanceGroup, instanceIndex) => {
        const operationsArray = (instanceGroup as FormGroup).get('operationsArray') as FormArray;

        if (!operationsArray) return null;

        const operations = operationsArray.controls.map(operationControl => {
          const typeId = operationControl.get('typeId')?.value;
          const price = operationControl.get('price')?.value;
          const count = operationControl.get('count')?.value;

          if (typeId === null || price === null || count === null) {
            return null;
          }

          return {
            type: this.getOperationLabel(typeId),
            typeId: Number(typeId),
            price: Number(price),
            count: Number(count),
          };
        }).filter(Boolean);

        return {
          materialId: Number(materialId),
          operations: operations
        };
      }).filter(Boolean);
    });

    const combineMaterial: ICombineMaterial = {
      name: formValue.name,
      materials: materialsData,
      active: formValue.active,
      comment: formValue.comment,
    };

    if (!this.isCreate && this.combineMaterial$.value?.id) {
      combineMaterial.id = this.combineMaterial$.value.id;
      this.store.dispatch(CombineMaterialActions.updateCombineMaterial({ combineMaterial }));
    } else {
      this.store.dispatch(CombineMaterialActions.createCombineMaterial({ combineMaterial }));
    }
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  delete() {
    const combineMaterial = this.combineMaterial$.value;
    if (combineMaterial) {
      this.store.dispatch(
        CombineMaterialActions.deleteCombineMaterial({ id: combineMaterial.id! }),
      );
      this.isOpenDelete = false;
    }
  }
}
