// section-interaction.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as THREE from 'three';

import { SectionHighlightService } from './SectionHighlightService.service';
import { SceneManagerService } from '../SceneManager.service';
import { SectionManagerService } from './SectionManagerServcice.service';
import {
  DRAVER_MIN_POSITION,
  MIN_DISTANCE_BETWEEN_SHELVES,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  SHELF_POSITION_OFFSET,
  WALL_THICKNESS,
} from '../../сabinet/constants';
import { calculateDrawerElements, DrawerBlock } from '../../сabinet/model/Drawers';
import { PositionCutout } from '../../сabinet/model/Facade';
import { DrawerWarningAction } from '../../сabinet/warnings/drawer-warning-overlay/drawer-warning-overlay.component';
import { Subsection } from '../../сabinet/model/Subsection';
import { ShelfWarningService } from '../warnings/ShelfWarningService.service';
import { BaseCabinet } from '../../сabinet/cabinetTypes/BaseCabinet';
import { CabinetSubType } from 'src/entities/Cabinet/model/types/cabinet.model';

@Injectable({
  providedIn: 'root',
})
export class SectionInteractionService {
  private _selectedSubsection = new BehaviorSubject<Subsection | null>(null);
  public selectedSubsection$ = this._selectedSubsection.asObservable();

  private _selectedSection = new BehaviorSubject<'left' | 'right' | 'center' | null>(null);
  public selectedSection$ = this._selectedSection.asObservable();

  constructor(
    private sceneManagerService: SceneManagerService,
    private sectionManagerService: SectionManagerService,
    private sectionHighlightService: SectionHighlightService,
    private shelfWarningService: ShelfWarningService,
  ) {}

  /**
   * Определяет секцию по клику
   */
  // detectSection(
  //   clickedObject: THREE.Object3D,
  //   intersectionPoint: THREE.Vector3,
  // ): 'left' | 'right' | 'center' | null {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (!cabinet) return null;

  //   // Проверяем, является ли объект полкой или связанным с полкой объектом
  //   if (this.isShelfOrRelatedObject(clickedObject)) {
  //     return null;
  //   }

  //   const hasMullion = cabinet.hasMullion();
  //   const cabinetParams = cabinet.getCabinetParams().dimensions.general;
  //   const cabinetWidth = cabinetParams.width;
  //   const cabinetHeight = cabinetParams.height;

  //   // Проверяем, что клик был внутри границ шкафа
  //   const isInsideCabinet =
  //     Math.abs(intersectionPoint.x) <= cabinetWidth / 2 - WALL_THICKNESS &&
  //     intersectionPoint.y >= PODIUM_HEIGHT &&
  //     intersectionPoint.y <= cabinetHeight - WALL_THICKNESS;

  //   if (!isInsideCabinet) {
  //     return null;
  //   }

  //   // Если нет средника - вся область это одна центральная секция
  //   if (!hasMullion) {
  //     return 'center';
  //   }

  //   // Получаем позицию средника
  //   const mullion = cabinet.getMullion();
  //   const mullionPosition = mullion.position.x;

  //   // Проверяем, в какую секцию попал клик
  //   if (intersectionPoint.x < mullionPosition) {
  //     return 'left';
  //   } else {
  //     return 'right';
  //   }
  // }

  /**
   * Определяет ПОДСЕКЦИЮ по клику
   */
  detectSubsection(
    clickedObject: THREE.Object3D,
    intersectionPoint: THREE.Vector3,
  ): Subsection | null {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return null;

    // 1. Сначала определяем вертикальную секцию (Left/Right/Center)
    // Используем логику, которая была раньше, но выносим в helper
    const sectionType = this.getVerticalSectionType(intersectionPoint);
    if (!sectionType) return null;

    // 2. Получаем все "разделители" в этой секции (полки, ящики)
    const dividers = this.getDividersInSection(sectionType);

    // 3. Добавляем границы шкафа (низ подиума и верх крышки)
    const cabinetHeight = cabinet.getCabinetHeight();
    const podiumHeight = PODIUM_HEIGHT / 2 + WALL_THICKNESS;
    const wallThickness = WALL_THICKNESS;

    // Границы зон (Y координаты):
    // Начинаем с самого низа (над подиумом)
    const boundaries = [podiumHeight];

    // Добавляем позиции всех полок и блоков ящиков
    dividers.forEach((obj) => {
      const box = new THREE.Box3().setFromObject(obj);
      boundaries.push(box.min.y); // Низ объекта
      boundaries.push(box.max.y); // Верх объекта
    });

    // Заканчиваем под крышкой
    boundaries.push(cabinetHeight - wallThickness * 3 - WALL_THICKNESS / 2); // Верх шкафа

    // Сортируем и убираем дубликаты
    const sortedBoundaries = [...new Set(boundaries)].sort((a, b) => a - b);

    // 4. Ищем, в какой интервал попал клик (Y координата)
    const clickY = intersectionPoint.y;

    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
      const bottom = sortedBoundaries[i];
      const top = sortedBoundaries[i + 1];

      // Проверяем попадание, с небольшим допуском
      if (clickY >= bottom && clickY <= top) {
        // Проверяем, что высота зоны достаточна (например, > 50мм)
        // Это исключит клики "внутри" самой полки, если полка толстая,
        // или клики между полками, если они вплотную
        if (top - bottom > 50) {
          return {
            section: sectionType,
            yStart: bottom,
            yEnd: top,
            height: top - bottom,
            yPosition: (top + bottom) / 2,
          };
        }
      }
    }

    return null;
  }

  /**
   * Вспомогательный метод: определяет лево/право/центр
   */
  // private getVerticalSectionType(point: THREE.Vector3): 'left' | 'right' | 'center' | null {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   const hasMullion = cabinet.hasMullion();
  //   const cabinetWidth = cabinet.getCabinetWidth();

  //   // Проверка границ шкафа по X (грубая)
  //   if (Math.abs(point.x) > cabinetWidth / 2) return null;

  //   if (!hasMullion) return 'center';

  //   const mullionX = cabinet.getMullion().position.x;
  //   return point.x < mullionX ? 'left' : 'right';
  // }

  /**
   * Вспомогательный метод: определяет лево/право/центр с учетом высоты средника
   */
  private getVerticalSectionType(point: THREE.Vector3): 'left' | 'right' | 'center' | null {
    const cabinet = this.sceneManagerService.getCabinet();
    const hasMullion = cabinet.hasMullion();
    const cabinetWidth = cabinet.getCabinetWidth();

    if (Math.abs(point.x) > cabinetWidth / 2) return null;

    if (!hasMullion) return 'center';

    const mullion = cabinet.getMullion();

    // ВАЖНО: Получаем реальные границы средника по Y
    const box = new THREE.Box3().setFromObject(mullion);

    // Если клик выше верхнего края средника или ниже нижнего края
    // (с небольшим допуском в 2мм для точности)
    const isOutsideMullionY = point.y > box.max.y + 2 || point.y < box.min.y - 2;

    if (isOutsideMullionY) {
      return 'center'; // В этой зоне средника нет, значит секция общая
    }

    // Если мы попали в диапазон средника по высоте — делим на лево/право
    const mullionX = mullion.position.x;
    return point.x < mullionX ? 'left' : 'right';
  }

  /**
   * Вспомогательный метод: ищет объекты-разделители в конкретной секции
   */
  // private getDividersInSection(section: 'left' | 'right' | 'center'): THREE.Object3D[] {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   const dividers: THREE.Object3D[] = [];
  //   const hasMullion = cabinet.hasMullion();
  //   const mullionX = hasMullion ? cabinet.getMullion().position.x : 0;

  //   // Хелпер для проверки X координаты
  //   const isInSection = (obj: THREE.Object3D) => {
  //     if (!hasMullion) return true; // Если нет средника, всё в центре
  //     if (section === 'center') return true;

  //     const x = obj.position.x;
  //     if (section === 'left') return x < mullionX - 10;
  //     if (section === 'right') return x > mullionX + 10;
  //     return false;
  //   };

  //   // 1. Полки
  //   cabinet.getShelves().forEach((shelf) => {
  //     if (isInSection(shelf)) dividers.push(shelf);
  //   });

  //   // 2. Ящики
  //   if (cabinet.getDrawerManager()) {
  //     const blocks = cabinet.getDrawerManager().getAllDrawerBlocks();
  //     blocks.forEach((block) => {
  //       if (isInSection(block)) dividers.push(block);
  //     });
  //   }

  //   return dividers;
  // }
  private getDividersInSection(section: 'left' | 'right' | 'center'): THREE.Object3D[] {
    const cabinet = this.sceneManagerService.getCabinet();
    const dividers: THREE.Object3D[] = [];
    const hasMullion = cabinet.hasMullion();
    const mullion = hasMullion ? cabinet.getMullion() : null;

    let mullionBox: THREE.Box3 | null = null;
    if (mullion) {
      mullionBox = new THREE.Box3().setFromObject(mullion);
    }

    // Хелпер для проверки, относится ли объект к текущей зоне клика
    const isObjectRelevant = (obj: THREE.Object3D) => {
      const objBox = new THREE.Box3().setFromObject(obj);

      // 1. Если мы в режиме "center" (выше/ниже средника)
      if (section === 'center') {
        // Ищем только полки на всю ширину (которые не пересекаются со средником по X)
        // или которые находятся в той же "пустой" зоне
        return true;
      }

      // 2. Если мы в левой или правой секции
      const x = obj.position.x;
      const mullionX = mullion?.position.x || 0;

      if (section === 'left') return x < mullionX - 10;
      if (section === 'right') return x > mullionX + 10;

      return false;
    };

    // 1. Полки
    cabinet.shelfManager.getShelves().forEach((shelf) => {
      if (isObjectRelevant(shelf)) dividers.push(shelf);
    });

    // 2. Ящики
    if (cabinet.drawerManager) {
      cabinet
        .drawerManager
        .getAllDrawerBlocks()
        .forEach((block) => {
          if (isObjectRelevant(block)) dividers.push(block);
        });
    }

    return dividers;
  }

  /**
   * Проверяет принадлежность объекта к секции
   */
  private isObjectInSection(obj: THREE.Object3D, section: 'left' | 'right' | 'center'): boolean {
    // Логика зависит от того, как у вас хранятся данные о секции в объекте.
    // Вариант А: через userData
    // if (obj.userData['section'] === section) return true;

    // Вариант Б: через координаты (более надежно)
    const cabinet = this.sceneManagerService.getCabinet();
    const objX = obj.position.x;

    if (!cabinet.hasMullion()) return section === 'center';

    const mullionX = cabinet.getMullion().position.x;

    if (section === 'left') return objX < mullionX - 10; // -10 для надежности
    if (section === 'right') return objX > mullionX + 10;

    return false;
  }

  /**
   * Выделяет секцию
   */
  selectSection(section: 'left' | 'right' | 'center'): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const scene = this.sceneManagerService.getScene();

    if (!cabinet || !scene) {
      console.error('No cabinet or scene found!');
      return;
    }

    console.log('=== SECTION SELECTION DEBUG ===');
    console.log('Section:', section);
    console.log('Cabinet exists:', !!cabinet);
    console.log('Scene exists:', !!scene);

    // Визуально выделяем секцию используя существующий сервис
    this.sectionManagerService.highlightSection(section, scene, cabinet);

    this._selectedSection.next(section);
  }

  /**
   * Выделяет подсекцию (Visual + State)
   */
  selectSubsection(subsection: Subsection): void {
    const scene = this.sceneManagerService.getScene();
    const cabinet = this.sceneManagerService.getCabinet();

    // Визуальное выделение
    this.highlightSubsection(subsection, scene, cabinet);

    // Обновляем стейт
    this._selectedSubsection.next(subsection);
    this._selectedSection.next(subsection.section); // Для совместимости
  }

  /**
   * Снимает выделение с секции
   */
  clearSectionSelection(): void {
    const scene = this.sceneManagerService.getScene();

    // Очищаем подсветку секции
    if (scene) {
      this.sectionManagerService.clearHighlight(scene);
    }

    // Очищаем подсветку подсекции
    if (scene) {
      this.clearSubsectionHighlight(scene);
    }

    this._selectedSection.next(null);
    this._selectedSubsection.next(null);
  }

  // section-interaction.service.ts - добавьте эти методы

  /**
   * Определяет секцию объекта
   */
  private getObjectSection(object: THREE.Object3D): 'left' | 'right' | 'center' {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return 'center';

    const hasMullion = cabinet.hasMullion();

    if (!hasMullion) return 'center';

    const mullion = cabinet.getMullion();
    const mullionPosition = mullion.position.x;

    return object.position.x < mullionPosition ? 'left' : 'right';
  }

  /**
   * Получает высоту объекта
   */
  private getObjectHeight(object: THREE.Object3D): number {
    if (object.name.startsWith('shelf')) {
      return SHELF_HEIGHT;
    } else if (object.name.startsWith('drawerBlock')) {
      return object.userData['height'] || 100; // Зависит от количества ящиков
    }
    return 50; // Значение по умолчанию
  }

  /**
   * Подсвечивает конкретную подсекцию
   */
  highlightSubsection(subsection: Subsection, scene: THREE.Scene, cabinet: BaseCabinet): void {
    this.clearSubsectionHighlight(scene); // Убираем старую подсветку

    const cabinetSize = cabinet.getCabinetSize(); // {width, height, depth}
    const hasMullion = cabinet.hasMullion();

    let width = 0;
    let posX = 0;

    // Вычисляем ширину и позицию X подсветки
    if (!hasMullion) {
      width = cabinetSize.width - WALL_THICKNESS * 2;
      posX = 0;
    } else {
      const mullionX = cabinet.getMullion().position.x;
      const halfWidth = cabinetSize.width / 2;

      if (subsection.section === 'left') {
        // Ширина от левой стенки до средника
        // Левая стенка внутри: -halfWidth + WALL_THICKNESS
        // Средник левый край: mullionX - (WALL_THICKNESS/2)
        const leftInner = -halfWidth + WALL_THICKNESS;
        const rightInner = mullionX - WALL_THICKNESS / 2; // или просто mullionX если без толщины
        width = rightInner - leftInner;
        posX = leftInner + width / 2;
      } else {
        // Right logic
        const leftInner = mullionX + WALL_THICKNESS / 2;
        const rightInner = halfWidth - WALL_THICKNESS;
        width = rightInner - leftInner;
        posX = leftInner + width / 2;
      }
    }

    // Создаем меш
    const geometry = new THREE.BoxGeometry(width - 2, subsection.height - 2, cabinetSize.depth);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00, // Зеленый для примера
      transparent: true,
      opacity: 0.2,
      depthTest: false, // Чтобы было видно сквозь стенки
    });

    const highlightMesh = new THREE.Mesh(geometry, material);
    highlightMesh.name = 'section_highlight_mesh'; // Статичное имя для легкого удаления

    // Позиционирование
    // X = рассчитанный центр секции
    // Y = центр подсекции (из subsection.yPosition)
    // Z = 0 (центр шкафа)
    highlightMesh.position.set(posX, subsection.yPosition, 0);

    scene.add(highlightMesh);
  }

  /**
   * Очищает подсветку подсекции
   */
  clearSubsectionHighlight(scene: THREE.Scene): void {
    const existingHighlight = scene.getObjectByName('section_highlight_mesh'); // Или 'subsectionHighlight' - проверьте имя!
    if (existingHighlight) {
      scene.remove(existingHighlight);
      // Хорошей практикой также является освобождение памяти
      if (existingHighlight instanceof THREE.Mesh) {
        existingHighlight.geometry.dispose();
        if (Array.isArray(existingHighlight.material)) {
          existingHighlight.material.forEach((m) => m.dispose());
        } else {
          existingHighlight.material.dispose();
        }
      }
    }
  }

  /**
   * Добавляет полку в секцию
   */
  // addShelfToSection(sectionParam?: 'left' | 'right' | 'center'): void {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (!cabinet) return;

  //   const subsection = this._selectedSubsection.getValue();
  //   let shelfY: number;
  //   let targetSection: 'left' | 'right' | 'center';

  //   // // Просто добавляем полку по центру секции
  //   // const shelfY = Math.ceil((cabinetHeight + PODIUM_HEIGHT) / 2);
  //   console.log(subsection);
  //   if (subsection) {
  //     // Если подсекция выделена, берем её центр и её секцию
  //     console.log('Adding shelf to subsection:', subsection);

  //     // Берем центр подсекции
  //     const rawCenterY = subsection.yPosition;
  //     shelfY = Math.round(rawCenterY / 32) * 32;

  //     // Снэппинг к границам подсекции с учетом отступа
  //     const halfShelf = SHELF_HEIGHT / 2;
  //     const minGap = MIN_DISTANCE_BETWEEN_SHELVES;

  //     // ПРОВЕРКА ГРАНИЦ:
  //     // Убедимся, что полка не вылезла за границы подсекции из-за округления
  //     // if (shelfY - halfShelf < subsection.yStart + MIN_DISTANCE_BETWEEN_SHELVES) {
  //     //   shelfY = subsection.yStart + MIN_DISTANCE_BETWEEN_SHELVES + halfShelf;
  //     //   // Повторно снэпим, если критично, или оставляем как есть
  //     // } else if (shelfY + halfShelf > subsection.yEnd - MIN_DISTANCE_BETWEEN_SHELVES) {
  //     //   shelfY = subsection.yEnd - MIN_DISTANCE_BETWEEN_SHELVES - halfShelf;
  //     // }
  //     // Небольшая корректировка границ, чтобы не прилипать вплотную
  //     if (shelfY - halfShelf < subsection.yStart + minGap) {
  //       shelfY = subsection.yStart + minGap + halfShelf;
  //     } else if (shelfY + halfShelf > subsection.yEnd - minGap) {
  //       shelfY = subsection.yEnd - minGap - halfShelf;
  //     }

  //     targetSection = subsection.section;
  //   } else {
  //     const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;
  //     const rawY = (cabinetHeight + PODIUM_HEIGHT) / 2;

  //     // Здесь тоже можно применить 32мм
  //     shelfY = Math.round(rawY / 32) * 32;

  //     targetSection = sectionParam || 'center';
  //   }

  //   const validationError = this.validateShelfPlacement(shelfY, targetSection);
  //   if (validationError) {
  //     this.shelfWarningService.showWarning(validationError);
  //     this.clearSectionSelection();
  //     return;
  //   }

  //   const shelf = cabinet.getShelfManager().addShelfToSection(shelfY, targetSection);

  //   if (shelf) {
  //     this.updateShelfCheckboxState();

  //     // ОБНОВЛЯЕМ СЕКЦИОННЫЕ РАЗМЕРНЫЕ ЛИНИИ
  //     const dimensionLines = cabinet.getDimensionLine();
  //     if (dimensionLines && dimensionLines.getSectionDimensionLines()) {
  //       dimensionLines.updateSectionHeightLines();
  //     }
  //   }

  //   this.clearSectionSelection();
  // }

  addShelfToSection(sectionParam?: 'left' | 'right' | 'center'): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const subsection = this._selectedSubsection.getValue();
    let shelfY: number;
    let targetSection: 'left' | 'right' | 'center';

    if (subsection) {
      console.log('Adding shelf to subsection:', subsection);

      const rawCenterY = subsection.yPosition;
      // Округляем до шага 32мм (системный шаг)
      shelfY = Math.round(rawCenterY / 32) * 32;

      const halfShelf = SHELF_HEIGHT / 2;
      // Используем минимальный технический зазор для снэппинга, чтобы не вылезти за границы
      // Но саму валидацию на 112мм сделаем ниже
      const minTechGap = MIN_DISTANCE_BETWEEN_SHELVES;

      if (shelfY - halfShelf < subsection.yStart + minTechGap) {
        shelfY = subsection.yStart + minTechGap + halfShelf;
      } else if (shelfY + halfShelf > subsection.yEnd - minTechGap) {
        shelfY = subsection.yEnd - minTechGap - halfShelf;
      }

      targetSection = subsection.section;
    } else {
      const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;
      const rawY = (cabinetHeight + PODIUM_HEIGHT) / 2;
      shelfY = Math.round(rawY / 32) * 32;
      targetSection = sectionParam || 'center';
    }

    // --- ВАЛИДАЦИЯ (112 мм) ---
    const validationError = this.validateShelfPlacement(shelfY, targetSection);

    if (validationError) {
      // Показываем предупреждение и прерываем добавление
      this.shelfWarningService.showWarning(validationError);
      this.clearSectionSelection();
      return;
    }

    // Если всё ок — добавляем
    const shelf = cabinet.shelfManager.addShelfToSection(shelfY, targetSection);

    if (shelf) {
      this.updateShelfCheckboxState();
      const dimensionLines = cabinet.dimensionLines;
      if (dimensionLines && dimensionLines.getSectionDimensionLines()) {
        dimensionLines.updateSectionHeightLines();
      }
    }

    this.clearSectionSelection();
  }

  /**
   * Проверяет возможность установки полки в данной позиции
   */
  /**
   * Проверяет отступы до ближайших элементов (112мм)
   */
  private validateShelfPlacement(
    yPosition: number,
    section: 'left' | 'right' | 'center',
  ): string | null {
    const cabinet = this.sceneManagerService.getCabinet();
    // Требуемое расстояние по задаче
    const REQUIRED_GAP = 112;
    const halfShelf = SHELF_HEIGHT / 2;

    // 1. Проверка границ шкафа (Подиум и Крышка)
    // Для границ можно оставить стандартный MIN_DISTANCE или тоже применить 112,
    // здесь применяем MIN_DISTANCE_BETWEEN_SHELVES как базовое ограничение
    const cabinetHeight = cabinet.getCabinetHeight();
    const bottomLimit = PODIUM_HEIGHT + MIN_DISTANCE_BETWEEN_SHELVES + halfShelf;
    const topLimit = cabinetHeight - WALL_THICKNESS - MIN_DISTANCE_BETWEEN_SHELVES - halfShelf;

    if (yPosition < bottomLimit) {
      return 'Слишком низко. Мешает дно/подиум.';
    }
    if (yPosition > topLimit) {
      return 'Слишком высоко. Мешает крышка шкафа.';
    }

    // 2. Получаем соседей (полки и ящики в этой секции)
    const dividers = this.getDividersInSection(section);

    for (const obj of dividers) {
      // BoundingBox существующего объекта
      const box = new THREE.Box3().setFromObject(obj);

      // Вычисляем дистанцию
      // box.max.y - верх существующего объекта
      // box.min.y - низ существующего объекта

      // Границы новой полки
      const newShelfBottom = yPosition - halfShelf;
      const newShelfTop = yPosition + halfShelf;

      // Проверка: Новая полка НАД существующей
      if (newShelfBottom >= box.max.y) {
        const gap = newShelfBottom - box.max.y;
        if (gap < REQUIRED_GAP) {
          return `Мало места. До нижней полки ${Math.round(gap)} мм (нужно ${REQUIRED_GAP} мм).`;
        }
      }
      // Проверка: Новая полка ПОД существующей
      else if (newShelfTop <= box.min.y) {
        const gap = box.min.y - newShelfTop;
        if (gap < REQUIRED_GAP) {
          return `Мало места. До верхней полки ${Math.round(gap)} мм (нужно ${REQUIRED_GAP} мм).`;
        }
      }
      // Проверка: Пересечение (коллизия)
      else {
        return 'В этом месте уже установлен другой элемент.';
      }
    }

    return null; // Ошибок нет
  }
  /**
   * Добавляет блок ящиков в секцию
   */
  addDrawerBlockToSection(section: 'left' | 'right' | 'center'): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const cabinetSize = cabinet.getCabinetParams().dimensions.general;
    const { width, height, depth } = cabinetSize;
    const hasMullion = cabinet.hasMullion();
    const mullionPosition = hasMullion ? cabinet.getMullion().position.x : 0;
    const isSingleCabinet = cabinet.getCabinetParams().subType === CabinetSubType.Single;

    const subsection = this._selectedSubsection.getValue();
    let blockDrawerY: number;

    let targetSection: 'left' | 'right' | 'center';

    if (subsection) {

    } else {
      const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;
      const rawY = (cabinetHeight + PODIUM_HEIGHT) / 2;
      blockDrawerY = Math.round(rawY / 32) * 32;
      targetSection = section || 'center';
    }

    // Проверяем условия, при которых блок с ящиками НЕЛЬЗЯ установить
    const validationResult = this.validateDrawerBlockInstallation(
      width,
      depth,
      isSingleCabinet,
      hasMullion,
      section,
    );

    if (!validationResult.canInstall) {
      // Показываем предупреждение через сервис
      this.showDrawerInstallationWarning(
        validationResult.problemType,
        isSingleCabinet,
        hasMullion,
        validationResult.minWidth,
        validationResult.requiredDepth,
        true,
      );
      return;
    }

    // Вычисляем параметры секции
    const sectionParams = cabinet
      .sectionManager
      .calculateSectionParams(section, hasMullion, cabinetSize.width, mullionPosition);

    if (!sectionParams) {
      alert('Не удалось вычислить параметры секции');
      return;
    }

    const { availableWidth, positionX } = sectionParams;

    this.createAndAddDrawerBlock(cabinet, section, availableWidth, positionX);

    // Автоматически обновляем флаг ящиков
    this.updateDrawerCheckboxState();
  }

  // addShelfToSection(sectionParam?: 'left' | 'right' | 'center'): void {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (!cabinet) return;

  //   const subsection = this._selectedSubsection.getValue();
  //   let shelfY: number;
  //   let targetSection: 'left' | 'right' | 'center';

  //   if (subsection) {
  //     console.log('Adding shelf to subsection:', subsection);

  //     const rawCenterY = subsection.yPosition;
  //     // Округляем до шага 32мм (системный шаг)
  //     shelfY = Math.round(rawCenterY / 32) * 32;

  //     const halfShelf = SHELF_HEIGHT / 2;
  //     // Используем минимальный технический зазор для снэппинга, чтобы не вылезти за границы
  //     // Но саму валидацию на 112мм сделаем ниже
  //     const minTechGap = MIN_DISTANCE_BETWEEN_SHELVES;

  //     if (shelfY - halfShelf < subsection.yStart + minTechGap) {
  //       shelfY = subsection.yStart + minTechGap + halfShelf;
  //     } else if (shelfY + halfShelf > subsection.yEnd - minTechGap) {
  //       shelfY = subsection.yEnd - minTechGap - halfShelf;
  //     }

  //     targetSection = subsection.section;
  //   } else {
  //     const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;
  //     const rawY = (cabinetHeight + PODIUM_HEIGHT) / 2;
  //     shelfY = Math.round(rawY / 32) * 32;
  //     targetSection = sectionParam || 'center';
  //   }

  //   // --- ВАЛИДАЦИЯ (112 мм) ---
  //   const validationError = this.validateShelfPlacement(shelfY, targetSection);

  //   if (validationError) {
  //     // Показываем предупреждение и прерываем добавление
  //     this.shelfWarningService.showWarning(validationError);
  //     this.clearSectionSelection();
  //     return;
  //   }

  //   // Если всё ок — добавляем
  //   const shelf = cabinet.getShelfManager().addShelfToSection(shelfY, targetSection);

  //   if (shelf) {
  //     this.updateShelfCheckboxState();
  //     const dimensionLines = cabinet.getDimensionLine();
  //     if (dimensionLines && dimensionLines.getSectionDimensionLines()) {
  //       dimensionLines.updateSectionHeightLines();
  //     }
  //   }

  //   this.clearSectionSelection();
  // }

  /**
   * Проверяет возможность установки блока с ящиками
   */
  private validateDrawerBlockInstallation(
    width: number,
    depth: number,
    isSingleCabinet: boolean,
    hasMullion: boolean,
    section: 'left' | 'right' | 'center',
  ): {
    canInstall: boolean;
    problemType?: string;
    minWidth?: number;
    requiredDepth?: number;
  } {
    // Для одностворчатых шкафов
    if (isSingleCabinet) {
      // Ширина 350мм - нельзя устанавливать ящики
      if (width === 350) {
        return {
          canInstall: false,
          problemType: 'width_350',
          minWidth: 375,
        };
      }

      // Ширина 375мм с глубиной 580мм - нельзя устанавливать ящики
      if (width === 375 && depth === 580) {
        return {
          canInstall: false,
          problemType: 'width_375_depth_580',
          minWidth: 375,
          requiredDepth: 430,
        };
      }

      // Ширина 375мм с глубиной не 430мм - нельзя устанавливать ящики
      if (width === 375 && depth !== 430) {
        return {
          canInstall: false,
          problemType: 'width_375_depth',
          minWidth: 375,
          requiredDepth: 430,
        };
      }
    }
    // Для двустворчатых шкафов
    else {
      // Ширина 700мм со средником - нельзя устанавливать ящики
      if (width === 700 && hasMullion) {
        return {
          canInstall: false,
          problemType: 'width_700_mullion',
          minWidth: 750,
        };
      }

      // Проверка для отдельных секций в двустворчатом шкафу
      if (hasMullion) {
        const sectionWidth = this.calculateSectionWidth(width, section, hasMullion);

        // Если ширина секции меньше минимальной для ящиков
        if (sectionWidth < 350) {
          return {
            canInstall: false,
            problemType: 'section_too_narrow',
            minWidth: 350,
          };
        }
      }
    }

    return { canInstall: true };
  }

  /**
   * Вычисляет ширину секции
   */
  private calculateSectionWidth(
    cabinetWidth: number,
    section: 'left' | 'right' | 'center',
    hasMullion: boolean,
  ): number {
    if (!hasMullion) {
      return cabinetWidth - WALL_THICKNESS * 2;
    }

    // Для шкафа со средником вычисляем ширину каждой секции
    const mullionPosition = this.sceneManagerService.getCabinet().getMullion().position.x;

    switch (section) {
      case 'left':
        return cabinetWidth / 2 + mullionPosition - WALL_THICKNESS * 2;
      case 'right':
        return cabinetWidth / 2 - mullionPosition - WALL_THICKNESS * 2;
      default:
        return cabinetWidth - WALL_THICKNESS * 2;
    }
  }

  /**
   * Показывает предупреждение о невозможности установки ящиков
   */
  private showDrawerInstallationWarning(
    problemType: string,
    isSingleCabinet: boolean,
    hasMullion: boolean,
    minWidth?: number,
    requiredDepth?: number,
    isAddingNew: boolean = false,
  ): void {
    // Используем DrawerWarningService для показа предупреждения
    const drawerWarningService = this.sceneManagerService.drawerWarningService;

    drawerWarningService.showWarning({
      section: problemType,
      problemType: problemType,
      isSingleCabinet: isSingleCabinet,
      hasMullion: hasMullion,
      minWidth: minWidth,
      requiredDepth: requiredDepth,
      isAddingNew: isAddingNew,
    });

    // Для добавления новых ящиков не нужно подписываться на действия
    if (!isAddingNew) {
      // Подписываемся на действие пользователя только для обновления
      const subscription = drawerWarningService.onAction().subscribe((action) => {
        console.log('User action received:', action);

        // Обрабатываем действие пользователя
        this.handleDrawerWarningAction(action, minWidth, requiredDepth);

        // Отписываемся после получения действия
        subscription.unsubscribe();
      });
    }
  }

  /**
   * Обрабатывает действие пользователя из диалога предупреждения
   */
  private handleDrawerWarningAction(
    action: DrawerWarningAction,
    minWidth?: number,
    requiredDepth?: number,
  ): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    switch (action.type) {
      case 'restoreWidth':
        if (minWidth && cabinet.getCabinetParams().subType === CabinetSubType.Single) {
          // Восстанавливаем минимальную ширину
          cabinet.getCabinetParams().dimensions.general.width = minWidth;
          cabinet.updateCabinetParams(cabinet.getCabinetParams());
          console.log(`📏 Ширина шкафа восстановлена до ${minWidth}мм`);

          // После восстановления ширины можно попробовать снова добавить блок
          // (пользователь должен сам выбрать секцию заново)
        }
        break;

      case 'restoreMullion':
        if (cabinet.hasMullion()) {
          // Восстанавливаем средник
          const mullion = cabinet.getMullion();
          if (mullion) {
            mullion.position.x = 0;
            cabinet.getCabinetParams().components.mullion.position.x = 0;
            mullion.updateMatrixWorld();
            console.log('↩️ Средник возвращён на центральную позицию');
          }
        }
        break;

      case 'removeDrawers':
        // Просто закрываем диалог - ничего не делаем
        console.log('Пользователь решил не добавлять ящики');
        break;
    }
  }

  /**
   * Вычисляет следующую позицию для полки
   */
  private calculateNextShelfPosition(): number {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;

    if (cabinet.getCabinetParams().components.shelves.shelfItems.length === 0) {
      // Первая полка - по центру шкафа
      const availableHeight = cabinetHeight - PODIUM_HEIGHT - WALL_THICKNESS;
      const middlePosition = PODIUM_HEIGHT + availableHeight / 2;
      const middleSnapped =
        Math.round(middlePosition / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;
      return middleSnapped;
    } else {
      // Следующая полка - выше предыдущей
      const shelfItems = cabinet.getCabinetParams().components.shelves.shelfItems;
      return shelfItems[shelfItems.length - 1].position.y + SHELF_POSITION_OFFSET;
    }
  }

  /**
   * Создает и добавляет блок с ящиками
   */
  private createAndAddDrawerBlock(
    cabinet: BaseCabinet,
    targetSection: 'left' | 'right' | 'center',
    availableWidth: number,
    positionX: number,
  ): void {
    const totalBlocks = cabinet.drawerManager.getTotalBlocks();
    const cabinetSize = cabinet.getCabinetParams().dimensions.general;
    const { width, height, depth } = cabinetSize;
    const material = cabinet.getCabinetParams().appearance.additionColor;
    const countFP = cabinet.getCabinetParams().subType === CabinetSubType.Single ? 1 : 2;
    const typeProduct: CabinetSubType = cabinet.getCabinetType();
    const hasMullion: boolean = cabinet.hasMullion();

    // Вычисляем размеры блока с ящиками
    const { fullSize, fullDrawerSize } = calculateDrawerElements(
      typeProduct,
      hasMullion,
      1, // начальное количество ящиков
      availableWidth,
      height,
      depth,
      countFP,
    );

    // Создаем блок ящиков
    const drawerBlock = {
      id: totalBlocks + 1,
      material: material,
      fullSize: fullSize,
      fullDrawerSize: fullDrawerSize,
      drawerItems: [{ id: 1, position: { x: positionX, y: 0, z: 0 } }],
      position: { x: positionX, y: PODIUM_HEIGHT / 2 + WALL_THICKNESS, z: 0 },
      section: targetSection,
    };

    // Добавляем в параметры шкафа
    cabinet.getCabinetParams().components.drawers.checkBox = true;
    cabinet.getCabinetParams().components.drawers.drawerBlocks.push(drawerBlock);

    const size = {
      width: availableWidth,
      height: cabinetSize.height,
      depth: cabinetSize.depth,
    };

    const positionLoops = this.getPositionLoops(targetSection);

    // Добавляем блок в сцену
    cabinet.drawerManager.addBlock(drawerBlock, size, positionLoops);
    cabinet.updateMullion();
    // cabinet.mullionManager.updateMullionSize();
  }

  /**
   * Определяет направление петель для секции
   */
  private getPositionLoops(targetSection: 'left' | 'right' | 'center'): string {
    switch (targetSection) {
      case 'right':
        return 'right-side';
      case 'left':
        return 'left-side';
      case 'center':
        return 'right-side';
      default:
        return 'right-side';
    }
  }

  /**
   * Обновляет состояние флага полок на основе наличия элементов
   */
  private updateShelfCheckboxState(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const hasShelves = cabinet.getCabinetParams().components.shelves.shelfItems.length > 0;
    cabinet.getCabinetParams().components.shelves.checkBox = hasShelves;

    console.log(`Флаг полок обновлен: ${hasShelves}`);
  }

  /**
   * Обновляет состояние флага ящиков на основе наличия элементов
   */
  private updateDrawerCheckboxState(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const hasDrawers = cabinet.getCabinetParams().components.drawers.drawerBlocks.length > 0;
    cabinet.getCabinetParams().components.drawers.checkBox = hasDrawers;

    console.log(`Флаг ящиков обновлен: ${hasDrawers}`);
  }

  /**
   * Определяет направление открытия для секции
   */
  private getOpeningDirection(section: 'left' | 'right' | 'center'): PositionCutout {
    const cabinet = this.sceneManagerService.getCabinet();

    if (cabinet.getCabinetType().includes(CabinetSubType.Single)) {
      return cabinet.getPositionHinges();
    } else {
      if (cabinet.hasMullion()) {
        return section.includes('left') ? 'left-side' : 'right-side';
      } else {
        return 'both';
      }
    }
  }

  /**
   * Проверяет, является ли объект полкой или связанным с полкой объектом
   */
  private isShelfOrRelatedObject(object: THREE.Object3D): boolean {
    let current: THREE.Object3D | null = object;

    while (current) {
      if (
        current.name.startsWith('shelf') ||
        current.name.startsWith('topCabinet') ||
        current.name.startsWith('frontEdgeShelf_') ||
        current.name.includes('Shelf') ||
        current.userData?.['type'] === 'shelf'
      ) {
        return true;
      }

      if (
        current.parent &&
        (current.parent.name.startsWith('shelf') || current.parent.name.startsWith('topCabinet'))
      ) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  /**
   * Получает текущую выбранную секцию
   */
  get selectedSection(): 'left' | 'right' | 'center' | null {
    return this._selectedSection.getValue();
  }

  /**
   * Проверяет, есть ли активная выбранная секция
   */
  hasSelectedSection(): boolean {
    return this._selectedSection.getValue() !== null;
  }
}
