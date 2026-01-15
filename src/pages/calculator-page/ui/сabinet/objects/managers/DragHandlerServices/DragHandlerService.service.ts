import { Injectable } from '@angular/core';
import * as THREE from 'three';
import {
  MIN_DISTANCE_BETWEEN_SHELVES,
  MIN_DISTANCE_SHELF_DRAWER_BLOCK,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  SHELF_MAX_POSITION_OFFSET,
  SHELF_POSITION_OFFSET,
  WALL_THICKNESS,
} from '../../../constants';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { IntersectionManagerService } from 'src/pages/calculator-page/ui/services/IntersectionManagerService.service';
import { SHELF_BOUNDARIES, ShelfBoundary } from '../../../model/Shelf';
import { ICabinet } from 'src/entities/Cabinet';
import { Facade, PositionCutout } from '../../../model/Facade';
import { BaseCabinet } from '../../../cabinetTypes/BaseCabinet';
import { CabinetSubType } from 'src/entities/Cabinet/model/types/cabinet.model';

@Injectable({
  providedIn: 'root',
})
export class DragHandlerService {
  constructor(
    private sceneManagerService: SceneManagerService,
    private intersectionManager: IntersectionManagerService,
  ) {}

  // Основной метод для обработки перемещения полки
  handleShelfDrag(
    selectedShelf: THREE.Object3D,
    mouseStartPos: { x: number; y: number },
    shelfStartPos: THREE.Vector3,
    event: MouseEvent,
    cabinet: any,
  ): void {
    // Сохраняем текущие размеры полки
    const currentDimensions = this.saveShelfDimensions(selectedShelf);
    // Вычисляем новую позицию
    let snappedPosition = this.calculateSnappedPosition(
      shelfStartPos.y,
      mouseStartPos.y,
      event.clientY,
    );

    // Применяем ограничения
    snappedPosition = this.applyShelfConstraints(snappedPosition, selectedShelf, cabinet);

    // Устанавливаем позицию
    selectedShelf.position.y = snappedPosition;

    // Восстанавливаем размеры
    this.restoreShelfDimensions(selectedShelf, currentDimensions);

    // Обрабатываем пересечения с петлями
    this.handleHingeIntersections(selectedShelf, cabinet);

    // Обновляем UI
    this.updateShelfUI(selectedShelf, cabinet);
  }

  private getShelfBoundary(cabinetHeight: number): ShelfBoundary {
    // Находим ближайшую высоту в таблице
    const closest = SHELF_BOUNDARIES.reduce((prev, curr) => {
      return Math.abs(curr.cabinetHeight - cabinetHeight) <
        Math.abs(prev.cabinetHeight - cabinetHeight)
        ? curr
        : prev;
    });

    return closest;
  }

  private saveShelfDimensions(shelf: THREE.Object3D): {
    width: number;
    height: number;
    depth: number;
  } {
    return {
      width: shelf.scale.x,
      height: shelf.scale.y,
      depth: shelf.scale.z,
    };
  }

  private restoreShelfDimensions(
    shelf: THREE.Object3D,
    dimensions: { width: number; height: number; depth: number },
  ): void {
    shelf.scale.set(dimensions.width, dimensions.height, dimensions.depth);
  }

  private applyShelfConstraints(
    position: number,
    selectedShelf: THREE.Object3D,
    cabinet: any,
  ): number {
    const cabinetHeight = cabinet.getCabinetHeight();
    const otherShelves = this.getOtherShelves(selectedShelf, cabinet);

    let constrainedPosition = this.applyBasicConstraints(position, cabinetHeight);

    // Применяем ограничения для блоков ящиков
    constrainedPosition = this.applyDrawerBlockConstraints(
      constrainedPosition,
      selectedShelf,
      cabinet,
    );

    // Применяем ограничения расстояния с учетом секций
    constrainedPosition = this.applyShelfDistanceConstraintsWithSections(
      constrainedPosition,
      selectedShelf,
      otherShelves,
      cabinet,
    );

    constrainedPosition = this.applyFirstShelfConstraints(
      constrainedPosition,
      selectedShelf,
      otherShelves,
      cabinet,
    );

    // Применяем ограничение от крыши
    constrainedPosition = this.applyTopConstraint(constrainedPosition, cabinetHeight);

    return constrainedPosition;
  }

  private calculateSnappedPosition(startY: number, mouseStartY: number, clientY: number): number {
    // Вычисляем смещение от начальной позиции мыши
    const mouseDelta = clientY - mouseStartY;

    // Округляем смещение до ближайшего шага 32 мм
    const snappedDelta = Math.round(mouseDelta / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;

    // Применяем snappedDelta к начальной позиции полки
    return startY - snappedDelta;
  }
  /*
   * Применяет ограничения расстояния между полками с учетом секций
   * Для двустворчатых шкафов с средником полки в разных секциях могут быть на одном уровне
   */
  private applyShelfDistanceConstraintsWithSections(
    position: number,
    selectedShelf: THREE.Object3D,
    otherShelves: THREE.Object3D[],
    cabinet: BaseCabinet,
  ): number {
    let resultPosition = position;
    const shelfHalfHeight = SHELF_HEIGHT / 2;
    const hasMullion = cabinet.hasMullion();
    const isDoubleDoor = cabinet.getCabinetType() === CabinetSubType.Double;

    // Определяем секцию выбранной полки
    const selectedShelfSection = this.getShelfSection(selectedShelf, cabinet);

    console.log('Applying shelf distance constraints with sections...');
    console.log(`Selected shelf section: ${selectedShelfSection}`);
    console.log(`Has mullion: ${hasMullion}, Is double door: ${isDoubleDoor}`);

    for (const otherShelf of otherShelves) {
      const otherShelfY = otherShelf.position.y;
      const otherShelfSection = this.getShelfSection(otherShelf, cabinet);

      // Проверяем, находятся ли полки в одной секции
      const sameSection = selectedShelfSection === otherShelfSection;

      // Для двустворчатых шкафов с средником:
      // полки в разных секциях могут быть на одном уровне
      const shouldApplyConstraints = sameSection || !(isDoubleDoor && hasMullion);

      const distance = Math.abs(otherShelfY - resultPosition);
      const isIntersecting = distance - WALL_THICKNESS * 2 < shelfHalfHeight * 2;

      console.log(
        `Other shelf Y: ${otherShelfY}, Section: ${otherShelfSection}, Same section: ${sameSection}, Should apply constraints: ${shouldApplyConstraints}, Distance: ${distance}, Is intersecting: ${isIntersecting}`,
      );

      if (shouldApplyConstraints) {
        // Применяем ограничения только для полок в одной секции
        // ИЛИ если это не двустворчатый шкаф с средником
        if (isIntersecting) {
          // Полное запрещение пересечения
          if (otherShelfY > resultPosition) {
            // Перемещаем полку строго под нижнюю границу верхней полки
            resultPosition = otherShelfY - MIN_DISTANCE_BETWEEN_SHELVES;
          } else {
            // Перемещаем полку строго над верхней границей нижней полки
            resultPosition = otherShelfY + MIN_DISTANCE_BETWEEN_SHELVES;
          }
        }
        // Минимальное расстояние при отсутствии пересечения
        else if (distance < MIN_DISTANCE_BETWEEN_SHELVES) {
          if (otherShelfY > resultPosition) {
            resultPosition = otherShelfY - MIN_DISTANCE_BETWEEN_SHELVES;
          } else {
            resultPosition = otherShelfY + MIN_DISTANCE_BETWEEN_SHELVES;
          }
        }
      } else {
        // Не применяем ограничение минимального расстояния между секциями
      }

      resultPosition = Math.round(resultPosition / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;
    }

    return resultPosition;
  }

  private applyTopConstraint(position: number, cabinetHeight: number): number {
    const boundary = this.getShelfBoundary(cabinetHeight);
    const maxPosition = cabinetHeight - boundary.minDistanceFromTop - WALL_THICKNESS;

    return Math.min(position, maxPosition);
  }

  private applyBasicConstraints(position: number, cabinetHeight: number): number {
    const minPosition = PODIUM_HEIGHT + 32;
    const maxPosition = cabinetHeight - 32 - WALL_THICKNESS;
    return Math.max(minPosition, Math.min(position, maxPosition));
  }

  private getDrawerBlockSize(drawerBlock: THREE.Object3D): { height: number } | null {
    // Получаем размер блока ящиков из userData
    if (drawerBlock.userData['drawerData']) {
      const fullSize = drawerBlock.userData['drawerData'].fullSize;
      return { height: fullSize.shelf.size.height * 2 + fullSize.wall.size.height };
    }

    // Альтернативно можно попробовать вычислить по bounding box
    const box = new THREE.Box3().setFromObject(drawerBlock);
    const size = new THREE.Vector3();
    box.getSize(size);

    return { height: size.y };
  }

  private getOtherShelves(selectedShelf: THREE.Object3D, cabinet: BaseCabinet): THREE.Object3D[] {
    const allShelves = Array.from(cabinet.shelfManager.getShelves().values());

    return allShelves.filter(
      (shelf): shelf is THREE.Object3D =>
        shelf instanceof THREE.Object3D && shelf !== selectedShelf,
    );
  }

  private applyFirstShelfConstraints(
    position: number,
    selectedShelf: THREE.Object3D,
    otherShelves: THREE.Object3D[],
    cabinet: BaseCabinet,
  ): number {
    // Определяем секцию выбранной полки
    const selectedShelfSection = this.getShelfSection(selectedShelf, cabinet);

    // Фильтруем полки только из той же секции
    const otherShelvesInSameSection = otherShelves.filter(
      (shelf) => this.getShelfSection(shelf, cabinet) === selectedShelfSection,
    );

    // Преобразуем в массив Y-позиций
    const otherShelfPositions = otherShelvesInSameSection.map((shelf) => shelf.position.y);

    const isFirstShelf =
      otherShelfPositions.length === 0 || position < Math.min(...otherShelfPositions);

    if (!isFirstShelf) {
      return position;
    }

    let minFirstShelfPosition = PODIUM_HEIGHT + 256;

    // Проверка на наличие ящиков под полкой
    const drawerBlocks = Array.from(this.sceneManagerService.getScene().children).filter((obj) =>
      obj.name.startsWith('drawerBlock_'),
    );

    for (const drawerBlock of drawerBlocks) {
      const worldPosition = new THREE.Vector3();
      drawerBlock.getWorldPosition(worldPosition);

      // Получаем размеры блока ящиков
      const drawerBlockSize = this.getDrawerBlockSize(drawerBlock);
      if (!drawerBlockSize) continue;

      const drawerTop = worldPosition.y + drawerBlockSize.height / 2;

      // Учитываем минимальное расстояние от верха блока ящиков
      const requiredMinPosition = drawerTop + SHELF_HEIGHT / 2 + MIN_DISTANCE_SHELF_DRAWER_BLOCK;

      if (requiredMinPosition > minFirstShelfPosition) {
        minFirstShelfPosition = requiredMinPosition;
      }
    }

    return Math.max(position, minFirstShelfPosition);
  }

  private applyDrawerBlockConstraints(
    position: number,
    selectedShelf: THREE.Object3D,
    cabinet: BaseCabinet,
  ): number {
    let resultPosition = position;

    // Получаем все блоки с ящиками
    const drawerBlocks = Array.from(this.sceneManagerService.getScene().children).filter((obj) =>
      obj.name.startsWith('drawerBlock_'),
    );

    for (const drawerBlock of drawerBlocks) {
      const worldPosition = new THREE.Vector3();
      drawerBlock.getWorldPosition(worldPosition);

      // Получаем размеры блока ящиков
      const drawerBlockSize = this.getDrawerBlockSize(drawerBlock);
      if (!drawerBlockSize) continue;

      const drawerTop = worldPosition.y + drawerBlockSize.height / 2;
      const drawerBottom = worldPosition.y - drawerBlockSize.height / 2;

      const shelfBottom = resultPosition - SHELF_HEIGHT / 2;
      const shelfTop = resultPosition + SHELF_HEIGHT / 2;

      // Проверяем пересечение полки с блоком ящиков
      if (shelfBottom < drawerTop && shelfTop > drawerBottom) {
        // Полное запрещение пересечения
        if (resultPosition > worldPosition.y) {
          // Полка выше блока ящиков - перемещаем выше блока
          resultPosition = drawerTop + SHELF_HEIGHT / 2 + SHELF_MAX_POSITION_OFFSET;
        } else {
          // Полка ниже блока ящиков - перемещаем ниже блока
          resultPosition = drawerBottom - SHELF_HEIGHT / 2 - SHELF_MAX_POSITION_OFFSET;
        }
      }
      // Проверяем минимальное расстояние
      else if (
        Math.abs(resultPosition - worldPosition.y) <
        (SHELF_HEIGHT + drawerBlockSize.height) / 2 + SHELF_MAX_POSITION_OFFSET
      ) {
        if (resultPosition > worldPosition.y) {
          resultPosition = drawerTop + SHELF_HEIGHT / 2 + SHELF_MAX_POSITION_OFFSET;
        } else {
          resultPosition = drawerBottom - SHELF_HEIGHT / 2 - SHELF_MAX_POSITION_OFFSET;
        }
      }

      // Округляем до шага 32мм
      resultPosition = Math.round(resultPosition / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;
    }

    return resultPosition;
  }

  /**
   * Проверяем, есть ли пересечение полки с петлёй
   * @param selectedShelf
   * @param cabinet
   */
  private handleHingeIntersections(selectedShelf: THREE.Object3D, cabinet: any): void {
    // Получаем секцию полки
    const shelfSection = selectedShelf.userData['section']; // 'left', 'right' или 'center'

    // Получаем фасады
    const doorItems = cabinet.getCabinetParams().components.facades.facadeItems;

    // Фильтруем петли: берем только те, которые могут касаться этой полки
    const hingeObjects: THREE.Object3D[] = [];

    doorItems.forEach((door: Facade) => {
      // Условие: если полка в левой секции, проверяем только левые петли (и наоборот).
      // Если полка общая (center), проверяем всё.
      const isRelevantDoor =
        !shelfSection ||
        shelfSection === 'center' ||
        (shelfSection === 'left' && door.positionLoops === 'left-side') ||
        (shelfSection === 'right' && door.positionLoops === 'right-side');

      if (isRelevantDoor) {
        const hinges = this.sceneManagerService.getHinges(
          this.sceneManagerService.getCabinetGroup(),
          door.positionLoops,
        );
        hinges.forEach((h) => hingeObjects.push(h as THREE.Object3D));
      }
    });

    // Определяем сторону пересечения
    // Если пересечений нет, принудительно ставим 'none'
    let side: PositionCutout = this.intersectionManager.checkShelfHingeIntersections(
      selectedShelf,
      hingeObjects,
    );
    if (!side) side = 'none';

    // Если состояние не изменилось — выходим
    if (selectedShelf.userData['lastIntersectionSide'] === side) {
      return;
    }

    // Запоминаем новое состояние
    selectedShelf.userData['lastIntersectionSide'] = side;

    // Применяем изменения геометрии
    if (side !== 'none') {
      console.log('Добавляем вырез:', side);
      this.processHingeIntersection(selectedShelf, cabinet, side);
    } else {
      console.log('Восстанавливаем полку (удаляем вырезы)');
      this.removeHingeIntersection(selectedShelf, cabinet);
    }
  }
  /**
   * Обрабатываем положение петель
   */
  private processHingeIntersection(
    selectedShelf: THREE.Object3D,
    cabinet: BaseCabinet,
    side: PositionCutout,
  ): void {
    const isDoubleDoor = cabinet.getCabinetType() === CabinetSubType.Double;
    const positionHinges = cabinet.getPositionHinges() == 'left-side' ? 'left-side' : 'right-side';
    const hasMullion = cabinet.hasMullion();

    const shelfMaterial = this.getShelfMaterial(cabinet);
    const shelfMesh = selectedShelf as THREE.Mesh;
    if (side == 'both' && isDoubleDoor && !hasMullion) {
      cabinet.shelfManager.addCutoutForHinge(shelfMesh, 'both', shelfMaterial);
      cabinet.shelfManager.updateShelfEdge(selectedShelf, selectedShelf.userData['type'], 'both');
    } else {
      cabinet.shelfManager.addCutoutForHinge(shelfMesh, side, shelfMaterial);
      cabinet.shelfManager.updateShelfEdge(
        selectedShelf,
        selectedShelf.userData['type'],
        positionHinges,
      );
    }
  }

  private removeHingeIntersection(selectedShelf: THREE.Object3D, cabinet: any): void {
    cabinet.getShelfManager().removeCutoutForHinge(selectedShelf);
    cabinet
      .getShelfManager()
      .updateShelfEdge(selectedShelf, selectedShelf.userData['type'], 'none');
  }

  private getShelfMaterial(cabinet: any): any {
    // Реализуйте получение материала в зависимости от вашей структуры
    return cabinet.getCabinetParams().appearance.additionColor.texture.path;
  }

  /**
   * Получает секцию полки из userData
   * Если секция не указана, определяет её по позиции X
   */
  private getShelfSection(
    shelf: THREE.Object3D,
    cabinet: BaseCabinet,
  ): 'left' | 'right' | 'center' {
    // Пытаемся получить секцию из userData
    if (shelf.userData['section']) {
      return shelf.userData['section'];
    }

    // Если в userData нет секции, определяем её по позиции X
    const hasMullion = cabinet.hasMullion();
    const mullion = cabinet.mullionManager.getMullion();

    if (!hasMullion || !mullion) {
      return 'center'; // Если нет средника, полка в центре/общей секции
    }

    const mullionPositionX = mullion.position.x;
    const shelfPositionX = shelf.position.x;

    // Определяем секцию на основе позиции X
    if (shelfPositionX < mullionPositionX) {
      return 'left';
    } else {
      return 'right';
    }
  }

  private updateShelfUI(selectedShelf: THREE.Object3D, cabinet: BaseCabinet): void {
    const shelvesMap = new Map<number, THREE.Object3D>();
    cabinet.shelfManager.getShelves().forEach((shelf: THREE.Object3D, position: number) => {
      shelvesMap.set(position, shelf);
    });

    const cabinetHeight = cabinet.getCabinetHeight();
    const cabinetWidth = cabinet.getCabinetWidth();

    // cabinet
    //   .getDimensionLine()
    //   .updateAllShelfDimensionLines([...shelvesMap.values()], cabinetWidth, cabinetHeight);

    this.intersectionManager.highlightObjectsOnMove(
      selectedShelf,
      this.sceneManagerService.getScene(),
    );
  }
}
