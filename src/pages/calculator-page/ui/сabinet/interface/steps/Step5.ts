import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { ICabinet } from 'src/entities/Cabinet';
import { Shelf } from '../../model/Shelf';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { Rod } from '../../model/Rod';
import { Facade } from '../../model/Facade';
import { Drawer, DrawerBlock } from '../../model/Drawers';

import {
  SHELF_POSITION_OFFSET,
  SHELF_HEIGHT,
  WALL_THICKNESS,
  DEEP_DRAVER_IN_CABINET,
  PODIUM_HEIGHT,
  INTERVAL_1_MM,
  DEPTH_WIDTH_INTG_HADLE,
  CLEARANCE,
  SHELF_MIN_POSITION,
  SHELF_MAX_POSITION_OFFSET,
} from '../../constants';
import { UInterface } from '../UInterface';
import { FacadeManager } from '../../objects/managers/FacadeManager/FacadeManager';
import { CabinetFactory } from '../../objects/factorys/cabinetFactory';
import { MMaterial } from 'src/entities/Cabinet/model/types/cabinet.model';

export class Step5 {
  private gui: GUI;
  private customizationFolder: dat.GUI | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private sceneManagerService: SceneManagerService;

  constructor(gui: GUI, sceneManagerService: SceneManagerService) {
    this.gui = gui;
    this.applyStyles();
    this.sceneManagerService = sceneManagerService;
  }

  private applyStyles(): void {
    const guiElement = this.gui.domElement;
    guiElement.classList.add('dat-gui');
    guiElement.style.position = 'absolute';
    guiElement.style.top = '100px';
    guiElement.style.right = '10px';
    guiElement.style.width = '400px !important';
    guiElement.style.background = 'rgba(0, 0, 0, 0.8)';
    guiElement.style.borderRadius = '10px';
    guiElement.style.color = 'white';
    guiElement.style.fontFamily = 'Arial, sans-serif';
  }

  public init(): void {
    this.initStep5GUI();
  }

  private initStep5GUI(): void {
    const header = document.createElement('div');
    header.innerText = 'КАСТОМИЗАЦИЯ';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.color = 'white';
    header.style.margin = '10px 0 5px 10px';
    this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);

    const cabinetParams = this.sceneManagerService.getCabinet().getCabinetParams();

    const materialOptions = CabinetFactory.getAvailableMaterials().filter(
      (material) => material.type.toLowerCase() === 'ldsp',
    );
    const colorOptions = CabinetFactory.getColors();

    const mainColorController = {
      selectedMaterialName: cabinetParams.appearance.visibleDtails.name,
    };

    this.gui
      .add(
        mainColorController,
        'selectedMaterialName',
        materialOptions.map((m) => m.name),
      )
      .name('Основ. цвет')
      .onChange((materialName: string) => {
        const selectedMaterial = materialOptions.find((m) => m.name == materialName);
        if (selectedMaterial) {
          // Обновляем основной цвет
          cabinetParams.appearance.visibleDtails = selectedMaterial;
          this.sceneManagerService.getCabinet().updateGeneralMaterial(selectedMaterial);

          // Обновляем доп. цвет и видимые детали
          cabinetParams.appearance.additionColor = selectedMaterial;
          this.sceneManagerService.getCabinet().updateAdditionMaterial(selectedMaterial);
          this.sceneManagerService.getCabinet().updateVisibleMaterial(selectedMaterial);

          // Если кастомизация активна и доп. контроллеры отображаются — обновить GUI
          if (this.customizationFolder) {
            this.gui.removeFolder(this.customizationFolder);
            this.customizationFolder = null;
            this.showCustomizationOptions(); // Пересоздаём с новыми значениями
          }
        }
      });

    const customizationController = {
      enabled: cabinetParams.appearance.customization ?? false,
    };

    this.gui
      .add(customizationController, 'enabled')
      .name('Кастомизация')
      .onChange((value: boolean) => {
        cabinetParams.appearance.customization = value;
        if (value) {
          this.showCustomizationOptions();
        } else {
          this.hideCustomizationOptions();
        }
      });
    if (cabinetParams.appearance.customization) {
      this.showCustomizationOptions();
    }
    this.gui
      .add(
        {
          next: () => this.createOrfer(),
        },
        'next',
      )
      .name('Создать заказ');

    this.gui
      .add(
        {
          next: () => {
            UInterface.getInstance(this.sceneManagerService).goToStep(4);
          },
        },
        'next',
      )
      .name('Назад');
  }

  private showCustomizationOptions(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (this.customizationFolder) return;

    const materialOptions = this.getMaterialsByType('ldsp');
    const colorOptions = CabinetFactory.getColors();

    this.customizationFolder = this.gui.addFolder('Доп. параметры');
    this.customizationFolder.open();

    const additionalColorController = {
      selectedMaterialName: cabinet.getCabinetParams().appearance.additionColor.name,
    };

    this.customizationFolder
      .add(
        additionalColorController,
        'selectedMaterialName',
        materialOptions.map((m) => m.name),
      )
      .name('Доп. цвет')
      .onChange((materialName: string) => {
        const selectedMaterial = materialOptions.find((m) => m.name == materialName);
        if (selectedMaterial) {
          cabinet.updateAdditionMaterial(selectedMaterial);
        }
      });

    const visibleDtails = {
      selectedMaterialName: cabinet.getCabinetParams().appearance.visibleDtails.name,
    };

    this.customizationFolder
      .add(
        visibleDtails,
        'selectedMaterialName',
        materialOptions.map((m) => m.name),
      )
      .name('Видимые детали')
      .onChange((materialName: string) => {
        const selectedMaterial = materialOptions.find((m) => m.name == materialName);
        if (selectedMaterial) {
          cabinet.updateVisibleMaterial(selectedMaterial);
        }
      });

    // const panelController = {
    //   selectedMaterialName: cabinetParams.appearance.material.name,
    // };

    // this.customizationFolder
    //   .add(
    //     panelController,
    //     'selectedMaterialName',
    //     materialOptions.map((m) => m.name),
    //   )
    //   .name('Материал панели у фасада с инт. ручкой')
    //   .onChange((materialName: string) => {
    //     const selectedMaterial = materialOptions.find((m) => m.name === materialName);
    //     if (selectedMaterial) {
    //     }
    //   });
  }

  private getMaterialsByType(type: string): MMaterial[] {
    return CabinetFactory.getAvailableMaterials().filter(
      (material) => material.type.toLowerCase() === type.toLowerCase(),
    );
  }

  private hideCustomizationOptions(): void {
    if (this.customizationFolder) {
      this.gui.removeFolder(this.customizationFolder);
      this.customizationFolder = null;
    }
  }

  private createOrfer(): void {
    const confirmAdd = window.confirm('Вы уверены, что хотите создать заказ?');
    if (confirmAdd) {
      console.log('________________________________CABINET-PARAMS________________________________');
      console.log(this.sceneManagerService.getCabinet().getCabinetParams());
      console.log('_____________________________________END______________________________________');
    }
  }
}
