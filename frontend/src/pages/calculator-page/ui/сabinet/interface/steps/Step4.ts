import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { ICabinet } from 'src/entities/Cabinet';
import { Shelf, ShelfType } from '../../model/Shelf';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { Rod } from '../../model/Rod';
import {
  Facade,
  FacadeType,
  FacadeTypes,
  HandleType,
  HandleTypeLabels,
  IHandle,
  Mirror,
  PositionCutout,
} from '../../model/Facade';
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
  MATERIALS_TYPES,
  DEEP_04MM,
} from '../../constants';
import { UInterface } from '../UInterface';
import { FacadeManager } from '../../objects/managers/FacadeManager/FacadeManager';
import { CabinetFactory } from '../../objects/factorys/cabinetFactory';
import { HandleFactory } from '../../objects/factorys/HandleFactory';
import e from 'express';
import { BaseCabinet } from '../../cabinetTypes/BaseCabinet';
import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { SingleDoorCabinet } from '../../cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../../cabinetTypes/doubleDoorCabinet';

export class Step4 {
  private gui: GUI;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private sceneManagerService: SceneManagerService;

  // Папки для GUI
  private customizationFolder: dat.GUI | null = null;
  private cutoutFolder: dat.GUI | null = null;
  private materialFolder: dat.GUI | null = null;
  private mirrorFolder: dat.GUI | null = null;
  private handleFolder: dat.GUI | null = null;
  private limitersFolder: dat.GUI | null = null;
  private handleController: dat.GUIController | null = null;
  private handleTypeController: dat.GUIController | null = null;

  private isInitializing = true;

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
    this.isInitializing = true;
    this.initStep4GUI();
    this.isInitializing = false;
  }

  private initStep4GUI(): void {
    const header = document.createElement('div');
    header.innerText = 'ФАСАДЫ';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.color = 'white';
    header.style.margin = '10px 0 5px 10px';
    this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);

    const cabinet = this.sceneManagerService.getCabinet();
    console.log(cabinet.getCabinetParams());
    const cabinetParams = cabinet.getCabinetParams();
    const facades = cabinetParams.components.facades.facadeItems;

    // Общие элементы GUI для всех типов кабинетов
    this.addCommonGUIElements(cabinet, cabinetParams, facades);

    // Специфичные элементы GUI для разных типов кабинетов
    if (cabinetParams.subType === CabinetSubType.Single) {
      this.addSingleCabinetGUI(cabinet, cabinetParams);
    } else if (cabinetParams.subType === CabinetSubType.Double) {
      this.addDoubleCabinetGUI(cabinet, cabinetParams);
    }

    // // Кнопки навигации
    this.addNavigationButtons();
  }

  private addCommonGUIElements(cabinet: SingleDoorCabinet | DoubleDoorCabinet, cabinetParams: ICabinet, facades: Facade[]): void {
    const isDoubleCabinet = cabinetParams.subType === CabinetSubType.Double;

    // Checkbox для отображения фасада
    this.gui
      .add(cabinetParams.components.facades, 'checkBox')
      .name('Фасад')
      .onChange((isEnabled: boolean) => {
        const facadeManager = cabinet.facadeManager;

        // if (!facadeManager.hasDoors()) {
        //   this.addFacade();
        // }
        // console.log('isEnabled: ' + isEnabled);
        // Обновляем видимость существующих фасадов
        facadeManager.updateFacadeVisibility();
        isEnabled ? facadeManager.showFacades() : facadeManager.hideDoors();
      });

    // Чекбокс "Ограничители" с папкой для левой/правой двери
    const limitersController = {
      enabled: facades[0].limiters,
      left: facades[0].limiters !== undefined ? facades[0].limiters : true,
      right: isDoubleCabinet
        ? facades[1].limiters !== undefined
          ? facades[1].limiters
          : true
        : false,
    };

    // Чекбокс "Ограничители"
    if (!isDoubleCabinet) {
      this.gui
        .add(limitersController, 'enabled')
        .name('Ограничители')
        .onChange((enabled: boolean) => {
          if (facades[0].limiters !== enabled) {
            // Проверяем, действительно ли значение изменилось
            facades[0].limiters = enabled;
            cabinet.updateCabinetParams(cabinetParams); // Обновляем только при реальном изменении
          }
        });
    } else {
      this.gui
        .add(limitersController, 'enabled')
        .name('Ограничители')
        .onChange((enabled: boolean) => {
          // Обновляем общий флаг для всех фасадов
          facades.forEach((facade) => {
            facade.limiters = enabled;
          });

          if (enabled) {
            if (!this.limitersFolder) {
              this.limitersFolder = this.gui.addFolder('Настройки ограничителей');

              // Чекбокс для левого фасада (всегда есть)
              this.limitersFolder
                .add(limitersController, 'left')
                .name('Левый фасад')
                .onChange((value: boolean) => {
                  facades[0].limiters = value;
                  cabinet.updateCabinetParams(cabinetParams);
                });

              // Чекбокс для правого фасада (только для double)
              if (isDoubleCabinet) {
                this.limitersFolder
                  .add(limitersController, 'right')
                  .name('Правый фасад')
                  .onChange((value: boolean) => {
                    facades[1].limiters = value;
                    cabinet.updateCabinetParams(cabinetParams);
                  });
              }
            }
            this.limitersFolder.show();
          } else {
            if (this.limitersFolder) {
              this.limitersFolder.hide();
            }
          }
          // Здесь можно добавить логику включения/выключения ограничителей
          cabinet.updateCabinetParams(cabinetParams);
        });
    }

    // Чекбокс "KLOK"

    this.gui
      .add(cabinetParams.components.facades, 'klok')
      .name('KLOK')
      .onChange((enabled: boolean) => {
        if (cabinetParams.components.facades.checkBox !== enabled) {
          cabinetParams.components.facades.checkBox = enabled;
          cabinet.updateCabinetParams(cabinetParams);
        }
      });

    // Чекбокс "Подрезка фасада"
    this.gui
      .add(cabinetParams.features, 'cutoutFacade')
      .name('Подрезка фасада')
      .onChange((enabled: boolean) => {
        this.toggleCutoutFolder(enabled, cabinet, facades, cabinetParams);
      });

    // 🔹 Сразу проверяем, был ли чекбокс включён ранее
    if (cabinetParams.features.cutoutFacade) {
      this.toggleCutoutFolder(true, cabinet, facades, cabinetParams);
    }
    const initialPositionLoops =
      cabinetParams.components.facades.facadeItems[0].positionLoops || 'right-side';

    this.gui
      .add(cabinetParams.components.facades.facadeItems[0], 'positionLoops', {
        'Петли справа': 'right-side',
        'Петли слева': 'left-side',
      })
      .name('Расположение петель')
      .onChange((value: 'left-side' | 'right-side') => {
        // Сохраняем новое значение
        cabinetParams.components.facades.facadeItems[0].positionLoops = value;
        // Обновляем позицию петель на шкафе
        cabinet.facadeManager.updateDoorPositionLoops(value);


        cabinet.updateCabinetParams(cabinetParams);

        if (cabinetParams.components.drawers.drawerBlocks.length > 0) {
          cabinet.drawerManager.updateBlocks(cabinet.getCabinetSize());
        }
      })
      .setValue(initialPositionLoops);
  }

  private toggleCutoutFolder(
    enabled: boolean,
    cabinet: SingleDoorCabinet | DoubleDoorCabinet,
    facades: Facade[],
    cabinetParams: ICabinet,
  ) {
    if (enabled) {
      if (!this.cutoutFolder) {
        this.cutoutFolder = this.gui.addFolder('Настройки подрезки фасада');
        this.cutoutFolder
          .add(facades[0], 'cutHeight', 16, 85) // Вынести числа в константы!!!
          .step(1)
          .name('Высота подрезки (мм)')
          .onChange((newCutHeight: number) => {
            const cabinetSize: Size = cabinet.getCabinetSize();
            cabinet.updateFacadeCutHeightAndFacadeType(newCutHeight, cabinetSize);
          });
      }
      this.cutoutFolder.show();
    } else {
      if (this.cutoutFolder) {
        this.cutoutFolder.hide();
      }
      if (facades[0].cutHeight !== 16) {
        const cabinetSize = cabinet.getCabinetSize();
        cabinet.updateFacadeCutHeightAndFacadeType(16, cabinetSize);
      }
    }
  }

  private addSingleCabinetGUI(cabinet: SingleDoorCabinet | DoubleDoorCabinet, cabinetParams: ICabinet): void {
    const materialOptions = CabinetFactory.getAvailableMaterials();
    const defaultMaterialType =
      cabinetParams.components.facades.facadeItems[0].material?.type || 'ldsp';
    const currentMaterial = MATERIALS_TYPES[defaultMaterialType];

    const materialController = this.gui
      .add({ materialType: currentMaterial }, 'materialType', Object.values(MATERIALS_TYPES))
      .name('Материал фасада')
      .onChange((materialName: string) => {
        this.showMaterialSettings(materialName, cabinet, cabinetParams, materialOptions);
      })
      .setValue(currentMaterial);

    // Вызываем сразу, чтобы открыть настройки при загрузке
    // this.showMaterialSettings(currentMaterial, cabinet, cabinetParams, materialOptions);
  }

  // Вынес логику открытия настроек материала в отдельный метод
  private showMaterialSettings(
    materialName: string,
    cabinet: SingleDoorCabinet | DoubleDoorCabinet,
    cabinetParams: ICabinet,
    materialOptions: MMaterial[],
  ): void {
    const selectedMaterialKey = Object.keys(MATERIALS_TYPES).find(
      (key) => MATERIALS_TYPES[key] == materialName,
    );
    if (!selectedMaterialKey) return;
    const selectedMaterial = materialOptions.find((m) => m.type === selectedMaterialKey);
    if (!selectedMaterial) return;

    cabinetParams.components.facades.facadeItems[0].material = selectedMaterial;
    cabinet.facadeManager.updateDoorMaterial(selectedMaterial);
    cabinet.updateCabinetParams(cabinetParams);

    // Пересоздаём и сразу открываем папку с настройками
    if (this.materialFolder) {
      this.gui.removeFolder(this.materialFolder);
    }
    this.materialFolder = this.gui.addFolder(`Настройки материала: ${materialName}`);
    this.materialFolder.open();

    if (selectedMaterial.type.toLowerCase() === 'mdf') {
      this.updateMDFSettings(this.materialFolder, selectedMaterial);
    } else {
      this.updateLDSPSettings(this.materialFolder, selectedMaterial);
    }
  }

  private addDoubleCabinetGUI(cabinet: BaseCabinet, cabinetParams: ICabinet): void {
    const materialOptions = CabinetFactory.getAvailableMaterials();

    const materialModeController = {
      mode: 'Один материал',
    };

    const handleMaterialModeChange = (selectedMode: string) => {
      if (this.materialFolder) {
        this.gui.removeFolder(this.materialFolder);
        this.materialFolder = null;
      }

      if (selectedMode == 'Один материал') {
        const defaultMaterialType =
          cabinetParams.components.facades.facadeItems[0].material?.type || 'ldsp';

        this.gui
          .add(
            {
              materialType: MATERIALS_TYPES[defaultMaterialType],
            },
            'materialType',
            Object.values(MATERIALS_TYPES),
          )
          .name('Материал фасада (оба)')
          .onChange((materialName: string) => {
            const selectedKey = Object.keys(MATERIALS_TYPES).find(
              (k) => MATERIALS_TYPES[k] == materialName,
            );
            if (!selectedKey) return;
            const selectedMaterial = materialOptions.find((m) => m.type == selectedKey);
            if (!selectedMaterial) return;

            cabinetParams.components.facades.facadeItems.forEach(
              (door) => (door.material = selectedMaterial),
            );
            cabinet.updateCabinetParams(cabinetParams);
            cabinet.facadeManager.updateDoorMaterial(selectedMaterial);

            if (this.materialFolder) {
              this.gui.removeFolder(this.materialFolder);
            }
            this.materialFolder = this.gui.addFolder(`Материал: ${materialName}`);
            this.materialFolder.open();

            if (selectedMaterial.type.toLowerCase() == 'mdf') {
              this.updateMDFSettings(this.materialFolder, selectedMaterial);
            } else {
              this.updateLDSPSettings(this.materialFolder, selectedMaterial);
            }
          })
          .setValue(MATERIALS_TYPES[defaultMaterialType]);
      } else {
        // Два материала: создаём папку для каждой двери
        this.materialFolder = this.gui.addFolder('Материалы фасадов');
        const doors = cabinetParams.components.facades.facadeItems;

        doors.forEach((door, index) => {
          const doorFolder = this.materialFolder!.addFolder(
            `Фасад ${index == 0 ? 'левый' : 'правый'}`,
          );
          const defaultType = door.material?.type || 'ldsp';

          doorFolder
            .add(
              {
                materialType: MATERIALS_TYPES[defaultType],
              },
              'materialType',
              Object.values(MATERIALS_TYPES),
            )
            .name('Материал')
            .onChange((materialName: string) => {
              const key = Object.keys(MATERIALS_TYPES).find(
                (k) => MATERIALS_TYPES[k] == materialName,
              );
              const selected = materialOptions.find((m) => m.type == key);
              if (selected) {
                door.material = selected;
                cabinet.updateCabinetParams(cabinetParams);
                cabinet.facadeManager.updateDoorMaterial(selected); // на всякий случай, можно уточнить на каком фасаде
              }

              // Очистить и обновить вложенные папки
              while (Object.keys(doorFolder.__folders || {}).length > 0) {
                const firstSubfolderName = Object.keys(doorFolder.__folders)[0];
                doorFolder.removeFolder(doorFolder.__folders[firstSubfolderName]);
              }

              const subFolder = doorFolder.addFolder(`Настройки: ${materialName}`);
              subFolder.open();

              if (selected?.type.toLowerCase() == 'mdf') {
                this.updateMDFSettings(subFolder, selected);
              } else {
                this.updateLDSPSettings(subFolder, selected);
              }
            })
            .setValue(MATERIALS_TYPES[defaultType]);

          doorFolder.open();
        });

        this.materialFolder.open();
      }
    };

    this.gui
      .add(materialModeController, 'mode', ['Один материал', 'Два материала'])
      .name('Редактирование фасадов')
      .onChange(handleMaterialModeChange);
    handleMaterialModeChange('Один материал');
  }

  private addNavigationButtons(): void {
    this.gui
      .add(
        {
          next: () => UInterface.getInstance(this.sceneManagerService).goToStep(5),
        },
        'next',
      )
      .name('Далее');
    this.gui
      .add(
        {
          back: () => UInterface.getInstance(this.sceneManagerService).goToStep(3),
        },
        'back',
      )
      .name('Назад');
  }

  private addFacade() {
    const cabinet = this.sceneManagerService.getCabinet();
    const params = cabinet.getCabinetParams();
    const doorParams = params.components.facades.facadeItems[0];

    const { width, height, depth } = params.dimensions.general;
    const cutHeight = doorParams.cutHeight;
    const cabinetType = cabinet.getCabinetType();
    const isIntegratedHandle = cabinet.getFacadeType() == 'INTEGRATED_HANDLE';

    const cabinetSize: Size = { width, height, depth };

    const doorSize = FacadeManager.calculateDoorSize(
      width,
      height - cutHeight - 2, // сверху зазор 2 мм
      isIntegratedHandle,
      cabinetType,
    );

    const leftDoor: Facade = {
      id: 1,
      facadeType: doorParams.facadeType,
      cutHeight,
      size: doorSize,
      originalHeight: doorSize.height,
      positionLoops: 'left-side',
      positionFacade: { x: 0, y: 0, z: 0 },
      material: doorParams.material,
      handle: { ...doorParams.handle },
      countLoops: doorParams.countLoops,
      mirrors: {
        checkbox: false,
        mirrorItems: [],
      },
      limiters: doorParams.limiters,
    };

    const doors: Facade[] = [leftDoor];

    if (cabinetType == CabinetSubType.Double) {
      const rightDoor: Facade = {
        id: 2,
        facadeType: doorParams.facadeType,
        cutHeight,
        size: doorSize,
        originalHeight: doorSize.height,
        positionLoops: 'right-side',
        positionFacade: { x: doorSize.width + INTERVAL_1_MM, y: 0, z: 0 },
        material: doorParams.material,
        handle: { ...doorParams.handle },
        countLoops: doorParams.countLoops,
        limiters: doorParams.limiters,
      };
      doors.push(rightDoor);
    }

    params.components.facades.checkBox = true;
    params.components.facades.facadeItems = doors;
    cabinet.facadeManager.addFacade(leftDoor, cabinet.getCabinetType(), cabinetSize); // <-- Проверить, правильно сохраняется тип
  }

  private updateLDSPSettings(folder: dat.GUI, material: MMaterial): void {
    // Гарантируем, что папка пуста перед добавлением контролов
    this.clearFolder(folder);

    // Удаляем старые отдельные папки ручек/зеркал если они где-то остались
    if (this.handleFolder) this.removeFolderSafe('handleFolder');
    if (this.mirrorFolder) this.removeFolderSafe('mirrorFolder');
    // if (this.handleTypeController) {
    //   folder.remove(this.handleTypeController);
    //   this.handleTypeController = null;
    // }
    // if (this.handleController) {
    //   folder.remove(this.handleController);
    //   this.handleController = null;
    // }

    const cabinet = this.sceneManagerService.getCabinet();
    const allMaterials = CabinetFactory.getAvailableMaterials();
    const ldspMaterials = allMaterials.filter((m) => m.type.toLowerCase() == 'ldsp');
    const mirrorMaterials = allMaterials.filter((m) => m.type.toLowerCase() == 'mirror');
    console.log('mirrorMaterial');
    console.log(mirrorMaterials);
    const cabinetParams = cabinet.getCabinetParams();
    const facadeItems = cabinetParams.components.facades.facadeItems;
    const facadeItem = facadeItems[0];

    const currentFacadeType = facadeItem.facadeType;
    const defaultMaterial =
      ldspMaterials.find((m) => m.name == facadeItem.material.name) || ldspMaterials[0];
    const handleType = HandleFactory.getHandleTypeFromFacadeType(currentFacadeType);
    const defaultHandle = facadeItem.handle || HandleFactory.getDefaultHandle(handleType);

    const materialController = {
      selectedMaterialName: defaultMaterial.name,
      selectedMirrorMaterialName: mirrorMaterials[0]?.name ?? '',
      selectedHandleName: defaultHandle.name,
    };

    // Контрол для типа ручки
    const defaultTypeFacade = currentFacadeType;
    const cabinetType = cabinet.getCabinetType();
    const availableFacadeTypes = Object.entries(FacadeTypes)
      .filter(([key]) => {
        if (cabinetType == CabinetSubType.Single) return key != 'INTEGRATED_HANDLE';
        return true;
      })
      .map(([_, value]) => value);

    folder
      .add({ facadeType: FacadeTypes[defaultTypeFacade] }, 'facadeType', Object.values(FacadeTypes))
      .name('Тип фасада')
      .onChange((facadeTypeLabel: string) => {
        const selectedFacadeType: FacadeType = Object.entries(FacadeTypes).find(
          ([, label]) => label === facadeTypeLabel,
        )?.[0] as FacadeType;

        facadeItems.forEach((facade) => {
          facade.facadeType = selectedFacadeType;
          if (selectedFacadeType !== 'HANDLE') {
            facade.handle = null;
          }
        });

        cabinet.updateDepthForIntegratedHandle(selectedFacadeType);
        cabinet.updateCabinetParams(cabinet.getCabinetParams());

        // применяем изменения только если фасад включен
        if (cabinet.getCabinetParams().components.facades.checkBox) {
          cabinet.updateDepthForIntegratedHandle(selectedFacadeType);
          cabinet.updateCabinetParams(cabinet.getCabinetParams());

          if (selectedFacadeType === 'HANDLE') {
            this.createHandleControllers(folder, materialController, facadeItems, cabinet);
          } else if (selectedFacadeType === 'PUSH_OPENING') {
            this.removeHandleControllers(folder);
            facadeItems.forEach((facade) => (facade.handle = null));
            cabinet.updateCabinetParams(cabinet.getCabinetParams());
            this.redrawFacades();
          } else if (selectedFacadeType === 'INTEGRATED_HANDLE') {
            this.removeHandleControllers(folder);
            facadeItems.forEach((facade) => (facade.handle = null));
            cabinet.updateDepthForIntegratedHandle(selectedFacadeType);
            cabinet.updateCabinetParams(cabinet.getCabinetParams());
          }
        }
      })
      .setValue(FacadeTypes[defaultTypeFacade]);
    // Контрол выбора LDSP материала
    folder
      .add(
        materialController,
        'selectedMaterialName',
        ldspMaterials.map((m) => m.name),
      )
      .name('Цвет материала')
      .onChange((selectedName: string) => {
        const selected = ldspMaterials.find((m) => m.name == selectedName);
        if (selected) {
          facadeItem.material = selected;
          cabinet.updateCabinetParams(cabinet.getCabinetParams());
          cabinet.facadeManager.updateDoorMaterial(selected);
        }
      });

    // === Чекбокс "Зеркало"
    const mirrorCheckboxController = folder
      .add(facadeItem.mirrors, 'checkbox')
      .name('Зеркало')
      .onChange((enabled: boolean) => {
        facadeItems.forEach((facade) => {
          this.toggleMirrorFolder(enabled, materialController, mirrorMaterials, facadeItems);
        });
      });
    // === ДОБАВЛЯЕМ автоинициализацию при входе на шаг 4 ===
    if (facadeItem.mirrors?.checkbox) {
      this.toggleMirrorFolder(true, materialController, mirrorMaterials, facadeItems);
    }
    // ==== Автоинициализация контролов ручек, если фасад уже с ручкой ====
    if (currentFacadeType === 'HANDLE') {
      this.createHandleControllers(folder, materialController, facadeItems, cabinet, handleType);
    }
  }

  private toggleMirrorFolder(
    enabled: boolean,
    materialController: any,
    mirrorMaterials: MMaterial[],
    facadeItems: Facade[],
  ) {
    const cabinet = this.sceneManagerService.getCabinet();
    // убрать старую папку GUI
    if (this.mirrorFolder) {
      this.gui.removeFolder(this.mirrorFolder);
      this.mirrorFolder = null;
    }
    if (enabled) {
      // Включаем чекбокс
      cabinet.getCabinetParams().components.facades.facadeItems.forEach((facade) => {
        if (!facade.mirrors) {
          facade.mirrors = { checkbox: true, mirrorItems: [] as Mirror[] };
        }
        facade.mirrors.checkbox = true;

        // если зеркал нет — добавляем дефолтное
        if (!facade.mirrors.mirrorItems.length) {
          const defaultMirror = mirrorMaterials[0]; // первый материал из списка
          facade.mirrors.mirrorItems.push({
            id: 1,
            name: 'Зеркало',
            size: { ...facade.size }, // используем размеры фасада
            position: {
              // можно ставить в начало фасада
              x: facade.positionFacade.x,
              y: facade.positionFacade.y,
              z: facade.positionFacade.z,
            },
            material: defaultMirror,
          });
        }
      });

      // GUI для выбора материала зеркала
      this.mirrorFolder = this.gui.addFolder('Настройки зеркала');
      this.mirrorFolder.open();
      const controller = this.mirrorFolder
        .add(
          materialController,
          'selectedMirrorMaterialName',
          mirrorMaterials.map((m) => m.name),
        )
        .name('Материал зеркала')
        .onChange((selectedName: string) => {
          const selectedMirror = mirrorMaterials.find((m) => m.name === selectedName);
          if (selectedMirror) {
            facadeItems.forEach((facade) => {
              if (facade.mirrors?.mirrorItems?.length) {
                facade.mirrors.mirrorItems[0].material = selectedMirror;
              }
            });
            cabinet.updateCabinetParams(cabinet.getCabinetParams());
            if (cabinet.getCabinetParams().components.facades.checkBox) {
              this.redrawFacades();
            }
          }
        });
    } else {
      // Снимаем флаг и очищаем массив с резкалами
      facadeItems.forEach((facade) => {
        if (facade.mirrors) {
          facade.mirrors.checkbox = false;
          facade.mirrors.mirrorItems = [];
        }
      });
      cabinet.updateCabinetParams(cabinet.getCabinetParams());
      if (cabinet.getCabinetParams().components.facades.checkBox) {
        this.redrawFacades();
      }
    }
  }
  // ===== Методы для логики ручек =====
  private createHandleControllers(
    folder: dat.GUI,
    materialController: any,
    facadeItems: any[],
    cabinet: SingleDoorCabinet | DoubleDoorCabinet,
    defaultHandleType: HandleType = 'OVERHEAD_HANDLE',
  ): void {
    // Безопасное удаление контролов, только если они реально есть в папке
    if (this.handleTypeController && folder.__controllers.includes(this.handleTypeController)) {
      folder.remove(this.handleTypeController);
    }
    this.handleTypeController = null;

    if (this.handleController && folder.__controllers.includes(this.handleController)) {
      folder.remove(this.handleController);
    }
    this.handleController = null;

    // --- Берём handleType из модели, а не всегда дефолт ---
    const currentHandle = facadeItems[0]?.handle;
    const initialHandleType = currentHandle?.type ?? defaultHandleType;

    const handleTypeObj = { handleType: defaultHandleType };
    const handleTypeOptions = Object.values(HandleTypeLabels);

    this.handleTypeController = folder
      .add(handleTypeObj, 'handleType', handleTypeOptions)
      .name('Тип ручки')
      .onChange((selectedLabel: HandleType) => {
        const handleType = (Object.keys(HandleTypeLabels) as HandleType[]).find(
          (key) => HandleTypeLabels[key] === selectedLabel,
        ) as HandleType;

        if (handleType) {
          this.updateHandleList(folder, materialController, facadeItems, cabinet, handleType);
        }
      })
      .setValue(HandleTypeLabels[initialHandleType]);

    this.updateHandleList(folder, materialController, facadeItems, cabinet, initialHandleType);
  }

  private updateHandleList(
    folder: dat.GUI,
    materialController: any,
    facadeItems: any[],
    cabinet: SingleDoorCabinet | DoubleDoorCabinet,
    handleType: HandleType,
  ): void {
    const handles = HandleFactory.getHandlesByType(handleType);

    if (
      this.handleController &&
      folder.__controllers &&
      folder.__controllers.includes(this.handleController)
    ) {
      folder.remove(this.handleController);
    }
    this.handleController = null;

    // Берём текущее значение из модели
    const currentHandle = facadeItems[0]?.handle;
    const defaultHandle =
      currentHandle && currentHandle.type === handleType ? currentHandle : handles[0];

    this.handleController = folder
      .add(
        materialController,
        'selectedHandleName',
        handles.map((h) => h.name),
      )
      .name('Выбор ручки')
      .onChange((selectedHandleName: string) => {
        const selectedHandle = HandleFactory.getHandleByName(selectedHandleName);
        if (selectedHandle) {
          facadeItems.forEach((facade) => {
            facade.handle = selectedHandle;
            facade.handle.type = handleType;
          });
          cabinet.updateCabinetParams(cabinet.getCabinetParams());

          if (cabinet.getCabinetParams().components.facades.checkBox) {
            this.redrawFacades();
          }
        }
      });

    if (defaultHandle) {
      facadeItems.forEach((facade) => {
        facade.handle = defaultHandle;
        facade.handle.type = handleType;
      });
      materialController.selectedHandleName = defaultHandle.name;
      this.handleController.setValue(defaultHandle.name);
      cabinet.updateCabinetParams(cabinet.getCabinetParams());
    }
  }

  public redrawFacades(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const facadesParams = cabinet.getCabinetParams().components.facades.facadeItems;

    // удалить старые фасады
    cabinet.facadeManager.clearFacades();

    // пересоздать
    facadesParams.forEach((facade) => {
      cabinet
        .facadeManager
        .addFacade(facade, cabinet.getCabinetType(), cabinet.getCabinetSize());
    });
  }

  // хелпер для удаления контролов ручек
  private removeHandleControllers(folder: dat.GUI): void {
    if (this.handleTypeController && folder.__controllers.includes(this.handleTypeController)) {
      folder.remove(this.handleTypeController);
      this.handleTypeController = null;
    }
    if (this.handleController && folder.__controllers.includes(this.handleController)) {
      folder.remove(this.handleController);
      this.handleController = null;
    }
  }

  // ---------- Утилиты для безопасного удаления контролов/папок ----------
  private clearFolder(folder: any): void {
    if (!folder) return;

    // Удаляем все контролы (если есть)
    try {
      while (folder.__controllers && folder.__controllers.length) {
        folder.remove(folder.__controllers[0]);
      }
    } catch (e) {
      // безопасно игнорируем ошибки удаления контролов
      // (иногда контрол уже удалён извне)
    }

    // Рекурсивно очищаем и удаляем все вложенные папки
    if (folder.__folders) {
      const keys = Object.keys(folder.__folders);
      for (const k of keys) {
        const sub = folder.__folders[k];
        this.clearFolder(sub);
        try {
          // Удаляем вложенную папку через GUI (используется у тебя в проекте)
          this.gui.removeFolder(sub);
        } catch (e) {
          // игнорируем
        }
      }
    }
  }
  // /**
  //  * Безопасно удаляет папку и сбрасывает соответствующие ссылки-контролы.
  //  * folderRefName — строка поля this, например: 'materialFolder', 'handleFolder', 'mirrorFolder'
  //  */
  private removeFolderSafe(
    folderRefName:
      | 'materialFolder'
      | 'handleFolder'
      | 'mirrorFolder'
      | 'limitersFolder'
      | 'cutoutFolder',
  ): void {
    const folder = (this as any)[folderRefName];
    if (!folder) return;

    this.clearFolder(folder);
    try {
      this.gui.removeFolder(folder);
    } catch (e) {
      // Если gui.removeFolder нетили он упадёт — безопасно игнорируем
    }

    // обнуляем ссылки на папку и связанные контролы
    (this as any)[folderRefName] = null;

    if (folderRefName === 'handleFolder') {
      this.handleController = null;
      this.handleTypeController = null;
    }
    if (folderRefName === 'mirrorFolder') {
      // никаких дополнительных контролов сейчас не храним
    }
  }

  private updateMDFSettings(folder: dat.GUI, material: MMaterial): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const mdfMaterials = CabinetFactory.getAvailableMaterials().filter(
      (m) => m.type.toLowerCase() == 'mdf',
    );

    const currentFacadeType =
      cabinet.getCabinetParams().components.facades.facadeItems[0].facadeType;
    let currentFacadeLabel = 'МДФ';

    if (currentFacadeType == 'INTEGRATED_HANDLE') {
      currentFacadeLabel = ' Интегрированной ручкой';
    }
  }

  public updateDoorFasade(newFasade: FacadeType, material: MMaterial, handle: IHandle): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetSize: Size = {
      width: cabinet.getCabinetParams().dimensions.general.width,
      height: cabinet.getCabinetParams().dimensions.general.height,
      depth: cabinet.getCabinetParams().dimensions.general.depth,
    };

    const doorType: CabinetSubType = cabinet.getCabinetType();
    const isIntegratedHandle = newFasade == 'INTEGRATED_HANDLE';
    const doorSize: Size = FacadeManager.calculateDoorSize(
      cabinetSize.width,
      cabinetSize.height,
      isIntegratedHandle,
      doorType,
    );

    const newDoor: Facade = {
      id: cabinet.getCabinetParams().components.facades.facadeItems.length,
      facadeType: newFasade,
      cutHeight: cabinet.getCabinetParams().components.facades.facadeItems[0].cutHeight,
      material: material,
      handle: handle,
      countLoops: cabinet.getCabinetParams().components.facades.facadeItems[0].countLoops,
      size: doorSize,
      positionFacade: { x: 0, y: 0, z: 0 },
      positionLoops: cabinet.getCabinetParams().components.facades.facadeItems[0].positionLoops,
      mirrors: {
        checkbox: true,
        mirrorItems: [],
      },
      limiters: cabinet.getCabinetParams().components.facades.facadeItems[0].limiters,
    };

    cabinet.updateCabinetSize(cabinet.getCabinetParams().dimensions.general);
    cabinet.getCabinetParams().components.facades.facadeItems[0].facadeType = newFasade;
    cabinet.updateCabinetParams(cabinet.getCabinetParams());

    if (cabinet.getCabinetParams().components.facades.checkBox) {
      cabinet.updateFacade(newDoor, cabinet.getCabinetType(), cabinetSize);
    } else {
      cabinet.facadeManager.updateDoorFasade(newFasade);
      cabinet.facadeManager.clearSceneFacades();
    }
  }

  //   /**
  //  * Обновляет вырезы в полках при изменении расположения петель
  //  */
  private updateShelfCutoutsForHinges(cabinet: SingleDoorCabinet | DoubleDoorCabinet, newPositionLoops: 'left-side' | 'right-side'): void {
    const shelfManager = cabinet.shelfManager;
    const shelves = shelfManager.getShelves();

    // Получаем материал для полок
    const shelfMaterial = cabinet.getCabinetParams().appearance.visibleDtails;
    const material = BaseCabinet.getMaterial(shelfMaterial.texture.path);

    shelves.forEach((shelf: THREE.Object3D) => {
      if (shelf.userData['type'] === 'cutout') {
        // Удаляем старые вырезы
        shelfManager.removeCutoutForHinge(shelf);

        // Добавляем новые вырезы в соответствии с новым положением петель
        shelfManager.addCutoutForHinge(shelf as THREE.Mesh, newPositionLoops, material);

        // Обновляем кромку полки
        shelfManager.updateShelfEdge(
          shelf,
          shelf.userData['type'] as ShelfType,
          newPositionLoops
        );

        // ОБНОВЛЯЕМ МОДЕЛЬ ДАННЫХ
        this.updateShelfModelCutout(cabinet, shelf, newPositionLoops);
      }
    });
  }

  //  /**
  //  * Обновляет положение выреза в модели данных полки
  //  */
  private updateShelfModelCutout(cabinet: SingleDoorCabinet | DoubleDoorCabinet, shelf: THREE.Object3D, positionCutout: PositionCutout): void {
    const shelfId = shelf.userData['id'];
    if (!shelfId) return;

    const shelfItems = cabinet.getCabinetParams().components.shelves.shelfItems;
    const shelfModel = shelfItems.find((item: any) => item.id === shelfId);

    if (shelfModel) {
      shelfModel.positionCutout = positionCutout;
      console.log(`Updated shelf model cutout: id=${shelfId}, positionCutout=${positionCutout}`);
    }
  }
}
