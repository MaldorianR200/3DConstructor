import * as THREE from 'three';
import { DimensionLines } from '../../DimensionLines';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import {
  MIN_DISTANCE_BETWEEN_SHELVES,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  SHELF_POSITION_OFFSET,
  WALL_THICKNESS,
} from '../../../constants';
import { IShelfDimensionLines } from '../../../interfaces/IShelfDimensionLines';

/**
 * Класс ShelfDimensionLines управляет созданием, обновлением и удалением размерных линий для полок
 */
export class ShelfDimensionLines {
  private sceneManagerService: SceneManagerService;
  private shelfLines: (THREE.Line | THREE.Group)[] = [];
  private dimensionLines: IShelfDimensionLines;

  constructor(sceneManagerService: SceneManagerService, dimensionLines: IShelfDimensionLines) {
    this.sceneManagerService = sceneManagerService;
    this.dimensionLines = dimensionLines;
  }

  /**
   * Создает одну размерную линию для полки
   */
  public addShelfDimensionLine(
    from: THREE.Vector3 | THREE.Object3D,
    to: THREE.Vector3 | THREE.Object3D,
    value: number,
    id: string,
    showText: boolean = true,
    label?: string,
  ): void {
    const fromPos =
      from instanceof THREE.Object3D
        ? new THREE.Vector3(from.position.x, from.position.y, from.position.z)
        : from.clone();

    const toPos =
      to instanceof THREE.Object3D
        ? new THREE.Vector3(to.position.x, to.position.y, to.position.z)
        : to.clone();

    const line = this.dimensionLines.createDimensionLine(fromPos, toPos, value, true, false, 35);
    line.name = `shelfDimensionLine_${id}`;
    this.sceneManagerService.addObject(line);
    this.shelfLines.push(line);
  }

  public updateShelfDimensionLinesById(
    id: number,
    shelves: Map<number, THREE.Object3D>,
    height: number,
    width: number,
  ): void {
    this.removeShelfDimensionLinesForPosition(id);
    const shelf = shelves.get(id);
    if (!shelf) {
      console.error(`Shelf with id ${id} not found for dimension line update.`);
      return;
    }

    const position = shelf.position;

    const widthLine = this.dimensionLines.createDimensionLine(
      new THREE.Vector3(position.x - width / 4, position.y + height / 2, position.z + 5),
      new THREE.Vector3(position.x + width / 4, position.y + height / 2, position.z + 5),
      width,
      true,
      false,
      35,
    );
    widthLine.name = `shelfDimensionLine_${id}_width`;

    const heightLine = this.dimensionLines.createDimensionLine(
      new THREE.Vector3(position.x + width / 4, position.y, position.z),
      new THREE.Vector3(position.x + width / 4, position.y + height, position.z),
      height - WALL_THICKNESS,
      true,
      false,
      35,
    );
    heightLine.name = `shelfDimensionLine_${id}_height`;

    this.sceneManagerService.addObject(heightLine);
    this.sceneManagerService.addObject(widthLine);
    this.shelfLines.push(heightLine, widthLine);
  }

  // public updateAllShelfDimensionLines(
  //   shelves: THREE.Object3D[],
  //   cabinetWidth: number,
  //   cabinetHeight: number,
  // ): void {
  //   this.removeShelfDimensionLines();
  //   if (!shelves || shelves.length === 0) return;

  //   const cabinet = this.sceneManagerService.getCabinet();
  //   const hasMullion = !!cabinet.hasMullion();

  //   // Получаем позицию средника
  //   const mullionPositionX = hasMullion
  //     ? cabinet.getCabinetParams().components.mullion?.position?.x ?? 0
  //     : 0;

  //   const zPos = (shelves[0]?.position.z ?? 0) + 5;
  //   const cabinetBottomY = PODIUM_HEIGHT;
  //   const cabinetTopY = cabinetHeight;

  //   // Фильтруем полки относительно позиции средника
  //   const fullSection = shelves
  //     .filter(s => Math.abs(s.position.x - mullionPositionX) < 1)
  //     .sort((a, b) => a.position.y - b.position.y);

  //   const leftSection = shelves
  //     .filter(s => s.position.x < mullionPositionX)
  //     .sort((a, b) => a.position.y - b.position.y);

  //   const rightSection = shelves
  //     .filter(s => s.position.x > mullionPositionX)
  //     .sort((a, b) => a.position.y - b.position.y);

  //   // 🔹 ВЫЧИСЛЯЕМ ЦЕНТРЫ СЕКЦИЙ ДИНАМИЧЕСКИ
  //   const leftWallX = -cabinetWidth / 2 + WALL_THICKNESS;
  //   const rightWallX = cabinetWidth / 2 - WALL_THICKNESS;

  //   // Центр левой секции
  //   const leftSectionCenter = hasMullion
  //     ? (leftWallX + mullionPositionX / 2) / 2
  //     : leftWallX / 2;

  //   // Центр центральной секции
  //   const centerSectionCenter = hasMullion
  //     ? mullionPositionX
  //     : 0;

  //   // Центр правой секции
  //   const rightSectionCenter = hasMullion
  //     ? (mullionPositionX + rightWallX) / 2
  //     : rightWallX / 2;

  //   if (!hasMullion || fullSection.length === 0) {
  //     // Без средника - единая размерная линия по центру шкафа
  //     this.drawSegmentedVertical(
  //       centerSectionCenter,
  //       zPos,
  //       cabinetBottomY,
  //       cabinetTopY,
  //       shelves,
  //       'center'
  //     );
  //     return;
  //   }

  //   // Со средником - раздельные размерные линии для каждой секции
  //   const bottomFullShelf = fullSection[0];
  //   const bottomFullBottomY = bottomFullShelf.position.y;
  //   const bottomFullTopY = bottomFullShelf.position.y +
  //                         (bottomFullShelf.userData['size']?.height ?? 0);

  //   // 🔹 РАЗМЕРНЫЕ ЛИНИИ ПО ЦЕНТРАМ СЕКЦИЙ

  //   // Левая секция - полностью
  //   if (leftSection.length > 0) {
  //     this.drawSegmentedVertical(
  //       leftSectionCenter,
  //       zPos,
  //       cabinetBottomY,
  //       cabinetTopY,
  //       leftSection,
  //       'left'
  //     );
  //   }

  //   // Правая секция - полностью
  //   if (rightSection.length > 0) {
  //     this.drawSegmentedVertical(
  //       rightSectionCenter,
  //       zPos,
  //       cabinetBottomY,
  //       cabinetTopY,
  //       rightSection,
  //       'right'
  //     );
  //   }

  //   // Центральная секция - разделенная
  //   // Верхняя часть (над нижней полкой)
  //   const upperFullSection = fullSection.filter(shelf => shelf.position.y > bottomFullBottomY);
  //   if (upperFullSection.length > 0) {
  //     this.drawSegmentedVertical(
  //       centerSectionCenter,
  //       zPos,
  //       bottomFullTopY - WALL_THICKNESS,
  //       cabinetTopY,
  //       upperFullSection,
  //       'center_above'
  //     );
  //   }

  //   // Нижняя часть центральной секции
  //   this.drawSegmentedVertical(
  //     centerSectionCenter,
  //     zPos,
  //     cabinetBottomY,
  //     bottomFullTopY - WALL_THICKNESS,
  //     [bottomFullShelf],
  //     'center_below'
  //   );
  // }

  public updateAllShelfDimensionLines(
    shelves: THREE.Object3D[],
    cabinetWidth: number,
    cabinetHeight: number,
  ): void {
    this.removeShelfDimensionLines();
    if (!shelves || shelves.length === 0) return;

    const hasMullion = !!this.sceneManagerService.getCabinet().hasMullion();
    const mullion = this.sceneManagerService.getCabinet().getMullion();
    const zPos = (shelves[0]?.position.z ?? 0) + 5;

    // дно и потолок шкафа
    const cabinetBottomY = PODIUM_HEIGHT;
    const cabinetTopY = cabinetHeight;

    const full = shelves
      .filter((s) => s.position.x === 0)
      .sort((a, b) => a.position.y - b.position.y);
    const left = shelves
      .filter((s) => s.position.x < 0)
      .sort((a, b) => a.position.y - b.position.y);
    const right = shelves
      .filter((s) => s.position.x > 0)
      .sort((a, b) => a.position.y - b.position.y);

    console.log(right);
    const centerX = 0;
    const leftX = -cabinetWidth / 4;
    const rightX = cabinetWidth / 4;

    if (!hasMullion || full.length === 0) {
      this.drawSegmentedVertical(
        0,
        zPos,
        cabinetBottomY,
        cabinetTopY,
        full.length ? full : shelves,
        'center',
      );
      return;
    }

    const bottomFull = full[0];
    const bottomFullBottomY = bottomFull.position.y;
    const bottomFullTopY = bottomFull.position.y + (bottomFull.userData['size']?.height ?? 0);

    this.drawSegmentedVertical(
      centerX,
      zPos,
      bottomFullTopY - WALL_THICKNESS,
      cabinetTopY,
      full,
      'center_above',
    );
    this.drawSegmentedVertical(leftX, zPos, cabinetBottomY, bottomFullBottomY, left, 'left_below');
    this.drawSegmentedVertical(
      rightX,
      zPos,
      cabinetBottomY,
      bottomFullBottomY,
      right,
      'right_below',
    );
  }

  /**
   * Рисует "сегментированную" вертикальную размерную линию
   */
  private drawSegmentedVertical(
    x: number,
    z: number,
    yStart: number,
    yEnd: number,
    shelvesSortedOrNot: THREE.Object3D[],
    idPrefix: string,
  ): void {
    // сортировка полок с низу вверх (по оси Y)
    const shelvesSorted = [...shelvesSortedOrNot].sort((a, b) => a.position.y - b.position.y);

    const shelfBottom = (s: THREE.Object3D) => s.position.y;
    const shelfTop = (s: THREE.Object3D) => s.position.y + (s.userData['size']?.height ?? 0);

    // фильтрация полок внутри диапазона (берём только те полки, которые хотя бы частично попадают в диапазон yStart..yEnd)
    const shelvesInRange = shelvesSorted.filter(
      (s) => shelfTop(s) > yStart && shelfBottom(s) < yEnd,
    );

    // Функция округления длины до ближайшего кратного 32
    const snapTo32 = (value: number) =>
      Math.round(value / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;

    const snapTo112Plus32 = (value: number) => {
      if (value <= 112) return 112;
      // находим ближайшее кратное 32, начиная от 112
      const offset = value - 112;
      return 112 + Math.round(offset / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;
    };

    // Если полок в диапазоне нет (рисуется одна сплошная размерная линия от yStart до yEnd)
    if (shelvesInRange.length === 0) {
      if (yEnd > yStart) {
        this.addShelfDimensionLine(
          new THREE.Vector3(x, yStart, z),
          new THREE.Vector3(x, yEnd, z),
          snapTo32(yEnd - yStart),
          `${idPrefix}_full`,
        );
      }
      return;
    }

    const firstShelf = shelvesInRange[0];
    const firstShelfBottom = shelfBottom(firstShelf);
    if (firstShelfBottom > yStart) {
      console.log('firstBottom: ', firstShelfBottom);
      console.log('yStart: ', yStart);
      this.addShelfDimensionLine(
        new THREE.Vector3(x, yStart - SHELF_HEIGHT, z),
        new THREE.Vector3(x, firstShelfBottom - SHELF_HEIGHT, z),
        snapTo32(firstShelfBottom - yStart),
        `${idPrefix}_start_to_first`,
      );
    }

    for (let i = 0; i < shelvesInRange.length - 1; i++) {
      const a = shelvesInRange[i];
      const b = shelvesInRange[i + 1];
      const aTop = Math.max(yStart, shelfTop(a));
      const bBottom = Math.min(yEnd, shelfBottom(b)) - SHELF_HEIGHT;
      console.log('aTop: ', aTop);
      console.log('bBottom: ', bBottom);
      if (bBottom > aTop) {
        const gap = Math.max(bBottom - aTop, MIN_DISTANCE_BETWEEN_SHELVES);
        this.addShelfDimensionLine(
          new THREE.Vector3(x, aTop, z),
          new THREE.Vector3(x, bBottom - SHELF_HEIGHT / 2, z),
          snapTo112Plus32(gap), // bBottom - aTop,
          `${idPrefix}_between_${i}`,
        );
      }
    }

    // Размерная линия от полки до верха шкафа
    const last = shelvesInRange[shelvesInRange.length - 1];
    const lastTop = Math.max(yStart, shelfTop(last));
    const yPosTopShelf = this.sceneManagerService.getObjectByName('topCabinet');
    if (yEnd > lastTop) {
      this.addShelfDimensionLine(
        new THREE.Vector3(x, lastTop, z),
        new THREE.Vector3(x, yPosTopShelf.position.y - SHELF_HEIGHT / 2, z), // yEnd
        yEnd - lastTop,
        `${idPrefix}_last_to_end`,
      );
    }
  }

  public updateShelfDimensionLineId(oldId: number, newId: number): void {
    const lineIndex = this.shelfLines.findIndex((line) => line.name === `dimensionLine_${oldId}`);
    if (lineIndex !== -1) {
      const dimensionLine = this.shelfLines[lineIndex];
      dimensionLine.name = `dimensionLine_${newId}`;
      console.log(`Размерная линия обновлена: ${oldId} → ${newId}`);
    }
  }

  /**
   * Удаляет все линии размеров полок из сцены.
   */
  public removeShelfDimensionLines(): void {
    const shelfDimensionLines = this.shelfLines.filter((line) =>
      line.name.startsWith('shelfDimensionLine'),
    );

    this.sceneManagerService.deleteObject(...shelfDimensionLines);
    this.shelfLines = this.shelfLines.filter((line) => !line.name.startsWith('shelfDimensionLine'));
  }

  public removeShelfDimensionLinesObj(shelf: THREE.Object3D): void {
    this.shelfLines = this.shelfLines.filter((line) => {
      if (line.userData && line.userData['shelf'] === shelf) {
        this.sceneManagerService.deleteObject(line);
        return false;
      }
      return true;
    });
  }

  /**
   * Удаляет конкретные линии размеров полок для заданной позиции полки.
   */
  public removeShelfDimensionLinesForPosition(id: number): void {
    const shelfDimensionLines = this.shelfLines.filter((line) =>
      line.name.startsWith(`shelfDimensionLine_${id}`),
    );

    if (shelfDimensionLines.length === 0) {
      console.warn(`No dimension lines found for shelf position with id: ${id}`);
      return;
    }

    this.sceneManagerService.deleteObject(...shelfDimensionLines);
    this.shelfLines = this.shelfLines.filter(
      (line) => !line.name.startsWith(`shelfDimensionLine_${id}`),
    );
  }
}
