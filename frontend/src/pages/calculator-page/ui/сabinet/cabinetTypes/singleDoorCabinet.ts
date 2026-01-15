import * as THREE from 'three';
import { DimensionLines } from '../objects/DimensionLines';
import {
  ICabinet,
  ICabinetDimensions,
  Size,
  MMaterial,
  CabinetSubType,
} from 'src/entities/Cabinet/model/types/cabinet.model';
import { Facade, FacadeType } from '../model/Facade';
import { CutoutPlinth, Lighting } from '../model/Features';
import {
  DEPTH_EDGE_04MM,
  DEPTH_EDGE_4MM,
  DEPTH_EDGE_8MM,
  DEPTH_WIDTH_INTG_HADLE,
  DRAVER_MIN_POSITION,
  FACADE_HEIGHT,
  PLINTH_RADIUS_MAX,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  WALL_THICKNESS,
} from '../constants';
import { BaseCabinet } from './BaseCabinet';
import { RoundedBoxGeometry } from 'three-stdlib';
import { SceneManagerService } from '../../services/SceneManager.service';
import { DrawerWarningService } from '../../services/warnings/DrawerWarningService.service';

export class SingleDoorCabinet extends BaseCabinet {
  constructor(sceneManagerService: SceneManagerService, cabinetParams: ICabinet) {
    super(sceneManagerService, cabinetParams);
  }
  // РЕАЛИЗАЦИЯ ТЕЛА ШКАФА
  protected override createCabinetBody(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SingleCabinet_Geometry';

    const { width, height, depth } = this.params.dimensions.general;
    const heightWall = height - DEPTH_EDGE_04MM * 2;

    const positionLoops = this.params.components.facades.facadeItems[0].positionLoops;
    const isIntegratedHandle = this.getFacadeType() === 'INTEGRATED_HANDLE';

    // Материалы
    const additionalMaterial = BaseCabinet.getMaterial(
      this.params.appearance.additionColor.texture.path,
    );
    const visibleDetails = BaseCabinet.getMaterial(
      this.params.appearance.visibleDtails.texture.path,
    );

    const checkCutout = this.params.features.cutoutPlinth.checkBox;

    // Левая стенка
    const leftWall = this.createWall(
      'leftWallCabinet',
      WALL_THICKNESS,
      heightWall,
      depth,
      visibleDetails,
      visibleDetails,
      false,
      checkCutout,
    );
    leftWall.position.set(-width / 2 + WALL_THICKNESS / 2, height / 2 - PODIUM_HEIGHT / 2, 0);
    if (positionLoops === 'left-side') this.addHinges('left-side', leftWall);
    group.add(leftWall);

    // Правая стенка
    const rightWall = this.createWall(
      'rightWallCabinet',
      WALL_THICKNESS,
      heightWall,
      depth,
      visibleDetails,
      visibleDetails,
      false,
      checkCutout,
    );
    rightWall.position.set(width / 2 - WALL_THICKNESS / 2, height / 2 - PODIUM_HEIGHT / 2, 0);
    if (positionLoops === 'right-side') this.addHinges('right-side', rightWall);
    group.add(rightWall);

    // Крыша
    const top = this.createWall(
      'topCabinet',
      width - WALL_THICKNESS * 2,
      WALL_THICKNESS,
      depth - 4,
      visibleDetails,
      visibleDetails,
      true,
      false,
    );
    top.position.set(0, height - PODIUM_HEIGHT / 2 - WALL_THICKNESS / 2, 2);
    group.add(top);

     // восстановление штанг после пересоздания topCabinet
    const shelvesModel = this.params.components.shelves;
    if (shelvesModel.topShelf?.length) {
      shelvesModel.topShelf.forEach((rodModel) => {
        top.userData['hasRod'] = true;
        this.sceneManager.getCabinet().shelfManager.addRod(top, rodModel.position, true);
      });
    }

    // Дно
    const bottom = this.createWall(
      'bottomCabinet',
      width - WALL_THICKNESS * 2,
      WALL_THICKNESS,
      depth - 4,
      additionalMaterial,
      additionalMaterial,
      true,
      false,
    );
    bottom.position.set(0, PODIUM_HEIGHT / 2 + WALL_THICKNESS / 2, 2);
    group.add(bottom);

    // Цоколь
    const plinth = this.createPlinth(isIntegratedHandle, CabinetSubType.Single);
    group.add(plinth);

    // ХДФ (Задняя стенка)
    const hdfSize = {
      width: width - WALL_THICKNESS * 2 + 19,
      height: height - PODIUM_HEIGHT - 3,
      depth: DEPTH_EDGE_8MM,
    };
    const hdf = BaseCabinet.createMeshHdf('cabinetHDF', hdfSize);
    hdf.position.set(0, height / 2, -depth / 2 + DEPTH_EDGE_8MM / 2 + 0.4);
    hdf.name = 'hdf';
    group.add(hdf);

    this.dimensionLines.addDimensionLines(width, height, depth, 35);
    // Секционные размерные линии
    this.dimensionLines.updateSectionHeightLines();

    return group;
  }

  // Обязательные методы переопределения
  public override build(): void {
    // Вызываем базовый метод сборки, который очистит группу и вызовет createCabinetBody
    super.build();
  }

  public override updateSize(width: number, height: number, depth: number): void {
    this.params.dimensions.general = { width, height, depth };
    this.build();
  }

  public override updateMaterial(material: MMaterial): void {
    this.updateGeneralMaterial(material);
  }

  // public createCabinet(): THREE.Group {
  //   // console.log('Параметры при создании Cabinet:\n', this.cabinetParams);
  //   this.removeCabinet();
  //   const group = new THREE.Group();
  //   group.name = 'SingleCabinet'; // Это имя группы шкафа

  //   // Глобальные размеры шкафа
  //   const { width, height, depth } = this.params.dimensions.general;
  //   const heightWall = height - DEPTH_EDGE_04MM * 2; // Высота боковин без учёта кромок
  //   const cabinetType = this.params.subType;
  //   const positionLoops = this.params.components.facades.facadeItems[0].positionLoops;
  //   // const isDoubleDoorCabinet = this.params.basicInfo.type === 'double';

  //   const isSingleDoorCabinet = this.params.subType == CabinetSubType.Single;
  //   const isIntegratedHandle = this.getFacadeType() == 'INTEGRATED_HANDLE';
  //   console.log('positionLoops: ', positionLoops);
  //   const isRightHinged = positionLoops == 'right-side';
  //   const isLeftHinged = positionLoops == 'left-side';

  //   // _______________________Метериалы_______________________

  //   // Материал для кромок
  //   // const edgeMaterial = new THREE.MeshStandardMaterial({
  //   //   color: this.cabinetParams.appearance.visibleDtails.color.hex,
  //   // });

  //   // Материала добавочного элемента
  //   const additionalMaterial = BaseCabinet.getMaterial(
  //     this.params.appearance.additionColor.texture.path,
  //   );
  //   // Материал видимых элементов
  //   const visibleDetails = BaseCabinet.getMaterial(
  //     this.params.appearance.visibleDtails.texture.path,
  //   );
  //   // ______________________________________________

  //   const checkCutout = this.params.features.cutoutPlinth.checkBox;
  //   if (checkCutout) console.log('Проверка на вырез в плинтусе: ', checkCutout);
  //   // Левая стенка
  //   const leftWall = this.createWall(
  //     'leftWallCabinet',
  //     WALL_THICKNESS,
  //     heightWall,
  //     depth,
  //     visibleDetails,
  //     visibleDetails,
  //     false,
  //     checkCutout,
  //   );
  //   leftWall.name = 'leftWallCabinet';

  //   leftWall.position.set(
  //     -width / 2 + WALL_THICKNESS / 2,
  //     height / 2 - PODIUM_HEIGHT / 2,
  //     -(depth - depth) / 2,
  //   );
  //   if (isLeftHinged || this.params.subType == CabinetSubType.Double) {
  //     this.addHinges('left-side', leftWall);
  //   }
  //   group.add(leftWall);

  //   // Правая стенка
  //   const rightWall = this.createWall(
  //     'rightWallCabinet',
  //     WALL_THICKNESS,
  //     heightWall,
  //     depth,
  //     visibleDetails,
  //     visibleDetails,
  //     false,
  //     checkCutout,
  //   );
  //   rightWall.name = 'rightWallCabinet';

  //   rightWall.position.set(
  //     width / 2 - WALL_THICKNESS / 2,
  //     height / 2 - PODIUM_HEIGHT / 2,
  //     -(depth - depth) / 2,
  //   );
  //   if (isRightHinged || this.params.subType == CabinetSubType.Double) {
  //     this.addHinges('right-side', rightWall);
  //   }
  //   group.add(rightWall);
  //   // Крыша
  //   const top = this.createWall(
  //     'topCabinet',
  //     width - WALL_THICKNESS * 2,
  //     WALL_THICKNESS,
  //     depth - 4, // Вычитаем 4мм для хдф
  //     visibleDetails,
  //     visibleDetails,
  //     true,
  //     false,
  //   );
  //   top.name = 'topCabinet';
  //   top.position.set(0, height - PODIUM_HEIGHT / 2 - WALL_THICKNESS / 2, 2);
  //   group.add(top);

  //   // восстановление штанг после пересоздания topCabinet
  //   const shelvesModel = this.params.components.shelves;
  //   if (shelvesModel.topShelf?.length) {
  //     shelvesModel.topShelf.forEach((rodModel) => {
  //       top.userData['hasRod'] = true;
  //       this.sceneManager.getCabinet().shelfManager.addRod(top, rodModel.position, true); // или 'left'/'right' если хранишь side
  //     });
  //   }

  //   // Дно
  //   const bottom = this.createWall(
  //     'bottomCabinet',
  //     width - WALL_THICKNESS * 2,
  //     WALL_THICKNESS,
  //     depth - 4, // Вычитаем 4мм для хдф
  //     additionalMaterial,
  //     additionalMaterial,
  //     true, // добавялем флаг, для поперечного наложения
  //     false,
  //   );
  //   bottom.name = 'bottomCabinet';
  //   bottom.position.set(0, PODIUM_HEIGHT / 2 + WALL_THICKNESS / 2, 0 + 2);
  //   group.add(bottom);

  //   // Цоколь
  //   const plinthGroup: THREE.Group = this.createPlinth(isIntegratedHandle, cabinetType);
  //   group.add(plinthGroup);

  //   // Создаем BoxGeometry и Mesh
  //   // const hdfGeometry = new THREE.BoxGeometry(
  //   //   width - WALL_THICKNESS * 2,
  //   //   height - PODIUM_HEIGHT - WALL_THICKNESS * 2,
  //   //   DEPTH_EDGE_8MM,
  //   // );
  //   const hdfSize: Size = {
  //     width: width - WALL_THICKNESS * 2 + 10 * 2 - 0.5 * 2,
  //     height: height - PODIUM_HEIGHT - 1.5 * 2,
  //     depth: DEPTH_EDGE_8MM,
  //   };
  //   const hdf = BaseCabinet.createMeshHdf('cabinetHDF', hdfSize);
  //   hdf.position.set(0, height / 2, -depth / 2 + DEPTH_EDGE_8MM / 2 + 0.4); // -3 если что
  //   hdf.name = 'hdf';
  //   group.add(hdf);

  //   // Внешение размерные линиии
  //   this.dimensionLines.addDimensionLines(width, height, depth, 35);

  //   // Секционные размерные линии
  //   this.dimensionLines.updateSectionHeightLines();

  //   return group;
  // }

  public override createPanelWithCutout(
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

    const geometry = new THREE.BoxGeometry(width, height, depth - 0.8); //  depth - 0.4 - 0.8 + 0.5 + 0.5
    if (rotateTexture) {
      BaseCabinet.rotateUVs(geometry);
    }
    let panel: THREE.Mesh = new THREE.Mesh(geometry, panelMaterial);

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
      console.log(xPos, yPos, zPos);
      console.log('isSideWall: ', isSideWall, xPos);
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
      console.log(`Creating cutout for ${name}:`, {
        checkCutout,
        isSideWall,
        isRightWall,
        isLeftWall,
      });
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
    }

    return panel;
  }

  // Метод для добавления цоколя
  // public createPlinth(checkTypeFacade: boolean = false): THREE.Group {
  //   const plinthGroup = new THREE.Group();
  //   plinthGroup.name = 'plinth';
  //   const { width, height, depth } = this.params.dimensions.general;
  //   const positionDepth = checkTypeFacade
  //     ? depth / 2 - WALL_THICKNESS / 2 - DEPTH_WIDTH_INTG_HADLE
  //     : depth / 2 - WALL_THICKNESS / 2;
  //   const depthForInteg = checkTypeFacade ? depth - DEPTH_WIDTH_INTG_HADLE : depth;

  //   const additionalMaterial = BaseCabinet.getMaterial(
  //     this.params.appearance.additionColor.texture.path,
  //   );
  //   const facadeMaterial = BaseCabinet.getMaterial(
  //     this.params.appearance.visibleDtails.texture.path,
  //   );

  // Создаем основные части плинтуса
  //   const plinthFacade = BaseCabinet.createFalsePanel({
  //     width: width - WALL_THICKNESS * 2,
  //     height: PODIUM_HEIGHT,
  //     depth: WALL_THICKNESS,
  //     positionX: 0,
  //     positionY: WALL_THICKNESS - WALL_THICKNESS,
  //     positionZ: positionDepth,
  //     name: 'plinthFacade',
  //     material: facadeMaterial,
  //     rotateTexture: true,
  //   });

  //   const plinthFacadeAdd = BaseCabinet.createFalsePanel({
  //     width: width - WALL_THICKNESS * 2,
  //     height: FACADE_HEIGHT,
  //     depth: WALL_THICKNESS,
  //     positionX: 0,
  //     positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
  //     positionZ: positionDepth - WALL_THICKNESS - 4,
  //     name: 'plinthFacadeAdd',
  //     material: additionalMaterial,
  //     rotateTexture: true,
  //   });

  //   const plinthFalseBack = BaseCabinet.createFalsePanel({
  //     width: width - WALL_THICKNESS * 2,
  //     height: FACADE_HEIGHT,
  //     depth: WALL_THICKNESS,
  //     positionX: 0,
  //     positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
  //     positionZ:
  //       (-depth + DEPTH_WIDTH_INTG_HADLE) / 2 +
  //       WALL_THICKNESS / 2 +
  //       PLINTH_RADIUS_MAX -
  //       WALL_THICKNESS,
  //     name: 'plinthFalseBack',
  //     material: additionalMaterial,
  //     rotateTexture: true,
  //   });

  //   const centerZ = (plinthFacadeAdd.position.z + plinthFalseBack.position.z) / 2;

  //   // Боковые фальшпанели
  //   const plinthFalseLeft = BaseCabinet.createFalsePanel({
  //     width: WALL_THICKNESS,
  //     height: FACADE_HEIGHT + 2.5,
  //     depth: depthForInteg - WALL_THICKNESS * 3 - PLINTH_RADIUS_MAX - 4 - 10,
  //     positionX: -width / 2 + WALL_THICKNESS / 2 + WALL_THICKNESS,
  //     positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
  //     positionZ: centerZ,
  //     name: 'plinthFalseLeft',
  //     material: additionalMaterial,
  //     rotateTexture: true,
  //   });

  //   const plinthFalseRight = BaseCabinet.createFalsePanel({
  //     width: WALL_THICKNESS,
  //     height: FACADE_HEIGHT,
  //     depth: depthForInteg - WALL_THICKNESS * 3 - PLINTH_RADIUS_MAX - 4 - 10,
  //     positionX: width / 2 - WALL_THICKNESS / 2 - WALL_THICKNESS,
  //     positionY: WALL_THICKNESS - WALL_THICKNESS + 2.5,
  //     positionZ: centerZ,
  //     name: 'plinthFalseRight',
  //     material: additionalMaterial,
  //     rotateTexture: true,
  //   });

  //   // Добавляем все части плинтуса в группу
  //   plinthGroup.add(plinthFacade);
  //   plinthGroup.add(plinthFacadeAdd);
  //   plinthGroup.add(plinthFalseBack);
  //   plinthGroup.add(plinthFalseLeft);
  //   plinthGroup.add(plinthFalseRight);

  //   this.createPlinthLegs(plinthFalseLeft, plinthFalseRight);

  //   return plinthGroup;
  // }

  // public updateCabinetParams(newParams: ICabinet): void {
  //   // console.log('Обновление параметров шкафа', newParams);
  //   this.params = newParams;
  //   const group = this.createCabinet();
  //   this.sceneManager.setCabinetGroup(group);
  //   console.log('GROUP: ', group);
  //   this.sceneManager.addObject(group); // Добавить на сцену
  // }

  public updateCabinetSize(newSize: Size): void {}

  public removeCabinet(): void {
    this.sceneManager.clearCabinetGroup(); // Удаляет всю группу шкафа
    this.dimensionLines.removeAllDimensionLines();
  }

  /**
   * Получает все объекты, которые являются частью шкафа
   */
  public getAllCabinetObjects(): THREE.Object3D[] {
    const cabinetObjects: THREE.Object3D[] = [];

    // Рекурсивно собираем все дочерние объекты
    this.traverse((object) => {
      cabinetObjects.push(object);
    });

    return cabinetObjects;
  }

  /**
   * Проверяет, является ли объект частью этого шкафа
   */
  public isPartOfCabinet(object: THREE.Object3D): boolean {
    let current: THREE.Object3D | null = object;
    const cabinetRoot = this.sceneManager.getObjectByName('SingleCabinet');
    while (current) {
      if (current === cabinetRoot) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}
