import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import {
  ICabinet,
  CabinetSubType,
  MMaterial,
  Size,
} from 'src/entities/Cabinet/model/types/cabinet.model';
import { BaseProduct } from 'src/entities/Product/model/types/baseProduct';
import { SceneManagerService } from '../../services/SceneManager.service';
import { DimensionLines } from '../objects/DimensionLines';
import { ShelfManager } from '../objects/managers/ShelfManager/ShelfManager';
import { MullionManager } from '../objects/managers/MullionManager/MullionManager';
import { DrawerManager } from '../objects/managers/DrawerManager/DrawerManager';
import { FacadeManager } from '../objects/managers/FacadeManager/FacadeManager';
import { SectionManager } from '../objects/managers/SectionManager/SectionManager';
import { SectionHighlightService } from '../../services/section/SectionHighlightService.service';
import {
  WALL_THICKNESS,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  DEPTH_EDGE_04MM,
  DEPTH_EDGE_8MM,
  INTERVAL_1_MM,
  DEPTH_EDGE_4MM,
  PLINTH_RADIUS_MAX,
  FACADE_HEIGHT,
  DEPTH_WIDTH_INTG_HADLE,
} from '../constants';
import { RodType } from '../model/Rod';
import { FacadeType, Facade, PositionCutout } from '../model/Facade';
import { Shelf } from '../model/Shelf';
import { Position } from '../model/BaseModel';
import { DrawerBlock } from '../model/Drawers';
import { Mullion } from '../model/Mullion';
import { MaterialProvider } from '../materials/MaterialProvider';
import { SectionDimensionLines } from '../objects/SectionDimensionLines';
import { RoundedBoxGeometry } from 'three-stdlib';

export abstract class BaseCabinet extends BaseProduct<ICabinet> {
  public dimensionLines: DimensionLines;

  // Менеджеры компонентов
  public shelfManager!: ShelfManager;
  public mullionManager!: MullionManager;
  public drawerManager!: DrawerManager;
  public facadeManager!: FacadeManager;
  public sectionManager!: SectionManager;
  public sectionDimensionLines!: SectionDimensionLines;

  constructor(sceneManagerService: SceneManagerService, cabinetParams: ICabinet) {
    super(sceneManagerService, cabinetParams);

    this.dimensionLines = new DimensionLines(
      this.sceneManager,
      this.params.dimensions.general.height,
    );

    this.initializeManagers();
  }

  protected initializeManagers(): void {
    const size = this.params.dimensions.general;
    const sectionHighlightService = new SectionHighlightService();

    this.shelfManager = new ShelfManager(this.sceneManager, this.dimensionLines, size);
    this.drawerManager = new DrawerManager(
      this.sceneManager,
      this.sceneManager.drawerWarningService,
      this.dimensionLines,
      size,
    );
    this.facadeManager = new FacadeManager(this.sceneManager, this.dimensionLines);
    this.mullionManager = new MullionManager(this.sceneManager, size);
    this.sectionManager = new SectionManager(this.sceneManager, sectionHighlightService);
    this.sectionDimensionLines = new SectionDimensionLines(this.sceneManager, this.dimensionLines);
  }

  /**
   * Основной метод сборки продукта
   */
  public build(): void {
    this.group.clear();

    // 1. Создаем корпус (реализуется в Single/Double)
    const body = this.createCabinetBody();
    this.group.add(body);

    // 2. Инициализируем логику секций на основе созданной геометрии
    if (this.sectionManager) {
      this.sectionManager.initialize();
    }

    // 3. Обновляем размерные линии
    const { width, height, depth } = this.params.dimensions.general;
    this.dimensionLines.updateDimensionLines(width, height, depth, 35);
  }

  public addHinges(side: 'left-side' | 'right-side', wall: THREE.Group): void {
    const cabinetHeight = this.getCabinetHeight(); // высота шкафа
    const cabinetDepth = this.getCabinetDepth(); // глубина шкафа
    let hingeCount = 0;

    if (cabinetHeight >= 2000 && cabinetHeight <= 2375) {
      hingeCount = 5;
    } else if (cabinetHeight > 2375 && cabinetHeight <= 2750) {
      hingeCount = 6;
    } else {
      console.warn('Высота вне диапазона для добавления петель');
      return;
    }

    const hingeGroup = new THREE.Group();
    hingeGroup.name = `${side}-hinges`;
    console.log('addHinges: ', hingeGroup.name);
    const blockThickness = 10;
    const plateGeometry = new THREE.BoxGeometry(20, 53, 4);
    const blockGeometry = new THREE.BoxGeometry(67, 16, blockThickness);

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.5,
      roughness: 0.3,
    });

    const bottomOffset = 161;
    const topOffset = 102;
    const minY = -cabinetHeight / 2 + bottomOffset;
    const maxY = cabinetHeight / 2 - topOffset;

    const intervalCount = hingeCount - 1;
    const spacing = (maxY - minY) / intervalCount;

    for (let i = 0; i < hingeCount; i++) {
      const y = minY + spacing * i;

      // Группа для конкретной петли
      const singleHingeGroup = new THREE.Group();
      singleHingeGroup.name = `${side}-hinge-${i}`;
      // Создаём пластину
      let plate = new THREE.Mesh(plateGeometry, metalMaterial);

      plate.position.set(
        side == 'left-side'
          ? WALL_THICKNESS / 2 + blockThickness / 4 - 2
          : -WALL_THICKNESS / 2 - blockThickness / 4 + 2,
        y,
        cabinetDepth / 2 - 35,
      );
      plate.rotation.y = Math.PI / 2;
      plate.updateMatrixWorld(true);

      // Параметры отверстий
      const holeRadius = 2;
      const holeDepth = 4;
      const holeOffsetY = 12;

      const holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, holeDepth, 32);
      holeGeometry.rotateX(Math.PI / 2); // поворачиваем цилиндр
      const holeMesh = new THREE.Mesh(holeGeometry, metalMaterial);
      // Локальные координаты отверстий в системе координат пластины
      const localUpper = new THREE.Vector3(0, holeOffsetY, 0);
      const localLower = new THREE.Vector3(0, -holeOffsetY, 0);

      // Преобразуем их в мировые координаты
      const worldUpper = localUpper.clone().applyMatrix4(plate.matrixWorld);
      const worldLower = localLower.clone().applyMatrix4(plate.matrixWorld);

      // Извлекаем мировую ориентацию (для цилиндров)
      const worldRotation = new THREE.Euler().setFromRotationMatrix(plate.matrixWorld);

      // Выполняем вычитание
      plate = BaseCabinet.subtract(
        plate,
        holeMesh,
        metalMaterial,
        worldUpper,
        worldRotation,
      ) as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
      plate = BaseCabinet.subtract(
        plate,
        holeMesh,
        metalMaterial,
        worldLower,
        worldRotation,
      ) as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;

      // Добавляем блок петли
      const block = new THREE.Mesh(blockGeometry, metalMaterial);
      block.position.copy(plate.position);
      block.position.x -= side == 'left-side' ? -15 / 2 + 3 : 15 / 2 - 3;
      block.position.z += 2;
      block.rotation.y = Math.PI / 2;

      // Добавляем в подгруппу
      singleHingeGroup.add(plate);
      singleHingeGroup.add(block);

      hingeGroup.add(singleHingeGroup);
    }

    wall.add(hingeGroup);
  }

  // Абстрактный метод построения каркаса
  protected abstract createCabinetBody(): THREE.Group;

  // --- Геттеры параметров ---
  public getCabinetParams(): ICabinet {
    return this.params;
  }
  public getCabinetSize(): Size {
    return this.params.dimensions.general;
  }
  public getCabinetHeight(): number {
    return this.params.dimensions.general.height;
  }
  public getCabinetWidth(): number {
    return this.params.dimensions.general.width;
  }
  public getCabinetDepth(): number {
    return this.params.dimensions.general.depth;
  }
  public getCabinetType(): CabinetSubType {
    return this.params.subType;
  }
  public getFacadeType(): FacadeType {
    return this.params.components.facades.facadeItems[0]?.facadeType;
  }
  public hasMullion(): boolean {
    return !!this.params.components.mullion?.checkBox;
  }

  public updateCabinetParams(newParams: ICabinet): void {
    this.params = newParams;
    this.build(); // Пересобираем всё
  }

  public static createMeshHdf(type: 'drawerHDF' | 'cabinetHDF', size: Size): THREE.Mesh {
    const materials = MaterialProvider.getHdfMaterials(type);
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    return new THREE.Mesh(geometry, materials);
  }

  // --- Управление материалами ---

  public updateGeneralMaterial(newMaterial: MMaterial): void {
    this.params.appearance.additionColor = newMaterial;
    this.params.appearance.visibleDtails = newMaterial;

    this.shelfManager.updateMaterial(newMaterial);
    this.drawerManager.updateMaterial(newMaterial);
    this.mullionManager.updateMaterial(newMaterial);
    this.build();
  }

  public updateVisibleMaterial(newMaterial: MMaterial): void {
    this.params.appearance.visibleDtails = newMaterial;
    this.applyMaterialToParts(
      ['rightWallCabinet', 'leftWallCabinet', 'topCabinet', 'plinthFacade'],
      newMaterial,
    );
  }

  public updateAdditionMaterial(newMaterial: MMaterial): void {
    this.params.appearance.additionColor = newMaterial;
    const parts = [
      'backWallCabinet',
      'bottomCabinet',
      'plinthFacadeAdd',
      'plinthFalseBack',
      'plinthFalseLeft',
      'plinthFalseRight',
      'plinthCenter',
    ];
    this.applyMaterialToParts(parts, newMaterial);

    this.shelfManager.updateMaterial(newMaterial);
    this.drawerManager.updateMaterial(newMaterial);
  }

  public updateMaterialCabinet(newMaterial: MMaterial): void {
    this.params.appearance.additionColor = newMaterial;
    this.params.appearance.visibleDtails = newMaterial;
  }

  private applyMaterialToParts(names: string[], materialParams: MMaterial): void {
    const texturePath = materialParams.texture.path;
    const threeMaterial = BaseCabinet.getMaterial(texturePath);

    this.group.traverse((child) => {
      if (names.includes(child.name) || names.some((n) => child.name.includes(n))) {
        child.traverse((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            mesh.material.dispose();
            mesh.material = threeMaterial;
            mesh.material.needsUpdate = true;
          }
        });
      }
    });
  }

  public static applyUVMapping(
    geometry: THREE.BufferGeometry,
    uAxis: 'x' | 'y' | 'z' = 'x',
    vAxis: 'x' | 'y' | 'z' = 'z',
  ): void {
    geometry.computeBoundingBox();
    const max = geometry.boundingBox!.max;
    const min = geometry.boundingBox!.min;

    const uvAttribute: number[] = [];
    const pos = geometry.attributes['position'];

    const getComponent = (i: number, axis: 'x' | 'y' | 'z') => {
      switch (axis) {
        case 'x':
          return pos.getX(i);
        case 'y':
          return pos.getY(i);
        case 'z':
          return pos.getZ(i);
      }
    };

    for (let i = 0; i < pos.count; i++) {
      const u = (getComponent(i, uAxis) - min[uAxis]) / (max[uAxis] - min[uAxis] || 1);
      const v = (getComponent(i, vAxis) - min[vAxis]) / (max[vAxis] - min[vAxis] || 1);
      uvAttribute.push(u, v);
    }

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvAttribute, 2));
  }

  public static createBoxBufferGeometry(
    size: Size,
    material: THREE.Material,
  ): THREE.BufferGeometry {
    return new THREE.BoxGeometry(size.width, size.height, size.depth);
  }

  public static subtract(
    baseMesh: THREE.Mesh,
    cutoutMesh: THREE.Mesh,
    material: THREE.Material,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
  ): THREE.Mesh {
    baseMesh.updateMatrixWorld(true);

    // cutoutMesh.updateMatrixWorld(true);

    // Устанавливаем позицию и поворот, если указаны
    if (position) cutoutMesh.position.copy(position);
    if (rotation) cutoutMesh.rotation.copy(rotation);

    cutoutMesh.updateMatrix();
    cutoutMesh.updateMatrixWorld(true);

    return this.performCSGOperation(baseMesh, cutoutMesh, material);
  }

  public traverse(callback: (object: THREE.Object3D) => void): void {
    const cabinetGroup = this.sceneManager.getCabinetGroup();
    for (const child of cabinetGroup.children) {
      if (child instanceof BaseCabinet) {
        child.traverse(callback);
      } else {
        callback(child);
        if (child.children.length > 0) {
          child.traverse(callback);
        }
      }
    }
  }

  public static performCSGOperation(
    baseMesh: THREE.Mesh,
    cutoutMesh: THREE.Mesh,
    material: THREE.Material,
  ): THREE.Mesh {
    baseMesh.updateMatrixWorld();
    cutoutMesh.updateMatrixWorld();

    const baseCSG = CSG.fromMesh(baseMesh);
    const cutoutCSG = CSG.fromMesh(cutoutMesh);
    const resultCSG = baseCSG.subtract(cutoutCSG);

    const resultMesh = CSG.toMesh(resultCSG, baseMesh.matrix, material);
    resultMesh.position.copy(baseMesh.position);
    resultMesh.rotation.copy(baseMesh.rotation);
    resultMesh.scale.copy(baseMesh.scale);
    resultMesh.updateMatrix();

    return resultMesh;
  }

  public static buildRoundedCornerPanelShape(
    width: number,
    height: number,
    radius: number,
  ): THREE.Shape {
    const shape = new THREE.Shape();

    // ⬅️⬇️ Начинаем снизу слева
    shape.moveTo(0, 0);

    // ⬅️⬆️ Левый нижний → левый верхний (до начала скругления)
    shape.lineTo(0, height - radius);

    // 🎯 Скруглённый угол: левый верхний
    shape.quadraticCurveTo(0, height, radius, height);

    // ➡️ верх до правого верхнего (прямой угол)
    shape.lineTo(width, height);

    // ⬇️ правый верхний → правый нижний
    shape.lineTo(width, 0);

    // ⬅️ правый нижний → левый нижний
    shape.lineTo(0, 0);

    return shape;
  }

  /* прямоугольный вырез */
  public static buildRectCutout({ width, height, depth }: Size) {
    return new THREE.BoxGeometry(width, height, depth);
  }

  /* Методы для создания выреза */
  // Вспомогательный метод для создания выреза
  public static createCutoutMesh(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
  ): THREE.Mesh {
    const cutout = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth));
    // this.sceneManagerService.addObject(cutout);
    cutout.position.set(x, y, z);
    return cutout;
  }

  public createWall(
    name: string,
    width: number,
    height: number,
    depth: number,
    edgeMaterial: THREE.Material,
    panelMaterial: THREE.Material,
    rotateTexture: boolean,
    checkCutout: boolean,
  ): THREE.Group {
    const group = new THREE.Group();

    const panel = this.createPanelWithCutout(
      width,
      height,
      depth,
      panelMaterial,
      name,
      checkCutout,
      rotateTexture,
    );
    group.add(panel);

    const edges = this.createWallEdges(name, width, height, depth, edgeMaterial, checkCutout);
    group.add(edges);

    return group;
  }

  protected createWallEdges(
    name: string,
    width: number,
    height: number,
    depth: number,
    edgeMaterial: THREE.Material,
    checkCutout: boolean,
  ): THREE.Group {
    const group = new THREE.Group();
    const edgeThickness = 0.4;
    const radius = 0.1;

    const isRightWall = name.includes('rightWallCabinet');
    const isLeftWall = name.includes('leftWallCabinet');
    const isSideWall = name.includes('Wall');

    // Передняя кромка
    const frontEdge = new THREE.Mesh(
      new RoundedBoxGeometry(width, height, 0.8, 2, 0.2),
      edgeMaterial,
    );
    frontEdge.position.set(0, 0, depth / 2);
    group.add(frontEdge);

    if (!isSideWall) return group;

    // Верхняя кромка
    const topEdge = new THREE.Mesh(
      new RoundedBoxGeometry(WALL_THICKNESS, edgeThickness, depth - 0.8, 2, radius),
      edgeMaterial,
    );
    topEdge.position.set(0, height / 2 + edgeThickness / 2, 0);

    if (isRightWall || isLeftWall) {
      const cutoutTop = BaseCabinet.createCutoutMesh(
        10,
        edgeThickness * 2,
        4,
        isRightWall ? width / 2 - 5 - 6 : -width / 2 + 5 + 6,
        height / 2 + edgeThickness / 2,
        -depth / 2 + 2.4,
      );
      const cutTopEdge = BaseCabinet.performCSGOperation(topEdge, cutoutTop, edgeMaterial);
      cutTopEdge.position.copy(topEdge.position);
      group.add(cutTopEdge);
    } else {
      group.add(topEdge);
    }

    // Задняя кромка
    let backEdge = new THREE.Mesh(
      new RoundedBoxGeometry(width, height, edgeThickness, 2, radius),
      edgeMaterial,
    ) as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;

    if (isRightWall || isLeftWall) {
      // Вырез под ХДФ
      const notchWidth = 10; // ширина выреза
      const notchHeight = height - PODIUM_HEIGHT;
      const notchDepth = DEPTH_EDGE_8MM;

      const xPos = isRightWall ? width / 2 - 5 - 6 : -width / 2 + 5 + 6;
      const yPos = PODIUM_HEIGHT / 2 + 1;
      const zPos = edgeThickness / 2 - notchDepth / 2; // внутри кромки по Z

      const hdfNotch = BaseCabinet.createCutoutMesh(
        notchWidth,
        notchHeight,
        notchDepth,
        xPos,
        yPos,
        zPos,
      );
      hdfNotch.name = `${name}_backEdge_hdf_notch`;

      // Применяем вырез
      backEdge = BaseCabinet.subtract(backEdge, hdfNotch, edgeMaterial, hdfNotch.position.clone());

      if (checkCutout) {
        const cabinetParams = this.params;
        const cutoutPlinthHeight = cabinetParams.features.cutoutPlinth.height;

        const cutout = BaseCabinet.createCutoutMesh(
          WALL_THICKNESS, // ширина выреза
          cutoutPlinthHeight + 3, // высота выреза (по Y)
          edgeThickness * 3, // глубина выреза (по Z)
          isRightWall ? 0 : -width / 2 + WALL_THICKNESS / 2, // X-позиция
          -height / 2 + cutoutPlinthHeight / 2, // Y-позиция — снизу
          -depth / 2 - WALL_THICKNESS, // Z-позиция — центр задней кромки
        );
        // this.sceneManagerService.addObject(cutout);
        const cutBackEdge = BaseCabinet.subtract(
          backEdge,
          cutout,
          edgeMaterial,
          new THREE.Vector3(
            isRightWall ? 0 : -width / 2 + WALL_THICKNESS / 2,
            -height / 2 + cutoutPlinthHeight / 2,
            0,
          ),
        );

        cutBackEdge.position.set(0, 0, -depth / 2 + edgeThickness / 2);
        group.add(cutBackEdge);
      } else {
        backEdge.position.set(0, 0, -depth / 2 + edgeThickness / 2);
        group.add(backEdge);
      }
    } else {
      backEdge.position.set(0, 0, -depth / 2 - edgeThickness / 2);
      group.add(backEdge);
    }

    // Нижняя кромка
    const bottomEdge = new THREE.Mesh(
      new RoundedBoxGeometry(width, edgeThickness, depth, 2, radius),
      edgeMaterial,
    );
    if (checkCutout) {
      const cutoutPlinthDepth = this.sceneManager.getCabinet().getCabinetParams().features
        .cutoutPlinth.depth;
      console.log(cutoutPlinthDepth);

      const cutout = BaseCabinet.createCutoutMesh(
        WALL_THICKNESS, // ширина выреза
        edgeThickness * 2, // высота выреза
        cutoutPlinthDepth, // глубина выреза (глубина под плинтус)
        isRightWall ? 0 : -width / 2 + WALL_THICKNESS / 2,
        -height / 2 - edgeThickness / 2,
        -depth / 2 - edgeThickness / 2,
      );

      const cutBottomEdge = BaseCabinet.subtract(
        bottomEdge,
        cutout,
        edgeMaterial,
        new THREE.Vector3(
          isRightWall ? 0 : -width / 2 + WALL_THICKNESS / 2,
          0,
          -depth / 2 + cutoutPlinthDepth / 2,
        ),
      );

      cutBottomEdge.position.set(0, -height / 2 - edgeThickness / 2, 0);
      group.add(cutBottomEdge);
    } else {
      bottomEdge.position.set(0, -height / 2 - edgeThickness / 2, 0);
      group.add(bottomEdge);
    }

    return group;
  }

  /**
  Создание фальшпанели плинтуса
@param params Параметры фальшпанели
@returns Созданный меш
*/
  public static createFalsePanel(params: {
    width: number;
    height: number;
    depth: number;
    positionX: number;
    positionY: number;
    positionZ: number;
    name: string;
    material: THREE.Material;
    rotateTexture?: boolean;
  }): THREE.Mesh {
    const panel = BaseCabinet.createMesh(
      {
        width: params.width,
        height: params.height,
        depth: params.depth,
      },
      params.material,
      params.rotateTexture,
    );
    panel.name = params.name;
    panel.position.set(params.positionX, params.positionY, params.positionZ);
    return panel;
  }

  public createPanelWithCutout(
    width: number,
    height: number,
    depth: number,
    panelMaterial: THREE.Material,
    name: string,
    checkCutout: boolean,
    rotateTexture: boolean,
  ): THREE.Mesh {
    const isSideWall = name.includes('Wall');
    const isRightWall = name.includes('rightWallCabinet');
    const isLeftWall = name.includes('leftWallCabinet');

    const geometry = new THREE.BoxGeometry(width, height, depth - 0.8);
    if (rotateTexture) {
      BaseCabinet.rotateUVs(geometry);
    }
    let panel: THREE.Mesh = new THREE.Mesh(geometry, panelMaterial);
    panel.name = name;
    // Добавляем вырез под ХДФ сзади
    if (isSideWall) {
      // Вырез под ХДФ
      const notchWidth = 10; // ширина выреза
      const notchHeight = height - PODIUM_HEIGHT;
      const notchDepth = DEPTH_EDGE_8MM;

      const xPos = isRightWall
        ? width / 2 - WALL_THICKNESS / 2 - 3
        : -width / 2 + WALL_THICKNESS / 2 + 3;
      const yPos = PODIUM_HEIGHT / 2 + 1;
      const zPos = -depth / 2 + 0.5;

      const hdfNotch = BaseCabinet.createCutoutMesh(
        notchWidth,
        notchHeight,
        notchDepth,
        xPos,
        yPos,
        zPos,
      );
      hdfNotch.name = `${name}_back_hdf_notch`;
      // Применяем вырез
      panel = BaseCabinet.subtract(panel, hdfNotch, panelMaterial, hdfNotch.position.clone());
    }

    if (checkCutout && isSideWall) {
      const cH = this.params.features.cutoutPlinth.height + 2;
      const cD = this.params.features.cutoutPlinth.depth;
      const radius = this.params.features.cutoutPlinth.radius;

      const xPos = isRightWall
        ? width / 2 - WALL_THICKNESS // Для правой стенки
        : -WALL_THICKNESS; // Для левой стенки
      const yPos = -height / 2;
      const zPos = -depth / 2 + cD;

      const geometry = BaseCabinet.buildRoundedCornerPanelGeometry(
        cD,
        cH,
        WALL_THICKNESS * 2,
        radius,
      );
      const cutout = new THREE.Mesh(geometry, panelMaterial);
      cutout.position.set(xPos, yPos, zPos);
      cutout.name = 'test';
      // this.sceneManagerService.deleteObjectByName('test');
      // this.sceneManagerService.addObject(cutout);

      // Вырезаем отверстие
      panel = BaseCabinet.subtract(panel, cutout, panelMaterial, cutout.position.clone());

      // Добавляем кромку
      const edgeGeometry = BaseCabinet.buildRoundedCornerPanelEdgeGeometry(
        cD,
        cH,
        WALL_THICKNESS,
        radius,
      );
      const edgeMesh = new THREE.Mesh(edgeGeometry, panelMaterial);
      const edgeName = isRightWall ? 'rightEdge' : isLeftWall ? 'leftEdge' : 'panelEdge';
      edgeMesh.name = edgeName;
      const xPosEdge = isRightWall
        ? this.params.dimensions.general.width / 2 - WALL_THICKNESS
        : -this.params.dimensions.general.width / 2 + WALL_THICKNESS;
      const yPosEdge = this.params.features.cutoutPlinth.height / 2 - PODIUM_HEIGHT / 2 - cH / 2;
      const zPosEdge = -this.params.dimensions.general.depth / 2 - DEPTH_EDGE_4MM / 2;
      edgeMesh.position.set(xPosEdge, yPosEdge, zPosEdge);
      // zPos + WALL_THICKNESS / 2 + DEPTH_EDGE_4MM / 2
      // this.sceneManagerService.deleteObjectByName(edgeName);
      // this.sceneManagerService.addObject(edgeMesh);
    }
    return panel;
  }

  // Метод для добавления цоколя
  public createPlinth(checkTypeFacade: boolean, cabinetType: string): THREE.Group {
    const plinthGroup = new THREE.Group();
    plinthGroup.name = 'plinth';

    const { width, height, depth } = this.params.dimensions.general;
    const positionDepth = checkTypeFacade
      ? depth / 2 - WALL_THICKNESS / 2 - DEPTH_WIDTH_INTG_HADLE
      : depth / 2 - WALL_THICKNESS / 2;
    const depthForInteg = checkTypeFacade ? depth - DEPTH_WIDTH_INTG_HADLE : depth;

    const additionalMaterial = BaseCabinet.getMaterial(
      this.params.appearance.additionColor.texture.path,
    );
    const facadeMaterial = BaseCabinet.getMaterial(
      this.params.appearance.visibleDtails.texture.path,
    );

    // Создаем основные части плинтуса
    const plinthFacade = BaseCabinet.createFalsePanel({
      width: width - WALL_THICKNESS * 2,
      height: PODIUM_HEIGHT,
      depth: WALL_THICKNESS,
      positionX: 0,
      positionY: WALL_THICKNESS - WALL_THICKNESS,
      positionZ: positionDepth,
      name: 'plinthFacade',
      material: facadeMaterial,
      rotateTexture: true,
    });

    const plinthFacadeAdd = BaseCabinet.createFalsePanel({
      width: width - WALL_THICKNESS * 2,
      height: FACADE_HEIGHT,
      depth: WALL_THICKNESS,
      positionX: 0,
      positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
      positionZ: positionDepth - WALL_THICKNESS - 4,
      name: 'plinthFacadeAdd',
      material: additionalMaterial,
      rotateTexture: true,
    });

    const plinthFalseBack = BaseCabinet.createFalsePanel({
      width: width - WALL_THICKNESS * 2,
      height: FACADE_HEIGHT,
      depth: WALL_THICKNESS,
      positionX: 0,
      positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
      positionZ:
        (-depth + DEPTH_WIDTH_INTG_HADLE) / 2 +
        WALL_THICKNESS / 2 +
        PLINTH_RADIUS_MAX -
        WALL_THICKNESS,
      name: 'plinthFalseBack',
      material: additionalMaterial,
      rotateTexture: true,
    });

    const centerZ = (plinthFacadeAdd.position.z + plinthFalseBack.position.z) / 2;

    // Боковые фальшпанели
    const plinthFalseLeft = BaseCabinet.createFalsePanel({
      width: WALL_THICKNESS,
      height: FACADE_HEIGHT + 2.5,
      depth: depthForInteg - WALL_THICKNESS * 3 - PLINTH_RADIUS_MAX - 4 - 10,
      positionX: -width / 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
      positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
      positionZ: centerZ,
      name: 'plinthFalseLeft',
      material: additionalMaterial,
      rotateTexture: true,
    });

    const plinthFalseRight = BaseCabinet.createFalsePanel({
      width: WALL_THICKNESS,
      height: FACADE_HEIGHT,
      depth: depthForInteg - WALL_THICKNESS * 3 - PLINTH_RADIUS_MAX - 4 - 10,
      positionX: width / 2 - WALL_THICKNESS / 2 - WALL_THICKNESS,
      positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
      positionZ: centerZ,
      name: 'plinthFalseRight',
      material: additionalMaterial,
      rotateTexture: true,
    });

    // Добавляем все части плинтуса в группу
    plinthGroup.add(plinthFacade);
    plinthGroup.add(plinthFacadeAdd);
    plinthGroup.add(plinthFalseBack);
    plinthGroup.add(plinthFalseLeft);
    plinthGroup.add(plinthFalseRight);

    // Центральная панель для двустворчатого шкафа
    let plinthCenter: THREE.Mesh | undefined;
    if (cabinetType == CabinetSubType.Double) {
      plinthCenter = BaseCabinet.createFalsePanel({
        width: WALL_THICKNESS,
        height: FACADE_HEIGHT,
        depth: depthForInteg - WALL_THICKNESS * 3 - PLINTH_RADIUS_MAX - 4,
        positionX: 0,
        positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
        positionZ: centerZ,
        name: 'plinthCenter',
        material: additionalMaterial,
        rotateTexture: true,
      });

      plinthGroup.add(plinthCenter);
    }

    this.createPlinthLegs(plinthFalseLeft, plinthFalseRight);

    return plinthGroup;
  }

  protected createPlinthLegs(leftPanel: THREE.Mesh, rightPanel: THREE.Mesh) {
    // Добавляем ножки к правой панели
    this.addLegsToPanel(rightPanel);

    // Добавляем ножки к левой панели
    this.addLegsToPanel(leftPanel);
  }

  public addLegsToCenterPanel(centerPanel: THREE.Object3D): void {
    if (this.params.subType === CabinetSubType.Double && this.hasMullion()) {
      this.addLegsToPanel(centerPanel);
    }
  }

  public updateFacadeCutHeightAndFacadeType(newCutHeight: number, cabinetSize: Size): void {
    const doorItems = this.params.components.facades?.facadeItems;
    if (!doorItems || doorItems.length === 0) return;

    const width = cabinetSize.width;
    const adjustedHeight = cabinetSize.height - newCutHeight;

    const facadeType = this.getFacadeType();
    const isIntegratedHandle = facadeType === 'INTEGRATED_HANDLE';
    const productType = this.getCabinetType();
    const cabinetType: CabinetSubType = this.getCabinetType();

    // Обновляем параметры всех дверей
    doorItems.forEach((doorParams) => {
      doorParams.cutHeight = newCutHeight;

      const newDoorSize: Size = FacadeManager.calculateDoorSize(
        width,
        adjustedHeight,
        isIntegratedHandle,
        productType,
      );

      if (!doorParams.originalHeight) {
        doorParams.originalHeight = newDoorSize.height;
      }

      doorParams.size = newDoorSize;
    });

    // Общий вызов визуального обновления
    this.facadeManager.updateFacadeSize(cabinetSize, cabinetType, facadeType, doorItems);
  }

  public updateDepthForIntegratedHandle(facadeType: string): void {
    // const depthOffset = isIntegratedHandle ? depth - DEPTH_WIDTH_INTG_HADLE : depth;
    const sizeCabinet = this.params.dimensions;
    // Обновляем глубину полок
    this.shelfManager.updateShelfSize(
      {
        width: sizeCabinet.general.width,
        height: sizeCabinet.general.height,
        depth: sizeCabinet.general.depth,
      },
      facadeType,
    );

    // Обновляем глубину средника
    this.mullionManager.updateMullionSize(
      sizeCabinet.general.width - WALL_THICKNESS * 2,
      sizeCabinet.general.depth,
      sizeCabinet.general.height - SHELF_HEIGHT * 2 - PODIUM_HEIGHT,
      this.params.dimensions.general.height,
      facadeType,
    );
  }

  // --- Логика ножек и отверстий ---

  public addLegsToPanel(panel: THREE.Object3D): void {
    // Удаляем старые ножки
    const oldLegs = panel.children.filter((c) => c.name === 'cabinetLeg');
    oldLegs.forEach((l) => panel.remove(l));

    const bbox = new THREE.Box3().setFromObject(panel);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    let legOffsetX = 0;
    if (panel.name.includes('plinthFalseLeft')) {
      legOffsetX = -size.x / 2 + WALL_THICKNESS * 2;
    } else if (panel.name.includes('plinthFalseRight')) {
      legOffsetX = size.x / 2 - WALL_THICKNESS * 2;
    }
    const zPos = size.z / 2 - WALL_THICKNESS * 3
    const positions = [
      new THREE.Vector3(legOffsetX, -PODIUM_HEIGHT / 2, -zPos),
      new THREE.Vector3(legOffsetX, -PODIUM_HEIGHT / 2, zPos),
    ];

    positions.forEach((pos) => {
      const leg = this.createLegGroup(panel.name);
      leg.position.copy(pos);
      panel.add(leg);
    });
  }

  private createLegGroup(panelName: string): THREE.Group {
    const group = new THREE.Group();
    group.name = 'cabinetLeg';

    // Размеры (можно вынести в константы)
    const bracketSize = 40; // Размер уголка
    const mainBodyRadius = 16; // Радиус резьбовой части
    const mainBodyHeight = 35; // Высота стакана
    const footRadius = 16; // Радиус черного основания
    const footHeight = 6; // Толщина черного основания
    const boltRadius = 5; // Радиус болта сверху

    // Материалы
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.9,
      roughness: 0.3,
    });
    const blackPlasticMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
    });

    // 1. Уголок крепления
    const bracketGroup = new THREE.Group();

    // Вертикальная пластина уголка
    const verticalPlate = new THREE.Mesh(
      new THREE.BoxGeometry(bracketSize, bracketSize, 2),
      metalMat,
    );

     let legOffsetX; // Смещение ножки от края панели
    if (panelName.includes('plinthFalseLeft')) {
      legOffsetX = -bracketSize / 2 + 5;
    } else if (panelName.includes('plinthFalseRight')) {
      legOffsetX = bracketSize / 2 - 5;
    }

    verticalPlate.position.set(legOffsetX, bracketSize / 2, mainBodyRadius / 2 + 10);
    verticalPlate.rotateY(Math.PI / 2);
    bracketGroup.add(verticalPlate);
    group.add(bracketGroup);

    // 2. Основной резьбовой корпус (цилиндр с насечками)
    // Чтобы имитировать резьбу без текстур, можно использовать сегментированный цилиндр
    const bodyGeo = new THREE.CylinderGeometry(mainBodyRadius, mainBodyRadius, mainBodyHeight, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, metalMat);
    // Центрируем на горизонтальной полке
    bodyMesh.position.set(0, mainBodyHeight / 2 + 2, bracketSize / 2 - 2);
    group.add(bodyMesh);


    // 3. Нижнее основание (Черный пластик)
    const footGeo = new THREE.CylinderGeometry(footRadius, footRadius, footHeight, 24);
    const footMesh = new THREE.Mesh(footGeo, blackPlasticMat);
    // Опускаем в самый низ
    footMesh.position.set(0, -footHeight / 2 + 2, bracketSize / 2 - 2);
    group.add(footMesh);

    return group;
  }

  public static subtractGeometry(
    baseMesh: THREE.Mesh,
    cutoutMesh: THREE.Mesh,
  ): THREE.BufferGeometry {
    // Выполняем CSG
    const bspBase = CSG.fromMesh(baseMesh);
    const bspCutout = CSG.fromMesh(cutoutMesh);
    const bspResult = bspBase.subtract(bspCutout);
    const result = CSG.toMesh(bspResult, baseMesh.matrixWorld, baseMesh.material);

    return result.geometry;
  }

  // --- Управление фасадами ---
  public updateOtherFeatures(features: any): void {
    this.params.features.cutoutPlinth = features.cutoutPlinth;
    this.params.features.lighting = features.lighting;
    this.build(); // Пересоздаем шкаф с новыми параметрами
  }

  // --- Управление компонентами (Полки) ---

  public addShelf(shelfData: Shelf): void {
    this.shelfManager.addShelf(shelfData, this.params.dimensions.general);
  }

  public removeShelf(idToRemove: number): void {
    this.params.components.shelves.shelfItems = this.params.components.shelves.shelfItems.filter(
      (s) => s.id !== idToRemove,
    );
    this.shelfManager.removeShelf(idToRemove);
  }

  public updateShelfSize(width: number, height: number, depth: number): void {
    this.shelfManager.updateShelfSize({ width, height, depth }, this.getFacadeType());
  }

  public updateRodType(newType: RodType): void {
    const shelves = this.params.components.shelves.shelfItems;
    for (let i = 0; i < shelves.length; i++) {
      const shelf = shelves[i];

      // Если у полки есть штанги
      if (shelf.rods && shelf.rods.length > 0) {
        for (let j = 0; j < shelf.rods.length; j++) {
          shelf.rods[j].type = newType;
        }
      }
    }

    // Если у тебя есть верхняя полка (topShelf) — обновляем и её
    if (this.params.components.shelves.topShelf) {
      for (let k = 0; k < this.params.components.shelves.topShelf.length; k++) {
        this.params.components.shelves.topShelf[k].type = newType;
      }
    }

    console.log(`Все штанги обновлены на тип: ${newType}`);
  }

  public getPositionHinges(): PositionCutout {
    return this.params.components.facades.facadeItems[0].positionLoops;
  }

  // --- Управление компонентами (Ящики) ---

  public addBlock(drawerBlock: DrawerBlock, positionLoops: string): void {
    this.drawerManager.addBlock(drawerBlock, this.params.dimensions.general, positionLoops);
  }

  public removeDrawer(id: number): void {
    this.drawerManager.removeDrawer(id);
  }

  public removeDrawerBlocks(): void {
    this.dimensionLines.removeAllSidePanelHeightLines();
    this.drawerManager.removeBlocks();
  }

  // --- Управление компонентами (Средник) ---

  public createMullion(data: Mullion): void {
    this.mullionManager.createMullion(data);
    this.build();
  }

  //   /**
  //    * Метод для получение средника
  //    */
  public getMullion(): THREE.Object3D | null {
    return this.mullionManager.getMullion();
  }

  public updateMullionPositionX(newX: number): void {
    if (this.mullionManager.getMullion()) {
      this.mullionManager.getMullion().position.x = newX;
      this.getCabinetParams().components.mullion.position.x = newX;
    }
  }

  // public updateMullionSize(newWidth: number, newDepth: number, newHeight: number): void {
  //   if (!this.hasMullion()) return;
  //   this.mullionManager.updateMullionSize(
  //     newWidth,
  //     newDepth,
  //     newHeight,
  //     this.getCabinetHeight(),
  //     this.getFacadeType(),
  //     this.params.components.shelves.shelfItems.length,
  //   );
  // }

  public updateMullion(): void {
    if (
      this.params.components.shelves.shelfItems.length > 0 ||
      this.params.components.drawers.drawerBlocks.length > 0
    ) {
      const lowestShelfPosition = this.shelfManager.getLowestShelfHeight();
      if (lowestShelfPosition !== null) {
        // Обновляем позицию средника
        const mullionHeight = lowestShelfPosition; // - SHELF_HEIGHT * 2 - PODIUM_HEIGHT
        console.log('mullionHeight: ', mullionHeight);
        // Обновляем размеры средника
        this.updateMullionSize(
          this.params.dimensions.general.width,
          this.params.dimensions.general.depth,
          mullionHeight - SHELF_HEIGHT * 4 - INTERVAL_1_MM * 2,
          this.params.components.shelves.shelfItems.length,
        );
      }
    }
  }

  public updateMullionSize(
    newWidth: number,
    newDepth: number,
    newHeight: number,
    countShelf: number = 0,
  ): void {
    if (!this.hasMullion()) return;

    const mullion = this.getMullion();

    this.mullionManager.updateMullionSize(
      newWidth,
      newDepth,
      newHeight,
      this.params.dimensions.general.height,
      this.getFacadeType(),
      countShelf,
    );

    // Обновляем позицию центральной панели и ножек
    const plinthCenter = this.mullionManager.getPlinthCenter();
    if (plinthCenter) {
      // Сохраняем текущую позицию X перед обновлением
      const currentXPosition = plinthCenter.position.x;

      // Обновляем позицию панели
      plinthCenter.position.x = currentXPosition;

      // Всегда добавляем ножки при обновлении
      this.addLegsToPanel(plinthCenter);
    }
  }

  // --- Управление компонентами (Фасады) ---

  public updateFacadeSize(width: number, height: number, depth: number): void {
    this.facadeManager.updateFacadeSize(
      { width, height, depth },
      this.params.type as any,
      this.getFacadeType(),
      this.params.components.facades.facadeItems,
    );
  }

  public updateFacade(facade: Facade, cabinetType: CabinetSubType, cabinetSize: Size): void {
    this.params.components.facades.facadeItems[0] = facade;
    this.facadeManager.updateDoor(facade, cabinetType, cabinetSize);
  }

  // --- Геометрические утилиты (Static) ---

  public static getMaterial(texturePath: string): THREE.MeshStandardMaterial {
    const texture = new THREE.TextureLoader().load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: texture });
  }

  public static rotateUVs(geometry: THREE.BufferGeometry): void {
    const uvAttribute = geometry.attributes['uv'];
    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);
      uvAttribute.setXY(i, v, 1 - u);
    }
    uvAttribute.needsUpdate = true;
  }

  public static createMesh(size: Size, material: THREE.Material, rotate = false): THREE.Mesh {
    const geo = new THREE.BoxGeometry(size.width, size.height, size.depth);
    if (rotate) this.rotateUVs(geo);
    return new THREE.Mesh(geo, material);
  }

  public static buildRoundedCornerPanelEdgeGeometry(
    width: number,
    height: number,
    depth: number,
    radius: number,
  ): THREE.ExtrudeGeometry {
    const shape = this.buildRoundedCornerPanelShape(DEPTH_EDGE_04MM * 2, height, radius);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: WALL_THICKNESS, // толщина кромки
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);

    // Добавляем UV-координаты для текстурирования
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); // желательно для освещения
    // Применяем UV-мэппинг по Z и Y (из-за поворота по Y)
    this.applyUVMapping(geometry, 'z', 'y');

    return geometry;
  }

  public static buildRoundedCornerPanelGeometryForShelf(
    width: number,
    height: number,
    depth: number,
    radius: number,
  ): THREE.ExtrudeGeometry {
    const shape = this.buildRoundedCornerPanelShape(depth, height, radius);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: width,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    geometry.rotateY(-Math.PI / 2);
    geometry.rotateZ(Math.PI / 2);
    geometry.computeVertexNormals();
    this.applyUVMapping(geometry, 'x', 'y'); // Y стал Z из-за поворота

    return geometry;
  }

  public static buildRoundedCornerPanelGeometry(
    width: number,
    height: number,
    depth: number,
    radius: number,
  ): THREE.ExtrudeGeometry {
    const shape = this.buildRoundedCornerPanelShape(width, height, radius);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: depth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    geometry.computeVertexNormals();

    // Применяем UV-мэппинг по XY
    this.applyUVMapping(geometry, 'x', 'y');

    return geometry;
  }
}
