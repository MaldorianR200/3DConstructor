import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IMaterial, MaterialActions } from 'src/entities/Material';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderSingleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import { selectTypesFurniture } from '../../../../entities/Furniture/model/store/furniture.selectors';
import { selectTypeMaterial } from '../../../../entities/Material/model/store/material.selectors';

interface TypeOption {
  value: number;
  label: string;
  texture: boolean;
}

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    AdminImagesLoaderSingleComponent,
  ],
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
})
export class MaterialFormComponent implements OnInit {
  @Input() material$: BehaviorSubject<IMaterial | null> = new BehaviorSubject<IMaterial | null>(null);
  isCreate = false;
  isOpenDelete = false;
  materialForm: FormGroup;

  types: TypeOption[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.materialForm = this.fb.group({
      typeId: new FormControl(),
      name: new FormControl(),
      price: new FormControl(),
      length: new FormControl(),
      width: new FormControl(),
      pricePerM2: new FormControl(),
      active: new FormControl(),
      texture: new FormControl(),
      comment: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.store.select(selectTypeMaterial).subscribe((types) => {
      this.types = types || [];
    });

    this.material$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.materialForm.patchValue({
          name: item.name,
          typeId: item.typeId,
          length: Number(item.length),
          // price: item.price, <-- УБИРАЕМ, так как это теперь цена за м2, а не за лист
          pricePerM2: item.price, // <-- ЗАПИСЫВАЕМ пришедшую цену в поле м2
          width: Number(item.width),
          active: item.active,
          texture: item.texture,
          comment: item.comment || '',
        });

        // ВМЕСТО updatePricePerM2() вызываем обратный пересчет:
        // На основе загруженных Length, Width и PricePerM2 высчитываем цену за Лист для UI
        this.updatePriceFromPerM2();
      } else {
        this.materialForm.reset({
          active: true
        });
      }
    });

    // ... подписки на valueChanges остаются без изменений ...
    // Они обеспечат пересчет в обе стороны при вводе данных пользователем
    this.materialForm.get('price')!.valueChanges.subscribe(() => this.updatePricePerM2());
    this.materialForm.get('length')!.valueChanges.subscribe(() => this.updatePricePerM2());
    this.materialForm.get('width')!.valueChanges.subscribe(() => this.updatePricePerM2());
    this.materialForm.get('pricePerM2')!.valueChanges.subscribe(() => this.updatePriceFromPerM2());

    // === Обработка экшенов ===
    this.actions$.pipe(ofType(MaterialActions.createMaterialSuccess)).subscribe(() => this.materialForm.reset({
      active: true
    }));
    this.actions$.pipe(ofType(MaterialActions.updateMaterialSuccess)).subscribe(() => {
      this.materialForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(MaterialActions.deleteMaterialSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    if (this.isCreate) this.create();
    else this.update();
  }

  get hasTexture(): boolean {
    const selectedType = this.materialForm.get('typeId')?.value;
    if (!selectedType) return false;
    const type = this.types.find(t => t.value === selectedType);
    return type?.texture;
  }

  create() {
    const formValue = this.materialForm.value;
    // Извлекаем price (цена за лист, она нам на бэке не нужна) и pricePerM2
    const { price, pricePerM2, ...rest } = formValue;

    // Формируем объект для отправки
    const material: any = {
      ...rest,
      price: pricePerM2, // <-- Теперь в поле price отправляем цену за м2
    };

    material.comment = material.comment || '';
    material.texture = material.texture
      ? {
        id: material.texture.id ?? undefined,
        file: material.texture.file ?? undefined,
        displayOrder: material.texture.displayOrder ?? 0,
      }
      : null;

    this.store.dispatch(MaterialActions.createMaterial({ material }));
  }

  update() {
    const formValue = this.materialForm.value;
    // Аналогично извлекаем старую цену за лист и цену за м2
    const { price, pricePerM2, ...rest } = formValue;

    const material: any = {
      ...rest,
      price: pricePerM2, // <-- Отправляем цену за м2
      id: this.material$.value?.id
    };

    material.comment = material.comment || '';
    material.texture = material.texture
      ? {
        id: material.texture.id ?? undefined,
        file: material.texture.file ?? undefined,
        displayOrder: material.texture.displayOrder ?? 0,
      }
      : null;

    this.store.dispatch(MaterialActions.updateMaterial({ material }));
  }

  delete() {
    const material = this.material$.value;
    if (material) {
      this.store.dispatch(MaterialActions.deleteMaterial({ id: material.id! }));
      this.isOpenDelete = false;
    }
  }

  // ===== Пересчёт полей =====
  calculateArea(): number {
    const length = this.materialForm.get('length')!.value || 0;
    const width = this.materialForm.get('width')!.value || 0;
    return (length/1000) * (width/1000);
  }

  updatePricePerM2() {
    const price = this.materialForm.get('price')!.value || 0;
    const area = this.calculateArea();

    if (area > 0) {
      const newPricePerM2 = price / area;
      this.materialForm.get('pricePerM2')!.setValue(Number(newPricePerM2.toFixed(5)), { emitEvent: false });
    } else {
      this.materialForm.get('pricePerM2')!.setValue(0, { emitEvent: false });
    }
  }

  updatePriceFromPerM2() {
    const pricePerM2 = this.materialForm.get('pricePerM2')!.value || 0;
    const area = this.calculateArea();

    const newPrice = pricePerM2 * area;
    this.materialForm.get('price')!.setValue(Number(newPrice.toFixed(2)), { emitEvent: false });
  }
}
