import * as THREE from 'three';
import { SceneManagerService } from '../../services/SceneManager.service';
import { IDimensionLines } from '../interfaces/IDimensionLines';
import { INTERVAL_1_MM, PODIUM_HEIGHT, SHELF_HEIGHT, WALL_THICKNESS } from '../constants';
import { ISectionDimensionLines } from '../interfaces/ISectionDimensionLines';
import { FullDrawerBlockSize } from '../model/Drawers';

export class SectionDimensionLines implements ISectionDimensionLines {
  private sceneManagerService: SceneManagerService;
  private dimensionLines: IDimensionLines;
  private sectionLines: Map<string, THREE.Group> = new Map();

  constructor(sceneManagerService: SceneManagerService, dimensionLines: IDimensionLines) {
    this.sceneManagerService = sceneManagerService;
    this.dimensionLines = dimensionLines;
  }

  /**
   * Обновляет все вертикальные размерные линии в секциях шкафа
   */
  // public updateSectionHeightLines(): void {
  //   this.removeAllSectionLines();
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (!cabinet) return;
  //   const width = cabinet.getCabinetWidth();
  //   const height = cabinet.getCabinetHeight();
  //   const depth = cabinet.getCabinetDepth();
  //   const hasMullion = cabinet.hasMullion();

  //   // Получаем все объекты в шкафу (полки, ящики и т.д.)
  //   const allObjects = this.getAllCabinetObjects();

  //   // Группируем объекты по секциям
  //   const sectionObjects = this.groupObjectsBySection(allObjects, width, hasMullion);

  //   if (hasMullion) {
  //     // Двустворчатый шкаф со средником - линии для левой и правой секций
  //     const mullion = cabinet.getMullion();
  //     if (!mullion) return;

  //     const mullionX = mullion.position.x;

  //     // Левая секция
  //     this.createSectionVerticalLines(
  //       'left',
  //       -width / 2 + WALL_THICKNESS,
  //       mullionX - WALL_THICKNESS,
  //       height,
  //       depth,
  //       sectionObjects['left'] || [],
  //     );

  //     // Правая секция
  //     this.createSectionVerticalLines(
  //       'right',
  //       mullionX + WALL_THICKNESS,
  //       width / 2 - WALL_THICKNESS,
  //       height,
  //       depth,
  //       sectionObjects['right'] || [],
  //     );
  //   } else {
  //     // Одностворчатый шкаф - одна центральная линия
  //     this.createSectionVerticalLines(
  //       'center',
  //       -width / 2 + WALL_THICKNESS,
  //       width / 2 - WALL_THICKNESS,
  //       height,
  //       depth,
  //       sectionObjects['center'] || [],
  //     );
  //   }
  // }

  public updateSectionHeightLines(): void {
    this.removeAllSectionLines();
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const width = cabinet.getCabinetWidth();
    const height = cabinet.getCabinetHeight();
    const depth = cabinet.getCabinetDepth();
    const hasMullion = cabinet.hasMullion();

    // Внутренняя верхняя граница шкафа (под крышкой)
    const cabinetInteriorTop = height - WALL_THICKNESS;
    const allObjects = this.getAllCabinetObjects();

    if (hasMullion) {
      const mullion = cabinet.getMullion();
      if (!mullion) return;

      const mullionX = mullion.position.x;
      // Находим верхнюю точку средника (используем размер из userData или рассчитываем)
      const mullionSize = mullion.userData['size']?.height;
      const mullionTopY = mullion.position.y + mullionSize / 2;

      // Ищем полку, которая лежит на среднике (Т-образное соединение)
      const tShelf = allObjects.find((obj) => {
        if (!obj.name.includes('shelf')) return false;
        const shelfBottomY = obj.position.y - SHELF_HEIGHT / 2;
        return Math.abs(shelfBottomY - mullionTopY) < 5;
      });

      if (tShelf) {
        const tShelfTopSurfaceY = tShelf.position.y + SHELF_HEIGHT / 2;

        // --- НИЖНИЕ СЕКЦИИ (до полки) ---
        const bottomObjects = allObjects.filter((obj) => obj.position.y < tShelf.position.y);
        const sectionObjects = this.groupObjectsBySection(bottomObjects, width, true);

        // Лево низ
        this.createSectionVerticalLines(
          'left_bottom',
          -width / 2 + WALL_THICKNESS,
          mullionX - WALL_THICKNESS / 2,
          tShelfTopSurfaceY - SHELF_HEIGHT, // До низа Т-полки
          depth,
          sectionObjects['left'] || [],
          PODIUM_HEIGHT,
        );

        // Право низ
        this.createSectionVerticalLines(
          'right_bottom',
          mullionX + WALL_THICKNESS / 2,
          width / 2 - WALL_THICKNESS,
          tShelfTopSurfaceY - SHELF_HEIGHT, // До низа Т-полки
          depth,
          sectionObjects['right'] || [],
          PODIUM_HEIGHT,
        );

        // --- ВЕРХНЯЯ СЕКЦИЯ (над полкой) ---
        // Фильтруем объекты, которые находятся ВЫШЕ Т-полки
        const topObjects = allObjects.filter((obj) => obj.position.y > tShelfTopSurfaceY);

        this.createSectionVerticalLines(
          'center_top',
          -width / 2 + WALL_THICKNESS,
          width / 2 - WALL_THICKNESS,
          cabinetInteriorTop, // Внутренний потолок
          depth,
          topObjects,
          tShelfTopSurfaceY, // От верха Т-полки
        );
        return; // Выходим, так как Т-логика отработана
      }
    }

    // Стандартная логика (если нет Т-полки или нет средника)
    const sectionObjects = this.groupObjectsBySection(allObjects, width, hasMullion);
    if (hasMullion) {
      const mullionX = cabinet.getMullion().position.x;
      this.createSectionVerticalLines(
        'left',
        -width / 2 + WALL_THICKNESS,
        mullionX - WALL_THICKNESS / 2,
        cabinetInteriorTop,
        depth,
        sectionObjects['left'] || [],
      );
      this.createSectionVerticalLines(
        'right',
        mullionX + WALL_THICKNESS / 2,
        width / 2 - WALL_THICKNESS,
        cabinetInteriorTop,
        depth,
        sectionObjects['right'] || [],
      );
    } else {
      this.createSectionVerticalLines(
        'center',
        -width / 2 + WALL_THICKNESS,
        width / 2 - WALL_THICKNESS,
        cabinetInteriorTop,
        depth,
        sectionObjects['center'] || [],
      );
    }
  }

  /**
   * Группирует объекты по секциям
   */
  private groupObjectsBySection(
    objects: THREE.Object3D[],
    cabinetWidth: number,
    hasMullion: boolean,
  ): { [key: string]: THREE.Object3D[] } {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return { left: [], right: [], center: [] };

    const result: { [key: string]: THREE.Object3D[] } = {
      left: [],
      right: [],
      center: [],
    };

    // Если нет средника - все объекты в центральной секции
    if (!hasMullion) {
      result['center'] = [...objects];
      return result;
    }

    const mullion = cabinet.getMullion();
    if (!mullion) return result;

    const mullionX = mullion.position.x;

    objects.forEach((obj) => {
      const objX = obj.position.x;

      if (objX < mullionX - WALL_THICKNESS / 2) {
        result['left'].push(obj);
      } else if (objX > mullionX + WALL_THICKNESS / 2) {
        result['right'].push(obj);
      } else {
        // Объект в области средника - добавляем в обе секции или центральную
        // в зависимости от ширины объекта
        const objWidth = obj.userData['size']?.width || 0;
        const objLeft = objX - objWidth / 2;
        const objRight = objX + objWidth / 2;

        // Если объект пересекает средник
        if (objLeft < mullionX && objRight > mullionX) {
          // Для полногабаритных объектов, пересекающих средник
          // Для полногабаритных объектов, пересекающих средник
          result['center'].push(obj);
        } else if (objX < mullionX) {
          result['left'].push(obj);
        } else {
          result['right'].push(obj);
        }
      }
    });

    return result;
  }

  /**
   * Создает вертикальные размерные линии для секции
   */
  // private createSectionVerticalLines(
  //   sectionName: string,
  //   sectionStartX: number,
  //   sectionEndX: number,
  //   cabinetHeight: number,
  //   cabinetDepth: number,
  //   sectionObjects: THREE.Object3D[],
  // ): void {
  //   const sectionCenterX = (sectionStartX + sectionEndX) / 2;
  //   const zPos = 0; // Смещение вперед для видимости

  //   // Сортируем объекты по высоте снизу вверх
  //   const sortedObjects = [...sectionObjects].sort((a, b) => a.position.y - b.position.y);

  //   // Верх шкафа - это cabinetHeight минус толщина верхней полки
  //   const bottomY = PODIUM_HEIGHT; // Начинаем с подиума
  //   const topY = cabinetHeight; // Заканчиваем перед верхней панелью

  //   // Вычисляем доступную высоту секции
  //   const availableHeight = topY - bottomY;

  //   // Создаем сегментированную вертикальную линию с учетом объектов
  //   this.createSegmentedVerticalLine(
  //     sectionName,
  //     sectionCenterX,
  //     zPos,
  //     bottomY,
  //     topY,
  //     availableHeight,
  //     sectionObjects,
  //   );
  // }

  private createSectionVerticalLines(
    sectionName: string,
    sectionStartX: number,
    sectionEndX: number,
    limitTopY: number, // Максимальная высота (куда идем)
    cabinetDepth: number,
    sectionObjects: THREE.Object3D[],
    customBottomY?: number, // Откуда начинаем (если не указано - PODIUM_HEIGHT)
  ): void {
    const sectionCenterX = (sectionStartX + sectionEndX) / 2;
    const zPos = 0;

    const bottomY = customBottomY !== undefined ? customBottomY : PODIUM_HEIGHT;
    const topY = limitTopY;
    const availableHeight = topY - bottomY;

    this.createSegmentedVerticalLine(
      sectionName,
      sectionCenterX,
      zPos,
      bottomY,
      topY,
      availableHeight,
      sectionObjects,
    );
  }

  /**
   * Создает сегментированную вертикальную линию с разрывами для объектов
   */
  // private createSegmentedVerticalLine(
  //   sectionName: string,
  //   x: number,
  //   z: number,
  //   startY: number,
  //   endY: number,
  //   fullHeight: number,
  //   objects: THREE.Object3D[],
  // ): void {
  //   if (startY >= endY) return;

  //   // Если объектов нет - создаем одну линию полной высоты
  //   if (objects.length === 0) {
  //     startY -= WALL_THICKNESS;
  //     endY -= WALL_THICKNESS * 4;
  //     fullHeight -= WALL_THICKNESS;
  //     this.createFullHeightLine(sectionName, x, z, startY, endY, fullHeight);
  //     return;
  //   }

  //   const segments: { startY: number; endY: number; value: number }[] = [];

  //   // Добавляем объекты как точки разрыва
  //   const breakPoints: number[] = [startY];

  //   objects.forEach((obj) => {
  //     // Определяем высоту объекта в зависимости от его типа
  //     let objHeight: number;
  //     let objBottom: number;
  //     let objTop: number;
  //     if (obj.name.includes('drawerBlock_')) {
  //       // Блок с ящиками
  //       objHeight = this.getObjectHeight(obj);
  //       objBottom = obj.position.y - objHeight / 2; // Центр минус половина высоты
  //       objTop = obj.position.y + objHeight / 2; // Центр плюс половина высоты
  //     } else if (obj.name.includes('shelf')) {
  //       // Полка
  //       objHeight = this.getObjectHeight(obj);
  //       objBottom = obj.position.y - objHeight / 2; // Центр минус половина высоты
  //       objTop = obj.position.y + objHeight / 2; // Центр плюс половина высоты
  //     } else {
  //       // Другие объекты
  //       objHeight = this.getObjectHeight(obj);
  //       objBottom = obj.position.y - objHeight / 2;
  //       objTop = obj.position.y + objHeight / 2;
  //     }
  //     // const objTop = objBottom + objHeight;

  //     // Добавляем нижнюю и верхнюю границы объекта как точки разрыва
  //     breakPoints.push(objBottom);
  //     breakPoints.push(objTop);
  //   });

  //   breakPoints.push(endY);

  //   // Убираем дубликаты и сортируем
  //   const sortedBreakPoints = [...new Set(breakPoints)].sort((a, b) => a - b);

  //   for (let i = 0; i < sortedBreakPoints.length - 1; i++) {
  //     let segmentStart = sortedBreakPoints[i];
  //     let segmentEnd = sortedBreakPoints[i + 1];
  //     let segmentHeight = sortedBreakPoints[i + 1] - sortedBreakPoints[i]; // - WALL_THICKNESS / 2;

  //     if (i === sortedBreakPoints.length - 2) {
  //       segmentEnd -= WALL_THICKNESS; // Смещение для верхней линии
  //     }

  //     console.log('sortedBreakPoints', sortedBreakPoints[i], sortedBreakPoints[i + 1]);

  //     console.log('segmentHeight before adjustments', segmentHeight);

  //     // Пропускаем слишком маленькие сегменты (меньше 20 мм)
  //     if (segmentHeight >= 5) {
  //       segments.push({
  //         startY: segmentStart,
  //         endY: segmentEnd,
  //         value: segmentHeight,
  //       });
  //     } else {
  //       console.log('Пропущен сегмент с высотой:', segmentHeight);
  //     }

  //     // Проверяем общую сумму сегментов
  //     const totalSegmentsHeight = segments.reduce((sum, seg) => sum + seg.value, 0);
  //     console.log(`Total segments height: ${totalSegmentsHeight}, expected: ${endY - startY}`);
  //   }

  //   // Если после фильтрации сегментов не осталось - создаем полную линию
  //   if (segments.length === 0) {
  //     this.createFullHeightLine(sectionName, x, z, startY, endY, fullHeight);
  //     return;
  //   }

  //   // Если есть только один сегмент - создаем полную линию
  //   if (segments.length === 1 && Math.abs(segments[0].value - fullHeight) < 10) {
  //     this.createFullHeightLine(sectionName, x, z, startY, endY, fullHeight);
  //     return;
  //   }

  //   // Создаем размерные линии для каждого сегмента
  //   segments.forEach((segment, index) => {
  //     const lineName = `section_${sectionName}_vertical_${index}`;

  //     // Позиционируем текст для лучшей читаемости
  //     const textOffsetX = sectionName === 'left' ? 40 : -40;

  //     // Корректируем позиции отрисовки линий с учетом смещений
  //     const drawStartY = index === 0 ? segment.startY - WALL_THICKNESS : segment.startY;
  //     const drawEndY =
  //       index === segments.length - 1 ? segment.endY - WALL_THICKNESS * 3 : segment.endY;

  //     // console.log("segment.value", segment.value);
  //     const line = this.dimensionLines.createDimensionLine(
  //       new THREE.Vector3(x, drawStartY, z),
  //       new THREE.Vector3(x, drawEndY, z),
  //       segment.value,
  //       false,
  //       false,
  //       25,
  //     );

  //     // Настраиваем позицию текста для лучшей читаемости
  //     this.adjustTextPosition(line, textOffsetX);

  //     line.name = lineName;
  //     this.sceneManagerService.addObject(line);
  //     this.sectionLines.set(lineName, line);
  //   });
  // }

  private createSegmentedVerticalLine(
    sectionName: string,
    x: number,
    z: number,
    startY: number,
    endY: number,
    fullHeight: number,
    objects: THREE.Object3D[],
  ): void {
    if (startY >= endY - 10) return; // Слишком малая зона для линии
    const depth = this.sceneManagerService.getCabinet().getCabinetDepth();
    const zPos = 0; // Вынос чуть вперед для видимости

    // Если объектов нет - одна линия на всю доступную высоту
    if (objects.length === 0) {
      const segmentValue = Math.round(endY - startY);
      // Рисуем линию с небольшим отступом от краев для красоты стрелок
      this.createFullHeightLine(sectionName, x, zPos, startY + 2, endY - 2, segmentValue);
      return;
    }

    // Создаем точки разрыва
    const breakPoints: number[] = [startY];
    objects.forEach((obj) => {
      const objHeight = this.getObjectHeight(obj);
      breakPoints.push(obj.position.y - objHeight / 2);
      breakPoints.push(obj.position.y + objHeight / 2);
    });
    breakPoints.push(endY);

    const sortedBreakPoints = [...new Set(breakPoints)].sort((a, b) => a - b);

    for (let i = 0; i < sortedBreakPoints.length - 1; i++) {
      const segmentStart = sortedBreakPoints[i];
      const segmentEnd = sortedBreakPoints[i + 1];
      const segmentValue = Math.round(segmentEnd - segmentStart);

      // Игнорируем сегменты, соответствующие толщине полок (обычно 16мм)
      if (segmentValue > 20) {
        const lineName = `section_${sectionName}_vertical_${i}`;
        // Смещение текста: слева - влево, справа и центр - вправо
        const textOffsetX = sectionName.includes('left') ? -45 : 45;

        const line = this.dimensionLines.createDimensionLine(
          new THREE.Vector3(x, segmentStart + 2, zPos),
          new THREE.Vector3(x, segmentEnd - 2, zPos),
          segmentValue,
          false,
          false,
          20,
        );

        this.adjustTextPosition(line, textOffsetX);
        line.name = lineName;
        this.sceneManagerService.addObject(line);
        this.sectionLines.set(lineName, line);
      }
    }
  }

  /**
   * Настраивает позицию текста на размерной линии
   */
  private adjustTextPosition(lineGroup: THREE.Group, offsetX: number): void {
    const textSprite = lineGroup.children.find((child) => child.type === 'Sprite') as THREE.Sprite;

    if (textSprite) {
      // Получаем текущую позицию текста
      const currentPos = textSprite.position;

      // Смещаем текст по X для лучшей читаемости
      textSprite.position.set(currentPos.x + offsetX, currentPos.y, currentPos.z);
    }
  }

  /**
   * Получает высоту объекта
   */
  private getObjectHeight(obj: THREE.Object3D): number {
    // Проверяем, является ли объект полкой
    if (obj.name.includes('shelf') || obj.userData['type'] === 'shelf') {
      return obj.userData['size']?.height || SHELF_HEIGHT;
    }

    // Проверяем, является ли объект блоком ящиков
    if (obj.name.includes('drawer') || obj.name.includes('block')) {
      const fullSize = obj.userData['drawerData'].fullSize as FullDrawerBlockSize;
      return fullSize.shelf.size.height * 2 + fullSize.wall.size.height;
    }

    // Возвращаем высоту из userData или используем стандартную
    return obj.userData['size']?.height || obj.userData['height'] || 50;
  }

  /**
   * Создает одну размерную линию полной высоты секции
   */
  // private createFullHeightLine(
  //   sectionName: string,
  //   x: number,
  //   z: number,
  //   startY: number,
  //   endY: number,
  //   fullHeight: number,
  // ): void {
  //   // const fullHeight = endY - startY;
  //   // Определяем смещение текста в зависимости от секции
  //   const textOffsetX = sectionName === 'left' ? 40 : sectionName === 'right' ? -40 : 0;

  //   const lineName = `section_${sectionName}_full`;
  //   console.log('lineName');
  //   console.log(lineName);
  //   const line = this.dimensionLines.createDimensionLine(
  //     new THREE.Vector3(x, startY, z),
  //     new THREE.Vector3(x, endY, z),
  //     fullHeight,
  //     false,
  //     false,
  //     25,
  //   );

  //   // Настраиваем позицию текста
  //   this.adjustTextPosition(line, textOffsetX);

  //   line.name = lineName;
  //   this.sceneManagerService.addObject(line);
  //   this.sectionLines.set(lineName, line);
  // }

  private createFullHeightLine(
    sectionName: string,
    x: number,
    z: number,
    startY: number,
    endY: number,
    fullHeight: number,
  ): void {
    if (fullHeight <= 0) return;

    // Смещение текста в зависимости от стороны
    const textOffsetX = sectionName.includes('left') ? -45 : 45;

    const lineName = `section_${sectionName}_full`;
    const line = this.dimensionLines.createDimensionLine(
      new THREE.Vector3(x, startY, z),
      new THREE.Vector3(x, endY, z),
      Math.round(fullHeight),
      false,
      false,
      25,
    );

    this.adjustTextPosition(line, textOffsetX);
    line.name = lineName;
    this.sceneManagerService.addObject(line);
    this.sectionLines.set(lineName, line);
  }

  /**
   * Получает все объекты в шкафу (полки, ящики и т.д.)
   */
  /**
   * Получает все объекты в шкафу (полки, ящики и т.д.)
   */
  private getAllCabinetObjects(): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return objects;

    // Добавляем полки
    const shelves = cabinet.shelfManager.getShelves();
    shelves.forEach((shelf) => {
      if (shelf instanceof THREE.Object3D) {
        objects.push(shelf);
      }
    });

    // Добавляем блоки с ящиками (если есть DrawerManager)
    const drawerManager = cabinet.drawerManager;
    if (drawerManager) {
      // Получаем все блоки ящиков
      // Этот метод зависит от реализации вашего DrawerManager
      try {
        const drawerBlocks = drawerManager.getAllDrawerBlocks();
        drawerBlocks.forEach((block) => {
          if (block instanceof THREE.Object3D) {
            objects.push(block);
          }
        });
      } catch (error) {
        console.warn('Не удалось получить блоки ящиков:', error);
      }
    }

    // Можно добавить другие объекты: штангодержатели, подсветку и т.д.

    return objects;
  }

  /**
   * Определяет, находится ли объект в указанной секции
   */
  public isObjectInSection(
    obj: THREE.Object3D,
    section: 'left' | 'right' | 'center',
    cabinetWidth: number,
    hasMullion: boolean,
  ): boolean {
    if (!hasMullion) return section === 'center';

    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return false;

    const mullion = cabinet.getMullion();
    if (!mullion) return false;

    const objX = obj.position.x;
    const mullionX = mullion.position.x;

    switch (section) {
      case 'left':
        return objX < mullionX - WALL_THICKNESS / 2;
      case 'right':
        return objX > mullionX + WALL_THICKNESS / 2;
      case 'center':
        return true; // Для центральной секции без средника
      default:
        return false;
    }
  }

  /**
   * Обновляет линии для конкретной секции
   */
  public updateSectionLines(section: 'left' | 'right' | 'center'): void {
    // Удаляем только линии указанной секции
    this.sectionLines.forEach((line, name) => {
      if (name.includes(`section_${section}`)) {
        this.sceneManagerService.deleteObject(line);
        this.sectionLines.delete(name);
      }
    });

    // Пересоздаем линии для секции
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const width = cabinet.getCabinetWidth();
    const height = cabinet.getCabinetHeight();
    const depth = cabinet.getCabinetDepth();
    const hasMullion = cabinet.hasMullion();
    const allObjects = this.getAllCabinetObjects();
    const sectionObjects = this.groupObjectsBySection(allObjects, width, hasMullion);

    if (section === 'center' && !hasMullion) {
      this.createSectionVerticalLines(
        'center',
        -width / 2 + WALL_THICKNESS,
        width / 2 - WALL_THICKNESS,
        height,
        depth,
        sectionObjects['center'] || [],
      );
    } else if (hasMullion && (section === 'left' || section === 'right')) {
      const mullion = cabinet.getMullion();
      if (!mullion) return;

      const mullionX = mullion.position.x;

      if (section === 'left') {
        this.createSectionVerticalLines(
          'left',
          -width / 2 + WALL_THICKNESS,
          mullionX - WALL_THICKNESS,
          height,
          depth,
          sectionObjects['left'] || [],
        );
      } else {
        this.createSectionVerticalLines(
          'right',
          mullionX + WALL_THICKNESS,
          width / 2 - WALL_THICKNESS,
          height,
          depth,
          sectionObjects['right'] || [],
        );
      }
    }
  }

  /**
   * Удаляет все размерные линии секций
   */
  public removeAllSectionLines(): void {
    this.sectionLines.forEach((line, name) => {
      this.sceneManagerService.deleteObject(line);
    });
    this.sectionLines.clear();
  }

  /**
   * Обновляет линии при добавлении/удалении объекта
   */
  public onObjectAddedOrRemoved(): void {
    this.updateSectionHeightLines();
  }

  /**
   * Обрабатывает изменение средника
   */
  public onMullionChanged(): void {
    this.updateSectionHeightLines();
  }
}
