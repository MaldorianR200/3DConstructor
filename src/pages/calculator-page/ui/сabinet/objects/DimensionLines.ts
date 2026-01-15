import * as THREE from 'three';
import {
  DEEP_DRAVER_IN_CABINET,
  DRAWER_GAP,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  WALL_THICKNESS,
} from '../constants';
import { SceneManagerService } from '../../services/SceneManager.service';
import { DrawerBlock, DrawerSize, DrawerSizeMap } from '../model/Drawers';
import { Position, Size } from '../model/BaseModel';
import { ShelfDimensionLines } from './managers/ShelfManager/ShelfDimensionLines';
import { IShelfDimensionLines } from '../interfaces/IShelfDimensionLines';
import { IDimensionLines } from '../interfaces/IDimensionLines';
import { DrawerDimensionLines } from './managers/DrawerManager/DrawerDimensionLines';
import { SectionDimensionLines } from './SectionDimensionLines';
import { IHandle } from '../model/Facade';

/**
 * Класс DimensionLines управляет созданием, обновлением и удалением размерных линий
 * в 3D сцене с использованием библиотеки Three.js.
 */
export class DimensionLines implements IDimensionLines {
  protected sceneManagerService: SceneManagerService;
  protected lines: (THREE.Line | THREE.Group)[] = [];
  protected raycaster: THREE.Raycaster;
  protected cabinetHeight: number;
  protected shelfDimensionLines: ShelfDimensionLines;
  protected drawerDimensionLines: DrawerDimensionLines;
  protected sectionDimensionLines: SectionDimensionLines;

  /**
   * Конструктор класса DimensionLines.
   * @param scene - Сцена Three.js, к которой будут добавлены размерные линии.
   */
  constructor(sceneManagerService: SceneManagerService, cabinetHeight: number) {
    this.sceneManagerService = sceneManagerService;
    this.raycaster = new THREE.Raycaster();
    this.cabinetHeight = cabinetHeight;
    this.shelfDimensionLines = new ShelfDimensionLines(sceneManagerService, this);
    this.drawerDimensionLines = new DrawerDimensionLines(sceneManagerService, this);
    this.sectionDimensionLines = new SectionDimensionLines(sceneManagerService, this);
  }

  public getSectionDimensionLines(): SectionDimensionLines {
    return this.sectionDimensionLines;
  }

  /**
   * Обновляет вертикальные размерные линии в секциях
   */
  public updateSectionHeightLines(): void {
    this.sectionDimensionLines.updateSectionHeightLines();
  }

  /**
   * Вызывается при добавлении/удалении объектов в шкафу
   */
  public onCabinetObjectsChanged(): void {
    this.sectionDimensionLines.onObjectAddedOrRemoved();
  }

  /**
   * Удаляет все размерные линии секций
   */
  public removeSectionHeightLines(): void {
    this.sectionDimensionLines.removeAllSectionLines();
  }

  /**
   * Добавляет размерные линии для ширины, высоты и глубины объекта в сцене.
   * @param width - Ширина объекта.
   * @param height - Высота объекта.
   * @param depth - Глубина объекта.
   * @param arrowSize - размер стрелок линий.
   */
  public addDimensionLines(
    width: number,
    height: number,
    depth: number,
    arrowSize: number = 5,
  ): void {
    // Основные внешние линии: ширина, высота, глубина
    this.addExternalDimensionLines(width, height, depth, arrowSize);

    // Внутренняя горизонтальная линия ширины
    this.updateInnerWidthLines();
  }

  /** Добавляет внешние размерные линии (Width, Height, Depth) */
  protected addExternalDimensionLines(
    width: number,
    height: number,
    depth: number,
    arrowSize: number,
  ): void {
    const widthLine = this.createDimensionLine(
      new THREE.Vector3(-width / 2 + WALL_THICKNESS / 2, height - 15, depth / 2),
      new THREE.Vector3(width / 2 - WALL_THICKNESS / 2 - SHELF_HEIGHT / 2, height - 15, depth / 2),
      width,
      false,
      false,
      arrowSize,
    );
    widthLine.name = 'dimensionLine_W';
    this.sceneManagerService.addObject(widthLine);
    this.lines.push(widthLine);

    const heightLine = this.createDimensionLine(
      new THREE.Vector3(width / 2 + 10, 0 - WALL_THICKNESS * 2, depth / 2 + 30),
      new THREE.Vector3(width / 2 + 10, height - WALL_THICKNESS * 2 - SHELF_HEIGHT * 2, depth / 2 + 30),
      height,
      false,
      false,
      arrowSize,
    );
    heightLine.name = 'dimensionLine_H';
    this.sceneManagerService.addObject(heightLine);
    this.lines.push(heightLine);

    const depthLine = this.createDimensionLine(
      new THREE.Vector3(-width / 2 - 5, height - WALL_THICKNESS, -depth / 2 + WALL_THICKNESS),
      new THREE.Vector3(-width / 2 - 5, height - WALL_THICKNESS, depth / 2 - WALL_THICKNESS),
      depth,
      false,
      false,
      arrowSize,
    );
    depthLine.name = 'dimensionLine_D';
    this.sceneManagerService.addObject(depthLine);
    this.lines.push(depthLine);
  }

  /** Обновляет внутренние горизонтальные линии ширины (учет средника и полок) */
  public updateInnerWidthLines(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    const shelves = [...cabinet.shelfManager.getShelves().values()]
      .map((s) => s.position.y)
      .sort((a, b) => a - b);
    const lowestShelfY = shelves.length > 0 ? shelves[0] : 0;
    const topOffset = 200; // чуть ниже верхней панели
    const topY = cabinet.getCabinetHeight() - topOffset;
    const shelfOffset = 20; // немного выше полки

    // Удаляем старые внутренние линии
    this.lines
      .filter(
        (line) =>
          line.name.startsWith('dimensionLine_InnerWidth') ||
          line.name.startsWith('dimensionLine_LeftToMullion') ||
          line.name.startsWith('dimensionLine_MullionToRight'),
      )
      .forEach((line) => this.sceneManagerService.deleteObject(line));

    this.lines = this.lines.filter(
      (line) =>
        !line.name.startsWith('dimensionLine_InnerWidth') &&
        !line.name.startsWith('dimensionLine_LeftToMullion') &&
        !line.name.startsWith('dimensionLine_MullionToRight'),
    );

    const width = cabinet.getCabinetWidth();
    const depth = cabinet.getCabinetDepth();

    // Вспомогательная функция для создания линии и добавления в сцену
    const addLine = (
      startX: number,
      endX: number,
      length: number,
      y: number,
      name: string,
      isShelf = false,
      isFirstShelf = false,
    ) => {
      const line = this.createDimensionLine(
        new THREE.Vector3(startX, y, depth / 2 + 10),
        new THREE.Vector3(endX, y, depth / 2 + 10),
        length,
        isShelf,
        isFirstShelf,
        25,
      );
      line.name = name;
      this.sceneManagerService.addObject(line);
      this.lines.push(line);
    };

    const fullLength = width / 2 - WALL_THICKNESS - (-width / 2 + WALL_THICKNESS);

    const cabinetHeight = cabinet.getCabinetHeight();
    // Добавляем полную верхнюю линию (независимо от наличия средника)
    if (!cabinet.hasMullion()) {
      addLine(
        -width / 2 + WALL_THICKNESS + WALL_THICKNESS / 2,
        width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2,
        fullLength,
        topY,
        'dimensionLine_InnerWidth_Top',
      );
    }

    // Если есть средник, добавляем две линии на уровне подиума
    if (cabinet.hasMullion()) {
      const mullion = cabinet.getMullion();
      if (!mullion) return;

      const mullionPosX = mullion.position.x;
      const podiumY = PODIUM_HEIGHT + shelfOffset; // Уровень подиума

      // Левая секция: от левой стенки до средника
      const leftLength = mullionPosX - (-width / 2 + WALL_THICKNESS) - WALL_THICKNESS / 2;
      addLine(
        -width / 2 + WALL_THICKNESS + WALL_THICKNESS / 2,
        mullionPosX - WALL_THICKNESS,
        leftLength,
        podiumY,
        'dimensionLine_LeftToMullion',
        true,
        true,
      );

      // Правая секция: от средника до правой стенки
      const rightLength = width / 2 - WALL_THICKNESS - mullionPosX - WALL_THICKNESS / 2;
      addLine(
        mullionPosX + WALL_THICKNESS,
        width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2,
        rightLength,
        podiumY,
        'dimensionLine_MullionToRight',
        true,
        false,
      );

      const mullionHeight = cabinet.getCabinetParams().components.mullion?.size.height || 0;
      if (mullionHeight <= cabinetHeight * 0.8) {
        addLine(
          -width / 2 + WALL_THICKNESS + WALL_THICKNESS / 2,
          width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2,
          fullLength,
          topY,
          'dimensionLine_InnerWidth_Top',
        );
      }
    }
  }

  /**
   * Создает размерную линию со стрелками и текстовой меткой, отображающей длину.
   * @param start - Начальная точка размерной линии.
   * @param end - Конечная точка размерной линии.
   * @param length - Длина размерной линии.
   * @param isShelf - Флаг, указывающий, является ли размерная линия для полки.
   * @param isFirstShelf - Флаг, указывающий, является ли это первая полка (необязательно).
   * @param arrowSize - Размер стрелок (по умолчанию 5).
   * @returns Группа Three.js, содержащая размерную линию, стрелки и текстовую метку.
   */
  public createDimensionLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    length: number,
    isShelf: boolean,
    isFirstShelf: boolean = false,
    arrowSize: number = 5,
  ): THREE.Group {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2f6864 });
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);

    const arrowHelperStart = new THREE.ArrowHelper(
      new THREE.Vector3().subVectors(start, end).normalize(),
      start,
      10,
      0x2f6864,
      arrowSize,
    );
    const arrowHelperEnd = new THREE.ArrowHelper(
      new THREE.Vector3().subVectors(end, start).normalize(),
      end,
      10,
      0x2f6864,
      arrowSize,
    );

    const textSprite = this.createTextSprite(length.toString());

    // Определяем ориентацию линии
    const isHorizontal = Math.abs(end.y - start.y) < 0.001; // Линия горизонтальна (Y почти не меняется)
    const isVertical = Math.abs(end.x - start.x) < 0.001; // Линия вертикальна (X почти не меняется)

    // Центральная точка линии
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    if (isShelf) {
      if (!isFirstShelf) {
        // Для полок (кроме первой) - смещение от центра
        const offset = new THREE.Vector3(10, -10, 0);
        textSprite.position.copy(center).add(offset);
      } else {
        // Для первой полки - смещение от центра
        const offset = new THREE.Vector3(10, 5, 0);
        textSprite.position.copy(center).add(offset);
      }
    } else {
      // Для шкафа - позиционирование в зависимости от ориентации
      if (isHorizontal) {
        // Горизонтальная линия - текст над линией по центру
        const offset = new THREE.Vector3(0, 20, 0);
        textSprite.position.copy(center).add(offset);
      } else if (isVertical) {
        // Вертикальная линия - текст справа от линии по центру
        const offset = new THREE.Vector3(20, 0, 0);
        textSprite.position.copy(center).add(offset);
      } else {
        // Диагональная линия - используем существующую логику или центрируем
        const offset = new THREE.Vector3(40, 0, 0);
        textSprite.position.copy(center).add(offset);
      }
    }

    textSprite.renderOrder = 1;

    const group = new THREE.Group();
    group.add(line, arrowHelperStart, arrowHelperEnd, textSprite);

    return group;
  }

  /**
   * Создает текстовый спрайт для отображения длины на размерных линиях.
   * @param message - Текст для отображения.
   * @returns Спрайт Three.js, содержащий текст.
   */
  public createTextSprite(message: string): THREE.Sprite {
    const fontFace = 'Arial';
    const fontSize = 100;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `Bold ${fontSize}px ${fontFace}`;
    context.fillStyle = 'rgba(47, 104, 100, 1.0)';
    context.fillText(message, 0, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);

    return sprite;
  }

  // public updateShelfDistanceLines(): void {
  //   this.removeShelfDimensionLines();
  // }

  /**
   * Обновляет размерные линии с новыми значениями ширины, высоты и глубины.
   * @param newWidth - Новая ширина объекта.
   * @param newHeight - Новая высота объекта.
   * @param newDepth - Новая глубина объекта.
   * @param arrowSize - Размер стрелок линии
   */
  public updateDimensionLines(
    newWidth: number,
    newHeight: number,
    newDepth: number,
    arrowSize: number,
  ): void {
    this.removeAllDimensionLines();

    this.addDimensionLines(newWidth, newHeight, newDepth, arrowSize);
  }

  /**
   * Удаляет все размерные линии из сцены.
   */

  public removeAllDimensionLines(): void {
    const scene = this.sceneManagerService.getScene();
    this.lines.forEach((line) => {
      this.sceneManagerService.deleteObject(line);
    });
    this.lines = []; // очищаем список
  }

  // Методы для полок
  public addShelfDimensionLine(
    from: THREE.Vector3 | THREE.Object3D,
    to: THREE.Vector3 | THREE.Object3D,
    value: number,
    id: string,
    showText: boolean = true,
    label?: string,
  ): void {
    this.shelfDimensionLines.addShelfDimensionLine(from, to, value, id, showText, label);
  }

  public updateShelfDimensionLinesById(
    id: number,
    shelves: Map<number, THREE.Object3D>,
    height: number,
    width: number,
  ): void {
    this.shelfDimensionLines.updateShelfDimensionLinesById(id, shelves, height, width);
  }

  public updateAllShelfDimensionLines(
    shelves: THREE.Object3D[],
    cabinetWidth: number,
    cabinetHeight: number,
  ): void {
    this.shelfDimensionLines.updateAllShelfDimensionLines(shelves, cabinetWidth, cabinetHeight);
  }

  public updateShelfDimensionLineId(oldId: number, newId: number): void {
    this.shelfDimensionLines.updateShelfDimensionLineId(oldId, newId);
  }

  public removeShelfDimensionLines(): void {
    this.shelfDimensionLines.removeShelfDimensionLines();
  }

  public removeShelfDimensionLinesObj(shelf: THREE.Object3D): void {
    this.shelfDimensionLines.removeShelfDimensionLinesObj(shelf);
  }

  public removeShelfDimensionLinesForPosition(id: number): void {
    this.shelfDimensionLines.removeShelfDimensionLinesForPosition(id);
  }

  // Методы для блоков с ящиками
  /**
   * Добавляет размерные линии для блока с ящиками
   * @param drawerBlock - Данные блока с ящиками
   * @param cabinetSize - Размеры шкафа
   * @param drawerSize - Размеры ящиков
   * @param position - Позиция блока в шкафу
   * @param arrowSize - Размер стрелок (необязательно, по умолчанию 3)
   */
  public addDrawerDimensionLines(
    drawerBlock: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    position: Position,
    arrowSize: number = 3, // Добавлен параметр с размером стрелок по умолчанию
  ): void {
    this.drawerDimensionLines.addDrawerDimensionLines(
      drawerBlock,
      cabinetSize,
      drawerSize,
      position,
      arrowSize,
    );
  }

  /**
   * Удаляет все размерные линии для блока с ящиками
   * @param drawerBlock - Данные блока с ящиками
   */
  public removeDrawerDimensionLines(drawerBlock: DrawerBlock): void {
    this.drawerDimensionLines.removeDrawerDimensionLines(drawerBlock);
  }

  /**
   * Обновляет размерные линии для блока ящиков при перемещении
   * @param drawerBlock - Блок ящиков
   * @param newPosition - Новая позиция блока
   */
  public updateDrawerBlockDimensionLines(drawerBlock: THREE.Object3D, newPosition: Position): void {
    this.drawerDimensionLines.updateDrawerBlockDimensionLines(drawerBlock, newPosition);
  }

  /**
   * Добавление размерной линии для ящика
   * @param id
   * @param width
   * @param sideHeight
   * @param depth
   * @param positionBlock
   * @param arrowSize - размер стрелок
   */
  public addSidePanelHeight(
    id: number,
    width: number,
    sideHeight: number,
    depth: number,
    positionBlock: Position,
    arrowSize: number,
  ): void {
    this.drawerDimensionLines.addSidePanelHeight(
      id,
      width,
      sideHeight,
      depth,
      positionBlock,
      arrowSize,
    );
  }

  public removeSidePanelHeightLineById(id: number): void {
    this.drawerDimensionLines.removeSidePanelHeightLineById(id);
  }

  /**
   * Вспомогательный метод для удаления линии по имени
   * @param name - Имя размерной линии
   */
  public removeDrawerDimensionLineByName(name: string): void {
    this.drawerDimensionLines.removeDimensionLineByName(name);
  }

  public removeAllSidePanelHeightLines(): void {
    this.drawerDimensionLines.removeAllSidePanelHeightLines();
  }

  public removeDimensionLineByName(name: string): void {
    // 1. Ищем объект в локальном массиве lines
    const lineIndex = this.lines.findIndex((line) => line.name === name);

    if (lineIndex !== -1) {
      const lineObject = this.lines[lineIndex];

      // 2. Удаляем из сцены через сервис
      this.sceneManagerService.deleteObject(lineObject);

      // 3. Удаляем из массива отслеживания
      this.lines.splice(lineIndex, 1);
    } else {
      // 4. Дополнительная страховка: поиск в сцене, если в массиве почему-то нет
      const objectInScene = this.sceneManagerService.getScene().getObjectByName(name);
      if (objectInScene) {
        this.sceneManagerService.deleteObject(objectInScene);
      }
    }

    // Опционально: оставляем вызов для специфичных линий ящиков
    this.drawerDimensionLines.removeDimensionLineByName(name);
  }

  // Средник__________________________________________________________________________________________

  /**
   * Добавляет горизонтальную размерную линию между стеной шкафа и средником.
   * @param mullion - Объект средника.
   * @param width - Ширина шкафа.
   * @param cabinetHeight - Высота шкафа.
   * @param wallThickness - Толщина стены шкафа.
   */
  public addMullionHorizontalDimensionLine(
    mullion: THREE.Object3D,
    width: number,
    cabinetHeight: number,
  ): void {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

    // Позиция средника по оси Z
    const mullionPositionZ = mullion.position.z;

    // Начальная точка линии (стена шкафа)
    const start = new THREE.Vector3(
      -width / 2 + WALL_THICKNESS,
      cabinetHeight / 2,
      mullionPositionZ,
    );

    // Конечная точка линии (средник)
    const end = new THREE.Vector3(mullion.position.x, cabinetHeight / 2, mullionPositionZ);

    // Длина линии (расстояние между стеной и средником)
    const length = Math.abs(start.x - end.x);

    // Создание размерной линии
    const horizontalLine = this.createDimensionLine(start, end, length, false);

    horizontalLine.name = 'mullionHorizontalDimensionLine';
    this.sceneManagerService.addObject(horizontalLine);
    this.lines.push(horizontalLine);
  }

  /**
   * Обновляет горизонтальную размерную линию между стеной шкафа и средником.
   * @param mullion - Объект средника.
   * @param width - Ширина шкафа.
   * @param cabinetHeight - Высота шкафа.
   * @param wallThickness - Толщина стены шкафа.
   */
  public updateMullionHorizontalDimensionLine(
    mullion: THREE.Object3D,
    width: number,
    cabinetHeight: number,
  ): void {
    // Удаляем старую размерную линию
    this.removeMullionHorizontalDimensionLine();

    // Добавляем новую размерную линию
    this.addMullionHorizontalDimensionLine(mullion, width, cabinetHeight);
  }

  /**
   * Удаляет горизонтальную размерную линию между стеной шкафа и средником.
   */
  public removeMullionHorizontalDimensionLine(): void {
    const line = this.sceneManagerService
      .getScene()
      .getObjectByName('mullionHorizontalDimensionLine');
    if (line) {
      this.sceneManagerService.deleteObject(line);
      this.lines = this.lines.filter((l) => l !== line);
    }
  }

  // __________________________________Размерные линии для отступа и высоту ручек__________________________________
  public updateHandleDimensions(
    handleObj: THREE.Object3D,
    facadeObj: THREE.Object3D,
    handleData: IHandle,
  ) {
    // Удаляем старые линии ручки
    this.clearAllHandleDimensions();

    const facadeWorldPos = new THREE.Vector3();
    facadeObj.getWorldPosition(facadeWorldPos);

    const handleWorldPos = new THREE.Vector3();
    handleObj.getWorldPosition(handleWorldPos);

    // 1. Размерная линия по Вертикали (От пола/полки до верхней точки ручки)
    // В мебельных системах обычно считается от нижней точки шкафа (Y=0)
    const topPointHandleY = handleWorldPos.y + handleData.size.height / 2;
    const bottomPointY = -PODIUM_HEIGHT / 2 + WALL_THICKNESS; // Самый низ шкафа (пол)

    const startY = new THREE.Vector3(handleWorldPos.x, bottomPointY, handleWorldPos.z + 10);
    const endY = new THREE.Vector3(handleWorldPos.x, topPointHandleY, handleWorldPos.z + 10);
    const lengthY = Math.round(topPointHandleY - bottomPointY);

    const lineY = this.createDimensionLine(startY, endY, lengthY, false, false, 5);
    lineY.name = `handle_dim_y_${facadeObj.name}`;
    this.sceneManagerService.addObject(lineY);
    this.lines.push(lineY);

    // 2. Размерная линия по Горизонтали (только для OVERHEAD_HANDLE)
    if (handleData.type === 'OVERHEAD_HANDLE') {
      const isLeftSide = facadeObj.name.includes('left');
      // Край фасада
      const edgeX = isLeftSide
        ? facadeWorldPos.x + handleData.size.width / 2
        : facadeWorldPos.x - handleData.size.width / 2;

      const startX = new THREE.Vector3(edgeX, handleWorldPos.y, handleWorldPos.z + 10);
      const endX = new THREE.Vector3(handleWorldPos.x, handleWorldPos.y, handleWorldPos.z + 10);
      const lengthX = Math.round(handleData.indentX);

      const lineX = this.createDimensionLine(startX, endX, lengthX, false, false, 5);
      lineX.name = `handle_dim_x_${facadeObj.name}`;
      this.sceneManagerService.addObject(lineX);
      this.lines.push(lineX);
    }
  }

  /**
   * Очищает все размерные линии ручек на всех фасадах
   */
  public clearAllHandleDimensions(): void {
    // Ищем и удаляем все линии, имена которых начинаются с префикса handle_dim
    const linesToRemove = this.lines.filter((l) => l.name && l.name.startsWith('handle_dim_'));
    linesToRemove.forEach((line) => {
      this.removeDimensionLineByName(line.name);
    });
  }
}
