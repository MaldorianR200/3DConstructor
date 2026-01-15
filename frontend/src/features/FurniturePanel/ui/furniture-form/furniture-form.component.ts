import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IFurniture, FurnitureActions } from 'src/entities/Furniture';
import {
  AdminButtonComponent, AdminFileLoaderMultipleComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import { selectTypesFurniture } from 'src/entities/Furniture/model/store/furniture.selectors';
import { IFile } from "../../../../entities/Image/model/types";

interface TypeOption {
  value: number;
  label: string;
}

interface IMeasurement {
  startX: number;
  startY: number;
  cornerX: number; // Точка пересечения катетов (угол)
  endX: number;
  endY: number;
  valX: number; // Значение смещения X
  valY: number; // Значение смещения Y
  dist: string; // Длина гипотенузы (строка)
  midX: number; // Середина для подписи X
  midY: number; // Середина для подписи Y
  midHypX: number; // Середина гипотенузы X
  midHypY: number; // Середина гипотенузы Y
}

// Интерфейс для точки на карте
interface IPoint {
  x: number;
  y: number;
  label: number | string;
}

@Component({
  selector: 'app-furniture-form',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    AdminFileLoaderMultipleComponent,
    FormsModule,
  ],
  templateUrl: './furniture-form.component.html',
  styleUrl: './furniture-form.component.scss',
})
export class FurnitureFormComponent implements OnInit {
  @Input() furniture$: BehaviorSubject<IFurniture | null> = new BehaviorSubject<IFurniture | null>(
    null,
  );

  furnitureForm: FormGroup;
  isCreate = false;
  isOpenDelete = false;
  isHandleType = false;
  optionsLoaded = false;

  zoomScale: number = 1;

  viewSettings = {
    showLabels: true, // Номера точек (#1, #2)
    showDistance: true, // Прямая (гипотенуза)
    showCoordValues: true, // Цифры смещений (X, Y)
    showCoordLines: true, // Пунктирные линии
    textScale: 1.0, // Множитель размера текста
  };

  types: TypeOption[] = [];

  type_handle = [
    { value: 'OVERHEAD_HANDLE', label: 'Накладная' },
    { value: 'END_HANDLE', label: 'Торцевая' },
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.furnitureForm = this.fb.group({
      typeId: new FormControl(null),
      name: new FormControl(''),
      price: new FormControl(0),
      typeHandle: new FormControl(''),
      indentHandle: new FormControl(0),
      changeIndent: new FormControl(false),
      bracings: this.fb.array([]),
      active: new FormControl(true),
      comment: new FormControl(''),
      obj: new FormControl<IFile[] | null>([]),
    });
  }

  // --- Методы для работы с отверстиями (Bracings) ---

  get bracingsArray(): FormArray {
    return this.furnitureForm.get('bracings') as FormArray;
  }

  textSizeUp() {
    this.viewSettings.textScale = Math.min(this.viewSettings.textScale + 0.1, 5.0);
  }

  textSizeDown() {
    this.viewSettings.textScale = Math.max(this.viewSettings.textScale - 0.1, 0.1);
  }

  // Методы "Показать всё" / "Скрыть всё"
  showAllLayers() {
    this.viewSettings.showLabels = true;
    this.viewSettings.showDistance = true;
    this.viewSettings.showCoordValues = true;
    this.viewSettings.showCoordLines = true;
  }

  hideAllLayers() {
    this.viewSettings.showLabels = false;
    this.viewSettings.showDistance = false;
    this.viewSettings.showCoordValues = false;
    this.viewSettings.showCoordLines = false;
  }

  // !!! НОВАЯ ЛОГИКА ВИЗУАЛИЗАЦИИ !!!

  // 1. Вычисляем абсолютные координаты точек для рисования
  get calculatedPoints(): IPoint[] {
    const rawPoints = this.bracingsArray.value;
    const points: IPoint[] = [];

    // Начальная точка (0,0) - точка отсчета (опционально, можно не рисовать)
    let currentX = 0;
    let currentY = 0;

    // Добавляем точку старта
    points.push({ x: 0, y: 0, label: 'Start' });

    rawPoints.forEach((p: any, index: number) => {
      // Суммируем, так как координаты относительные
      currentX += Number(p.x || 0);
      currentY += Number(p.y || 0); // SVG ось Y идет вниз. Если у вас вверх - тут можно ставить минус

      points.push({
        x: currentX,
        y: currentY,
        label: index + 1,
      });
    });

    return points;
  }

  get bracingPath(): string {
    const points = this.calculatedPoints;
    if (!points || points.length === 0) return '';
    const start = `M ${points[0].x} ${points[0].y}`;
    const lines = points
      .slice(1)
      .map((p) => ` L ${p.x} ${p.y}`)
      .join('');
    return start + lines;
  }
  get measurements(): IMeasurement[] {
    const rawPoints = this.bracingsArray.value; // Берем "сырые" смещения
    const measurements: IMeasurement[] = [];

    let currentAbsX = 0;
    let currentAbsY = 0;

    // ВАЖНО: Мы итерируемся по сырым данным (смещениям)
    // rawPoints[i] соответствует переходу от точки i к i+1 (в массиве calculatedPoints)
    rawPoints.forEach((p: any) => {
      const dx = Number(p.x || 0);
      const dy = Number(p.y || 0);

      const prevX = currentAbsX;
      const prevY = currentAbsY;

      // Обновляем текущие абсолютные координаты
      currentAbsX += dx;
      currentAbsY += dy;

      // Рассчитываем длину прямой линии
      const dist = Math.sqrt(dx * dx + dy * dy).toFixed(1);

      measurements.push({
        startX: prevX,
        startY: prevY,
        cornerX: currentAbsX, // Двигаемся сначала по X, потом по Y. Угол будет тут.
        endX: currentAbsX,
        endY: currentAbsY,
        valX: dx,
        valY: dy,
        dist: dist,
        // Координаты для подписей
        midX: prevX + dx / 2, // Середина горизонтальной линии
        midY: prevY - 5, // Чуть выше линии (для горизонтали используется startY)
        midHypX: prevX + dx / 2,
        midHypY: prevY + dy / 2,
      });
    });

    return measurements;
  }

  calcDistance(x: any, y: any): string {
    const numX = Number(x || 0);
    const numY = Number(y || 0);
    return Math.sqrt(numX * numX + numY * numY).toFixed(1);
  }
  // 2. Вычисляем viewBox для SVG, чтобы все точки влезли и были по центру
  get svgViewBox(): string {
    const points = this.calculatedPoints;

    // Базовые размеры, если точек нет
    if (points.length === 0) return '0 0 100 100';

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Базовый отступ
    const padding = 50;

    // Вычисляем реальные размеры контента
    let contentWidth = maxX - minX + padding * 2;
    let contentHeight = maxY - minY + padding * 2;

    // Защита от нулевых размеров
    if (contentWidth === 0) contentWidth = 200;
    if (contentHeight === 0) contentHeight = 200;

    // Центр контента
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    // !!! ПРИМЕНЕНИЕ ЗУМА !!!
    // Чтобы приблизить (zoom > 1), мы должны УМЕНЬШИТЬ viewBox.
    // Чтобы отдалить (zoom < 1), мы должны УВЕЛИЧИТЬ viewBox.
    const viewWidth = contentWidth / this.zoomScale;
    const viewHeight = contentHeight / this.zoomScale;

    // Вычисляем координаты левого верхнего угла viewBox так, чтобы центр остался на месте
    const viewX = centerX - viewWidth / 2;
    const viewY = centerY - viewHeight / 2;

    return `${viewX} ${viewY} ${viewWidth} ${viewHeight}`;
  }

  // 3. Методы управления зумом
  zoomIn() {
    this.zoomScale = Math.min(this.zoomScale * 1.2, 5); // Максимум 5x
  }

  zoomOut() {
    this.zoomScale = Math.max(this.zoomScale / 1.2, 0.2); // Минимум 0.2x
  }

  // Сброс зума (опционально, удобно при очистке формы)
  resetZoom() {
    this.zoomScale = 1;
  }

  // --- Конец логики визуализации ---

  addBracing() {
    const order = this.bracingsArray.length;
    const bracingGroup = this.fb.group({
      x: [0],
      y: [0],
      order: [order],
    });
    this.bracingsArray.push(bracingGroup);
  }

  removeBracing(index: number) {
    this.bracingsArray.removeAt(index);
  }

  clearBracings() {
    while (this.bracingsArray.length !== 0) {
      this.bracingsArray.removeAt(0);
    }
    this.resetZoom(); // Сбрасываем зум при очистке
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    const raw = this.furnitureForm.value;

    let objValue: IFile[] = [];

    if (Array.isArray(raw.obj)) {
      objValue = raw.obj.map((item, index) => ({
        id: item.id ?? null,
        file: item.file ?? null,
        displayOrder: item.displayOrder ?? index,
        path: item.path ?? null,
      }));
    }

    const bracingsValue = raw.bracings.map((b: any, index: number) => ({
      x: Number(b.x),
      y: Number(b.y),
      order: index,
    }));

    const furniture: IFurniture = {
      ...raw,
      price: parseFloat(raw.price),
      bracings: bracingsValue,
      obj: objValue,
    };

    if (this.isCreate) {
      this.store.dispatch(FurnitureActions.createFurniture({ furniture }));
    } else {
      furniture.id = this.furniture$.value?.id;
      this.store.dispatch(FurnitureActions.updateFurniture({ furniture }));
    }
  }

  delete() {
    const furniture = this.furniture$.value;
    if (furniture) {
      this.store.dispatch(FurnitureActions.deleteFurniture({ id: furniture.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.furniture$.subscribe((furniture) => {
      this.isCreate = !furniture;

      const fur = this.furniture$.value;
      this.store.select(selectTypesFurniture).subscribe((types) => {
        this.types = types || [];

        if (fur) {
          this.furnitureForm.patchValue(
            {
              typeId: fur.typeId,
            },
            { emitEvent: false },
          );

          const selectedType = this.types.find((t) => t.value === fur.typeId);
          this.isHandleType = !!selectedType && selectedType.label === 'Ручка';
        }
      });

      this.clearBracings();

      if (furniture) {
        this.furnitureForm.patchValue({
          name: furniture.name,
          price: furniture.price,
          typeHandle: furniture.typeHandle,
          indentHandle: furniture.indentHandle,
          changeIndent: furniture.changeIndent ?? false,
          active: furniture.active ?? true,
          comment: furniture.comment,
          obj: furniture.obj || null,
        });

        if (furniture.bracings && Array.isArray(furniture.bracings)) {
          const sortedBracings = [...furniture.bracings].sort((a, b) => a.order - b.order);

          sortedBracings.forEach((bracing) => {
            this.bracingsArray.push(
              this.fb.group({
                x: [bracing.x],
                y: [bracing.y],
                order: [bracing.order],
              }),
            );
          });
        }
      } else {
        this.furnitureForm.reset({ active: true });
        this.clearBracings();
      }

      this.cdr.detectChanges();
    });

    this.furnitureForm.get('typeId')?.valueChanges.subscribe((selectedValue) => {
      const selectedType = this.types.find((t) => t.value === selectedValue);
      this.isHandleType = !!selectedType && selectedType.label === 'Ручка';
      if (!this.isHandleType) {
        this.clearBracings();
      }
      this.cdr.detectChanges();
    });

    // Добавлена очистка при смене типа ручки
    this.furnitureForm.get('typeHandle')?.valueChanges.subscribe((value) => {
      if (value !== 'OVERHEAD_HANDLE') {
        this.clearBracings();
      }
    });

    this.actions$.pipe(ofType(FurnitureActions.createFurnitureSuccess)).subscribe(() => {
      this.furnitureForm.reset({ active: true });
      this.clearBracings();
    });

    this.actions$.pipe(ofType(FurnitureActions.updateFurnitureSuccess)).subscribe(() => {
      this.furnitureForm.reset({ active: true });
      this.clearBracings();
      this.router.navigate([], { queryParams: { edit: true } });
    });

    this.actions$.pipe(ofType(FurnitureActions.deleteFurnitureSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
