import * as THREE from 'three';
import { DimensionLines } from '../../DimensionLines';
import {
  DEEP_DRAVER_IN_CABINET,
  FALSE_PANEL_WIDTH,
  INTERVAL_1_MM,
  INTERVAL_4_MM,
  PODIUM_HEIGHT,
  SIDEWALL_INDENTATION,
  WALL_THICKNESS,
  DEPTH_EDGE_8MM,
  DEPTH_EDGE_4MM,
  FALSE_PANEL_TOP,
  DEPTH_EDGE_04MM,
  DEPTH_EDGE_08MM,
  DRAWER_GAP,
  HEIGHT_WALL_DRAWER,
} from '../../../constants';

import {
  calculateDrawerElements,
  Drawer,
  DrawerBlock,
  DrawerBlocks,
  DrawerPositions,
  DrawerSize,
  DrawerSizeMap,
  FullDrawerBlockSize,
  FullDrawerSize,
} from '../../../model/Drawers';

import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { RoundedBoxGeometry } from 'three-stdlib';
import { BaseCabinet } from '../../../cabinetTypes/BaseCabinet';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { PositionCutout } from '../../../model/Facade';
import { Position } from '../../../model/BaseModel';
import { DrawerWarningService } from 'src/pages/calculator-page/ui/services/warnings/DrawerWarningService.service';
import { DrawerWarningAction } from '../../../warnings/drawer-warning-overlay/drawer-warning-overlay.component';

/**
 *  class для управления блоками с ящиками в шкафу
 * @constructor (scene: THREE.Scene, dimensionLines: DimensionLines, size: Size, actionStack: any[])
 *
 */
export class DrawerManager {
  private sceneManagerService: SceneManagerService;
  private drawerWarningService: DrawerWarningService;
  private isUpdating = false;
  private blockDrawers: Map<number, THREE.Object3D> = new Map();
  private dimensionLines: DimensionLines;
  private sizeCabinet: Size;
  private material: MMaterial;

  constructor(
    sceneManagerService: SceneManagerService,
    drawerWarningService: DrawerWarningService,
    dimensionLines: DimensionLines,
    size: Size,
  ) {
    this.sizeCabinet = size;
    this.sceneManagerService = sceneManagerService;
    this.drawerWarningService = drawerWarningService;
    this.dimensionLines = dimensionLines;
  }

  /* ================================================ Методы для блоков ================================================*/

  public getAllDrawerBlocks(): THREE.Object3D[] {
    return Array.from(this.blockDrawers.values());
  }

  /**
   *
   */
  public addBlockToSection(
    drawerData: DrawerBlock,
    cabinetSize: Size,
    positionLoops: string = 'right-side',
  ) {

  }

  /**
   *
   *
   * @param {DrawerBlock} drawerData
   * @param {Size} cabinetSize
   * @param {string} [positionLoops='right-side']
   * @memberof DrawerManager
   */
  public addBlock(
    drawerData: DrawerBlock,
    cabinetSize: Size,
    positionLoops: string = 'right-side',
  ): void {
    console.log('Проверка drawerData:');
    console.log(drawerData);
    const id = drawerData.id;
    const drawerBlock = new THREE.Group();
    drawerBlock.userData['id'] = id;
    drawerBlock.name = `drawerBlock_${id}`;
    // Сохраняем количество ящиков в userData
    const drawersCount = drawerData.drawerItems.length;
    drawerBlock.userData['drawerData'] = drawerData;
    drawerBlock.userData['drawersCount'] = drawersCount;
    drawerBlock.userData['position'] = drawerData.position;

    const material = BaseCabinet.getMaterial(drawerData.material.texture.path);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: drawerData.material.color.hex,
    });

    // Размеры для всего блока с ящиками
    const fullSize = drawerData.fullSize;
    const fullDrawerSize = drawerData.fullDrawerSize;

    const drawerSize: DrawerSize = {
      facadeHeight: fullDrawerSize.facade.height,
      blockHeight: fullSize.wall.size.height + fullSize.shelf.size.height * 2,
      sideHeight: fullSize.wall.size.height,
    };

    const usableHeight = drawerSize.sideHeight - WALL_THICKNESS * 2; // без верхней и нижней панелей
    const drawerHeight = usableHeight / drawersCount;

    // Создаем все компоненты блока
    const { components, positions } = this.createBlockComponents(
      drawerData,
      cabinetSize,
      drawerSize,
      material,
      positionLoops,
    );

    // Добавляем все компоненты в группу
    drawerBlock.add(...Object.values(components));

    // Создаем и добавляем ящики
    drawerData.drawerItems.forEach((drawer, index) => {
      const drawerGroup = this.createDrawer(
        cabinetSize,
        fullSize,
        fullDrawerSize,
        drawerSize,
        material,
        edgeMaterial,
        positions,
        index,
        id,
      );
      console.log(drawerGroup);
      drawerBlock.add(drawerGroup);
    });

    // вычисляем bounding box по всем детям
    const bbox = new THREE.Box3().setFromObject(drawerBlock);
    const min = bbox.min.clone();
    const size = bbox.getSize(new THREE.Vector3());

    // если bbox пустой — пропускаем
    if (isFinite(min.y)) {
      // сдвигаем всех детей вниз на min.y (чтобы низ блока оказался в локальном y = 0)
      drawerBlock.children.forEach((child) => {
        // если у child есть собственный центр/world transform — смещаем локально
        child.position.y -= min.y;
      });
    }

    drawerBlock.position.set(drawerData.position.x, drawerData.position.y, drawerData.position.z);

    // Обновляем мировую матрицу после нормализации
    drawerBlock.updateMatrixWorld(true);

    // Добавляем блок на сцену
    this.sceneManagerService.addObject(drawerBlock);
    // Обновляем состояние размерных линий блока
    this.dimensionLines.updateDrawerBlockDimensionLines(
      drawerBlock,
      drawerBlock.userData['position'],
    );
    this.blockDrawers.set(id, drawerBlock);
  }

  private createBlockComponents(
    drawerData: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    material: THREE.Material,
    positionLoops: string,
  ): { components: Record<string, THREE.Mesh>; positions: DrawerPositions } {
    const components: Record<string, THREE.Mesh> = {};
    // const positions: Record<string, Position> = {};
    const id = this.blockDrawers.size;
    const boxPosition = drawerData.position; // drawerData.drawerItems[0].position;
    const hasMullion = this.sceneManagerService.getCabinet().hasMullion();
    console.log('boxPosition: ', boxPosition);
    const positions: DrawerPositions = {
      leftWall: { x: 0, y: 0, z: 0 },
      rightWall: { x: 0, y: 0, z: 0 },

      fasade: { x: 0, y: 0, z: 0 },
      back: { x: 0, y: 0, z: 0 },
      leftWallDrawer: { x: 0, y: 0, z: 0 },
      rightWallDrawer: { x: 0, y: 0, z: 0 },
      front: { x: 0, y: 0, z: 0 },
      hdf: { x: 0, y: 0, z: 0 },
      frontPanelTop: { x: 0, y: 0, z: 0 },
      backPanelTop: { x: 0, y: 0, z: 0 },
      frontPanelBottom: { x: 0, y: 0, z: 0 },
      backPanelBottom: { x: 0, y: 0, z: 0 },
      topShelf: { x: 0, y: 0, z: 0 },
      bottomPanel: { x: 0, y: 0, z: 0 },
    };

    // Базовые параметры позиционирования
    const baseZ = boxPosition.z - DEEP_DRAVER_IN_CABINET / 2 + INTERVAL_1_MM * 4;
    // const baseY = drawerSize.blockHeight / 2 + WALL_THICKNESS * 3 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 2;
    const indexDrawer = drawerData.id;

    // локальные смещения внутри блока (без использования drawerData.position.y)
    const localBaseYOffset = DRAWER_GAP + indexDrawer * (drawerSize.blockHeight + DRAWER_GAP);

    // базовая локальная высота: расстояние от локального нуля (низ блока) до центра боковой стенки
    const localBaseY =
      drawerSize.blockHeight / 2 + WALL_THICKNESS * 3 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 2;

    const baseY =
      drawerData.position.y +
      drawerSize.blockHeight / 2 +
      WALL_THICKNESS * 3 +
      WALL_THICKNESS / 2 +
      INTERVAL_1_MM * 2;
    const isSingleDoor = this.sceneManagerService
      .getCabinet()
      .getCabinetType()
      .includes(CabinetSubType.Single);
    const isRightOpening = positionLoops == 'right-side';

    const topY = boxPosition.y + drawerSize.blockHeight;
    const bottomY = boxPosition.y - drawerSize.blockHeight / 2;

    // top/bottom внутри блока (локальные)
    const localTopY = localBaseY + drawerSize.blockHeight / 2;
    const localBottomY = localBaseY - drawerSize.blockHeight / 2;
    const localWallCenterY = (localTopY + localBottomY) / 2;

    // Позиция панелей по оси X
    let frontPanelX = 0;

    // Вычисляем ширину планки в зависимости от типа шкафа
    let widthPanel;
    if (isSingleDoor) {
      widthPanel = drawerData.fullSize.falsePanelW.size.width - FALSE_PANEL_WIDTH;
    } else {
      if (hasMullion) {
        widthPanel = drawerData.fullSize.falsePanelW.size.width - FALSE_PANEL_WIDTH;
      } else {
        widthPanel = drawerData.fullSize.falsePanelW.size.width - FALSE_PANEL_WIDTH * 2;
      }
    }

    // Размеры компонентов
    const dimensions = {
      sideWall: {
        width: WALL_THICKNESS,
        height: drawerSize.sideHeight,
        depth: cabinetSize.depth - DEEP_DRAVER_IN_CABINET,
      },
      falsePanel: drawerData.fullSize.falsePanel_50.size,
      additionFP: drawerData.fullSize.falsePanelAdd.size,
      shelf: drawerData.fullSize.shelf,
      panel: {
        width: widthPanel,
        height: WALL_THICKNESS,
        depth: FALSE_PANEL_TOP,
      },
    };
    console.log('dimensions.shelf: ', dimensions.shelf);

    // ==========================
    // РАСЧЁТ ПОЗИЦИЙ БОКОВЫХ СТЕНОК
    // ==========================

    let leftWallX = 0;
    let rightWallX = 0;

    let offsetX_HDF = 0;
    let offsetY_HDF = 0;
    let offsetZ_HDF = 0;

    let offsetX_Bottom = 0;
    let offsetY_Bottom = 0;
    let offsetZ_Bottom = 0;

    let offsetX_TopShelf = 0;
    let offsetY_TopShelf = 0;
    let offsetZ_TopShelf = 0;

    let offsetX_LeftFalsePanel = 0;
    let offsetX_RightFalsePanel = 0;
    // 1. Одностворчатый шкаф
    if (isSingleDoor) {
      if (isRightOpening) {
        frontPanelX = -WALL_THICKNESS - INTERVAL_1_MM - WALL_THICKNESS / 2;
        // петли справа → фальшпанель справа, левая стенка ближе к краю
        leftWallX = 0 - dimensions.shelf.size.width / 2 + WALL_THICKNESS / 2;
        rightWallX =
          dimensions.shelf.size.width / 2 -
          WALL_THICKNESS * 1.5 -
          FALSE_PANEL_WIDTH +
          WALL_THICKNESS;

        offsetX_HDF = -WALL_THICKNESS * 2 + WALL_THICKNESS / 2 - INTERVAL_1_MM;
        // offsetX_LeftFalsePanel = -cabinetSize.width / 2 + WALL_THICKNESS * 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM;
        offsetX_RightFalsePanel = dimensions.shelf.size.width / 2 - FALSE_PANEL_WIDTH / 2;
      } else {
        frontPanelX = WALL_THICKNESS + INTERVAL_1_MM + WALL_THICKNESS / 2;
        // петли слева → фальшпанель слева
        leftWallX =
          -dimensions.shelf.size.width / 2 +
          WALL_THICKNESS * 1.5 +
          FALSE_PANEL_WIDTH -
          WALL_THICKNESS;
        rightWallX = 0 + dimensions.shelf.size.width / 2 - WALL_THICKNESS / 2;

        offsetX_HDF = WALL_THICKNESS * 2 - WALL_THICKNESS / 2 + INTERVAL_1_MM;
        offsetX_LeftFalsePanel = -dimensions.shelf.size.width / 2 + FALSE_PANEL_WIDTH / 2;
        // offsetX_RightFalsePanel = cabinetSize.width / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2 - INTERVAL_1_MM;
      }
    }
    // 2. Двустворчатый шкаф
    else {
      if (hasMullion) {
        // шкаф с средником, делим ширину на 2 секции
        const halfWidth = this.sceneManagerService.getCabinet().getMullion().position.x; // cabinetSize.width / 2;
        const isLeftSection = boxPosition.x < 0;
        const isRightSection = boxPosition.x >= 0;
        console.log('isLeftSection: ', isLeftSection, 'isRightSection: ', isRightSection);
        if (isLeftSection) {
          // левая секция
          frontPanelX = WALL_THICKNESS + INTERVAL_1_MM + WALL_THICKNESS / 2;
          leftWallX =
            -dimensions.shelf.size.width / 2 +
            WALL_THICKNESS * 1.5 +
            FALSE_PANEL_WIDTH -
            WALL_THICKNESS;
          rightWallX = 0 + dimensions.shelf.size.width / 2 - WALL_THICKNESS / 2;

          offsetX_HDF = WALL_THICKNESS + INTERVAL_1_MM + WALL_THICKNESS / 2;
          offsetX_LeftFalsePanel = -dimensions.shelf.size.width / 2 + FALSE_PANEL_WIDTH / 2;
          console.log('offsetX_LeftFalsePanel: ', offsetX_LeftFalsePanel);
          // offsetX_RightFalsePanel = cabinetSize.width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2 - INTERVAL_1_MM;
        } else if (isRightSection) {
          // правая секция
          console.log('правая секция!!!!!!!!!!!!!!!!!!!!');
          console.log(dimensions.shelf.size.width);
          frontPanelX = -WALL_THICKNESS - INTERVAL_1_MM - WALL_THICKNESS / 2;
          leftWallX = 0 - dimensions.shelf.size.width / 2 + WALL_THICKNESS / 2;
          rightWallX =
            dimensions.shelf.size.width / 2 -
            WALL_THICKNESS * 1.5 -
            FALSE_PANEL_WIDTH +
            WALL_THICKNESS; // halfWidth - WALL_THICKNESS * 1.5 + WALL_THICKNESS - FALSE_PANEL_WIDTH;

          offsetX_HDF = -WALL_THICKNESS - INTERVAL_1_MM - WALL_THICKNESS / 2;
          // offsetX_LeftFalsePanel = -cabinetSize.width / 2 + WALL_THICKNESS * 1 + WALL_THICKNESS / 2 + INTERVAL_1_MM;
          offsetX_RightFalsePanel = dimensions.shelf.size.width / 2 - FALSE_PANEL_WIDTH / 2; // cabinetSize.width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2 - INTERVAL_1_MM;
        }
      } else {
        // двустворчатый без средника → классическая схема (две панели)
        frontPanelX = 0;
        leftWallX = -cabinetSize.width / 2 + WALL_THICKNESS * 1.5 + FALSE_PANEL_WIDTH;
        rightWallX = cabinetSize.width / 2 - WALL_THICKNESS * 1.5 - FALSE_PANEL_WIDTH;

        offsetX_HDF = 0;
        offsetX_LeftFalsePanel =
          -cabinetSize.width / 2 + WALL_THICKNESS * 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM;
        offsetX_RightFalsePanel =
          cabinetSize.width / 2 - WALL_THICKNESS * 2 - WALL_THICKNESS / 2 - INTERVAL_1_MM;
      }
    }
    console.log('cabinetSize.width: ' + cabinetSize.width);
    console.log('leftWallX: ', leftWallX, 'rightWallX: ', rightWallX);

    // Создаем основные компоненты блока
    // ==========================
    // 🔸 БОКОВИНЫ БЛОКА
    // ==========================
    components['leftWall'] = this.createDrawerComponent(
      dimensions.sideWall,
      material,
      `leftWall_${id}`,
      { x: leftWallX, y: baseY, z: baseZ },
      true,
    );

    components['rightWall'] = this.createDrawerComponent(
      dimensions.sideWall,
      material,
      `rightWall_${id}`,
      { x: rightWallX, y: baseY, z: baseZ },
      true,
    );

    // ==========================
    // 🔸 ФАЛЬШПАНЕЛИ
    // ==========================

    const createLeftFalsePanels = () => {
      components[`leftFalsePanel_${id}`] = this.createDrawerComponent(
        dimensions.falsePanel,
        material,
        `leftFalsePanel_${id}`,
        {
          x: offsetX_LeftFalsePanel,
          y: baseY,
          z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2,
        },
      );

      components[`leftAdditionFP_${id}`] = this.createDrawerComponent(
        dimensions.additionFP,
        material,
        `leftAdditionFP_${id}`,
        {
          x: offsetX_LeftFalsePanel,
          y: baseY,
          z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2 - WALL_THICKNESS,
        },
      );
    };

    const createRightFalsePanels = () => {
      components[`rightFalsePanel_${id}`] = this.createDrawerComponent(
        dimensions.falsePanel,
        material,
        `rightFalsePanel_${id}`,
        {
          x: offsetX_RightFalsePanel, // cabinetSize.width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2 - INTERVAL_1_MM,
          y: baseY,
          z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2,
        },
      );

      components[`rightAdditionFP_${id}`] = this.createDrawerComponent(
        dimensions.additionFP,
        material,
        `rightAdditionFP_${id}`,
        {
          x: offsetX_RightFalsePanel, // cabinetSize.width / 2 - WALL_THICKNESS - WALL_THICKNESS / 2 - INTERVAL_1_MM,
          y: baseY,
          z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2 - WALL_THICKNESS,
        },
      );
    };

    if (isSingleDoor) {
      // одностворчатый шкаф
      if (isRightOpening) createRightFalsePanels();
      else createLeftFalsePanels();
    } else {
      // двустворчатый
      if (hasMullion) {
        // есть средник → только со стороны петель
        if (positionLoops.includes('left-side')) createLeftFalsePanels();
        else if (positionLoops.includes('right-side')) createRightFalsePanels();
      } else {
        // нет средника → две фальшпанели
        createLeftFalsePanels();
        createRightFalsePanels();
      }
    }

    // ==========================
    // 🔸 ПЛАНКИ
    // ==========================
    components['frontPanelTop'] = this.createDrawerComponent(
      dimensions.panel,
      material,
      `frontPanelTop_${id}`,
      {
        x: frontPanelX,
        y: drawerData.position.y + drawerSize.blockHeight + WALL_THICKNESS * 2 + INTERVAL_1_MM * 2,
        z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS * 4,
      },
      true,
    );

    // Планка сзади сверху
    components['backPanelTop'] = this.createDrawerComponent(
      dimensions.panel,
      material,
      `backPanelTop_${id}`,
      {
        x: frontPanelX,
        y: drawerData.position.y + drawerSize.blockHeight + WALL_THICKNESS * 2 + INTERVAL_1_MM * 2,
        z: -cabinetSize.depth / 2 + FALSE_PANEL_TOP / 2 + INTERVAL_1_MM * 4,
      },
      true,
    );

    // Планка спереди внизу
    components['frontPanelBottom'] = this.createDrawerComponent(
      dimensions.panel,
      material,
      `frontPanelBottom_${id}`,
      {
        x: frontPanelX,
        y:
          drawerData.position.y +
          PODIUM_HEIGHT +
          WALL_THICKNESS / 2 +
          WALL_THICKNESS +
          INTERVAL_1_MM * 5,
        z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS * 4,
      },
      true,
    );

    // Планка сзади внизу
    components['backPanelBottom'] = this.createDrawerComponent(
      dimensions.panel,
      material,
      `backPanelBottom_${id}`,
      {
        x: frontPanelX,
        y:
          drawerData.position.y +
          PODIUM_HEIGHT +
          WALL_THICKNESS / 2 +
          WALL_THICKNESS +
          INTERVAL_1_MM * 5,
        z: -cabinetSize.depth / 2 + FALSE_PANEL_TOP / 2 + INTERVAL_1_MM * 4,
      },
      true,
    );

    // ==========================
    // 🔸 Top && Botttom
    // ==========================

    // Создаем верхнюю полку
    components['topShelf'] = this.createDrawerComponent(
      dimensions.shelf.size,
      material,
      `topShelf_${id}`,
      {
        x: 0,
        y: topY + WALL_THICKNESS * 3 + INTERVAL_1_MM * 2,
        z: baseZ,
      },
      true,
    );
    // Создаём нижнюю полку
    components['bottomPanel'] = this.createDrawerComponent(
      dimensions.shelf.size,
      material,
      `bottomPanel_${id}`,
      {
        x: 0,
        y: baseY - drawerSize.blockHeight / 2 + WALL_THICKNESS / 2,
        z: baseZ,
      },
      true,
    );

    // Заполняем позиции для создания ящиков
    positions.fasade = {
      x: frontPanelX,
      y: drawerData.position.y + PODIUM_HEIGHT * 2 + WALL_THICKNESS / 2,
      z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2,
    };

    positions.back = {
      x: frontPanelX,
      y: drawerData.position.y + PODIUM_HEIGHT * 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
      z: -cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 4,
    };

    positions.front = {
      x: frontPanelX,
      y: drawerData.position.y + PODIUM_HEIGHT * 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
      z: baseZ + dimensions.sideWall.depth / 2 - WALL_THICKNESS / 2 - WALL_THICKNESS,
    };

    positions.leftWallDrawer = {
      x: leftWallX + WALL_THICKNESS + 8, // добавляем 3мм, т.к. отступ
      y: drawerData.position.y + PODIUM_HEIGHT * 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
      z: baseZ - WALL_THICKNESS / 2,
    };

    positions.rightWallDrawer = {
      x: rightWallX - WALL_THICKNESS - 8, // вычитаем 3мм, т.к. отступ
      y: drawerData.position.y + PODIUM_HEIGHT * 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
      z: baseZ - WALL_THICKNESS / 2,
    };
    //  const baseZ = boxPosition.z - DEEP_DRAVER_IN_CABINET / 2 + INTERVAL_1_MM * 4;
    positions.hdf = {
      x: offsetX_HDF,
      y:
        drawerData.position.y / 2 +
        positions.rightWallDrawer.y / 2 +
        WALL_THICKNESS +
        WALL_THICKNESS / 2 +
        1,
      z: -WALL_THICKNESS * 2 - WALL_THICKNESS + INTERVAL_1_MM * 4,
    };

    positions.bottomPanel = {
      x: isSingleDoor ? (isRightOpening ? -FALSE_PANEL_WIDTH / 2 : FALSE_PANEL_WIDTH / 2) : 0,
      y:
        drawerData.position.y +
        PODIUM_HEIGHT +
        WALL_THICKNESS -
        (isSingleDoor ? INTERVAL_1_MM * 4 : INTERVAL_1_MM * 2),
      z: -WALL_THICKNESS * 2 - WALL_THICKNESS / 2 - (isSingleDoor ? INTERVAL_1_MM * 4 : 0),
    };

    positions.topShelf = {
      x: isSingleDoor ? (isRightOpening ? -FALSE_PANEL_WIDTH / 2 : FALSE_PANEL_WIDTH / 2) : 0,
      y: drawerData.position.y + positions.rightWallDrawer.y * 2,
      z: -WALL_THICKNESS * 2 - WALL_THICKNESS / 2 - (isSingleDoor ? INTERVAL_1_MM * 4 : 0),
    };
    return { components, positions };
  }

  /**
   * Создание стандартного компонент ящика с повернутыми UV-координатами
   */
  private createDrawerComponent(
    size: Size,
    material: THREE.Material,
    name: string,
    position: Position,
    rotateUV: boolean = false,
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    if (rotateUV) {
      BaseCabinet.rotateUVs(geometry);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    return mesh;
  }

  /* ================================================ ---------------- ================================================*/

  /* ================================================ Методы для ящиков ================================================*/

  /**
   *
   *
   * @private
   * @param {Size} cabinetSize
   * @param {FullDrawerBlockSize} fullSize
   * @param {FullDrawerSize} fullDrawerSize
   * @param {DrawerSize} drawerSize
   * @param {THREE.Material} material
   * @param {THREE.Material} edgeMaterial
   * @param {DrawerPositions} positions
   * @param {number} index
   * @param {number} idBlock
   * @return {*}  {THREE.Group}
   * @memberof DrawerManager
   */
  private createDrawer(
    cabinetSize: Size,
    fullSize: FullDrawerBlockSize,
    fullDrawerSize: FullDrawerSize,
    drawerSize: DrawerSize,
    material: THREE.Material,
    edgeMaterial: THREE.Material,
    positions: DrawerPositions,
    index: number,
    idBlock: number,
  ): THREE.Group {
    const drawerGroup = new THREE.Group();
    drawerGroup.name = `drawer_${index}`;
    let yOffset;
    if (index == 0) {
      yOffset = index * drawerSize.facadeHeight + 2;
    } else {
      yOffset = index * drawerSize.facadeHeight + DRAWER_GAP * index + 2;
    }
    console.log(`drawerGroup:`);
    console.log(drawerGroup);
    console.log(`drawerSize:`);
    console.log(drawerSize);
    // Создаем стенки ящика
    const walls = this.createDrawerWalls(
      cabinetSize,
      drawerSize,
      fullDrawerSize,
      material,
      positions,
      idBlock,
    );
    console.log('cabinetSizeW: ', cabinetSize.width);
    // Создаём фасадную часть ящика
    const facadeDrawer = this.createFacadeWithEdges(
      {
        width: fullDrawerSize.facade.width, // this.getFrontDrawerWidth(cabinetSize.width) - 0.8 - 0.8 - 3 - 3,
        height: drawerSize.facadeHeight,
        depth: WALL_THICKNESS,
      },
      material,
      idBlock,
      `facadeDrawer_${idBlock}`,
      positions.fasade,
    );

    // Создаем HDF панель
    const hdf = this.createHdfPanel(cabinetSize, fullDrawerSize, drawerSize, positions, idBlock);

    // Добавляем mesh объекты в группу

    drawerGroup.add(walls.left, walls.right, walls.back, walls.front, facadeDrawer, hdf);
    drawerGroup.position.y = yOffset;
    // Панель под ящиками при ширине > 700
    if (cabinetSize.width > 700) {
      const bottomPanel = this.createPanelWithEdges(
        {
          width: DEEP_DRAVER_IN_CABINET,
          height: DEPTH_EDGE_8MM,
          depth: cabinetSize.depth - DEEP_DRAVER_IN_CABINET - WALL_THICKNESS,
        },
        material,
        `bottomPanel_${idBlock}`,
        positions.bottomPanel,
        false,
        ['front', 'back'],
      );
      drawerGroup.add(bottomPanel);
    }

    return drawerGroup;
  }

  private createDrawerWalls(
    cabinetSize: Size,
    drawerSize: DrawerSize,
    fullDrawerSize: FullDrawerSize,
    material: THREE.Material,
    positions: DrawerPositions,
    idBlock: number,
  ) {
    return {
      left: this.createDrawerSideWallWithEdges(
        positions.leftWallDrawer,
        drawerSize.facadeHeight,
        cabinetSize.depth,
        material,
        idBlock,
        'left',
        WALL_THICKNESS * 2,
      ),
      right: this.createDrawerSideWallWithEdges(
        positions.rightWallDrawer,
        drawerSize.facadeHeight,
        cabinetSize.depth,
        material,
        idBlock,
        'right',
        -WALL_THICKNESS * 2,
      ),
      front: this.createPanelWithEdges(
        {
          width: this.calculateWidthWithFalsePanel(fullDrawerSize.backFront.width) - 3 - 3 - 10,
          height: HEIGHT_WALL_DRAWER,
          depth: WALL_THICKNESS,
        },
        material,
        `frontWallDrawer_${idBlock}`,
        positions.front,
        true,
        ['top', 'bottom'],
      ),
      back: this.createPanelWithEdges(
        {
          width: this.calculateWidthWithFalsePanel(fullDrawerSize.backFront.width) - 3 - 3 - 10,
          height: HEIGHT_WALL_DRAWER,
          depth: WALL_THICKNESS,
        },
        material,
        `backWallDrawer_${idBlock}`,
        positions.back,
        true,
        ['top', 'bottom'],
      ),
    };
  }

  private createDrawerSideWallWithEdges(
    position: Position,
    height: number,
    depth: number,
    panelMaterial: THREE.Material,
    idBlock: number,
    side: 'left' | 'right',
    xOffset: number,
  ): THREE.Group {
    // const group = new THREE.Group();
    const name = `${side}WallDrawer_${idBlock}`;
    const actualDepth = depth - DEEP_DRAVER_IN_CABINET - WALL_THICKNESS;

    const panel = this.createPanelWithEdges(
      {
        width: WALL_THICKNESS,
        height: HEIGHT_WALL_DRAWER,
        depth: actualDepth,
      },
      panelMaterial,
      name,
      position,
      true,
      ['top', 'bottom', 'front'], // расположение кромок
    );
    // group.add(panel);
    // group.position.set(position.x + xOffset, position.y, position.z - WALL_THICKNESS / 2);

    return panel;
  }

  private createFacadeWithEdges(
    size: Size,
    panelMaterial: THREE.Material,
    idBlock: number,
    name: string,
    position: Position,
  ): THREE.Group {
    const group = new THREE.Group();

    // Создаем основную панель фасада
    const facadeGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const facadeMesh = new THREE.Mesh(facadeGeometry, panelMaterial);
    facadeMesh.name = name;
    BaseCabinet.rotateUVs(facadeMesh.geometry);
    group.add(facadeMesh);

    // Добавляем кромки по периметру (кроме передней и задней граней)
    const edgeThickness = DEPTH_EDGE_08MM; // Толщина кромки 0.8мм
    const edgeDepth = size.depth; // Глубина кромки равна глубине фасада

    // Верхняя кромка
    const topEdgeGeometry = new RoundedBoxGeometry(
      size.width, // Ширина равна ширине фасада
      edgeThickness, // Толщина кромки
      edgeDepth, // Глубина
      2,
      0.2,
    );
    const topEdgeMesh = new THREE.Mesh(topEdgeGeometry, panelMaterial);
    topEdgeMesh.name = `facadeTopEdge_${idBlock}`;
    topEdgeMesh.position.set(
      0, // Центр по X
      size.height / 2 + edgeThickness / 2, // Позиция сверху
      0, // Центр по Z
    );
    group.add(topEdgeMesh);

    // Нижняя кромка
    const bottomEdgeGeometry = new RoundedBoxGeometry(size.width, edgeThickness, edgeDepth, 2, 0.2);
    const bottomEdgeMesh = new THREE.Mesh(bottomEdgeGeometry, panelMaterial);
    bottomEdgeMesh.name = `facadeBottomEdge_${idBlock}`;
    bottomEdgeMesh.position.set(
      0,
      -size.height / 2 - edgeThickness / 2, // Позиция снизу
      0,
    );
    group.add(bottomEdgeMesh);

    // Левая кромка
    const leftEdgeGeometry = new RoundedBoxGeometry(
      edgeThickness, // Толщина кромки
      size.height, // Высота равна высоте фасада
      edgeDepth,
      2,
      0.2,
    );
    const leftEdgeMesh = new THREE.Mesh(leftEdgeGeometry, panelMaterial);
    leftEdgeMesh.name = `facadeLeftEdge_${idBlock}`;
    leftEdgeMesh.position.set(
      -size.width / 2 - edgeThickness / 2, // Позиция слева
      0,
      0,
    );
    group.add(leftEdgeMesh);

    // Правая кромка
    const rightEdgeGeometry = new RoundedBoxGeometry(edgeThickness, size.height, edgeDepth, 2, 0.2);
    const rightEdgeMesh = new THREE.Mesh(rightEdgeGeometry, panelMaterial);
    rightEdgeMesh.name = `facadeRightEdge_${idBlock}`;
    rightEdgeMesh.position.set(
      size.width / 2 + edgeThickness / 2, // Позиция справа
      0,
      0,
    );
    group.add(rightEdgeMesh);

    // Позиционируем всю группу
    group.position.set(position.x, position.y, position.z);

    return group;
  }

  private createPanelWithEdges(
    size: Size,
    panelMaterial: THREE.Material,
    name: string,
    position: Position,
    rotateUV: boolean = false,
    edges: string[] = [], // 'top', 'bottom', 'left', 'right', 'front', 'back'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = name;
    // Main panel
    const panelGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    if (rotateUV) BaseCabinet.rotateUVs(panelGeometry);
    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    // panelMesh.name = name;
    group.add(panelMesh);

    // Add requested edges
    edges.forEach((edge) => {
      let edgeGeometry: THREE.BufferGeometry;
      let edgePosition: THREE.Vector3;

      switch (edge) {
        case 'top':
          edgeGeometry = new RoundedBoxGeometry(size.width, DEPTH_EDGE_04MM, size.depth, 2, 0.2);
          edgePosition = new THREE.Vector3(0, size.height / 2 + DEPTH_EDGE_04MM / 2, 0);
          break;
        case 'bottom':
          edgeGeometry = new RoundedBoxGeometry(size.width, DEPTH_EDGE_04MM, size.depth, 2, 0.2);
          edgePosition = new THREE.Vector3(0, -size.height / 2 - DEPTH_EDGE_04MM / 2, 0);
          break;
        case 'left':
          edgeGeometry = new RoundedBoxGeometry(DEPTH_EDGE_04MM, size.height, size.depth, 2, 0.2);
          edgePosition = new THREE.Vector3(-size.width / 2 - DEPTH_EDGE_04MM / 2, 0, 0);
          break;
        case 'right':
          edgeGeometry = new RoundedBoxGeometry(DEPTH_EDGE_04MM, size.height, size.depth, 2, 0.2);
          edgePosition = new THREE.Vector3(size.width / 2 + DEPTH_EDGE_04MM / 2, 0, 0);
          break;
        case 'front':
          edgeGeometry = new RoundedBoxGeometry(size.width, size.height, DEPTH_EDGE_04MM, 2, 0.2);
          edgePosition = new THREE.Vector3(0, 0, size.depth / 2 + DEPTH_EDGE_04MM / 2);
          break;
        case 'back':
          edgeGeometry = new RoundedBoxGeometry(size.width, size.height, DEPTH_EDGE_04MM, 2, 0.2);
          edgePosition = new THREE.Vector3(0, 0, -size.depth / 2 - DEPTH_EDGE_04MM / 2);
          break;
        default:
          return;
      }

      const edgeMesh = new THREE.Mesh(edgeGeometry, panelMaterial);

      edgeMesh.position.copy(edgePosition);
      group.add(edgeMesh);
    });

    group.position.set(position.x, position.y, position.z);

    return group;
  }

  private createHdfPanel(
    cabinetSize: Size,
    fullDrawerSize: FullDrawerSize,
    drawerSize: DrawerSize,
    positions: DrawerPositions,
    idBlock: number,
  ) {
    console.log('hdfW:');
    console.log(this.getHdfWidth(fullDrawerSize.hdf.width));
    const hdfDrawer = BaseCabinet.createMeshHdf(`drawerHDF`, {
      width: fullDrawerSize.hdf.width,
      height: DEPTH_EDGE_04MM,
      depth: cabinetSize.depth - DEEP_DRAVER_IN_CABINET - WALL_THICKNESS,
    });
    hdfDrawer.position.set(positions.hdf.x, positions.hdf.y, positions.hdf.z);
    hdfDrawer.name = `hdf_${idBlock}`;
    hdfDrawer.userData['isHDF'] = true;
    return hdfDrawer;
  }

  /* ================================================ ---------------- ================================================*/

  public getBlockDrawersMap(): Map<number, THREE.Object3D> {
    return this.blockDrawers;
  }

  // Вспомогательные методы для расчета ширины

  private calculateWidthWithFalsePanel(cabinetWidth: number) {
    if (this.sceneManagerService.getCabinet().getCabinetType().includes(CabinetSubType.Single)) {
      return cabinetWidth;
    } else if (
      this.sceneManagerService.getCabinet().getCabinetType().includes(CabinetSubType.Double)
    ) {
      if (this.sceneManagerService.getCabinet().hasMullion()) {
        return cabinetWidth - FALSE_PANEL_WIDTH;
      } else {
        return cabinetWidth - FALSE_PANEL_WIDTH * 2;
      }
    }
    return null;
  }

  // private getDrawerWidth(cabinetWidth: number): number {
  //   return cabinetWidth < 600
  //     ? cabinetWidth - 4 * WALL_THICKNESS - FALSE_PANEL_WIDTH
  //     : cabinetWidth - 4 * WALL_THICKNESS - FALSE_PANEL_WIDTH * 2;
  // }

  // private getFrontDrawerWidth(cabinetWidth: number): number {
  //   if (this.sceneManagerService.getCabinet().getCabinetType().includes(ProductType.Single)) {
  //     return cabinetWidth - FALSE_PANEL_WIDTH;
  //   } else if (
  //     this.sceneManagerService.getCabinet().getCabinetType().includes(ProductType.Double)
  //   ) {
  //     return cabinetWidth - FALSE_PANEL_WIDTH * 2;
  //   }
  //   return null;
  // }

  private getHdfWidth(cabinetWidth: number): number {
    if (this.sceneManagerService.getCabinet().getCabinetType().includes(CabinetSubType.Single)) {
      return cabinetWidth - FALSE_PANEL_WIDTH;
    } else if (
      this.sceneManagerService.getCabinet().getCabinetType().includes(CabinetSubType.Double)
    ) {
      if (this.sceneManagerService.getCabinet().hasMullion()) {
        return cabinetWidth - FALSE_PANEL_WIDTH;
      } else {
        return cabinetWidth - FALSE_PANEL_WIDTH * 2;
      }
    }
    return null;
  }

  public getIdDrawer(drawerBlock: THREE.Object3D) {}

  public getBlockById(id: number): THREE.Object3D {
    return this.blockDrawers.get(id);
  }

  public getTotalBlocks(): number {
    return this.blockDrawers.size;
  }
  public getTotalDrawersBlock(id: number): number {
    return this.blockDrawers[id].size;
  }
  public getCountDrawersByBlock(block: THREE.Object3D): Drawer[] {
    let idBlock: number | undefined;
    for (const [id, obj] of this.blockDrawers.entries()) {
      if (obj == block) {
        idBlock = id;
        break;
      }
    }

    if (idBlock == undefined) {
      console.warn('Block not found in blockDrawers');
      return [];
    }

    const drawerBlocks = this.sceneManagerService.getCabinet().getCabinetParams().components
      .drawers.drawerBlocks;

    if (!drawerBlocks || !drawerBlocks[idBlock]) {
      console.warn(`No drawer block found for idBlock = ${idBlock}`);
      return [];
    }

    return drawerBlocks[idBlock].drawerItems;
  }
  public setMaterial(newMaterial: MMaterial): void {
    this.material = newMaterial;
  }

  public async updateBlocks(cabinetSize: Size): Promise<void> {
    // ЗАЩИТА ОТ РЕКУРСИИ И ПОВТОРНЫХ ВЫЗОВОВ
    if (this.isUpdating) {
      console.warn('🚫 DrawerManager.updateBlocks already in progress, skipping...');
      return;
    }

    try {
      this.isUpdating = true;
      console.log('🔄 Starting drawer blocks update...');

      const cabinet = this.sceneManagerService.getCabinet();
      const typeProduct: CabinetSubType = cabinet.getCabinetType();
      const hasMullion: boolean = cabinet.hasMullion();
      const mullion = hasMullion ? cabinet.getMullion() : null;
      const mullionPosition = hasMullion ? mullion.position.x : 0;
      const isSingleCabinet = cabinet.getCabinetType().includes(CabinetSubType.Single);

      const prevMullionPos = hasMullion
        ? cabinet.getCabinetParams().components.mullion.position.x
        : 0;

      // СОХРАНЯЕМ ТЕКУЩИЕ ПОЗИЦИИ БЛОКОВ ПЕРЕД УДАЛЕНИЕМ
      const currentBlockPositions = new Map<number, number>();

      // Копируем старые блоки
      const drawerBlocksCopy = [...cabinet.getCabinetParams().components.drawers.drawerBlocks];
      const countFP = cabinet.getCabinetParams().subType === CabinetSubType.Single ? 1 : 2;

      // Сохраняем позиции
      for (const [id, obj] of this.blockDrawers.entries()) {
        if (obj && typeof obj.position?.y === 'number') {
          currentBlockPositions.set(id, obj.position.y);
        }
      }

      // Для блоков, у которых нет mesh в 3D, берём позицию из модели
      drawerBlocksCopy.forEach((drawerData) => {
        const modelY = drawerData.position?.y;
        if (!currentBlockPositions.has(drawerData.id) && typeof modelY === 'number') {
          currentBlockPositions.set(drawerData.id, modelY);
        }
      });

      console.log('Current block positions:', currentBlockPositions);

      // Удаляем старые блоки
      this.removeBlocks();

      // Восстанавливаем модель
      cabinet.getCabinetParams().components.drawers.drawerBlocks = [...drawerBlocksCopy];

      // ОБРАБАТЫВАЕМ БЛОКИ ПОСЛЕДОВАТЕЛЬНО С ЗАЩИТОЙ
      for (const drawerData of drawerBlocksCopy) {
        // Добавляем задержку между обработкой блоков для избежания перегрузки
        await this.delay(50);

        const currentY = currentBlockPositions.get(drawerData.id) ?? drawerData.position.y;

        const targetSection: 'left' | 'right' | 'center' =
          drawerData.section ?? (hasMullion ? 'right' : 'center');

        const sectionParams = cabinet
          .sectionManager
          .calculateSectionParams(targetSection, hasMullion, cabinetSize.width, mullionPosition);

        if (!sectionParams) {
          console.warn(`❌ Невозможно вычислить параметры для секции ${targetSection}`);

          // Определяем минимальную ширину в зависимости от типа шкафа
          let minWidthForDrawers = 0;
          if (isSingleCabinet) {
            minWidthForDrawers = 375; // Минимальная ширина для одностворчатых с ящиками
          } else {
            minWidthForDrawers = hasMullion ? 750 : 700; // Для двустворчатых
          }

          // Используем кастомный контроллер с улучшенной обработкой
          try {
            const userAction = await this.showDrawerWarning(
              targetSection,
              isSingleCabinet,
              hasMullion,
              minWidthForDrawers,
            );

            if (userAction?.type === 'removeDrawers') {
              // Удаляем ящики из этой секции
              this.removeDrawersInSection(targetSection);
              console.log(`🗑️ Ящики в секции ${targetSection} удалены пользователем.`);
              continue;
            } else if (userAction?.type === 'restoreMullion') {
              // ↩Возвращаем средник на старую позицию
              if (mullion) {
                mullion.position.x = 0; // prevMullionPos;
                cabinet.getCabinetParams().components.mullion.position.x = prevMullionPos;
                mullion.updateMatrixWorld();
                console.log(`↩️ Средник возвращён на позицию ${prevMullionPos}`);
              }
              // Прерываем обновление после восстановления средника
              break;
            }
          } catch (error) {
            console.error('❌ Error in drawer warning flow:', error);
            continue;
          }

          continue;
        }

        const { availableWidth, positionX } = sectionParams;

        // Определяем направление открытия для этой секции
        let openingDirection: PositionCutout;
        if (this.sceneManagerService.getCabinet().getCabinetType().includes(CabinetSubType.Single)) {
          openingDirection = this.sceneManagerService.getCabinet().getPositionHinges();
        } else {
          if (hasMullion) {
            openingDirection = targetSection.includes('left') ? 'left-side' : 'right-side';
          } else {
            openingDirection = 'both';
          }
        }

        const newDrawerSize = calculateDrawerElements(
          typeProduct,
          hasMullion,
          drawerData.drawerItems.length,
          availableWidth,
          cabinetSize.height,
          cabinetSize.depth,
          countFP,
        );

        const position: Position = {
          x: positionX,
          y: currentY,
          z: drawerData.position.z,
        };

        this.addBlock(
          {
            ...drawerData,
            fullDrawerSize: newDrawerSize.fullDrawerSize,
            fullSize: newDrawerSize.fullSize,
            position: position,
          },
          cabinetSize,
          openingDirection,
        );

        // Обновляем данные в модели
        const updatedBlockIndex = cabinet
          .getCabinetParams()
          .components.drawers.drawerBlocks.findIndex((b) => b.id === drawerData.id);

        if (updatedBlockIndex !== -1) {
          cabinet.getCabinetParams().components.drawers.drawerBlocks[updatedBlockIndex] = {
            ...drawerData,
            fullDrawerSize: newDrawerSize.fullDrawerSize,
            fullSize: newDrawerSize.fullSize,
            position: position,
          };
        }
      }

      console.log('✅ Drawer blocks update completed successfully');
    } catch (error) {
      console.error('❌ Error in updateBlocks:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // Вспомогательный метод для задержки
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private showDrawerWarning(
    problemType: string,
    isSingleCabinet: boolean,
    hasMullion: boolean,
    minWidth: number,
  ): Promise<any> {
    return new Promise((resolve) => {
      console.log('🔄 Starting drawer warning flow for problem:', problemType);

      // Показываем предупреждение через сервис с дополнительными данными
      this.sceneManagerService.drawerWarningService.showWarning({
        section: problemType,
        problemType: problemType,
        isSingleCabinet: isSingleCabinet,
        hasMullion: hasMullion,
        minWidth: minWidth,
      });

      // Создаем таймаут для безопасности
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Drawer warning timeout reached');
        resolve({ type: 'removeDrawers' });
      }, 30000);

      // Подписываемся на действие пользователя
      const subscription = this.sceneManagerService.drawerWarningService
        .onAction()
        .subscribe((action) => {
          console.log('✅ User action received:', action);
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(action);
        });
    });
  }

  public updateMaterial(material: MMaterial): void {}

  public updateDrawerBlockPosition(blockId: number, newPositionY: number): void {
    // Обновляем данные самого mesh объекта
    const block = this.blockDrawers.get(blockId);
    if (block) {
      block.position.y = newPositionY;

      // ОБНОВЛЯЕМ userData блока
      if (block.userData['drawerData']) {
        block.userData['drawerData'].position.y = newPositionY;
      }

      // Также обновляем позицию в userData для быстрого доступа
      block.userData['position'] = {
        x: block.position.x,
        y: newPositionY,
        z: block.position.z,
      };
    }

    //обновляем данные в модели
    const cabinet = this.sceneManagerService.getCabinet();
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;

    const blockModel = drawerBlocks.find((b) => b.id === blockId);
    if (blockModel) {
      blockModel.position.y = newPositionY;
    }
    this.dimensionLines.updateDrawerBlockDimensionLines(block, block.userData['position']);
  }

  // Метод для проверки и обновления блоков при перемещении средника
  private updateDrawerBlocksOnMullionMove(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const CRITICAL_SECTION_WIDTH = 350;

    // Получаем все блоки с ящиками
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;

    for (let i = drawerBlocks.length - 1; i >= 0; i--) {
      const block = drawerBlocks[i];

      // Вычисляем текущую ширину секции
      const currentSectionWidth = this.getCurrentSectionWidth(block);

      // Если секция стала ≤ 350мм, удаляем блок
      if (currentSectionWidth <= CRITICAL_SECTION_WIDTH) {
        this.removeDrawerBlock(block.id);
        alert(`Блок с ящиками удален: секция стала слишком узкой (${currentSectionWidth}мм)`);
      } else {
        // Обновляем ширину блока, если секция изменилась
        const effectiveWidth = this.getEffectiveBlockWidth(currentSectionWidth);
        this.updateDrawerBlockWidth(block.id, effectiveWidth);
      }
    }
  }

  // Метод для вычисления текущей ширины секции блока
  private getCurrentSectionWidth(block: DrawerBlock): number {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetSize = cabinet.getCabinetParams().dimensions.general;
    const hasMullion = cabinet.hasMullion();
    const mullionPosition = hasMullion ? cabinet.getMullion().position.x : 0;
    const cabinetWidth = cabinetSize.width;
    const halfCabinet = cabinetWidth / 2;

    if (!hasMullion) {
      return cabinetWidth;
    }

    switch (block.section) {
      case 'left':
        return halfCabinet + mullionPosition;
      case 'right':
        return halfCabinet - mullionPosition;
      case 'center':
      default:
        return cabinetWidth;
    }
  }

  // Метод для вычисления полезной ширины блока (с учетом стенок)
  private getEffectiveBlockWidth(sectionWidth: number): number {
    return sectionWidth - WALL_THICKNESS * 2;
  }

  // Метод для обновления ширины блока
  private updateDrawerBlockWidth(blockId: number, newWidth: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;
    const block = drawerBlocks.find((b) => b.id === blockId);

    if (!block) return;

    const typeProduct = cabinet.getCabinetType();
    const hasMullion = cabinet.hasMullion();
    const cabinetSize = cabinet.getCabinetParams().dimensions.general;
    const countFP = cabinet.getCabinetParams().subType === CabinetSubType.Single ? 1 : 2;

    // Пересчитываем размеры блока
    const { fullSize, fullDrawerSize } = calculateDrawerElements(
      typeProduct,
      hasMullion,
      block.drawerItems.length,
      newWidth,
      cabinetSize.height,
      cabinetSize.depth,
      countFP,
    );

    // Обновляем размеры в модели
    block.fullSize = fullSize;
    block.fullDrawerSize = fullDrawerSize;

    // Обновляем блок на сцене
    this.updateExistingDrawerBlock(block, newWidth); // newEffectiveWidth
  }

  // Метод для обновления существующего блока на сцене
  private updateExistingDrawerBlock(blockData: DrawerBlock, effectiveWidth: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetSize = cabinet.getCabinetParams().dimensions.general;

    // Сначала удаляем старый блок
    this.removeDrawerBlock(blockData.id);

    // Затем добавляем обновленный
    const positionLoops =
      blockData.section === 'right'
        ? 'right-side'
        : blockData.section === 'left'
          ? 'left-side'
          : 'right-side';

    const size: Size = {
      width: effectiveWidth,
      height: cabinetSize.height,
      depth: cabinetSize.depth,
    };
    // size под вопросом
    cabinet.addBlock(blockData, positionLoops);
  }

  private removeDrawersInSection(section: 'left' | 'right' | 'center'): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const params = cabinet.getCabinetParams();
    const drawers = params.components.drawers.drawerBlocks;

    // Фильтруем блоки по секции
    const toRemove = drawers.filter((block) => block.section.includes(section));

    toRemove.forEach((block) => {
      const id = block.id;
      const object = this.blockDrawers.get(id);
      if (object) {
        this.removeBlock(object);
      }
    });

    console.log(`Удалено ${toRemove.length} блок(ов) из секции "${section}"`);
  }

  /**
   * Удаление блоков с ящиками
   */
  public removeBlocks(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const dimensionLineManager = cabinet.dimensionLines;

    // Удаляем все размерные линии, связанные с ящиками
    dimensionLineManager.removeAllSidePanelHeightLines();

    // Очищаем данные модели
    cabinet.getCabinetParams().components.drawers.drawerBlocks = [];

    this.blockDrawers.forEach((block, key) => {
      console.log('BLOCK: ', block);
      dimensionLineManager.removeDrawerDimensionLines(block.userData['drawerData']);
      this.sceneManagerService.deleteObject(block);
    });
    this.blockDrawers.clear();
  }

  /**
   * Удаляет только 3D-объект блока со сцены и из внутренней карты,
   * не изменяя модель (cabinetParams).
   */
  public removeBlockFromSceneOnly(drawerBlock: THREE.Object3D): void {
    const id = drawerBlock.userData['id'];
    if (id == undefined) return;

    // Удаляем объект со сцены
    this.sceneManagerService.deleteObject(drawerBlock);

    // Удаляем из карты
    this.blockDrawers.delete(id);
  }

  public removeBlock(drawerBlock: THREE.Object3D): void {
    const id = drawerBlock.userData['id'];
    if (id == undefined) return;

    // 1. Удаляем со сцены и из карты
    this.removeBlockFromSceneOnly(drawerBlock);

    // 3. Удаляем данные из модели
    const cabinetParams = this.sceneManagerService.getCabinet().getCabinetParams();
    const drawerBlocks = cabinetParams.components.drawers.drawerBlocks;

    // Находим блок по id
    const index = drawerBlocks.findIndex((block) => block.id === id);
    if (index !== -1) {
      // Полностью очищаем ящики внутри блока
      drawerBlocks[index].drawerItems = [];

      // Удаляем сам блок
      drawerBlocks.splice(index, 1);
    }
  }

  // Метод для удаления блока с ящиками
  private removeDrawerBlock(blockId: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;

    // Удаляем из модели
    const blockIndex = drawerBlocks.findIndex((block) => block.id === blockId);
    if (blockIndex !== -1) {
      drawerBlocks.splice(blockIndex, 1);
    }

    // Удаляем из сцены
    const scene = this.sceneManagerService.getScene();
    const blockToRemove = scene.getObjectByName(`drawerBlock_${blockId}`);
    if (blockToRemove) {
      scene.remove(blockToRemove);
    }

    // Удаляем из локального хранилища
    this.blockDrawers.delete(blockId);
  }

  public removeDrawer(id: number): void {
    const drawer = this.blockDrawers.get(id);
    if (drawer) {
      this.sceneManagerService.deleteObject(drawer);
      this.blockDrawers.delete(id);
    }
  }
}
