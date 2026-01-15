import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { ICabinet } from 'src/entities/Cabinet';
import { Shelf, ShelfType } from '../../model/Shelf';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { Rod } from '../../model/Rod';
import { Facade, PositionCutout } from '../../model/Facade';
import { calculateDrawerElements, Drawer, DrawerBlock, FullDrawerBlockSize, FullDrawerSize } from '../../model/Drawers';

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
  CRITICAL_SECTION_WIDTH,
  MIN_SECTION_WIDTH,
} from '../../constants';
import { UInterface } from '../UInterface';
import { FacadeManager } from '../../objects/managers/FacadeManager/FacadeManager';
import { Mullion } from '../../model/Mullion';
import { IntersectionManagerService } from '../../../services/IntersectionManagerService.service';
import { Position, Size } from '../../model/BaseModel';
import { WarningBoard } from '../../warnings/WarningBoard';
import { CabinetSubType } from 'src/entities/Cabinet/model/types/cabinet.model';


export class Step3 {
  private gui: GUI;

  private shelfFolder: dat.GUI | null = null;
  private drawerFolder: dat.GUI | null = null;
  private mullionFolder: dat.GUI | null = null;
  private sceneManagerService: SceneManagerService;
  private mullionPosition: number | null = null;
  private warningBoard: WarningBoard | null = null;

  constructor(gui: GUI, sceneManagerService: SceneManagerService) {
    this.gui = gui;
    this.applyStyles();
    // cabinet.getCabinetParams() = cabinetParams;
    this.sceneManagerService = sceneManagerService;
  }

  private applyStyles(): void {
    const guiElement = this.gui.domElement;
    guiElement.classList.add('dat-gui'); // класс для настройки отображения
    guiElement.style.position = 'absolute';
    guiElement.style.top = '100px';
    guiElement.style.right = '10px';
    guiElement.style.width = '400px !important';
    guiElement.style.background = 'rgba(0, 0, 0, 0.8)';
    guiElement.style.borderRadius = '10px';
    guiElement.style.color = 'white';
    guiElement.style.fontFamily = 'Arial, sans-serif';
    // console.log('Применение стилей к GUI:', guiElement);
  }

  public init(): void {
    this.initStep3GUI();
  }

  private initStep3GUI(): void {
    const header = document.createElement('div');
    header.innerText = 'ШАГ 3';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.color = 'white';
    header.style.margin = '10px 0 5px 10px';
    this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);
    const cabinet = this.sceneManagerService.getCabinet();
    // this.gui
    //   .add(cabinet.getCabinetParams().components.shelves, 'checkBox')
    //   .name('Полки')
    //   .onChange((isEnabled: boolean) => {
    //     if (isEnabled) {
    //       this.createShelfControllers();
    //     } else {
    //       this.removeShelfFolder();
    //       cabinet.removeShelves();
    //     }
    //   });

    // if (cabinet.getCabinetParams().components.shelves.checkBox) {
    //   this.createShelfControllers();
    // }

    if (
      cabinet.getCabinetParams().subType == CabinetSubType.Double ||
      cabinet.getCabinetParams().subType == CabinetSubType.Showcase
    ) {
      this.gui
        .add(cabinet.getCabinetParams().components.mullion, 'checkBox')
        .name('Средник')
        .onChange((isEnabled: boolean) => {
          if (isEnabled) {
            this.createMullion();
          } else {
            this.removeMullion();
          }
        });

      // 🔹 Автозагрузка контроллера, если чекбокс уже включен
      if (cabinet.getCabinetParams().components.mullion.checkBox) {
        this.createMullion();
      }
    }

    // this.gui
    //   .add(cabinet.getCabinetParams().components.drawers, 'checkBox')
    //   .name('Ящики')
    //   .onChange((isEnabled: boolean) => {
    //     if (isEnabled) {
    //       this.createDrawerControllers();
    //     } else {
    //       this.removeDrawerFolder();
    //       cabinet.removeBox();
    //     }
    //   });
    // if (cabinet.getCabinetParams().components.drawers.checkBox) {
    //   this.createDrawerControllers();
    // }

    this.gui.add({ update: () => this.updateFullCabinet() }, 'update').name('Обновить шкаф');

    this.gui
      .add(
        {
          next: () => UInterface.getInstance(this.sceneManagerService).goToStep(4),
        },
        'next',
      )
      .name('Далее');
    this.gui
      .add(
        {
          next: () => {
            // cabinet.getCabinetParams() = this.sceneManagerService.getCabinet().getCabinetParams();

            // this.sceneManagerService.getCabinet().updateCabinetParams(cabinet.getCabinetParams());

            // console.log('SHELVES ITEMS!', cabinet.getCabinetParams().components.shelves.shelfItems);
            this.sceneManagerService.setProduct(cabinet.getCabinetParams());
            console.log('Перед переходом:', cabinet.getFacadeType());
            console.log('Глубина шкафа:', cabinet.getCabinetParams().dimensions.general.depth);
            console.log('Глубина средника:', cabinet.getMullion());
            UInterface.getInstance(this.sceneManagerService).goToStep(2);
          },
        },
        'next',
      )
      .name('Назад');
  }

  // private createShelfControllers(): void {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (this.shelfFolder) return; // уже открыт
  //   this.shelfFolder = this.gui.addFolder('Контроллер полок');

  //   // Выпадающий список для выбора типа выреза или утопления

  //   this.shelfFolder.add({ addShelf: () => this.addShelf() }, 'addShelf').name('Добавить полку');
  // }

  // private removeShelfFolder(): void {
  //   if (this.shelfFolder) {
  //     this.gui.removeFolder(this.shelfFolder);
  //     this.shelfFolder = null; // Обнуляем ссылку
  //   }
  // }

  // private createDrawerControllers(): void {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   if (this.drawerFolder) return;

  //   this.drawerFolder = this.gui.addFolder('Контроллер ящиков');

  //   this.drawerFolder
  //     .add({ addDrawer: () => this.addBlockDrawer() }, 'addDrawer')
  //     .name('Добавить ящик');
  // }

  private removeDrawerFolder(): void {
    if (this.drawerFolder) {
      this.gui.removeFolder(this.drawerFolder);
      this.drawerFolder = null;
    }
  }

  private addShelf(): void {
    // const confirmAdd = window.confirm('Вы уверены, что хотите добавить полку?');

    const cabinet = this.sceneManagerService.getCabinet();
    const { width, height, depth } = cabinet.getCabinetParams().dimensions.general;

    const isIntegratedHandle = cabinet.getFacadeType() == 'INTEGRATED_HANDLE';
    const depthOffset = isIntegratedHandle
      ? depth - DEPTH_WIDTH_INTG_HADLE - 4 - 5 - 0.8
      : depth - 4 - 5 - 0.8;

    const zPosition = isIntegratedHandle
      ? -DEPTH_WIDTH_INTG_HADLE / 2 + 2 - 2.5 - 0.4
      : 2 - 2.5 - 0.4;

    // if (confirmAdd) {

    // }
    const nextPosition = this.calculateNextShelfPosition();

    // Округляем позицию до шага 32 мм
    // const roundedPosition = Math.round(nextPosition / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;
    // console.log('roundedPosition: ', roundedPosition);
    const yPosition = nextPosition;
    console.log('yPosition: ', yPosition);
    if (yPosition + SHELF_POSITION_OFFSET >= height) {
      alert('Недостаточно места для добавления новой полки.');
      return;
    }

    const newId = cabinet.shelfManager.getNextShelfId();
    const newShelf: Shelf = {
      id: newId,
      size: {
        width: width - WALL_THICKNESS * 2,
        height: SHELF_HEIGHT,
        depth: depthOffset,
      },
      material: cabinet.getCabinetParams().appearance.additionColor,
      position: { x: 0, y: yPosition, z: zPosition },
      cutout: 'cutout',
      positionCutout: cabinet.getCabinetParams().components.facades.facadeItems[0].positionLoops,
      countCutout: 0,
    };
    console.log('Position new shelf: ', yPosition);
    cabinet.getCabinetParams().components.shelves.checkBox = true;
    cabinet.getCabinetParams().components.shelves.shelfItems.push(newShelf);
    cabinet.addShelf(newShelf);
    cabinet.updateMullion();
  }

  private calculateNextShelfPosition(): number {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetHeight = cabinet.getCabinetParams().dimensions.general.height;
    if (cabinet.getCabinetParams().components.shelves.shelfItems.length == 0) {
      // Вычисляем середину шкафа (от подиума до верха)
      const availableHeight = cabinetHeight - PODIUM_HEIGHT - WALL_THICKNESS;
      const middlePosition = PODIUM_HEIGHT + availableHeight / 2;
      console.log('middlePosition:', middlePosition);
      // Находим ближайшую позицию, кратную 32, к середине шкафа
      const middleSnapped =
        Math.round(middlePosition / SHELF_POSITION_OFFSET) * SHELF_POSITION_OFFSET;

      // Добавляем 256 к позиции в середине
      return 1269; // 256 + middleSnapped;
    } else {
      const shelfItems = cabinet.getCabinetParams().components.shelves.shelfItems;
      return shelfItems[shelfItems.length - 1].position.y + SHELF_POSITION_OFFSET;
    }
  }

  private createMullion(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const savedMullion = cabinet.getCabinetParams().components.mullion;

    const typeIntegrated = cabinet.getFacadeType();
    const isIntegratedHandle = typeIntegrated == 'INTEGRATED_HANDLE';

    // Если есть сохранённая позиция, берём её, иначе по умолчанию 0
    const xPosition = savedMullion?.position?.x ?? 0;
    const yPosition = cabinet.getCabinetHeight() / 2;
    const zPosition = isIntegratedHandle
      ? -DEPTH_WIDTH_INTG_HADLE / 2 + 2 - 2.5 + 1 + 0.4
      : 2 - 2.5 + 1 + 0.4;

    const depthOffset = isIntegratedHandle
      ? cabinet.getCabinetDepth() - DEPTH_WIDTH_INTG_HADLE
      : cabinet.getCabinetDepth();

    const sizeMullion: Size = {
      width: WALL_THICKNESS,
      height: cabinet.getCabinetHeight() - WALL_THICKNESS * 2 - PODIUM_HEIGHT,
      depth: depthOffset - 0.8 - 4 - 5,
    };

    const newMullion: Mullion = {
      checkBox: true,
      position: { x: xPosition, y: yPosition, z: zPosition },
      material: cabinet.getCabinetParams().appearance.additionColor,
      size: sizeMullion,
    };

    // 🔹 Сохраняем в модель
    cabinet.getCabinetParams().components.mullion = newMullion;

    cabinet.createMullion(newMullion);
    const plinthCenter = this.sceneManagerService.getPlinthCenter();
    cabinet.addLegsToCenterPanel(plinthCenter);

    if (!this.mullionFolder) {
      this.mullionFolder = this.gui.addFolder('Контроллер средника');

      const mullion = cabinet.getCabinetParams().components.mullion;
      const cabinetWidth = cabinet.getCabinetWidth();
      const halfCabinet = cabinetWidth / 2;
      const minX = -(halfCabinet - 150 - 16 - 8);
      const maxX = +(halfCabinet - 150 - 16 - 8);

      this.mullionFolder
        .add(mullion.position, 'x', minX, maxX)
        .step(1)
        .name('Позиция X (от центра)')
        .onChange((value: number) => {
          // Обновляем позицию и сохраняем в модель
          mullion.position.x = value;
          cabinet.getCabinetParams().components.mullion.position.x = value;

          cabinet.updateMullionPositionX(value);

          const plinthCenter = cabinet.mullionManager.getPlinthCenter();
          if (plinthCenter) {
            plinthCenter.position.x =
              value == 0
                ? value + WALL_THICKNESS
                : value + (value < 0 ? WALL_THICKNESS : -WALL_THICKNESS);
            cabinet.addLegsToPanel(plinthCenter);
          }

          // Проверка расстояния до боковины
          const halfCabinet = cabinet.getCabinetWidth() / 2;
          const distanceToSide = halfCabinet - Math.abs(value);

          this.checkMullionProximity();

          IntersectionManagerService.checkMullionIntersections(
            cabinet.getMullion(),
            this.sceneManagerService.getScene(),
          );

          // cabinet
          //   .getDimensionLine()
          //   .updateDimensionLines(
          //     cabinet.getCabinetSize().width,
          //     cabinet.getCabinetSize().height,
          //     cabinet.getCabinetSize().depth,
          //     35,
          //   );


          const shelvesMap = new Map<number, THREE.Object3D>();
          this.sceneManagerService
            .getCabinet()
            .shelfManager.getShelves()
            .forEach((shelf, position) => {
              shelvesMap.set(position, shelf);
            });
          const width = this.sceneManagerService.getCabinet().getCabinetSize().width;
          const height = this.sceneManagerService.getCabinet().getCabinetSize().height;
          // cabinet
          //   .getDimensionLine()
          //   .updateAllShelfDimensionLines([...shelvesMap.values()], width, height);

          cabinet.updateShelfSize(
            cabinet.getCabinetSize().width,
            cabinet.getCabinetSize().height,
            cabinet.getCabinetSize().depth,
          );

          // Пересчёт ящиков при движении средника
          this.updateDrawersOnMullionMove(value);
          cabinet.dimensionLines.updateSectionHeightLines();
          cabinet.dimensionLines.updateInnerWidthLines();


        });
        cabinet.dimensionLines.updateSectionHeightLines();
        cabinet.dimensionLines.updateInnerWidthLines();

    }
  }

  /**
 * Пересчитывает блоки с ящиками при изменении позиции средника.
 */
  private updateDrawersOnMullionMove(mullionX: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const hasMullion = cabinet.hasMullion();
    if (!hasMullion) return;

    const drawerManager = cabinet.drawerManager;
    if (!drawerManager) return;

    const cabinetSize = cabinet.getCabinetParams().dimensions.general;


    // Обновляем блоки с ящиками через общий метод DrawerManager
    drawerManager.updateBlocks(cabinetSize);

    console.log('🔄 Ящики пересчитаны после перемещения средника');
  }

  private checkMullionProximity() {
    const cabinet = this.sceneManagerService.getCabinet();
    const mullionPosition = cabinet.getMullion().position.x;
    const width = cabinet.getCabinetParams().dimensions.general.width;
    const minDistance = 300;

    const isTooClose = Math.abs(mullionPosition) > width / 2 - minDistance;

    if (isTooClose && !this.warningBoard) {
      // Создаём предупреждение только если его ещё нет
      this.warningBoard = new WarningBoard('Средник слишком близко к боковой стенке (<300 мм)');
    } else if (!isTooClose && this.warningBoard) {
      // Удаляем предупреждение когда расстояние стало нормальным
      this.warningBoard.destroy();
      this.warningBoard = null;
    }
  }

  private removeMullion(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    this.mullionPosition = null;
    cabinet.mullionManager.removeMullion();
    this.removeMullionFolder();

    // Обновляем полки
    const shelves = cabinet.shelfManager.getShelves();
    shelves.forEach((shelf) => {
      const width = cabinet.getCabinetWidth() - WALL_THICKNESS * 2;
      const height = SHELF_HEIGHT;
      const depth = cabinet.getCabinetDepth() - 4 - 5;
      const size = { width, height, depth };
      shelf.position.x = 0;
      cabinet.shelfManager.updateShelfSizeByShelf(size, shelf);
      this.sceneManagerService
        .getCabinet()
        .shelfManager
        .updateShelfEdge(
          shelf,
          shelf.userData['type'] as ShelfType,
          shelf.userData['positionHinges'] as PositionCutout,
        );
    });

    // Обновляем ящики
    // this.updateBlocks(
    //   {
    //     width: cabinet.getCabinetWidth(),
    //     height: cabinet.getCabinetHeight(),
    //     depth: cabinet.getCabinetDepth(),
    //   },

    // );

    // Обновляем размерные линии
    cabinet.dimensionLines.updateSectionHeightLines();

    // Чистим ножки в центре
    const plinthCenter = this.sceneManagerService.getScene().getObjectByName('plinthCenter');
    if (plinthCenter) {
      for (let i = plinthCenter.children.length - 1; i >= 0; i--) {
        const child = plinthCenter.children[i];
        if (child.name === 'cabinetLeg') {
          plinthCenter.remove(child);
        }
      }
    }
  }



  /**
   * Преобразует тип секции в строку для positionLoops
   */
  private getPositionLoops(targetSection: 'left' | 'right' | 'center'): string {
    switch (targetSection) {
      case 'right': return 'right-side';
      case 'left': return 'left-side';
      case 'center': return 'right-side'; // По умолчанию, как в оригинальном коде
      default: return 'right-side';
    }
  }

  /**
 * Удаляет папку контроллера средника из GUI
 */
private removeMullionFolder(): void {
  if (this.mullionFolder) {
    this.gui.removeFolder(this.mullionFolder);
    this.mullionFolder = null;
  }
}

  private updateFullCabinet(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    // cabinet.updateSize(
    //   cabinet.getCabinetParams().dimensions.general.width,
    //   cabinet.getCabinetParams().dimensions.general.height,
    //   cabinet.getCabinetParams().dimensions.general.depth,
    // );
    cabinet.getCabinetParams().components.shelves.checkBox = false;
    cabinet.getCabinetParams().components.mullion.checkBox = false;
    cabinet.getCabinetParams().components.drawers.checkBox = false;
    cabinet.updateMaterialCabinet(cabinet.getCabinetParams().appearance.visibleDtails);

    cabinet.getCabinetParams().components.shelves.shelfItems = [];
    cabinet.getCabinetParams().components.drawers.drawerBlocks = [];
    this.mullionPosition = null;
    cabinet.mullionManager.removeMullion();
    cabinet.shelfManager.removeAllShelves();
    cabinet.removeDrawerBlocks();
    cabinet.facadeManager.clearSceneFacades();
    // this.removeShelfFolder();
    // this.removeShelfControllers();

    cabinet.updateOtherFeatures({
      cutoutPlinth: cabinet.getCabinetParams().features.cutoutPlinth,
      lighting: cabinet.getCabinetParams().features.lighting,
    });

    cabinet.build();

    this.gui.updateDisplay();
  }
}
