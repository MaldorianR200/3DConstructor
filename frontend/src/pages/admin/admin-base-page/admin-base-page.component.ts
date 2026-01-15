import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map, firstValueFrom, BehaviorSubject, combineLatest } from 'rxjs';

// Селекторы
import { selectAllMaterials } from '../../../entities/Material/model/store/material.selectors';
import { selectAllFastenerss } from '../../../entities/Fasteners/model/store/fasteners.selectors';
import { selectAllFurnitures } from '../../../entities/Furniture/model/store/furniture.selectors';
import { selectAllActionsss } from '../../../entities/Actionss/model/store/actionss.selectors';
import { selectAllSeriess } from '../../../entities/Series/model/store/series.selectors';
import { selectAllColors } from '../../../entities/Color/model/store/color.selectors';
import { selectAllTypess } from '../../../entities/Types/model/store/types.selectors';
import { selectAllMillings } from '../../../entities/Milling/model/store/milling.selectors';
import { selectAllSteps } from '../../../entities/Milling/model/store/milling.selectors';
import { selectAllCombineMaterials } from '../../../entities/CombineMaterial/model/store/combineMaterial.selectors';
import { selectMaterialOptions, selectTypeNameById } from '../../../entities/Specification/model/store/specification.selectors';

// Действия
import { updateMaterial } from 'src/entities/Material/model/store/material.actions';
import { updateFasteners } from 'src/entities/Fasteners/model/store/fasteners.actions';
import { updateFurniture } from 'src/entities/Furniture/model/store/furniture.actions';
import { updateActionss } from 'src/entities/Actionss/model/store/actionss.actions';
import { updateColor } from 'src/entities/Color/model/store/color.actions';
import { updateTypes } from 'src/entities/Types/model/store/types.actions';
import { updateSeries } from 'src/entities/Series/model/store/series.actions';
import { updateMilling } from 'src/entities/Milling/model/store/milling.actions';
import { updateCombineMaterial } from 'src/entities/CombineMaterial/model/store/combineMaterial.actions';

// Интерфейсы
import { IMaterial } from '../../../entities/Material';
import { IFasteners } from '../../../entities/Fasteners';
import { IFurniture } from '../../../entities/Furniture';
import { IActionss } from '../../../entities/Actionss';
import { IMilling } from '../../../entities/Milling';
import { IImage } from '../../../entities/Image';
import { ITypes } from '../../../entities/Types';
import { ICombineMaterial } from '../../../entities/CombineMaterial';

export interface BaseRow {
  id: number;
  name?: string;
  price?: number;
  realPrice?: number;
  active?: boolean;
  comment?: string;
  length?: number;
  width?: number;
  type?: string;
  typeId?: number;
  texture?: IImage;
  type_handle?: string;
  indent_handle?: number;
  typeCategoryId?: number;
  file?: File;
  colorCategoryId?: number;
  hex?: string;
  steps?: Array<{
    typeStepId: number;
    price: number;
    count: number;
    stepName?: string;
  }>;
  totalCost?: number;
  expanded?: boolean;
  materials?: Array<{
    materialId: number;
    materialName?: string;
    operations?: Array<{
      typeId: number;
      price: number;
      count: number;
      typeName?: string;
    }>;
  }>;
}

type Entity = IMaterial | IFasteners | IFurniture | IMilling | ICombineMaterial | BaseRow;

@Component({
  selector: 'app-admin-base-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-base-page.component.html',
  styleUrls: ['./admin-base-page.component.scss'],
})
export class AdminBasePageComponent {
  // Observable для данных
  materials$: Observable<BaseRow[]>;
  fasteners$: Observable<BaseRow[]>;
  furniture$: Observable<BaseRow[]>;
  actionss$: Observable<BaseRow[]>;
  series$: Observable<BaseRow[]>;
  types$: Observable<BaseRow[]>;
  colors$: Observable<BaseRow[]>;
  millings$: Observable<BaseRow[]>;
  combineMaterials$: Observable<BaseRow[]>;
  allSteps$: Observable<ITypes[]>;
  allTypes$: Observable<ITypes[]>;
  materialOptions$: Observable<any[]>;

  // Filtered Observable
  filteredMaterials$: Observable<BaseRow[]>;
  filteredFasteners$: Observable<BaseRow[]>;
  filteredFurniture$: Observable<BaseRow[]>;
  filteredActionss$: Observable<BaseRow[]>;
  filteredSeries$: Observable<BaseRow[]>;
  filteredTypes$: Observable<BaseRow[]>;
  filteredColors$: Observable<BaseRow[]>;
  filteredMillings$: Observable<BaseRow[]>;
  filteredCombineMaterials$: Observable<BaseRow[]>;

  // Search terms
  materialSearchTerm = '';
  fastenerSearchTerm = '';
  furnitureSearchTerm = '';
  actionSearchTerm = '';
  seriesSearchTerm = '';
  typeSearchTerm = '';
  colorSearchTerm = '';
  millingSearchTerm = '';
  combineMaterialSearchTerm = '';

  // Search subjects
  private materialSearchTermSubject = new BehaviorSubject<string>('');
  private fastenerSearchTermSubject = new BehaviorSubject<string>('');
  private furnitureSearchTermSubject = new BehaviorSubject<string>('');
  private actionSearchTermSubject = new BehaviorSubject<string>('');
  private seriesSearchTermSubject = new BehaviorSubject<string>('');
  private typeSearchTermSubject = new BehaviorSubject<string>('');
  private colorSearchTermSubject = new BehaviorSubject<string>('');
  private millingSearchTermSubject = new BehaviorSubject<string>('');
  private combineMaterialSearchTermSubject = new BehaviorSubject<string>('');

  changedEntities: Record<string, Record<string | number, Partial<BaseRow>>> = {
    Material: {},
    Fasteners: {},
    Furniture: {},
    Actionss: {},
    Series: {},
    Types: {},
    Color: {},
    Milling: {},
    CombineMaterial: {},
  };

  // Кэши для производительности
  private stepNamesCache = new Map<number, string>();
  private typeNamesCache = new Map<number, string>();
  private materialNamesCache = new Map<number, string>();

  constructor(private store: Store) {
    // Загружаем вспомогательные данные
    this.allSteps$ = this.store.select(selectAllSteps);
    this.allTypes$ = this.store.select(selectAllTypess);
    this.materialOptions$ = this.store.select(selectMaterialOptions);

    // Инициализируем кэши
    this.allSteps$.subscribe(steps => {
      steps.forEach(step => {
        if (step.id) {
          this.stepNamesCache.set(step.id, step.name);
        }
      });
    });

    this.allTypes$.subscribe(types => {
      types.forEach(type => {
        if (type.id) {
          this.typeNamesCache.set(type.id, type.name);
        }
      });
    });

    this.materialOptions$.subscribe(materials => {
      materials.forEach(material => {
        this.materialNamesCache.set(material.value, material.label);
      });
    });

    const normalize = (item: any): BaseRow => {
      // Вычисляем общую стоимость для фрезеровок
      const calculateMillingCost = (steps: Array<{price: number, count: number}> = []) => {
        return steps.reduce((total, step) => total + (step.price * step.count), 0);
      };

      // Вычисляем общую стоимость для комбинированных материалов
      const calculateCombineMaterialCost = (materials: any[] = []) => {
        return materials.reduce((total, material) => {
          const materialCost = material.operations?.reduce((opTotal: number, op: any) =>
            opTotal + (op.price * op.count), 0) || 0;
          return total + materialCost;
        }, 0);
      };

      // Добавляем названия шагов к фрезеровкам
      let stepsWithNames = item.steps;
      if (item.steps && Array.isArray(item.steps)) {
        stepsWithNames = item.steps.map((step: any) => ({
          ...step,
          stepName: this.getStepName(step.typeStepId)
        }));
      }





      // Обрабатываем комбинированные материалы
      let materialsWithNames = item.materials;
      if (item.materials && Array.isArray(item.materials)) {
        materialsWithNames = item.materials.map((material: any) => ({
          ...material,
          materialName: this.getMaterialName(material.materialId),
          operations: material.operations?.map((op: any) => ({
            ...op,
            typeName: this.getTypeName(op.typeId)
          })) || []
        }));
      }

      const isCombineMaterial = item.materials && Array.isArray(item.materials);
      const totalCost = isCombineMaterial
        ? calculateCombineMaterialCost(item.materials)
        : (item.steps ? calculateMillingCost(item.steps) : item.price);

      const hasDimensions = item.length && item.width;
      let displayPrice = item.price ?? totalCost;
      const realPrice = item.price ?? totalCost;
      if (hasDimensions) {
        // Переводим мм в метры и считаем площадь
        const area = (item.length / 1000) * (item.width / 1000);
        if (area > 0) {
          // Конвертируем цену м2 -> цена лист
          // Округляем до 3 знаков для красоты, но можно и точнее
          displayPrice = Number((realPrice * area).toFixed(3));
        }
      }

      return {
        id: item.id,
        type: item.type, // Оригинальное английское значение
        typeId: item.typeId ?? undefined,
        typeCategoryId: item.typeCategoryId ?? undefined,
        width: item.width ?? undefined,
        length: item.length ?? undefined,
        texture: item.texture ?? null,
        name: item.name,
        price: displayPrice, // <-- Показываем цену за лист (если есть размеры)
        realPrice: realPrice, // <-- Храним цену за м2 для отправки
        active: item.active,
        comment: item.comment ?? undefined,
        hex: item.hex ?? undefined,
        colorCategoryId: item.colorCategoryId ?? undefined,
        steps: stepsWithNames ?? undefined,
        materials: materialsWithNames ?? undefined,
        totalCost: totalCost ?? undefined,
        expanded: false
      };
    };

    const sortItems = (items: BaseRow[]): BaseRow[] => {
      return items.sort((a, b) => {
        if (a.type && b.type) {
          const typeCompare = a.type.localeCompare(b.type);
          if (typeCompare !== 0) return typeCompare;
        }
        return a.name?.localeCompare(b.name || '') || 0;
      });
    };

    const filterItems = (items: BaseRow[], searchTerm: string): BaseRow[] => {
      if (!searchTerm) return items;
      return items.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    // Инициализация Observable
    this.materials$ = this.store.select(selectAllMaterials).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.fasteners$ = this.store.select(selectAllFastenerss).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.furniture$ = this.store.select(selectAllFurnitures).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.actionss$ = this.store.select(selectAllActionsss).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.series$ = this.store.select(selectAllSeriess).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.types$ = this.store.select(selectAllTypess).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.colors$ = this.store.select(selectAllColors).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.millings$ = this.store.select(selectAllMillings).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    this.combineMaterials$ = this.store.select(selectAllCombineMaterials).pipe(
      map((items) => items.map(normalize)),
      map((items) => sortItems(items)),
    );

    // Filtered Observable
    this.filteredMaterials$ = combineLatest([this.materials$, this.materialSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredFasteners$ = combineLatest([this.fasteners$, this.fastenerSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredFurniture$ = combineLatest([this.furniture$, this.furnitureSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredActionss$ = combineLatest([this.actionss$, this.actionSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredSeries$ = combineLatest([this.series$, this.seriesSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredTypes$ = combineLatest([this.types$, this.typeSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredColors$ = combineLatest([this.colors$, this.colorSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredMillings$ = combineLatest([this.millings$, this.millingSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );

    this.filteredCombineMaterials$ = combineLatest([this.combineMaterials$, this.combineMaterialSearchTermSubject]).pipe(
      map(([items, searchTerm]) => filterItems(items, searchTerm)),
    );
  }

  // Вспомогательные методы для получения названий
  private getStepName(stepId: number): string {
    return this.stepNamesCache.get(stepId) || `Шаг ${stepId}`;
  }

  translateType(type: string | undefined): string {
    if (!type) return '';

    const translateMap: Record<string, string> = {
      'OPERATION': 'Операция',
      'SERVICE': 'Услуга',
    };

    return translateMap[type.toUpperCase()] || type;
  }

  private getTypeName(typeId: number): string {
    return this.typeNamesCache.get(typeId) || `Тип ${typeId}`;
  }

  private getMaterialName(materialId: number): string {
    return this.materialNamesCache.get(materialId) || `Материал ${materialId}`;
  }

  // Методы для развертывания/свертывания
  toggleMillingExpansion(milling: BaseRow): void {
    milling.expanded = !milling.expanded;
  }

  toggleCombineMaterialExpansion(combineMaterial: BaseRow): void {
    combineMaterial.expanded = !combineMaterial.expanded;
  }

  // Методы для изменения данных
  onStepPriceChange(milling: BaseRow, stepIndex: number, newPrice: number): void {
    if (!milling.steps || !milling.steps[stepIndex]) return;

    milling.steps[stepIndex].price = newPrice;
    milling.totalCost = milling.steps.reduce((total, step) => total + (step.price * step.count), 0);

    this.changedEntities['Milling'][milling.id] = {
      ...(this.changedEntities['Milling'][milling.id] ?? {}),
      steps: [...milling.steps]
    };
  }

  onStepCountChange(milling: BaseRow, stepIndex: number, newCount: number): void {
    if (!milling.steps || !milling.steps[stepIndex]) return;

    milling.steps[stepIndex].count = newCount;
    milling.totalCost = milling.steps.reduce((total, step) => total + (step.price * step.count), 0);

    this.changedEntities['Milling'][milling.id] = {
      ...(this.changedEntities['Milling'][milling.id] ?? {}),
      steps: [...milling.steps]
    };
  }

  getMaterialTotalCost(material: any): number {
    if (!material.operations || !Array.isArray(material.operations)) {
      return 0;
    }
    return material.operations.reduce((total: number, op: any) => total + (op.price * op.count), 0);
  }

  // Методы для комбинированных материалов
  onOperationPriceChange(combineMaterial: BaseRow, materialIndex: number, operationIndex: number, newPrice: number): void {
    if (!combineMaterial.materials || !combineMaterial.materials[materialIndex]?.operations?.[operationIndex]) return;

    combineMaterial.materials[materialIndex].operations[operationIndex].price = newPrice;
    this.updateCombineMaterialTotalCost(combineMaterial);

    this.changedEntities['CombineMaterial'][combineMaterial.id] = {
      ...(this.changedEntities['CombineMaterial'][combineMaterial.id] ?? {}),
      materials: [...combineMaterial.materials]
    };
  }

  onOperationCountChange(combineMaterial: BaseRow, materialIndex: number, operationIndex: number, newCount: number): void {
    if (!combineMaterial.materials || !combineMaterial.materials[materialIndex]?.operations?.[operationIndex]) return;

    combineMaterial.materials[materialIndex].operations[operationIndex].count = newCount;
    this.updateCombineMaterialTotalCost(combineMaterial);

    this.changedEntities['CombineMaterial'][combineMaterial.id] = {
      ...(this.changedEntities['CombineMaterial'][combineMaterial.id] ?? {}),
      materials: [...combineMaterial.materials]
    };
  }

  private updateCombineMaterialTotalCost(combineMaterial: BaseRow): void {
    combineMaterial.totalCost = combineMaterial.materials?.reduce((total, material) => {
      const materialCost = material.operations?.reduce((opTotal, op) =>
        opTotal + (op.price * op.count), 0) || 0;
      return total + materialCost;
    }, 0) || 0;
  }

  // Поиск
  filterMaterials() {
    this.materialSearchTermSubject.next(this.materialSearchTerm);
  }

  filterFasteners() {
    this.fastenerSearchTermSubject.next(this.fastenerSearchTerm);
  }

  filterFurniture() {
    this.furnitureSearchTermSubject.next(this.furnitureSearchTerm);
  }

  filterActions() {
    this.actionSearchTermSubject.next(this.actionSearchTerm);
  }

  filterSeries() {
    this.seriesSearchTermSubject.next(this.seriesSearchTerm);
  }

  filterTypes() {
    this.typeSearchTermSubject.next(this.typeSearchTerm);
  }

  filterColors() {
    this.colorSearchTermSubject.next(this.colorSearchTerm);
  }

  filterMillings() {
    this.millingSearchTermSubject.next(this.millingSearchTerm);
  }

  filterCombineMaterials() {
    this.combineMaterialSearchTermSubject.next(this.combineMaterialSearchTerm);
  }

  // Остальные методы без изменений
  onPriceChange(entity: string, row: BaseRow, newPrice: number) {
    // 1. Обновляем UI модель (чтобы в инпуте было то, что ввел юзер)
    row.price = newPrice;

    let priceToSend = newPrice;

    // 2. Если это Материал с размерами, конвертируем Лист -> М2 для сохранения
    if (entity === 'Material' && row.length && row.width) {
      const area = (row.length / 1000) * (row.width / 1000);
      if (area > 0) {
        // Обратная конвертация: Цена Листа / Площадь = Цена М2
        priceToSend = newPrice / area;
        // Округляем до 5 знаков, чтобы цена за м2 была точной на бэке
        priceToSend = Number(priceToSend.toFixed(5));
      }
    }

    // 3. Записываем в changedEntities уже Цену за М2
    this.changedEntities[entity][row.id] = {
      ...(this.changedEntities[entity][row.id] ?? {}),
      price: priceToSend,
    };
  }

  onActiveToggle(entity: string, row: BaseRow, newActive: boolean) {
    this.changedEntities[entity][row.id] = {
      ...(this.changedEntities[entity][row.id] ?? {}),
      active: newActive,
    };
  }

  onCommentChange(entity: string, row: BaseRow, newComment: string) {
    this.changedEntities[entity][row.id] = {
      ...(this.changedEntities[entity][row.id] ?? {}),
      comment: newComment,
    };
  }

  hasType(rows: any[]): boolean {
    return rows.some((m) => !!m.type);
  }

  hasComment(rows: any[]): boolean {
    return rows.some((m) => !!m.comment);
  }

  hasChanges(entity: string, row: BaseRow): boolean {
    return !!this.changedEntities[entity][row.id];
  }

  async saveAllChanges() {
    const [materials, fasteners, furnitures, actionss, types, series, colors, millings, combineMaterials] = await Promise.all([
      firstValueFrom(this.materials$),
      firstValueFrom(this.fasteners$),
      firstValueFrom(this.furniture$),
      firstValueFrom(this.actionss$),
      firstValueFrom(this.types$),
      firstValueFrom(this.series$),
      firstValueFrom(this.colors$),
      firstValueFrom(this.millings$),
      firstValueFrom(this.combineMaterials$),
    ]);

    const entityMap: Record<string, BaseRow[]> = {
      Material: materials,
      Fasteners: fasteners,
      Furniture: furnitures,
      Actionss: actionss,
      Types: types,
      Color: colors,
      Series: series,
      Milling: millings,
      CombineMaterial: combineMaterials,
    };

    const dispatchMap: Record<string, (payload: any) => void> = {
      Material: (payload) => this.store.dispatch(updateMaterial({ material: payload })),
      Fasteners: (payload) => this.store.dispatch(updateFasteners({ fasteners: payload })),
      Furniture: (payload) => this.store.dispatch(updateFurniture({ furniture: payload })),
      Actionss: (payload) => this.store.dispatch(updateActionss({ actionss: payload })),
      Types: (payload) => this.store.dispatch(updateTypes({ types: payload })),
      Color: (payload) => this.store.dispatch(updateColor({ color: payload })),
      Series: (payload) => this.store.dispatch(updateSeries({ series: payload })),
      Milling: (payload) => this.store.dispatch(updateMilling({ milling: payload })),
      CombineMaterial: (payload) => this.store.dispatch(updateCombineMaterial({ combineMaterial: payload })),
    };

    for (const entityName in this.changedEntities) {
      const changes = this.changedEntities[entityName];
      for (const id in changes) {
        const entityId = Number(id);
        const original = entityMap[entityName].find((e) => e.id === entityId);

        if (!original) continue;

        // ВАЖНЫЙ МОМЕНТ СЛИЯНИЯ
        // original.price содержит Цену за Лист (из normalize).
        // changes[id].price содержит Цену за М2 (если меняли цену) или undefined (если меняли только active).

        // Нам нужно гарантировать, что в updated уйдет Цена за М2.
        const pricePayload = changes[id].price !== undefined
          ? changes[id].price       // Если меняли цену, берем новую (она уже в м2 из onPriceChange)
          : original.realPrice;     // Если не меняли, берем исходную realPrice (м2)

        const updated = {
          ...original,
          ...changes[id],
          price: pricePayload // Явно переписываем поле price
        };

        // Убираем вспомогательное поле realPrice перед отправкой, если нужно (обычно бэк игнорирует лишние поля, но для чистоты можно удалить)
        // @ts-ignore
        delete updated.realPrice;

        dispatchMap[entityName](updated);
      }

      this.changedEntities[entityName] = {};
    }
  }
}
