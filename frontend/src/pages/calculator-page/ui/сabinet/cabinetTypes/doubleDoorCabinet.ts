import * as THREE from 'three';
import { BaseCabinet } from './BaseCabinet';
import { DimensionLines } from '../objects/DimensionLines';
import {
  ICabinet,
  ICabinetDimensions,
  Size,
  MMaterial,
  CabinetSubType,
} from 'src/entities/Cabinet/model/types/cabinet.model';
import { CutoutPlinth, Lighting } from '../model/Features';
import {
  DEPTH_EDGE_04MM,
  DEPTH_EDGE_4MM,
  DEPTH_EDGE_8MM,
  DEPTH_WIDTH_INTG_HADLE,
  FACADE_HEIGHT,
  PLINTH_RADIUS_MAX,
  PODIUM_HEIGHT,
  WALL_THICKNESS,
} from '../constants';
import { RoundedBoxGeometry } from 'three-stdlib';
import { SceneManagerService } from '../../services/SceneManager.service';
import { FacadeType } from '../model/Facade';
import { DrawerWarningService } from '../../services/warnings/DrawerWarningService.service';

export class DoubleDoorCabinet extends BaseCabinet {
  constructor(sceneManagerService: SceneManagerService, cabinetParams: ICabinet) {
    super(sceneManagerService, cabinetParams);
  }
  public updateCabinetSize(newSize: Size): void {
    // Специфичная логика обновления размеров для двустворчатого шкафа
  }

  protected override createCabinetBody(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DoubleCabinet'; // Это имя группы шкафа

    const { width, height, depth } = this.params.dimensions.general;
    const heightWall = height - DEPTH_EDGE_04MM * 2; // Высота боковин без учёта кромок
    const cabinetType = this.params.subType;
    const isIntegratedHandle = this.getFacadeType() == 'INTEGRATED_HANDLE';
    const positionLoops = this.params.components.facades.facadeItems[0].positionLoops;
    // const isDoubleDoorCabinet = this.cabinetParams.basicInfo.type === 'double';

    const isSingleDoorCabinet = this.params.subType === CabinetSubType.Single;
    const shouldRecessBottomAndPlinth = isIntegratedHandle; // Всегда утапливаем дно и цоколь при интегрированной ручке
    const shouldRecessSideWall = isIntegratedHandle && isSingleDoorCabinet; // Ут

    const isRightHinged = positionLoops == 'right-side';
    const isLeftHinged = positionLoops == 'left-side';

    const adjustedLeftDepth = shouldRecessSideWall && isRightHinged ? depth - 32 : depth;
    const adjustedRightDepth = shouldRecessSideWall && isLeftHinged ? depth - 32 : depth;
    const adjustedDepth = shouldRecessBottomAndPlinth ? depth - DEPTH_WIDTH_INTG_HADLE : depth;
    const positionBottoom = shouldRecessBottomAndPlinth ? -DEPTH_WIDTH_INTG_HADLE / 2 : 0;

    // _______________________Метериалы_______________________

    // Материал для кромок
    // const edgeMaterial = new THREE.MeshStandardMaterial({
    //   color: this.cabinetParams.appearance.visibleDtails.color.hex,
    // });
    // Материала добавочного цвета
    const additionalMaterial = BaseCabinet.getMaterial(
      this.params.appearance.additionColor.texture.path,
    );
    const visibleDtails = BaseCabinet.getMaterial(
      this.params.appearance.visibleDtails.texture.path,
    );

    // ______________________________________________

    const checkCutout = this.params.features.cutoutPlinth.checkBox;
    if (checkCutout) console.log('Проверка на вырез в плинтусе: ', checkCutout);
    // Левая стенка
    const leftWall = this.createWall(
      'leftWallCabinet',
      WALL_THICKNESS,
      heightWall,
      adjustedLeftDepth,
      visibleDtails,
      visibleDtails,
      false,
      checkCutout,
    );
    leftWall.name = 'leftWallCabinet';
    leftWall.position.set(
      -width / 2 + WALL_THICKNESS / 2,
      height / 2 - PODIUM_HEIGHT / 2,
      -(depth - adjustedLeftDepth) / 2,
    );
    if (isLeftHinged || this.params.subType == CabinetSubType.Double) {
      this.addHinges('left-side', leftWall);
    }
    group.add(leftWall);

    // Правая стенка
    const rightWall = this.createWall(
      'rightWallCabinet',
      WALL_THICKNESS,
      heightWall,
      adjustedRightDepth,
      visibleDtails,
      visibleDtails,
      false,
      checkCutout,
    );
    rightWall.name = 'rightWallCabinet';
    rightWall.position.set(
      width / 2 - WALL_THICKNESS / 2,
      height / 2 - PODIUM_HEIGHT / 2,
      -(depth - adjustedRightDepth) / 2,
    );
    if (isRightHinged || this.params.subType == CabinetSubType.Double) {
      this.addHinges('right-side', rightWall);
    }
    group.add(rightWall);

    // Крыша
    const top = this.createWall(
      'topCabinet',
      width - WALL_THICKNESS * 2,
      WALL_THICKNESS,
      depth - 4, // Вычитаем 4мм для хдф
      visibleDtails,
      visibleDtails,
      true,
      false,
    );
    top.name = 'topCabinet';
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
      adjustedDepth - 4, // Вычитаем 4мм для хдф
      additionalMaterial,
      additionalMaterial,
      true, // добавялем флаг, для поперечного наложения
      false,
    );
    bottom.name = 'bottomCabinet';
    bottom.position.set(0, PODIUM_HEIGHT / 2 + WALL_THICKNESS / 2, positionBottoom + 2);
    group.add(bottom);

    // Цоколь
    const plinthGroup: THREE.Group = this.createPlinth(isIntegratedHandle, cabinetType);
    group.add(plinthGroup);

    const hdfSize: Size = {
      width: width - WALL_THICKNESS * 2 + 10 * 2 - 0.5 * 2,
      height: height - PODIUM_HEIGHT - 1.5 * 2,
      depth: DEPTH_EDGE_8MM,
    };
    const hdf = BaseCabinet.createMeshHdf('cabinetHDF', hdfSize);
    hdf.position.set(0, height / 2, -depth / 2 + DEPTH_EDGE_8MM / 2 + 0.4); // -3 если что
    hdf.name = 'hdf';
    group.add(hdf);

    this.dimensionLines.addDimensionLines(width, height, depth, 35);
    // Секционные размерные линии
    this.dimensionLines.updateSectionHeightLines();
    // console.log('DoubleDoorCabinet');
    // console.log(group);
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
  //   this.removeCabinet();
  //   const group = new THREE.Group();
  //   group.name = 'DoubleCabinet'; // Это имя группы шкафа

  //   const { width, height, depth } = this.params.dimensions.general;
  //   const heightWall = height - DEPTH_EDGE_04MM * 2; // Высота боковин без учёта кромок
  //   const cabinetType = this.params.subType;
  //   const isIntegratedHandle = this.getFacadeType() == 'INTEGRATED_HANDLE';
  //   const positionLoops = this.params.components.facades.facadeItems[0].positionLoops;
  //   // const isDoubleDoorCabinet = this.cabinetParams.basicInfo.type === 'double';

  //   const isSingleDoorCabinet = this.params.subType === CabinetSubType.Single;
  //   const shouldRecessBottomAndPlinth = isIntegratedHandle; // Всегда утапливаем дно и цоколь при интегрированной ручке
  //   const shouldRecessSideWall = isIntegratedHandle && isSingleDoorCabinet; // Ут

  //   const isRightHinged = positionLoops == 'right-side';
  //   const isLeftHinged = positionLoops == 'left-side';

  //   const adjustedLeftDepth = shouldRecessSideWall && isRightHinged ? depth - 32 : depth;
  //   const adjustedRightDepth = shouldRecessSideWall && isLeftHinged ? depth - 32 : depth;
  //   const adjustedDepth = shouldRecessBottomAndPlinth ? depth - DEPTH_WIDTH_INTG_HADLE : depth;
  //   const positionBottoom = shouldRecessBottomAndPlinth ? -DEPTH_WIDTH_INTG_HADLE / 2 : 0;

  //   // _______________________Метериалы_______________________

  //   // Материал для кромок
  //   // const edgeMaterial = new THREE.MeshStandardMaterial({
  //   //   color: this.cabinetParams.appearance.visibleDtails.color.hex,
  //   // });
  //   // Материала добавочного цвета
  //   const additionalMaterial = BaseCabinet.getMaterial(
  //     this.params.appearance.additionColor.texture.path,
  //   );
  //   const visibleDtails = BaseCabinet.getMaterial(
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
  //     adjustedLeftDepth,
  //     visibleDtails,
  //     visibleDtails,
  //     false,
  //     checkCutout,
  //   );
  //   leftWall.name = 'leftWallCabinet';
  //   leftWall.position.set(
  //     -width / 2 + WALL_THICKNESS / 2,
  //     height / 2 - PODIUM_HEIGHT / 2,
  //     -(depth - adjustedLeftDepth) / 2,
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
  //     adjustedRightDepth,
  //     visibleDtails,
  //     visibleDtails,
  //     false,
  //     checkCutout,
  //   );
  //   rightWall.name = 'rightWallCabinet';
  //   rightWall.position.set(
  //     width / 2 - WALL_THICKNESS / 2,
  //     height / 2 - PODIUM_HEIGHT / 2,
  //     -(depth - adjustedRightDepth) / 2,
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
  //     visibleDtails,
  //     visibleDtails,
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
  //       this.sceneManager.getCabinet().shelfManager.addRod(top, rodModel.position, true);
  //     });
  //   }

  //   // Дно
  //   const bottom = this.createWall(
  //     'bottomCabinet',
  //     width - WALL_THICKNESS * 2,
  //     WALL_THICKNESS,
  //     adjustedDepth - 4, // Вычитаем 4мм для хдф
  //     additionalMaterial,
  //     additionalMaterial,
  //     true, // добавялем флаг, для поперечного наложения
  //     false,
  //   );
  //   bottom.name = 'bottomCabinet';
  //   bottom.position.set(0, PODIUM_HEIGHT / 2 + WALL_THICKNESS / 2, positionBottoom + 2);
  //   group.add(bottom);

  //   // Цоколь
  //   const plinthGroup: THREE.Group = this.createPlinth(isIntegratedHandle, cabinetType);
  //   group.add(plinthGroup);

  //   const hdfSize: Size = {
  //     width: width - WALL_THICKNESS * 2 + 10 * 2 - 0.5 * 2,
  //     height: height - PODIUM_HEIGHT - 1.5 * 2,
  //     depth: DEPTH_EDGE_8MM,
  //   };
  //   const hdf = BaseCabinet.createMeshHdf('cabinetHDF', hdfSize);
  //   hdf.position.set(0, height / 2, -depth / 2 + DEPTH_EDGE_8MM / 2 + 0.4); // -3 если что
  //   hdf.name = 'hdf';
  //   group.add(hdf);

  //   this.dimensionLines.addDimensionLines(width, height, depth, 35);
  //   // Секционные размерные линии
  //   this.dimensionLines.updateSectionHeightLines();
  //   // console.log('DoubleDoorCabinet');
  //   // console.log(group);
  //   return group;
  // }

  public removeCabinet(): void {
    this.sceneManager.clearCabinetGroup(); // Удаляет всю группу шкафа
    this.dimensionLines.removeAllDimensionLines();
  }

  // public override updateCabinetParams(newParams: ICabinet): void {
  //   // console.log('Обновление параметров шкафа', newParams);
  //   this.params = newParams;
  //   const group = this.createCabinet();
  //   console.log(group);
  //   this.sceneManager.setCabinetGroup(group);
  //   this.sceneManager.addObject(group); // Добавить в сцену
  // }
  // public override removeCabinet(): void {
  //   this.sceneManager.clearCabinetGroup(); // Удаляет всю группу шкафа
  //   this.dimensionLines.removeAllDimensionLines();
  // }
}
