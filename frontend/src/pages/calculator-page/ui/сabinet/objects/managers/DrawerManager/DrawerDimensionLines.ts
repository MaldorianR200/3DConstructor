import * as THREE from 'three';
import { IDimensionLines } from '../../../interfaces/IDimensionLines';
import { IDrawerDimensionLines } from '../../../interfaces/IDrawerDimensionLines';
import { DrawerBlock, DrawerSize, DrawerSizeMap } from '../../../model/Drawers';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import {
  DEEP_DRAVER_IN_CABINET,
  DRAWER_GAP,
  PODIUM_HEIGHT,
  SHELF_POSITION_OFFSET,
  WALL_THICKNESS,
} from '../../../constants';
import { Position, Size } from '../../../model/BaseModel';

export class DrawerDimensionLines implements IDrawerDimensionLines {
  private sceneManagerService: SceneManagerService;
  private dimensionLines: IDimensionLines;
  private drawerLines: Map<string, THREE.Line | THREE.Group> = new Map();
  private lastUpdateTime: number = 0;
  private updateThrottleMs: number = 16;
  private lastPositions: Map<number, Position> = new Map();

  constructor(sceneManagerService: SceneManagerService, dimensionLines: IDimensionLines) {
    this.sceneManagerService = sceneManagerService;
    this.dimensionLines = dimensionLines;
  }

  /**
   * Оптимизированное обновление размерных линий с троттлингом
   */
  public updateDrawerBlockDimensionLines(drawerBlock: THREE.Object3D, newPosition: Position): void {
    // Троттлинг обновлений для улучшения производительности
    const now = Date.now();

    if (now - this.lastUpdateTime < this.updateThrottleMs) {
      return;
    }
    this.lastUpdateTime = now;

    const drawerData = drawerBlock.userData['drawerData'] as DrawerBlock;
    const cabinetSize = this.sceneManagerService.getCabinet().getCabinetSize();
    const drawerSize = DrawerSizeMap[drawerBlock.userData['drawersCount']];
    const blockId = drawerData.id;
    // Определяем, нужно ли показывать размерную линию под блоком
    const isAtBottom = newPosition.y <= PODIUM_HEIGHT + 32;

    // Проверяем — есть ли вообще хоть одна линия для этого блока
    const hasAnyLines = [...this.drawerLines.keys()].some(k =>
      k.includes(`_${blockId}_`) ||
      k === `dimensionLine_SideHeight_${blockId}`
    );
    if (!hasAnyLines) {
      const yPos = newPosition.y - (PODIUM_HEIGHT / 2 + WALL_THICKNESS);
      const updatePosition: Position = {
        x: newPosition.x,
        y: yPos,
        z: newPosition.z
      }

      const cabinetSize = this.sceneManagerService.getCabinet().getCabinetSize();
      const drawerSize = DrawerSizeMap[drawerBlock.userData['drawersCount']];

      // Первичное создание всех линий
      this.addDrawerDimensionLines(drawerData, cabinetSize, drawerSize, updatePosition);

      // Высота боковой панели
      this.addSidePanelHeight(
        blockId,
        drawerData.fullSize.shelf.size.width,
        drawerSize.blockHeight,
        cabinetSize.depth,
        updatePosition,
        30
      );
      return; // Прерываем update, т.к. линии уже созданы
    }

    // Обновляем линии только если позиция существенно изменилась
    if (this.shouldUpdateLines(drawerData.id, newPosition, isAtBottom)) {
      this.updateLinesWithOptimization(drawerData, cabinetSize, drawerSize, newPosition, isAtBottom);
    }
  }

  /**
   * Проверяет, нужно ли обновлять линии (оптимизация)
   */
  private shouldUpdateLines(blockId: number, newPosition: Position, isAtBottom: boolean): boolean {
    const blockHeightLine = this.drawerLines.get(`dimensionLine_blockHeight_${blockId}`);

    // Если блок на дне и линия уже удалена - не обновляем
    if (isAtBottom && !blockHeightLine) {
      return false;
    }

    // Если позиция не изменилась значительно - не обновляем
    const lastPosition = this.lastPositions.get(blockId);
    if (lastPosition && Math.abs(newPosition.y - lastPosition.y) < 5) {
      return false;
    }

    this.lastPositions.set(blockId, { ...newPosition });
    return true;
  }

  /**
   * Оптимизированное обновление линий
   */
  private updateLinesWithOptimization(
    drawerData: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    position: Position,
    isAtBottom: boolean
  ): void {
    const blockId = drawerData.id;
    const yPos = position.y - (PODIUM_HEIGHT / 2 + WALL_THICKNESS);
    const updatePosition: Position = {
      x: position.x,
      y: yPos,
      z: position.z
    }
    // Обновляем линии между ящиками только если они существуют
    if (drawerData.drawerItems.length > 0) {
      this.updateDrawerSpacingLines(drawerData, cabinetSize, drawerSize, updatePosition);
    }

    // Обновляем боковую панель высоты
    this.updateSidePanelHeight(blockId, drawerData.fullSize.shelf.size.width,
      drawerSize.sideHeight, cabinetSize.depth, updatePosition, 30);
  }

  /**
   * Оптимизированное обновление линий между ящиками
   */
  private updateDrawerSpacingLines(
    drawerBlock: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    position: Position
  ): void {
    const blockId = drawerBlock.id;
    const bottomY = position.y + PODIUM_HEIGHT;
    const drawerCount = drawerBlock.drawerItems.length;
    const centerX = position.x;

    // Обновляем существующие линии вместо пересоздания
    for (let i = 0; i < drawerCount - 1; i++) {
      const lineName = `dimensionLine_${blockId}_drawer${i}_to_drawer${i + 1}`;
      const currentDrawerBottom = bottomY + i * (drawerSize.facadeHeight + 30) + drawerSize.facadeHeight - 8 + 4;
      const nextDrawerTop = currentDrawerBottom + DRAWER_GAP - DRAWER_GAP / 2 - 4;

      this.updateExistingDimensionLine(
        lineName,
        new THREE.Vector3(
          centerX,
          currentDrawerBottom,
          position.z + (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2,
        ),
        new THREE.Vector3(
          centerX,
          nextDrawerTop,
          position.z + (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2,
        ),
        30,
        10
      );
    }

    // Линия от верхнего фасада до верха блока
    const topLineName = `dimensionLine_${blockId}_topDrawerToBlockTop`;
    const topDrawerBottom = bottomY + (drawerCount - 1) * (drawerSize.facadeHeight + 30) +
      drawerSize.facadeHeight + DRAWER_GAP / 2 - 5;
    const blockTopY = position.y + drawerSize.blockHeight + DRAWER_GAP / 2 + 5;

    this.updateExistingDimensionLine(
      topLineName,
      new THREE.Vector3(
        position.x,
        topDrawerBottom,
        position.z + (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2,
      ),
      new THREE.Vector3(
        position.x,
        blockTopY,
        position.z + (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2,
      ),
      30,
      10
    );
  }

  /**
   * Обновляет существующую размерную линию или создает новую
   */
  private updateExistingDimensionLine(
    lineName: string,
    start: THREE.Vector3,
    end: THREE.Vector3,
    value: number,
    arrowSize: number
  ): void {
    let line = this.drawerLines.get(lineName);

    if (line) {
      // Обновляем позиции существующей линии
      this.updateLinePositions(line, start, end, value, arrowSize);
    } else {
      // Создаем новую линию
      line = this.dimensionLines.createDimensionLine(start, end, value, false, false, arrowSize);
      line.name = lineName;
      this.sceneManagerService.addObject(line);
      this.drawerLines.set(lineName, line);
    }
  }

  /**
   * Обновляет позиции существующей линии
   */
  private updateLinePositions(line: THREE.Line | THREE.Group, start: THREE.Vector3, end: THREE.Vector3, value: number, arrowSize: number = 10): void {
    this.sceneManagerService.deleteObject(line);
    const newLine = this.dimensionLines.createDimensionLine(start, end, value, false, false, arrowSize);
    newLine.name = line.name;
    this.sceneManagerService.addObject(newLine);
    this.drawerLines.set(line.name, newLine);
  }

  /**
   * Обновляет боковую панель высоты
   */
  private updateSidePanelHeight(
    id: number,
    width: number,
    sideHeight: number,
    depth: number,
    positionBlock: Position,
    arrowSize: number,
  ): void {
    const lineName = `dimensionLine_SideHeight_${id}`;
    const xOffset = positionBlock.x - width / 4;
    const zPos = depth / 2 - 50;
    const baseY = positionBlock.y + WALL_THICKNESS * 4;
    const start = new THREE.Vector3(xOffset, baseY, zPos);
    const end = new THREE.Vector3(xOffset, baseY + sideHeight + WALL_THICKNESS, zPos);

    this.updateExistingDimensionLine(lineName, start, end, sideHeight, arrowSize);
  }

  //  const baseY = positionBlock.y + WALL_THICKNESS * 4;

  //   const start = new THREE.Vector3(xOffset, baseY, zPos);
  //   const end = new THREE.Vector3(xOffset, baseY + sideHeight + WALL_THICKNESS, zPos);

  /**
   * Обновляет линию от низа шкафа до нижней полки блока
   */
  private updateBlockHeightLine(blockId: number, position: Position, isAtBottom: boolean): void {
    const lineName = `dimensionLine_blockHeight_${blockId}`;
    // console.log('position block drawer:');
    // console.log(position);
    if (isAtBottom) {
      // Удаляем линию если блок на дне
      this.removeDimensionLineByName(lineName);
    } else {
      // Обновляем линию высоты
      const heightFromBottom = position.y;
      console.log('Position X for drawer lines');
      const start = new THREE.Vector3(position.x, PODIUM_HEIGHT / 2 + WALL_THICKNESS + WALL_THICKNESS / 2, position.z + 20);
      const end = new THREE.Vector3(position.x, position.y - WALL_THICKNESS / 2, position.z + 20);

      this.updateExistingDimensionLine(lineName, start, end, heightFromBottom, 30);
    }
  }

  /**
   * Добавляет размерные линии для блока с ящиками (для первоначального создания)
   */
  public addDrawerDimensionLines(
    drawerBlock: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    position: Position,
    arrowSize: number = 3,
  ): void {
    this.removeDrawerDimensionLines(drawerBlock);

    const bottomY = position.y + PODIUM_HEIGHT;
    const blockId = drawerBlock.id;

    // Линии между фасадами ящиков (30 мм)
    const drawerCount = drawerBlock.drawerItems.length;
    const centerX = position.x;

    for (let i = 0; i < drawerCount - 1; i++) {
      const currentDrawerBottom =
        bottomY + i * (drawerSize.facadeHeight + 30) + drawerSize.facadeHeight - 8 + 4;
      const nextDrawerTop = currentDrawerBottom + DRAWER_GAP - DRAWER_GAP / 2 - 4;

      const betweenDrawersLine = this.dimensionLines.createDimensionLine(
        new THREE.Vector3(
          centerX,
          currentDrawerBottom,
          position.z +
            (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 -
            WALL_THICKNESS * 2 -
            WALL_THICKNESS / 2,
        ),
        new THREE.Vector3(
          centerX,
          nextDrawerTop,
          position.z +
            (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 -
            WALL_THICKNESS * 2 -
            WALL_THICKNESS / 2,
        ),
        30,
        false,
        false,
        arrowSize,
      );

      const lineName = `dimensionLine_${blockId}_drawer${i}_to_drawer${i + 1}`;
      betweenDrawersLine.name = lineName;
      this.sceneManagerService.addObject(betweenDrawersLine);
      this.drawerLines.set(lineName, betweenDrawersLine);
    }

    // Линия от верхнего фасада до верха блока
    const topDrawerBottom =
      bottomY +
      (drawerCount - 1) * (drawerSize.facadeHeight + 30) +
      drawerSize.facadeHeight +
      DRAWER_GAP / 2 -
      5;
    const blockTopY = position.y + drawerSize.blockHeight + DRAWER_GAP / 2 + 5;

    const topDrawerToTopLine = this.dimensionLines.createDimensionLine(
      new THREE.Vector3(
        position.x,
        topDrawerBottom,
        position.z +
          (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 -
          WALL_THICKNESS * 2 -
          WALL_THICKNESS / 2,
      ),
      new THREE.Vector3(
        position.x,
        blockTopY,
        position.z +
          (cabinetSize.depth - DEEP_DRAVER_IN_CABINET) / 2 -
          WALL_THICKNESS * 2 -
          WALL_THICKNESS / 2,
      ),
      30,
      false,
      false,
      arrowSize,
    );

    const topLineName = `dimensionLine_${blockId}_topDrawerToBlockTop`;
    topDrawerToTopLine.name = topLineName;
    this.sceneManagerService.addObject(topDrawerToTopLine);
    this.drawerLines.set(topLineName, topDrawerToTopLine);
  }

  /**
   * Добавление размерной линии для боковой панели
   */
  public addSidePanelHeight(
    id: number,
    width: number,
    blockHeight: number,
    depth: number,
    positionBlock: Position,
    arrowSize: number,
  ): void {
    this.removeSidePanelHeightLineById(id);
    const xOffset = positionBlock.x - width / 4;
    const zPos = depth / 2 - 50;
    const baseY = positionBlock.y + WALL_THICKNESS * 4;

    const start = new THREE.Vector3(xOffset, baseY, zPos);
    const end = new THREE.Vector3(xOffset, baseY + blockHeight - WALL_THICKNESS, zPos);

    const sideHeightLine = this.dimensionLines.createDimensionLine(
      start,
      end,
      blockHeight,
      false,
      false,
      arrowSize,
    );

    const lineName = `dimensionLine_SideHeight_${id}`;
    sideHeightLine.name = lineName;
    this.sceneManagerService.addObject(sideHeightLine);
    this.drawerLines.set(lineName, sideHeightLine);
  }

  /**
   * Добавляет размерную линию высоты блока от дна шкафа
   */
  public addBlockHeightDimension(
    blockId: number,
    blockHeight: number,
    position: Position,
    arrowSize: number = 10,
  ): void {
    this.removeDimensionLineByName(`dimensionLine_blockHeight_${blockId}`);

    const start = new THREE.Vector3(
      position.x,
      0,
      position.z + 20
    );

    const end = new THREE.Vector3(
      position.x,
      position.y,
      position.z + 20
    );

    const heightLine = this.dimensionLines.createDimensionLine(
      start,
      end,
      blockHeight,
      false,
      false,
      arrowSize,
    );

    const lineName = `dimensionLine_blockHeight_${blockId}`;
    heightLine.name = lineName;
    this.sceneManagerService.addObject(heightLine);
    this.drawerLines.set(lineName, heightLine);
  }

  /**
   * Удаляет все размерные линии для блока с ящиками
   */
  public removeDrawerDimensionLines(drawerBlock: DrawerBlock): void {
    if (!drawerBlock?.id) return;

    const blockId = drawerBlock.id;
    const linesToRemove: string[] = [];

    // Собираем имена линий для удаления
    this.drawerLines.forEach((_, name) => {
      if (name.includes(`_${blockId}_`) || name === `dimensionLine_SideHeight_${blockId}` || name === `dimensionLine_blockHeight_${blockId}`) {
        linesToRemove.push(name);
      }
    });

    // Удаляем линии
    linesToRemove.forEach(name => {
      this.removeDimensionLineByName(name);
    });

    // Удаляем из кэша позиций
    this.lastPositions.delete(blockId);
  }

  public removeSidePanelHeightLineById(id: number): void {
    this.removeDimensionLineByName(`dimensionLine_SideHeight_${id}`);
  }

  /**
   * Удаление всех размерных линий dimensionLine_SideHeight_
   */
  public removeAllSidePanelHeightLines(): void {
    const linesToRemove: string[] = [];

    this.drawerLines.forEach((_, name) => {
      if (name.startsWith('dimensionLine_SideHeight_')) {
        linesToRemove.push(name);
      }
    });

    linesToRemove.forEach(name => {
      this.removeDimensionLineByName(name);
    });
  }

  /**
   * Безопасное удаление размерной линии с обработкой ошибок
   */
  private safeRemoveDimensionLine(lineName: string): void {
    try {
      this.removeDimensionLineByName(lineName);
    } catch (error) {
      console.warn(`Failed to remove dimension line ${lineName}:`, error);
    }
  }

  /**
   * Вспомогательный метод для удаления линии по имени
   */
  public removeDimensionLineByName(name: string): void {
    const line = this.drawerLines.get(name);
    if (line) {
      this.sceneManagerService.deleteObject(line);
      this.drawerLines.delete(name);
    }
  }

  /**
   * Удаляет все линии ящиков
   */
  public removeAllDrawerLines(): void {
    this.drawerLines.forEach((line) => {
      this.sceneManagerService.deleteObject(line);
    });
    this.drawerLines.clear();
    this.lastPositions.clear();
  }
}
