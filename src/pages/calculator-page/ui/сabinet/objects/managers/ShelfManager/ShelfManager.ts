import * as THREE from 'three';
import { Shelf, ShelfType } from '../../../model/Shelf';
import { DimensionLines } from '../../DimensionLines';

import {
  DEEP_DRAVER_IN_CABINET,
  DEPTH_EDGE_04MM,
  DEPTH_EDGE_08MM,
  DEPTH_EDGE_4MM,
  DEPTH_WIDTH_INTG_HADLE,
  INTERVAL_1_MM,
  MIN_DISTANCE_BETWEEN_SHELVES,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  SHELF_POSITION_OFFSET,
  WALL_THICKNESS,
} from '../../../constants';
import { CabinetGridManagerService } from 'src/pages/calculator-page/ui/services/CabinetGridManagerService.service';

import { RoundedBoxGeometry } from 'three-stdlib';
import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { BaseCabinet } from '../../../cabinetTypes/BaseCabinet';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { FullRodCurve, getRodTypeStub } from './RodManager';
import { RodMaterials, RodType } from '../../../model/Rod';
import { PositionCutout } from '../../../model/Facade';
import { EDGE_04, Position } from '../../../model/BaseModel';
import { Mullion } from '../../../model/Mullion';
import { SingleDoorCabinet } from '../../../cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../../../cabinetTypes/doubleDoorCabinet';

/**
 *  class для управления полками в шкафу
 * @constructor (scene: THREE.Scene, dimensionLines: DimensionLines, size: Size, actionStack: any[])
 *
 */
export class ShelfManager {
  private sceneManagerService: SceneManagerService;
  private shelves: Map<number, THREE.Object3D> = new Map();
  private dimensionLines: DimensionLines;
  private size: Size;

  constructor(
    sceneManagerService: SceneManagerService,
    dimensionLines: DimensionLines,
    size: Size,
  ) {
    this.size = size;
    this.dimensionLines = dimensionLines;
    this.sceneManagerService = sceneManagerService;
  }
  /**
   *
   * @param shelfDataArray
   */
  public syncShelvesFromCabinetParams(shelfDataArray: Shelf[], cabinetSize: Size): void {
    this.removeAllShelves(); // Удаляем все текущие полки
    shelfDataArray.forEach((shelfData) => {
      this.addShelf(shelfData, cabinetSize); // Добавляем каждую полку из массива
    });
  }

  /**
   * Добавляет полку в указанную секцию
   */
  public addShelfToSection(
    shelfY: number,
    section: 'left' | 'right' | 'center',
  ): THREE.Object3D | null {
    const cabinet: SingleDoorCabinet | DoubleDoorCabinet = this.sceneManagerService.getCabinet();

    // const cabinet: BaseCabinet = this.sceneManagerService.getProduct();
    const cabinetSize = cabinet.getCabinetSize();

    // Определяем правильное положение вырезов
    const positionCutout = this.determinePositionCutout(section, cabinet);

    // Вычисляем параметры секции
    const sectionParams = this.calculateSectionParams(section, cabinetSize);

    if (!sectionParams) {
      console.error('Cannot calculate section parameters for shelf');
      return null;
    }

    // Создаем объект полки
    const shelfData: Shelf = {
      id: this.getNextShelfId(),
      position: {
        x: sectionParams.positionX,
        y: shelfY,
        z: this.calculateShelfZPosition(cabinet),
      },
      size: {
        width: sectionParams.availableWidth,
        height: SHELF_HEIGHT,
        depth: this.calculateShelfDepth(cabinet),
      },
      material: cabinet.getCabinetParams().appearance.visibleDtails,
      cutout: 'cutout', // или 'recessed' в зависимости от логики
      positionCutout: positionCutout,
      countCutout: 0,
      section: section,
    };

    // Устанавливаем флаг в true при добавлении первой полки
    cabinet.getCabinetParams().components.shelves.checkBox = true;
    cabinet.getCabinetParams().components.shelves.shelfItems.push(shelfData);
    // Добавляем полку
    this.addShelf(shelfData, cabinetSize);
    // Находим и возвращаем созданную полку
    const createdShelf = this.shelves.get(shelfData.id);
    return createdShelf || null;
  }

  /**
   * Метод для добавления полки
   * @param shelfData - модель полки
   */
  public addShelf(shelfData: Shelf, cabinetSize: Size): void {
    const { id, material, position, size } = shelfData;
    this.size = size;

    // Определяем позицию новой полки
    let newPositionY = position.y;

    // Создаём новую полку с обновлённой позицией
    const shelfGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const shelfMaterial = BaseCabinet.getMaterial(material.texture.path);
    BaseCabinet.rotateUVs(shelfGeometry);

    const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
    const edgeMaterial = BaseCabinet.getMaterial(material.texture.path);

    const frontEdgeThickness = 0.8;
    const frontEdge = new THREE.Mesh(
      new RoundedBoxGeometry(size.width, size.height, frontEdgeThickness, 2, 0.2),
      edgeMaterial,
    );

    const originalPositionEdge: Position = {
      x: 0,
      y: 0,
      z: size.depth / 2 + DEPTH_EDGE_04MM / 2,
    };
    frontEdge.position.set(originalPositionEdge.x, originalPositionEdge.y, originalPositionEdge.z);
    frontEdge.name = `frontEdgeShelf_${id}`;

    const originalPositionShelf: Position = {
      x: shelfData.position.x,
      y: newPositionY,
      z: shelfData.position.z + INTERVAL_1_MM * 2,
    };
    shelfMesh.position.set(
      originalPositionShelf.x,
      originalPositionShelf.y,
      originalPositionShelf.z,
    );
    shelfMesh.userData['id'] = id;
    shelfMesh.userData['baseGeometry'] = shelfGeometry.clone(); // ✅ исходная
    // shelfMesh.userData['cutoutState'] = 'none'; // 'none' | 'left-side' | 'right-side' | 'both'
    shelfMesh.name = `shelf_${id}`;
    shelfMesh.userData['baseY'] = shelfMesh.position.y;
    shelfMesh.userData['originalPositionShelf'] = shelfMesh.position;
    shelfMesh.userData['originalPositionEdge'] = shelfMesh.position;
    shelfMesh.userData['type'] = shelfData.cutout;
    shelfMesh.userData['size'] = {
      width: size.width,
      height: size.height,
      depth: size.depth,
    };
    shelfMesh.userData['section'] = shelfData.section;
    // shelfMesh.userData['fullWidth'] = true;

    console.log('Создана полка с названием: ' + shelfMesh.name);
    console.log('Размер полки: ', size);
    shelfMesh.add(frontEdge);

    this.sceneManagerService.addObject(shelfMesh);
    this.shelves.set(id, shelfMesh);

    // this.dimensionLines.updateAllShelfDimensionLines(
    //   Array.from(this.shelves.values()),
    //   cabinetSize.width,
    //   cabinetSize.height,
    // );

    console.log('Shelf added:', shelfMesh);
    console.log('Current shelves:', Array.from(this.shelves.values()));
  }

  /**
   * Вычисляет параметры секции для полки
   */
  private calculateSectionParams(
    section: 'left' | 'right' | 'center',
    cabinetSize: Size,
  ): { availableWidth: number; positionX: number } | null {
    const cabinet: SingleDoorCabinet | DoubleDoorCabinet = this.sceneManagerService.getCabinet();
    const hasMullion = cabinet.hasMullion();
    const mullionPosition = hasMullion ? cabinet.getMullion().position.x : 0;
    const cabinetWidth = cabinetSize.width;

    if (hasMullion) {
      switch (section) {
        case 'left':
          const leftWidth =
            cabinetWidth / 2 + mullionPosition - WALL_THICKNESS - WALL_THICKNESS / 2;
          const leftPositionX = -cabinetWidth / 4 + mullionPosition / 2 + INTERVAL_1_MM * 4;
          return { availableWidth: leftWidth, positionX: leftPositionX };

        case 'right':
          const rightWidth =
            cabinetWidth / 2 - mullionPosition - WALL_THICKNESS - WALL_THICKNESS / 2;
          const rightPositionX = cabinetWidth / 4 + mullionPosition / 2 - INTERVAL_1_MM * 4;
          return { availableWidth: rightWidth, positionX: rightPositionX };

        default:
          return null;
      }
    } else {
      // Без средника - вся ширина
      const centerWidth = cabinetWidth - WALL_THICKNESS * 2;
      return { availableWidth: centerWidth, positionX: 0 };
    }
  }

  /**
   * Определяет правильное положение вырезов для петель в зависимости от типа шкафа и секции
   */
  private determinePositionCutout(
    section: 'left' | 'right' | 'center',
    cabinet: SingleDoorCabinet | DoubleDoorCabinet | BaseCabinet,
  ): PositionCutout {
    const cabinetType = cabinet.getCabinetType();
    const hasMullion = cabinet.hasMullion();

    // Для одностворчатого шкафа
    if (cabinetType === CabinetSubType.Single) {
      // Можно получить из настроек фасада или использовать значение по умолчанию
      const facadeParams = cabinet.getCabinetParams().components.facades.facadeItems[0];
      return facadeParams.positionLoops || 'right-side'; // или 'left-side' по умолчанию
    }

    // Для двустворчатого шкафа
    if (cabinetType === CabinetSubType.Double) {
      if (hasMullion) {
        // Со средником - каждая секция имеет свой вырез
        switch (section) {
          case 'left':
            return 'left-side';
          case 'right':
            return 'right-side';
          case 'center':
            return 'right-side'; // по умолчанию для центра
        }
      } else {
        // Без средника - вырезы с обеих сторон
        return 'both';
      }
    }

    return 'right-side'; // значение по умолчанию
  }

  /**
   * Вычисляет глубину полки в зависимости от типа фасада
   */
  private calculateShelfDepth(cabinet: SingleDoorCabinet | DoubleDoorCabinet): number {
    const cabinetDepth = cabinet.getCabinetSize().depth;
    const facadeType = cabinet.getFacadeType();

    if (facadeType === 'INTEGRATED_HANDLE') {
      return cabinetDepth - DEPTH_WIDTH_INTG_HADLE - 4 - 5;
    } else {
      return cabinetDepth - 4 - 5;
    }
  }

  /**
   * Вычисляет позицию по Z для полки
   */
  private calculateShelfZPosition(cabinet: any): number {
    const facadeType = cabinet.getFacadeType();

    if (facadeType === 'INTEGRATED_HANDLE') {
      return -DEPTH_WIDTH_INTG_HADLE / 2;
    } else {
      return (2 + 2.5) / -2;
    }
  }

  /**
   * Метод для обновления размеров полки
   * @param size - размеры [width, height, depth]
   */
  public updateShelfSize(cabinetSize: Size, isIntegratedHandle: string): void {
    const { width, height, depth } = cabinetSize;
    const cabinet: SingleDoorCabinet | DoubleDoorCabinet = this.sceneManagerService.getCabinet();
    const mullion = cabinet.getMullion();
    const positionHinges = cabinet.getPositionHinges();

    const depthOffset =
      isIntegratedHandle === 'INTEGRATED_HANDLE' ? depth - DEPTH_WIDTH_INTG_HADLE : depth;
    const zPosition =
      isIntegratedHandle === 'INTEGRATED_HANDLE'
        ? -DEPTH_WIDTH_INTG_HADLE / 2 - INTERVAL_1_MM * 2
        : INTERVAL_1_MM * 2;

    const hasMullion = cabinet.hasMullion();
    const halfCabinetWidth = width / 2;

    console.log('Update shelf size');

    this.shelves.forEach((shelf: THREE.Mesh) => {
      const type = shelf.userData['type'] as ShelfType;

      let shelfWidth = width - WALL_THICKNESS * 2; // по умолчанию (если нет средника)
      let shelfX = 0;

      if (hasMullion && mullion) {
        const wasLeft = shelf.position.x < mullion.position.x;

        // если полка помечена как fullWidth — игнорируем средник
        console.log('Проверка на fullWidth:', shelf.userData['fullWidth']);
        if (shelf.userData['fullWidth']) {
          console.log('Проверка на смещение полки!');
          shelfWidth = width - WALL_THICKNESS * 2;
          shelfX = 0;
        } else {
          console.log('Проверка на смещение полки!');
          const leftWidth = mullion.position.x + halfCabinetWidth - SHELF_HEIGHT - SHELF_HEIGHT / 2;
          const rightWidth =
            halfCabinetWidth - mullion.position.x - SHELF_HEIGHT - SHELF_HEIGHT / 2;

          if (wasLeft) {
            shelfWidth = leftWidth;
            shelfX = -halfCabinetWidth + shelfWidth / 2 + WALL_THICKNESS;
          } else {
            shelfWidth = rightWidth;
            shelfX = mullion.position.x + WALL_THICKNESS + shelfWidth / 2 - WALL_THICKNESS / 2;
          }
        }
      } else {
        // если нет средника, всегда во всю ширину
        shelfWidth = width - WALL_THICKNESS * 2;
        shelfX = 0;
      }
      const shelfDepth = depthOffset - 4 - 5;

      // Обновляем геометрию
      shelf.geometry.dispose();
      const shelfGeometry = new THREE.BoxGeometry(shelfWidth, SHELF_HEIGHT, shelfDepth);
      BaseCabinet.rotateUVs(shelfGeometry);
      shelf.geometry = shelfGeometry;


      shelf.position.x = shelfX;
      // Обновляем мета-данные
      shelf.userData['size'] = {
        width: shelfWidth,
        height: SHELF_HEIGHT,
        depth: shelfDepth,
      };

      this.updateShelfEdge(shelf, type, positionHinges);

      // === Обновляем подсветку ===
      CabinetGridManagerService.removeGridHighlight(shelf);
      CabinetGridManagerService.highlightObjectWithGrid(shelf, 0x00ff00);

      // Обновляем штангу, если есть
      const rodGroup = shelf.children.find((child) => child.name.includes(`rod_`)) as THREE.Group;
      if (rodGroup) {
        this.updateRodSize(shelf);
      }
    });

    // Обновление размерных линий полок
    // this.dimensionLines.updateAllShelfDimensionLines(
    //   Array.from(this.shelves.values()),
    //   cabinetSize.width,
    //   cabinetSize.height,
    // );
  }

  /**
   * Обновляет вырезы для всех полок при изменении расположения петель
   */
  public updateAllShelfCutouts(positionCutout: PositionCutout): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const shelfMaterial = cabinet.getCabinetParams().appearance.visibleDtails;
    const material = BaseCabinet.getMaterial(shelfMaterial.texture.path);

    this.shelves.forEach((shelf: THREE.Object3D) => {
      if (shelf.userData['type'] === 'cutout') {
        // Удаляем старые вырезы
        this.removeCutoutForHinge(shelf);

        // Добавляем новые вырезы
        this.addCutoutForHinge(shelf as THREE.Mesh, positionCutout, material);

        // Обновляем кромку
        this.updateShelfEdge(shelf, shelf.userData['type'] as ShelfType, positionCutout);
      }
    });
  }

  /**
   * Обновляет положение выреза в модели данных для всех полок
   */
  public updateAllShelfModelsCutout(positionCutout: PositionCutout): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const shelfItems = cabinet.getCabinetParams().components.shelves.shelfItems;

    this.shelves.forEach((shelf: THREE.Object3D) => {
      const shelfId = this.getIdShelve(shelf);
      const shelfModel = shelfItems.find((item: any) => item.id === shelfId);

      if (shelfModel) {
        shelfModel.positionCutout = positionCutout;
      }
    });
  }

  /**
   * Обновляет кромку полки в соответствии с её типом
   * @param shelf - объект полки
   * @param type - тип полки (cutout/recessed)
   */
  public updateShelfEdge(
    shelf: THREE.Object3D,
    type: ShelfType,
    positionHinges: PositionCutout,
  ): void {
    const frontEdge = shelf.children.find((child) =>
      child.name.startsWith('frontEdgeShelf_'),
    ) as THREE.Mesh;

    if (!frontEdge) {
      console.error('Front edge not found for shelf:', shelf.name);
      return;
    }

    const cabinet = this.sceneManagerService.getCabinet();
    const hasMullion = cabinet.hasMullion();
    const mullion = cabinet.getMullion();

    const shelfWidth = shelf.userData['size'].width;
    const shelfDepth = shelf.userData['size'].depth;

    let edgeWidth = shelfWidth;
    let edgeOffsetX = 0; // теперь относительно самой полки (локальная координата)
    let zOffset = 0;
    // --- Учитываем вырезы под петли ---
    switch (positionHinges) {
      case 'left-side':
        if (type != 'recessed') {
          edgeWidth -= 15 + 1;
          edgeOffsetX = 15 / 2 + 0.5;
        } else {
          frontEdge.position.z =
            shelfDepth / 2 - DEEP_DRAVER_IN_CABINET / 2 + DEPTH_EDGE_04MM * 2 + 4;
        }
        break;
      case 'right-side':
        if (type != 'recessed') {
          edgeWidth -= 15 + 1;
          edgeOffsetX = -15 / 2 - 0.5;
        } else {
          frontEdge.position.z =
            shelfDepth / 2 - DEEP_DRAVER_IN_CABINET / 2 + DEPTH_EDGE_04MM * 2 + 4;
        }

        break;
      case 'both':
        edgeWidth -= 30;

        if (type === 'recessed') {
          console.log('Recessed shelf edge positioning');
          frontEdge.position.z = shelfDepth / 2 - DEEP_DRAVER_IN_CABINET / 2 + DEPTH_EDGE_04MM / 2;
        } else {
          frontEdge.position.z = shelfDepth / 2 + DEPTH_EDGE_04MM;
        }
        break;

      case 'none':
        edgeWidth = shelfWidth;
        frontEdge.position.z = shelfDepth / 2 + DEPTH_EDGE_04MM;
        break;
    }

    // --- Обновляем геометрию ---
    frontEdge.geometry.dispose();

    frontEdge.geometry = new RoundedBoxGeometry(edgeWidth, SHELF_HEIGHT, DEPTH_EDGE_08MM, 2, 0.2);

    // --- Центрируем кромку относительно полки ---
    frontEdge.position.x = edgeOffsetX;
    // console.log(`Shelf edge updated: type=${type}, hinges=${positionHinges}, width=${edgeWidth}`);
  }

  // /**
  //  * Метод для обновления кромки полки при изменении размеров
  //  * @param shelf - объект полки
  //  * @param newWidth - новая ширина полки
  //  */
  // private updateShelfEdge(shelf: THREE.Object3D, newWidth: number): void {
  //   const frontEdge = shelf.children.find((child) => child.name.startsWith('frontEdgeShelf_'));

  //   if (!frontEdge || !(frontEdge instanceof THREE.Mesh)) return;

  //   // Удаление старой геометрии
  //   frontEdge.geometry.dispose();

  //   // Назначение новой геометрии
  //   frontEdge.geometry = new RoundedBoxGeometry(newWidth, SHELF_HEIGHT, 0.8, 2, 0.2);

  //   // Безопасный доступ к depth
  //   const depth = shelf.userData?.['size']?.depth;
  //   if (typeof depth === 'number') {
  //     frontEdge.position.set(0, 0, depth / 2 + DEPTH_EDGE_04MM / 2);
  //   }
  // }

  public addCutoutForHinge(
    shelf: THREE.Mesh,
    side: PositionCutout,
    shelfMaterial: THREE.Material,
  ): THREE.Mesh {
    // Исходные данные
    const size = shelf.userData['size'];
    if (!size) return shelf;

    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetSize = cabinet.getCabinetSize();
    const hasIntegratedHandle = cabinet.getFacadeType() === 'INTEGRATED_HANDLE';

    // Сброс геометрии
    shelf.geometry.dispose();
    shelf.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    BaseCabinet.rotateUVs(shelf.geometry);

    const typeShelf = shelf.userData['type'];
    const isRecessed = typeShelf === 'recessed';

    // Если пересечения нет (side === 'none')
    if (side === 'none' && !isRecessed) {
      return shelf;
    }

    // Логика для полки с подрезкой 80мм
    if (isRecessed) {
      const recessedDepth = cabinetSize.depth - DEEP_DRAVER_IN_CABINET;
      const shiftZ = 0 - DEEP_DRAVER_IN_CABINET / 2 + 4.5;

      shelf.geometry.dispose();
      shelf.geometry = new THREE.BoxGeometry(size.width, size.height, recessedDepth);
      shelf.position.z = shiftZ;

      BaseCabinet.applyUVMapping(shelf.geometry);
      BaseCabinet.rotateUVs(shelf.geometry);
      // Если для recessed не нужны вырезы под петли
      if (side === 'none') return shelf;
    }

    // Вырезы (CSG)
    const cutoutWidth = 30;
    const cutoutDepth = hasIntegratedHandle ? 44 : 75;
    const radius = cabinet.getCabinetParams().features.cutoutPlinth.radius;

    // Вспомогательная функция для вычитания
    const applySubtraction = (position: 'left' | 'right') => {
      // Создаем "нож" для выреза
      const cutterGeom = BaseCabinet.buildRoundedCornerPanelGeometryForShelf(
        cutoutWidth,
        size.height + 2, // Чуть выше полки для чистого реза
        cutoutDepth,
        radius,
      );
      const cutter = new THREE.Mesh(cutterGeom);

      // Позиционируем нож относительно локального центра полки
      const x =
        position === 'left' ? -size.width / 2 + cutoutWidth / 2 : size.width / 2 - cutoutWidth / 2;
      const z = size.depth / 2 - cutoutDepth / 2;

      cutter.position.set(x, 0, z);
      if (position === 'left') cutter.rotation.z = Math.PI;

      cutter.updateMatrix();

      // Выполняем вычитание (CSG)
      const result = BaseCabinet.subtract(
        shelf,
        cutter,
        shelfMaterial,
        cutter.position.clone(),
        cutter.rotation.clone(),
      );

      // Заменяем геометрию полки на результат вычитания
      shelf.geometry.dispose();
      shelf.geometry = result.geometry;
    };

    // Применяем вырезы
    if (side === 'left-side' || side === 'both') {
      applySubtraction('left');
    }
    if (side === 'right-side' || side === 'both') {
      applySubtraction('right');
    }

    // Подстраиваем текстуру
    BaseCabinet.applyUVMapping(shelf.geometry);
    BaseCabinet.rotateUVs(shelf.geometry);

    return shelf;
  }

  // public removeCutoutForHinge(shelf: THREE.Object3D): void {
  //   const cutout = shelf.children.find((child) => child.name.startsWith('hingeCutout'));
  //   const frontEdge = shelf.children.find((child) =>
  //     child.name.startsWith('frontEdgeShelf_'),
  //   ) as THREE.Mesh;

  //   if (cutout) {
  //     shelf.remove(cutout);

  //     if ((cutout as THREE.Mesh).geometry) {
  //       (cutout as THREE.Mesh).geometry.dispose();
  //     }

  //     if ((cutout as THREE.Mesh).material) {
  //       ((cutout as THREE.Mesh).material as THREE.Material).dispose();
  //     }
  //   }
  //   frontEdge.position.x = shelf.position.x;

  //   // Восстанавливаем позицию полки по Z
  //   if (shelf.userData['type'] == 'recessed') {
  //     // Для recessed полки возвращаем исходную позицию
  //     const cabinetDepth = this.sceneManagerService.getCabinet().getCabinetSize().depth;
  //     const originalZ = 0; // Или другое значение, если у вас есть логика расчета
  //     shelf.position.z = originalZ;
  //   }

  //   // Пересоздание полки
  //   this.rebuildShelf(shelf);
  // }
  public removeCutoutForHinge(shelf: THREE.Object3D): void {
    const mesh = shelf as THREE.Mesh;
    const size = shelf.userData['size'];

    // 1. Возвращаем чистую геометрию бокса (без вырезов)
    if (mesh.geometry) mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);

    // 2. Сбрасываем UV и поворот текстур
    BaseCabinet.rotateUVs(mesh.geometry);

    // 3. Если это была "утопленная" полка (recessed), возвращаем её Z позицию
    // (проверьте ваши константы, здесь пример логики)
    if (shelf.userData['type'] === 'recessed') {
      // shelf.position.z = ...
    }

    // 4. Обновляем кромку (edge), чтобы она снова стала полной ширины
    this.updateShelfEdge(shelf, shelf.userData['type'], 'none');
  }
  private rebuildShelf(shelf: THREE.Object3D): void {
    // Удалить текущую геометрию
    const mesh = shelf as THREE.Mesh;
    mesh.geometry.dispose();

    // Создать новую геометрию и присвоить
    mesh.geometry = new THREE.BoxGeometry(
      shelf.userData['size'].width,
      shelf.userData['size'].height,
      shelf.userData['size'].depth,
    );
    BaseCabinet.rotateUVs(mesh.geometry);
  }

  /**
   * Добавляет/удаляет штангу на полке с учетом типа шкафа и выбранной стороны
   * @param shelf Полка, на которую добавляется штанга
   * @param side Сторона ('left', 'right' или 'full')
   */
  public addRodShelf(shelf: THREE.Object3D, side: 'left' | 'right' | 'full' = 'full'): void {
    console.log(shelf);
    // Проверяем тип шкафа из userData полки или кабинета
    const cabinetType = this.sceneManagerService.getCabinet().getCabinetType();

    const shelfType = shelf.userData['type'];
    if (shelfType === 'topCabinet') {
      if (this.hasRod(shelf, side)) {
        this.deleteRod(shelf, side);
        shelf.userData['hasRod'] = false;
        console.log(`Штанга удалена (topCabinet): ${side}`);
      } else {
        this.addRod(shelf, side);
        shelf.userData['hasRod'] = true;
        console.log(`Штанга добавлена (topCabinet): ${side}`);
      }
      return; // ⬅ выходим, чтобы не провалиться в общую логику
    }

    // Для double шкафа проверяем наличие средника
    const hasMullion = this.sceneManagerService.getCabinet().hasMullion();
    console.log(cabinetType);
    console.log(hasMullion);
    if (hasMullion) {
      // Для double шкафа
      if (this.hasRod(shelf, side)) {
        console.log(`Штанга ${shelf.name} (${side}) удалена!`);
        this.deleteRod(shelf, side);
      } else {
        console.log(`Штанга для ${shelf.name} добавлена! Сторона: ${side}`);
        this.addRod(shelf, side);
      }
    } else if (cabinetType === CabinetSubType.Double) {
      if (this.hasRod(shelf, side)) {
        console.log(`Штанга ${shelf.name} (${side}) удалена!`);
        this.deleteRod(shelf, side);
      } else {
        console.log(`Штанга для ${shelf.name} добавлена! Сторона: ${side}`);
        this.addRod(shelf, side);
      }
    } else {
      // Для single шкафа
      const effectiveSide = 'full';

      if (this.hasRod(shelf, effectiveSide)) {
        console.log(`Штанга ${shelf.name} (${effectiveSide}) удалена!`);
        this.deleteRod(shelf, effectiveSide);
      } else {
        console.log(`Штанга для ${shelf.name} добавлена на всю ширину`);
        this.addRod(shelf, effectiveSide);
      }
    }
  }

  public getRodSide(shelf: THREE.Object3D): 'left' | 'right' | 'full' | null {
    const sides: Array<'left' | 'right' | 'full'> = ['left', 'right', 'full'];

    for (const side of sides) {
      if (this.hasRod(shelf, side)) {
        return side;
      }
    }

    return null;
  }

  public getRodSides(shelf: THREE.Object3D): Array<'left' | 'right' | 'full'> {
    const sides: Array<'left' | 'right' | 'full'> = ['left', 'right', 'full'];
    return sides.filter((side) => this.hasRod(shelf, side));
  }

  public shelfTypeChange(shelf: THREE.Object3D, type: ShelfType): void {
    if (!shelf) {
      console.error('Shelf is undefined!');
      return;
    }

    // Сохраняем тип полки в userData для последующего использования
    shelf.userData['type'] = type;

    console.log(`Тип полки ${shelf.name} изменён на ${type}`);
  }

  /**
   *
   *
   * @param {THREE.Object3D} shelf
   * @return {*}  {boolean}
   * @memberof ShelfManager
   */
  public hasRod(shelf: THREE.Object3D, side: 'left' | 'right' | 'full'): boolean {
    return shelf.children.some((child) => child.name.includes(`rod_${shelf.name}_${side}`));
  }

  /**
   * Добавляет штангу(и) к полке.
   * Если полка во всю ширину и под ней есть средник -> создаём 2 штанги (левая/правая), центрированные относительно средника.
   * Иначе — исходная логика.
   */
  public addRod(
    shelf: THREE.Object3D,
    side: 'left' | 'right' | 'full',
    skipModelUpdate = false,
  ): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetSize = cabinet.getCabinetSize();
    const typeRod = getRodTypeStub(cabinetSize.depth);
    const materials: RodMaterials = {
      rod: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.3 }),
      tip: new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.3, roughness: 0.6 }),
      holder: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5, roughness: 0.3 }),
    };

    const shelfSize = this.getShelfSize(shelf);
    const rodPositionY = this.calculateRodPositionY(shelfSize, typeRod);

    // topCabinet имеет свою отдельную логику
    if (this.isTopCabinet(shelf)) {
      this.addRodForTopCabinet(
        shelf,
        side,
        materials,
        shelfSize,
        cabinetSize,
        rodPositionY,
        typeRod,
        skipModelUpdate,
      );
      return;
    }

    // стандартная логика
    this.addStandardRod(shelf, shelfSize, cabinetSize, materials, side, typeRod, rodPositionY);
  }

  private addRodForTopCabinet(
    shelf: THREE.Object3D,
    side: 'left' | 'right' | 'full',
    materials: RodMaterials,
    shelfSize: Size,
    cabinetSize: Size,
    rodPositionY: number,
    typeRod: RodType,
    skipModelUpdate: boolean,
  ): void {
    const fullWidth = shelfSize.width;
    let rodWidth: number;
    let offsetX: number;

    if (side === 'full') {
      rodWidth = fullWidth - WALL_THICKNESS * 2;
      offsetX = 0;
    } else if (side === 'left') {
      rodWidth = fullWidth / 2 - WALL_THICKNESS;
      offsetX = -(fullWidth / 4);
    } else {
      rodWidth = fullWidth / 2 - WALL_THICKNESS;
      offsetX = fullWidth / 4;
    }

    this.createAndAttachRod(
      shelf,
      offsetX,
      rodWidth,
      side,
      rodPositionY,
      shelfSize,
      materials,
      typeRod,
      cabinetSize,
      skipModelUpdate,
    );

    if (!skipModelUpdate) {
      shelf.userData['hasRod'] = true;
      console.log('Установлен hasRod = true для', shelf.name);
    }
  }

  /**
   * Создаёт штангу и добавляет её в сцену + модель.
   */
  private createAndAttachRod(
    shelf: THREE.Object3D,
    offsetX: number,
    sectionWidth: number,
    sideName: 'left' | 'right' | 'full',
    rodPositionY: number,
    shelfSize: Size,
    materials: RodMaterials,
    typeRod: RodType,
    cabinetSize: Size,
    skipModelUpdate: boolean = false,
  ): void {
    const rodGroup = this.createRodGroup(shelf, sideName, offsetX);

    // === Создаём геометрию в зависимости от глубины шкафа ===
    this.addRodGeometry(shelf, rodGroup, shelfSize, sectionWidth, materials, typeRod, cabinetSize);

    // === Обновляем модель ===
    if (!skipModelUpdate) {
      // <--- защита (если мы просто пересоздаём шкаф и top уже есть штанга)
      this.updateRodModel(shelf, sideName, sectionWidth, typeRod);
    }

    // === Добавляем в сцену ===
    shelf.add(rodGroup);
    rodGroup.position.set(offsetX, rodPositionY, 0);

    console.log('shelf.userData["hasRod"] - ', shelf.userData['hasRod']);
    shelf.userData['hasRod'] = true;

    console.log(`Added rod: ${sideName}, width: ${sectionWidth} to ${shelf.name} at X=${offsetX}`);
  }

  /**
   * Создаёт группу для штанги с базовыми userData.
   */
  private createRodGroup(shelf: THREE.Object3D, sideName: string, offsetX: number): THREE.Group {
    const rodGroup = new THREE.Group();
    rodGroup.name = `rod_${shelf.name}_${sideName}_${Math.round(offsetX)}`;
    rodGroup.userData['type'] = 'rod';
    rodGroup.userData['side'] = sideName;
    return rodGroup;
  }

  /**
   * Создаёт геометрию штанги в зависимости от глубины шкафа.
   */
  private addRodGeometry(
    shelf: THREE.Object3D,
    rodGroup: THREE.Group,
    shelfSize: Size,
    sectionWidth: number,
    materials: RodMaterials,
    typeRod: string,
    cabinetSize: Size,
  ): void {
    console.log('WHAT', cabinetSize.depth);
    if (cabinetSize.depth == 580) {
      this.addRodFor580Depth(
        shelf,
        { ...shelfSize, width: sectionWidth },
        rodGroup,
        materials,
        typeRod,
      );
    } else if (cabinetSize.depth == 430) {
      const hasHandle =
        this.sceneManagerService.getCabinet().getFacadeType() === 'INTEGRATED_HANDLE';
      this.addRodFor430Depth(shelf, rodGroup, materials, hasHandle);
    }
  }

  /**
   * Обновляет модель (CabinetParams) информацией о новой штанге.
   */
  private updateRodModel(
    shelf: THREE.Object3D,
    sideName: 'left' | 'right' | 'full',
    sectionWidth: number,
    typeRod: RodType,
  ): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const shelvesModel = cabinet.getCabinetParams().components.shelves;

    if (shelf.name.startsWith('topCabinet')) {
      if (!shelvesModel.topShelf) shelvesModel.topShelf = [];

      const exists = shelvesModel.topShelf.some(
        (r) => r.position === sideName && Math.abs(r.length - sectionWidth) < 0.1,
      );

      if (!exists) {
        shelvesModel.topShelf.push({ type: typeRod, position: sideName, length: sectionWidth });
      } else {
        console.log(`Rod already exists: ${sideName}, length: ${sectionWidth}`);
      }
      return;
    }

    const shelfModel = shelvesModel.shelfItems.find((s) => s.id === shelf.userData['id']);
    if (!shelfModel) return;

    if (!shelfModel.rods) shelfModel.rods = [];

    const exists = shelfModel.rods.some(
      (r) => r.position === sideName && Math.abs(r.length - sectionWidth) < 0.1,
    );

    if (!exists) {
      shelfModel.rods.push({ type: typeRod, position: sideName, length: sectionWidth });
    } else {
      console.log(
        `Rod already exists on shelf ${shelf.userData['id']}: ${sideName}, length: ${sectionWidth}`,
      );
    }
  }

  private addStandardRod(
    shelf: THREE.Object3D,
    shelfSize: Size,
    cabinetSize: Size,
    materials: RodMaterials,
    side: 'left' | 'right' | 'full',
    typeRod: RodType,
    rodPositionY: number,
  ): void {
    const fullWidth = shelfSize.width;
    console.log('Full width for rod:', fullWidth);
    const halfWidth = (fullWidth - INTERVAL_1_MM) / 2;

    let rodWidth: number;
    let offsetX: number;
    if (side == 'full') {
      rodWidth = fullWidth - WALL_THICKNESS * 2;
      offsetX = 0;
    } else if (side == 'left') {
      rodWidth = halfWidth - WALL_THICKNESS;
      offsetX = -(fullWidth / 4);
    } else {
      rodWidth = halfWidth - WALL_THICKNESS;
      offsetX = fullWidth / 4;
    }

    this.createAndAttachRod(
      shelf,
      offsetX,
      rodWidth,
      side,
      rodPositionY,
      shelfSize,
      materials,
      typeRod,
      cabinetSize,
    );
  }

  private getShelfSize(shelf: THREE.Object3D): Size {
    const boundingBox = new THREE.Box3().setFromObject(shelf);
    const size = boundingBox.getSize(new THREE.Vector3());
    return { width: size.x, height: size.y, depth: size.z };
  }

  private calculateRodPositionY(shelfSize: Size, typeRod: string): number {
    let rodPositionY = -shelfSize.height / 2;
    if (typeRod !== 'extendableRod') {
      rodPositionY -= 50; // только для прямой
    }
    return rodPositionY;
  }

  private getCabinetGeometry(cabinet: BaseCabinet) {
    const halfCabinet = cabinet.getCabinetWidth() / 2;
    const innerLeftEdge = -halfCabinet + WALL_THICKNESS;
    const innerRightEdge = halfCabinet - WALL_THICKNESS;
    const mullion = cabinet.getCabinetParams().components.mullion;
    const hasMullion = !!mullion && typeof mullion.position?.x === 'number';
    const mullionX = hasMullion ? mullion.position.x : 0;
    return { innerLeftEdge, innerRightEdge, mullion, hasMullion, mullionX };
  }

  private isTopCabinet(shelf: THREE.Object3D): boolean {
    return shelf.name.startsWith('topCabinet');
  }

  public findParentShelf(rod: THREE.Object3D): THREE.Object3D | null {
    let parent = rod.parent;
    while (parent) {
      if (parent.name.startsWith('shelf') || parent.name.startsWith('topCabinet')) {
        return parent;
      }
      parent = parent.parent;
    }
    return null;
  }

  /**
   * Обновляет размеры всех установленных штанг для данной полки
   *
   * @param {THREE.Object3D} shelf - Объект полки
   * @memberof ShelfManager
   */
  public updateRodSize(shelf: THREE.Object3D): void {
    const sides: ('left' | 'right' | 'full')[] = ['left', 'right', 'full'];
    console.log('Просто проверка обновления размеров штанг для', shelf.name);
    let found = false;
    for (const side of sides) {
      if (this.hasRod(shelf, side)) {
        console.log(`Обновление штанги (${side}) для ${shelf.name}...`);
        this.deleteRod(shelf, side);
        this.addRod(shelf, side);

        found = true;
      }
    }

    if (!found) {
      console.warn(`Штанга для ${shelf.name} не найдена. Обновление невозможно.`);
    }
  }

  private createCeilingHolder(
    xPos: number,
    height: number,
    rodYPos: number,
    radius: number,
    material: THREE.Material,
  ): THREE.Group {
    const group = new THREE.Group();

    const part1Height = height * 0.15;
    const part2Height = height * 0.5;
    const part3Height = height * 0.25;

    // Радиусы (по убыванию)
    const radius1 = radius * 1.2; // широкий и короткий
    const radius2 = radius * 0.8; // средний
    const radius3 = radius / 2; // самый узкий

    // Первый цилиндр (широкий)
    const cyl1 = new THREE.Mesh(
      new THREE.CylinderGeometry(radius1, radius1, part1Height, 16),
      material,
    );

    // Второй цилиндр (средний)
    const cyl2 = new THREE.Mesh(
      new THREE.CylinderGeometry(radius2, radius2, part2Height, 16),
      material,
    );

    // Третий цилиндр (узкий)
    const cyl3 = new THREE.Mesh(
      new THREE.CylinderGeometry(radius3, radius3, part1Height, 16),
      material,
    );

    // Общая вертикальная позиция
    const topY = SHELF_HEIGHT * 3;
    const holderY = rodYPos;

    // Располагаем по вертикали
    const totalHeight = part1Height + part2Height + part3Height;

    // Нижняя базовая точка (низ всего держателя)
    const baseY = 50;

    // Верхний цилиндр (широкий, ближе всего к потолку)
    cyl1.position.set(0, baseY - 5, 0);

    // Средний цилиндр
    cyl2.position.set(0, baseY - part1Height / 2 - part2Height / 2, 0);

    // Нижний цилиндр (самый узкий)
    cyl3.position.set(0, baseY - part1Height - part2Height / 2 - part3Height / 2 - 5, 0);

    // --- Паз ---
    const recess = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 6, 32), material);
    recess.rotation.z = Math.PI / 2;
    recess.position.set(0, rodYPos, 0);
    recess.scale.set(1.5, 1, 0.8);

    // --- Овальная пластина ---
    const plateWidth = radius * 4;
    const plateDepth = radius * 7;
    const plateThickness = 2;

    const shape = new THREE.Shape();
    shape.absellipse(0, 0, plateWidth / 2, plateDepth / 2, 0, Math.PI * 2, false, 0);

    const extrudeSettings = { depth: plateThickness, bevelEnabled: false };
    const baseGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const plate = new THREE.Mesh(baseGeometry, material);
    plate.rotation.x = -Math.PI / 2;
    plate.position.set(0, topY, 0);
    plate.updateMatrixWorld(true);

    // --- Отверстия под саморезы ---
    const holeRadius = 1;
    const holeDepth = plateThickness + 1;
    const holeOffsetY = plateDepth / 3;

    const holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, holeDepth, 32);
    holeGeometry.rotateX(Math.PI / 2);

    const upperHole = new THREE.Mesh(holeGeometry, material);
    upperHole.position.set(0, holeOffsetY, plate.position.z);

    const lowerHole = new THREE.Mesh(holeGeometry, material);
    lowerHole.position.set(0, -holeOffsetY, plate.position.z);

    // Преобразовать в мировые координаты
    const worldUpper = upperHole.position.clone().applyMatrix4(plate.matrixWorld);
    const worldLower = lowerHole.position.clone().applyMatrix4(plate.matrixWorld);
    const worldRot = new THREE.Euler().setFromRotationMatrix(plate.matrixWorld);

    const plateWithUpper = BaseCabinet.subtract(plate, upperHole, material, worldUpper, worldRot);
    const plateWithHoles = BaseCabinet.subtract(
      plateWithUpper,
      lowerHole,
      material,
      worldLower,
      worldRot,
    ) as THREE.Mesh;

    // --- Собираем всё вместе ---
    // Добавляем в группу
    group.add(cyl1);
    group.add(cyl2);
    group.add(cyl3);
    group.add(recess);
    group.add(plateWithHoles);
    group.position.x = xPos;

    return group;
  }

  // Вспомогательные методы
  private createBentRod(
    group: THREE.Group,
    shelf: THREE.Object3D,
    materials: RodMaterials,
    isIntegratedHandle: boolean,
    side: 'left' | 'right' | 'full' = 'full',
  ): void {
    const rodLength = isIntegratedHandle ? 350 : 400;
    const rodHeight = 30;
    const bendRadius = 10;
    const HEIGHT_GUIDE = 8;

    let xOffset = 0;
    const shelfWidth = this.getShelfSize(shelf).width;

    if (side === 'left') {
      xOffset = -shelfWidth / 4; // Смещаем влево на четверть ширины полки
    } else if (side === 'right') {
      xOffset = shelfWidth / 4; // Смещаем вправо на четверть ширины полки
    }

    // Направляющая
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(HEIGHT_GUIDE / 2, HEIGHT_GUIDE, rodLength),
      materials.rod,
    );
    rail.position.set(0, -SHELF_HEIGHT / 2 - HEIGHT_GUIDE - 2, -bendRadius * 2);
    rail.name = 'rail';
    // Изогнутая штанга
    const curve = new FullRodCurve(rodHeight, bendRadius, rodLength);
    const rodMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 1000, 1.2, 16, false),
      materials.rod,
    );
    rodMesh.position.set(0, -rodHeight - 4, -20);
    rodMesh.rotation.y = Math.PI / 2;
    rodMesh.name = 'rodMesh_curve';
    // Торцевые наконечники
    const tipGeometry = new THREE.CylinderGeometry(2, 2, 6, 20);
    this.addTip(rodMesh, curve, 0.09, tipGeometry, materials.tip); // Левый
    this.addTip(rodMesh, curve, 0.9, tipGeometry, materials.tip); // Правый
    tipGeometry.name = 'tipGeometry';
    group.add(rodMesh, rail);
    group.position.y = shelf.position.y - SHELF_HEIGHT;
    group.position.z = 20;
  }

  private createStraightRod(
    length: number,
    diameter: number,
    material: THREE.Material,
    yPos: number,
  ): THREE.Mesh {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(diameter, diameter, length, 32),
      material,
    );
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, yPos, 0);
    // Делаем его овальным по X и Z
    rod.scale.set(1.5, 1, 0.8);
    return rod;
  }

  private addRodFor430Depth(
    shelf: THREE.Object3D,
    rodGroup: THREE.Group,
    materials: RodMaterials,
    isIntegrated: boolean,
    side: 'left' | 'right' | 'full' = 'full',
  ): void {
    this.createBentRod(rodGroup, shelf, materials, isIntegrated, side);
  }

  private addRodFor580Depth(
    shelf: THREE.Object3D,
    shelfSize: Size,
    rodGroup: THREE.Group,
    materials: RodMaterials,
    typeRod: string,
  ): void {
    const edgeOffset = 10;
    const rodLength = shelfSize.width;
    const rodDiameter = typeRod == 'solidRod' && shelfSize.width >= 1000 ? 10 : 8;
    const needsCenterMount = typeRod == 'centralMountingRod' && shelfSize.width >= 950;
    const rodPositionY = 60;
    console.log(rodPositionY);
    const rodMesh = this.createStraightRod(rodLength, rodDiameter, materials.rod, 0);
    rodMesh.name = 'rodMesh';
    const holders = this.createRodHolders(rodLength, 0, materials.rod, 50, 3);

    rodGroup.add(rodMesh, ...holders);

    if (needsCenterMount) {
      const centerMount = this.createCeilingHolder(0, 50, 0, 3, materials.rod);
      rodGroup.add(centerMount);
    }
  }

  private createRodHolders(
    rodLength: number,
    rodPositionY: number,
    material: THREE.Material,
    height: number,
    radius: number,
  ): THREE.Group[] {
    const left = this.createCeilingHolder(-rodLength / 2, height, rodPositionY, radius, material);
    left.name = 'holder-left';
    const right = this.createCeilingHolder(rodLength / 2, height, rodPositionY, radius, material);
    right.name = 'holder-right';
    return [left, right];
  }

  private addTip(
    parent: THREE.Object3D,
    curve: THREE.Curve<THREE.Vector3>,
    t: number,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
  ): void {
    const tip = new THREE.Mesh(geometry, material);
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    tip.position.copy(point);
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
    parent.add(tip);
  }

  /**
   * Удаляет штангу с заданной стороны (left, right, full)
   *
   * @param {THREE.Object3D} shelf
   * @param {'left' | 'right' | 'full'} side
   * @memberof ShelfManager
   */
  public deleteRod(shelf: THREE.Object3D, side: 'left' | 'right' | 'full'): void {
    const rodName = `rod_${shelf.name}_${side}`;
    const rod = shelf.children.find((child) => child.name.startsWith(rodName));
    console.log(rodName);
    console.log(rod);
    if (!rod) return;

    shelf.remove(rod);

    rod.traverse((child) => {
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }

      const material = (child as THREE.Mesh).material;
      if (material) {
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });

    // Удаляем из модели
    const cabinet = this.sceneManagerService.getCabinet();
    const shelvesModel = cabinet.getCabinetParams().components.shelves;

    if (shelf.name.startsWith('topCabinet') && shelvesModel.topShelf) {
      shelvesModel.topShelf = shelvesModel.topShelf.filter((r) => r.position !== side);
    } else {
      const shelfModel = shelvesModel.shelfItems.find((s) => s.id === shelf.userData['id']);
      if (shelfModel?.rods) {
        shelfModel.rods = shelfModel.rods.filter((r) => r.position !== side);
      }
    }

    console.log(`Штанга ${rodName} удалена`);
  }
  /**
   *
   *
   * @private - обновление цвета полки
   * @param {MMaterial} newMaterial
   * @memberof ShelfManager
   */
  public updateMaterial(newMaterial: MMaterial): void {
    // Проходим по всем полкам в коллекции shelves
    this.shelves.forEach((shelf: THREE.Mesh) => {
      // Ищем переднюю кромку для каждой полки
      const frontEdge = shelf.getObjectByName(`frontEdgeShelf_${shelf.name.split('_')[1]}`);

      // Если передняя кромка найдена — применяем материал
      if (frontEdge && frontEdge instanceof THREE.Mesh) {
        frontEdge.material = BaseCabinet.getMaterial(newMaterial.texture.path);
      }
      console.log(newMaterial);
      shelf.material = BaseCabinet.getMaterial(newMaterial.texture.path);
      // BaseCabinet.rotateUVs(shelf.geometry);
    });
  }

  public updateShelfDepth(newDepth: number) {
    // Проходим по всем полкам в коллекции shelves
    this.shelves.forEach((shelf: THREE.Mesh) => {
      // Обновляем геометрию полок
      shelf.geometry.dispose();
      shelf.geometry = new THREE.BoxGeometry(
        this.size.width - WALL_THICKNESS * 2,
        SHELF_HEIGHT,
        newDepth,
      );
      BaseCabinet.applyUVMapping(shelf.geometry, 'x', 'y');
      CabinetGridManagerService.highlightObjectWithGrid(shelf, 0x00ff00);
    });
  }
  public updateShelfWidth(newWidth: number) {
    // Проходим по всем полкам в коллекции shelves
    this.shelves.forEach((shelf: THREE.Mesh) => {
      // Обновляем геометрию полок
      shelf.geometry.dispose();
      shelf.geometry = new THREE.BoxGeometry(
        newWidth - WALL_THICKNESS * 2,
        SHELF_HEIGHT,
        this.size.depth,
      );
      BaseCabinet.applyUVMapping(shelf.geometry, 'x', 'y');
      CabinetGridManagerService.highlightObjectWithGrid(shelf, 0x00ff00); // ???
    });
  }
  /**
   *Обноление размеров указанной полки
   * @param size - новые размеры полки
   * @param selectedShelf
   * @returns
   */
  public updateShelfSizeByShelf(size: Size, selectedShelf: THREE.Object3D): void {
    const shelfId = this.getIdShelve(selectedShelf);

    if (!this.shelves.has(shelfId)) {
      console.error('Shelf not found in the manager.');
      return;
    }

    // Обновление размеров полки
    const { width, height, depth } = size;
    console.log('SIZE: UPDATE BY SHELF: ', size);

    // Обновляем данные о полке в массиве shelves
    const updatedShelf = this.shelves.get(shelfId);
    if (updatedShelf instanceof THREE.Mesh) {
      updatedShelf.geometry.dispose();
      updatedShelf.geometry = new THREE.BoxGeometry(width, height, depth);
      updatedShelf.userData['size'] = { width, height, depth };
      // updatedShelf.userData['baseGeometry'] = updatedShelf.clone();
      // updatedShelf.userData['cutoutState'] = 'none';
      BaseCabinet.rotateUVs(updatedShelf.geometry);
      this.shelves.set(shelfId, updatedShelf);

      // Update visual appearance for the resized shelf (optional highlighting)
      CabinetGridManagerService.highlightObjectWithGrid(selectedShelf, 0x00ff00);

      console.log(`Updated shelf size: width=${width}, height=${height}, depth=${depth}`);
    } else {
      console.error('Invalid shelf object type.');
    }

    // Обновление размерной линии для указанной полки
    // const shelfId = this.getIdShelve(shelf);
    // this.dimensionLines.updateShelfDimensionLinesById(shelfId, this.shelves, height, width);
  }
  /**
   *
   * @param position
   * @param selectedShelf
   */
  public updateShelfPositionByShelf(position: Position, selectedShelf: THREE.Object3D) {
    const shelfId = this.getIdShelve(selectedShelf);

    if (!this.shelves.has(shelfId)) {
      console.error('Shelf not found in the manager.');
      return;
    }
    selectedShelf.position.x = position.x;

    // Обновляем данные о полке в массиве shelves
    const updatedShelf = this.shelves.get(shelfId);
    if (updatedShelf) {
      updatedShelf.position.set(position.x, position.y, position.z); // Синхронизация позиции
      this.shelves.set(shelfId, updatedShelf); // Обновляем запись в Map
    }

    console.log(
      `Shelf position updated: id=${shelfId}, position=(${position.x}, ${position.y}, ${position.z})`,
    );
  }
  /**
   *  Метод для поиска позиции предыдущей полки
   * @param id - идентификатор полки
   * @returns позицию предыдущей полки [number]
   */
  private getPreviousShelfPosition(id: number): number {
    // Находит позицию предыдущей полки (если есть)
    let previousShelfPosition = 0;
    this.shelves.forEach((shelf: THREE.Object3D, shelfId: number) => {
      if (shelfId < id) {
        previousShelfPosition = Math.max(previousShelfPosition, shelf.position.y);
      }
    });
    return previousShelfPosition;
  }

  /**
   *  Методя для получения высоты от низа шкафа до первой полки в шкафу
   * @returns высоту от низа шкафа до первой полки
   */
  public getLowestShelfHeight(): number | null {
    if (this.shelves.size === 0) {
      return null; // Если полок нет, возвращаем null
    }

    let lowestShelfHeight = Infinity;
    for (const shelf of this.shelves.values()) {
      const shelfHeight = shelf.position.y;
      if (shelfHeight < lowestShelfHeight) {
        lowestShelfHeight = shelfHeight;
      }
    }

    return lowestShelfHeight;
  }
  /**
   *  Методя для получения высоты от низа шкафа до первой полки в шкафу
   * @returns высоту от низа шкафа до первой полки
   */
  public getHeightShelfHeight(): number | null {
    if (this.shelves.size === 0) {
      return null; // Если полок нет, возвращаем null
    }

    let heightShelfHeight = -Infinity;

    for (const shelf of this.shelves.values()) {
      const shelfHeight = shelf.position.y;
      if (shelfHeight > heightShelfHeight) {
        heightShelfHeight = shelfHeight;
      }
    }

    return heightShelfHeight;
  }
  /**
   *  Метод для получения массива с объектами полок
   * @returns массив объектов полок
   */
  public getShelves(): THREE.Object3D[] {
    return Array.from(this.shelves.values());
  }
  public getShelvesMap(): Map<number, THREE.Object3D> {
    return this.shelves;
  }
  public getShlefById(id: number): THREE.Object3D {
    return this.shelves[id];
  }

  // Добавление вырезов
  public addCutouts(shelf: THREE.Object3D, sides: string[]) {
    // логика применения вырезов может включать визуальные эффекты и т.д.
  }

  // Удаление вырезов
  public removeCutouts(shelf: THREE.Object3D) {
    // логика удаления вырезов
  }
  /**
   *  Метод для получение текущего числа полок в шкафу
   * @returns число полок в шкафу
   */
  public getTotalShelves(): number {
    return this.shelves.size;
  }
  /**
   * Метод для получения карты, id полки и сам объект полка
   * @returns
   */
  public getShelvesThisId(): Map<number, THREE.Object3D> {
    return this.shelves;
  }
  /**
   * Метод для получения id полки
   * @param shelf - объект полка
   * @returns id полки
   */
  public getIdShelve(shelf: THREE.Object3D): number {
    // let foundId: number | undefined = undefined;
    // this.shelves.forEach((value, key) => {
    //   if (value == shelf) {
    //     foundId = key;
    //   }
    // });
    return shelf.userData['id'];
  }
  /**
   *  Метод для получения высоты полки (возвращает высоту шкафа! НУЖНО ИСПРАВИТЬ!)
   * @returns высота полки
   */
  public getHeight(): number {
    return this.size.height;
  }

  /**
   * Возвращает следующий свободный id для новой полки
   */
  public getNextShelfId(): number {
    if (this.shelves.size === 0) return 1;
    return Math.max(...this.shelves.keys()) + 1;
  }

  /**
   * Пересчитывает id всех полок по порядку (1,2,3...)
   */
  private renumberShelves(): void {
    let newId = 1;
    const updatedShelves = new Map<number, THREE.Object3D>();

    this.shelves.forEach((shelf, oldId) => {
      shelf.userData['id'] = newId;
      shelf.name = `shelf_${newId}`;
      updatedShelves.set(newId, shelf);
      newId++;
    });

    this.shelves = updatedShelves;
  }

  /**
   * Методя для удаления полки по id
   * @param id - идентификатор полки
   */
  public removeShelf(id: number): void {
    this.dimensionLines.removeShelfDimensionLinesForPosition(id);

    const shelf = this.shelves.get(id);
    if (!shelf) {
      console.log(`Полка c id ${id} не найдена`);
      return;
    }
    // Удаляем полку со сцены
    this.sceneManagerService.deleteObject(shelf);
    // Удаляем её из карты
    this.shelves.delete(id);

    // Получаем актуальные параметры шкафа
    const cabinet: SingleDoorCabinet | DoubleDoorCabinet = this.sceneManagerService.getCabinet();
    const { width, height } = cabinet.getParams().dimensions.general;

    // Обновляем оставшиеся полки
    // this.updateShelfIdsAndDimensionLines();

    this.renumberShelves();

    const dimensionLines = cabinet.dimensionLines;
    dimensionLines.updateSectionHeightLines();
  }

  /**
   * Метод для удаления всех полок из шкафа
   */
  public removeAllShelves(): void {
    this.sceneManagerService.getCabinet().getCabinetParams().components.shelves.shelfItems = [];
    this.dimensionLines.removeShelfDimensionLines();
    this.sceneManagerService.removeAllShelves();
    this.shelves.clear();
  }
}
