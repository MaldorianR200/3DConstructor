import { GUI } from 'dat.gui';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { ICabinet } from 'src/entities/Cabinet';
import { CabinetFactory } from '../../objects/factorys/cabinetFactory';
import {
  HEIGHT_RANGE,
  DEPTH_OPTIONS,
  INTERVAL_1_MM,
  PODIUM_HEIGHT,
  WALL_THICKNESS,
  TYPE_MATERIAL,
  SINGLE_STEP,
  DOUBLE_STEP,
  SNOWCASE_STEP,
  MANUFACTURER_LDSP,
  MATERIALS_TYPES,
  CLEARANCE,
  SHELF_HEIGHT,
} from '../../constants';
import * as THREE from 'three';
import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { Facade, FacadeType, FacadeTypes, IHandle } from '../../model/Facade';
import { UInterface } from '../UInterface';
import { FacadeManager } from '../../objects/managers/FacadeManager/FacadeManager';
import { RodType } from '../../model/Rod';
import { BaseCabinet } from '../../cabinetTypes/BaseCabinet';

export class Step2 {
  private gui: GUI;
  // private cabinetParams: ICabinet;
  private cabinet: BaseCabinet;

  // Папки для GUI
  private cutoutFolder: dat.GUI | null = null;

  constructor(
    gui: GUI,
    private sceneManagerService: SceneManagerService,
  ) {
    this.gui = gui;
    this.applyStyles();
  }

  public init(): void {
    this.initControls();
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

  // private clearGUI(): void {
  //   this.gui.destroy();
  //   this.gui = new GUI();
  // }

  private initControls(): void {
    const header = document.createElement('div');
    header.innerText = 'ШАГ 2';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.color = 'white';
    header.style.margin = '10px 0 5px 10px';
    this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);

    const cabinet = this.sceneManagerService.getCabinet();

    console.log(
      'После перехода в Step2:',
      cabinet.getCabinetParams().components.facades.facadeItems[0].facadeType,
    );
    console.log('Глубина шкафа:', cabinet.getCabinetParams().dimensions.general.depth);
    console.log('Глубина средника:', cabinet.getMullion());
    // console.log('Проверяем материал фасада в модели:\n', cabinet.getCabinetParams());
    const materialOptions = CabinetFactory.getAvailableMaterials();
    const widthRange = this.getWidthRange(cabinet.getCabinetParams().type);
    // Определяем текущий материал из cabinetParams или ставим "ЛДСП" по умолчанию
    const defaultMaterialType =
      cabinet.getCabinetParams().components.facades.facadeItems[0].material?.type || 'ldsp';

    const widthController = this.gui
      .add(cabinet.getCabinetParams().dimensions.general, 'width', widthRange.min, widthRange.max)
      .name('Ширина (мм)');
    const heightController = this.gui
      .add(
        cabinet.getCabinetParams().dimensions.general,
        'height',
        HEIGHT_RANGE.min,
        HEIGHT_RANGE.max,
      )
      .name('Высота (мм)');
    const depthController = this.gui
      .add(cabinet.getCabinetParams().dimensions.general, 'depth', DEPTH_OPTIONS)
      .name('Глубина (мм)');

    // this.setStep(widthController, heightController);

    widthController.onChange(async (newWidth: number) => {
      cabinet.getCabinetParams().dimensions.general.width = newWidth;
      cabinet.updateCabinetParams(cabinet.getCabinetParams());
      // Обновляем шаг при изменении ширины
      this.setStep(widthController, heightController);

      if (cabinet.shelfManager.getShelves().length != 0) {
        cabinet.updateShelfSize(
          newWidth,
          cabinet.getCabinetParams().dimensions.general.height,
          cabinet.getCabinetParams().dimensions.general.depth,
        );
        // cabinet.updateRodSize(cabinet.getCabinetSize());
      }
      cabinet.updateMullionSize(
        newWidth,
        cabinet.getCabinetParams().dimensions.general.depth,
        cabinet.getCabinetParams().dimensions.general.height - 2 * SHELF_HEIGHT - PODIUM_HEIGHT,
      );
      cabinet.updateFacadeSize(
        newWidth,
        cabinet.getCabinetParams().dimensions.general.height,
        cabinet.getCabinetParams().dimensions.general.depth,
      );
      if (cabinet.getCabinetParams().components.drawers.drawerBlocks.length > 0) {
        await this.checkDrawerBlockInstallation(); // Проверяем возможность установки блока с ящиками
      }

      cabinet.dimensionLines.updateSectionHeightLines();

      // cabinet.updateBlockSize(
      //   newWidth,
      //   cabinet.getCabinetParams().dimensions.height,
      //   cabinet.getCabinetParams().dimensions.depth,
      //   cabinet.getCabinetParams().components.doors.doorItems[0].openingDirection,
      //   cabinet.getCabinetParams().basicInfo.type,
      // )
    });
    heightController.onChange(async (newHeight: number) => {
      cabinet.getCabinetParams().dimensions.general.height = newHeight;
      cabinet.updateCabinetParams(cabinet.getCabinetParams());
      // Обновляем шаг при изменении ширины
      this.setStep(widthController, heightController);
      // this.updateCabinetSize();
      cabinet.updateMullionSize(
        cabinet.getCabinetParams().dimensions.general.width,
        cabinet.getCabinetParams().dimensions.general.depth,
        newHeight - 2 * SHELF_HEIGHT - PODIUM_HEIGHT,
      );
      cabinet.updateFacadeSize(
        cabinet.getCabinetParams().dimensions.general.width,
        newHeight,
        cabinet.getCabinetParams().dimensions.general.depth,
      );
        cabinet.dimensionLines.updateSectionHeightLines();
    });
    depthController.onChange(async (newDepth: number) => {
      cabinet.getCabinetParams().dimensions.general.depth = newDepth; // Обновляем параметры шкафа
      cabinet.updateCabinetParams(cabinet.getCabinetParams());

      cabinet.updateFacadeSize(
        cabinet.getCabinetParams().dimensions.general.width,
        cabinet.getCabinetParams().dimensions.general.height,
        newDepth,
      );

      cabinet.updateMullionSize(
        cabinet.getCabinetParams().dimensions.general.width,
        newDepth,
        cabinet.getCabinetParams().dimensions.general.height - 2 * SHELF_HEIGHT - PODIUM_HEIGHT,
      );
      if (cabinet.shelfManager.getShelves().length != 0) {
        cabinet.updateShelfSize(
          cabinet.getCabinetParams().dimensions.general.width,
          cabinet.getCabinetParams().dimensions.general.depth,
          newDepth,
        );
        if (newDepth < 400) {
          cabinet.updateRodType('solidRod'); // Узкий шкаф — цельная штанга
        } else {
          cabinet.updateRodType('centralMountingRod'); // Глубокий шкаф — с центральным креплением
        }
      }
      if (cabinet.getCabinetParams().components.drawers.drawerBlocks.length > 0) {
        await this.checkDrawerBlockInstallation(); // Проверяем возможность установки блока с ящиками
      }
      cabinet.dimensionLines.updateSectionHeightLines();
    });

    // Чекбокс: "Вырез под плинтус"
    this.gui
      .add(cabinet.getCabinetParams().features.cutoutPlinth, 'checkBox')
      .name('Вырез под плинтус')
      .onChange((isEnabled: boolean) => {
        const cutout = cabinet.getCabinetParams().features.cutoutPlinth;
        if (isEnabled) {
          // ► Ставим стартовые значения
          cutout.depth = 5; // мм
          cutout.height = 20; // мм

          // ► Чтобы ползунки сразу отобразили новые числа:
          this.cutoutFolder?.__controllers.forEach((ctrl) => ctrl.updateDisplay());
          // ► Обновляем параметры и пересобираем шкаф
          cabinet.updateCabinetParams(cabinet.getCabinetParams());
          this.createCutoutControllers();
        } else {
          cutout.depth = 0;
          cutout.height = 0;
          cabinet.updateCabinetParams(cabinet.getCabinetParams());
          this.removeCutoutControls();
        }
      });

    // Автоматически создаём контроллеры, если вырез уже включён
    if (cabinet.getCabinetParams().features.cutoutPlinth.checkBox) {
      this.createCutoutControllers();
    }

    // Реализовать позже для стеллажей
    // if (cabinet.getCabinetType() == 'rack') {
    //   this.gui.add(cabinet.getCabinetParams().features.cutoutPlinth, 'checkBox').name('Подсветка');
    // }

    // if (cabinet.getCabinetParams().appearance.facade === 'mdf_enamel') {
    //   this.initMDFOptions();
    // }

    this.gui
      .add(
        {
          next: () => UInterface.getInstance(this.sceneManagerService).goToStep(3),
        },
        'next',
      )
      .name('Далее');
    this.gui
      .add(
        {
          next: () => UInterface.getInstance(this.sceneManagerService).goToStep(1),
        },
        'next',
      )
      .name('Назад');
  }

  private async checkDrawerBlockInstallation(): Promise<void> {
    const cabinet = this.sceneManagerService.getCabinet();
    const { width, height, depth } = cabinet.getCabinetParams().dimensions.general;
    const type = cabinet.getCabinetParams().subType;
    const countFP = type === CabinetSubType.Single ? 1 : 2;
    const isSingleCabinet = type === CabinetSubType.Single;

    // Проверяем условия, при которых блок с ящиками НЕЛЬЗЯ установить
    const isInvalidWidth350 = width == 350;
    const isInvalidWidth700WithMullion = width == 700 && cabinet.hasMullion();
    const isInvalidWidth375WithDeep580 = width == 375 && depth == 580;
    const isInvalidWidth375WithValidDepth = width == 375 && depth != 430; // Можно устанавливать только с глубиной 430

    // Основные условия запрета
    const cannotInstallDrawers =
    isInvalidWidth350 ||
    isInvalidWidth700WithMullion ||
    isInvalidWidth375WithDeep580 ||
    isInvalidWidth375WithValidDepth;

    if (cannotInstallDrawers) {
      // Определяем тип проблемы для показа соответствующего предупреждения
      let problemType: string;
      let minWidthForDrawers = 0;
      let requiredDepth = 0;

      if (isInvalidWidth350) {
        problemType = 'width_350';
        minWidthForDrawers = 375; // Минимальная ширина для одностворчатых с ящиками
      } else if (isInvalidWidth700WithMullion) {
        problemType = 'width_700_mullion';
        minWidthForDrawers = 750; // Минимальная ширина для двустворчатых с ящиками и средником
      } else if (isInvalidWidth375WithDeep580) {
        problemType = 'width_375_depth_580';
        minWidthForDrawers = 375;
        requiredDepth = 430; // Требуемая глубина
      } else if (isInvalidWidth375WithValidDepth) {
        problemType = 'width_375_depth';
        minWidthForDrawers = 375;
        requiredDepth = 430; // Требуемая глубина
      } else {
        problemType = 'general';
        minWidthForDrawers = isSingleCabinet ? 375 : 700;
      }

      try {
        const userAction = await this.showDrawerWarning(
          problemType,
          isSingleCabinet,
          cabinet.hasMullion(),
          minWidthForDrawers,
          requiredDepth,
          false,
        );
        console.log('userAction');
        console.log(userAction);

        if (userAction?.type === 'removeDrawers') {
          // Удаляем существующие блоки ящиков
          cabinet.removeDrawerBlocks();
          cabinet.getCabinetParams().components.drawers.drawerBlocks = [];
          console.warn(`Блок с ящиками удален: ${this.getProblemDescription(problemType)}`);
        } else if (userAction?.type === 'restoreWidth' && isSingleCabinet) {
          // Восстанавливаем минимальную ширину для одностворчатых
          await this.restoreCabinetWidth(minWidthForDrawers);
        } else if (userAction?.type === 'restoreMullion' && cabinet.hasMullion()) {
          // Восстанавливаем средник (если применимо)
          const mullion = cabinet.getMullion();
          if (mullion) {
            mullion.position.x = 0;
            cabinet.getCabinetParams().components.mullion.position.x = 0;
            mullion.updateMatrixWorld();
            console.log('↩️ Средник возвращён на центральную позицию');
          }
        }
      } catch (error) {
        console.error('❌ Error in drawer warning flow:', error);
        // В случае ошибки сервиса, удаляем блоки для безопасности
        cabinet.removeDrawerBlocks();
        cabinet.getCabinetParams().components.drawers.drawerBlocks = [];
      }

      return;
    }

    // Если все проверки пройдены - обновляем блоки ящиков
    const cabinetSize: Size = {
      width: width,
      height: height,
      depth: depth,
    };

    console.log('Обновление блоков ящиков с размерами:', cabinetSize);
    cabinet.drawerManager.updateBlocks(cabinetSize);
    console.log('Блок с ящиками успешно создан/обновлен');
  }

  // Вспомогательный метод для показа предупреждения через сервис
  // Обновленный метод showDrawerWarning
  private showDrawerWarning(
    problemType: string,
    isSingleCabinet: boolean,
    hasMullion: boolean,
    minWidth: number,
    requiredDepth?: number,
    isAddingNew: boolean = false,
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
        requiredDepth: requiredDepth,
        isAddingNew,
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

  // Вспомогательный метод для описания проблем
  private getProblemDescription(problemType: string): string {
    switch (problemType) {
      case 'width_350':
        return 'Блок с ящиками нельзя установить при ширине шкафа 350 мм';
      case 'width_700_mullion':
        return 'Блок с ящиками нельзя установить при ширине шкафа 700 мм со средником';
      case 'width_375_depth_580':
        return 'Блок с ящиками нельзя установить при ширине 375 мм и глубине 580 мм';
      case 'width_375_depth':
        return 'Блок с ящиками можно устанавливать при ширине 375 мм только с глубиной боковой 430 мм';
      default:
        return 'Недопустимые параметры для блока с ящиками';
    }
  }

  // Если необходимо динамически изменять глубину,
  // то добавим depthController в функцию в качестве параметра
  private setStep(widthController: any, heightController: any): void {
    const cabinet = this.sceneManagerService.getCabinet();
    // Если всё-таки понадобится, то вот depthController.step(singleStep);
    switch (cabinet.getCabinetParams().subType) {
      case CabinetSubType.Single:
        widthController.step(SINGLE_STEP);
        heightController.step(SINGLE_STEP);
        break;
      case CabinetSubType.Double:
        widthController.step(DOUBLE_STEP);
        heightController.step(DOUBLE_STEP);
        break;
      case CabinetSubType.Showcase:
        widthController.step(SNOWCASE_STEP);
        heightController.step(SNOWCASE_STEP);
        break;
      default:
        widthController.step(SINGLE_STEP);
        heightController.step(SINGLE_STEP);

        break;
    }
  }

  // Новый метод для восстановления ширины шкафа
  private async restoreCabinetWidth(newWidth: number): Promise<void> {
    const cabinet = this.sceneManagerService.getCabinet();
    const { height, depth } = cabinet.getCabinetParams().dimensions.general;

    console.log(`📏 Восстанавливаем ширину шкафа до ${newWidth}мм`);

    // Обновляем параметры шкафа
    cabinet.getCabinetParams().dimensions.general.width = newWidth;
    cabinet.updateCabinetParams(cabinet.getCabinetParams());

    // Находим и обновляем контроллер ширины в GUI
    this.updateWidthControllerValue(newWidth);

    // Обновляем все компоненты шкафа
    await this.updateAllCabinetComponents(cabinet, newWidth, height, depth);

    // Обновляем блоки ящиков с новой шириной
    const cabinetSize: Size = {
      width: newWidth,
      height,
      depth,
    };

    console.log('🔄 Обновление блоков ящиков после восстановления ширины...');
    await cabinet.drawerManager.updateBlocks(cabinetSize);
    console.log('✅ Блоки ящиков успешно обновлены');
  }

  // Новый метод для восстановления глубины шкафа
  private async restoreCabinetDepth(newDepth: number): Promise<void> {
    const cabinet = this.sceneManagerService.getCabinet();
    const { width, height } = cabinet.getCabinetParams().dimensions.general;

    console.log(`📏 Восстанавливаем глубину шкафа до ${newDepth}мм`);

    // 1. Обновляем параметры шкафа
    cabinet.getCabinetParams().dimensions.general.depth = newDepth;
    cabinet.updateCabinetParams(cabinet.getCabinetParams());

    // 2. Находим и обновляем контроллер глубины в GUI
    this.updateDepthControllerValue(newDepth);

    // 3. Обновляем все компоненты шкафа
    await this.updateAllCabinetComponents(cabinet, width, height, newDepth);

    // 4. Обновляем блоки ящиков с новой глубиной
    const cabinetSize: Size = {
      width: width,
      height: height,
      depth: newDepth,
    };

    console.log('🔄 Обновление блоков ящиков после восстановления глубины...');
    await cabinet.drawerManager.updateBlocks(cabinetSize);
    console.log('✅ Блоки ящиков успешно обновлены');
  }

  // Метод для обновления значения в контроллере глубины
  private updateDepthControllerValue(newDepth: number): void {
    // Находим контроллер глубины в GUI
    const depthController = this.gui.__controllers.find(
      (controller) => controller.property === 'depth',
    );

    if (depthController) {
      // Обновляем значение контроллера без вызова onChange
      depthController.setValue(newDepth);
      console.log(`✅ GUI контроллер глубины обновлен до ${newDepth}мм`);
    } else {
      console.warn('❌ Не удалось найти контроллер глубины в GUI');
    }
  }

  // Новый метод для восстановления позиции средника
  private async restoreMullionPosition(): Promise<void> {
    const cabinet = this.sceneManagerService.getCabinet();

    const mullion = cabinet.getMullion();
    if (mullion) {
      mullion.position.x = 0;
      cabinet.getCabinetParams().components.mullion.position.x = 0;
      mullion.updateMatrixWorld();
      console.log('↩️ Средник возвращён на центральную позицию');

      // После восстановления средника обновляем блоки ящиков
      const cabinetSize = cabinet.getCabinetSize();
      await cabinet.drawerManager.updateBlocks(cabinetSize);
    }
  }

  // Обновленный метод для обновления всех компонентов шкафа
  private async updateAllCabinetComponents(
    cabinet: BaseCabinet,
    width: number,
    height: number,
    depth: number,
  ): Promise<void> {
    console.log('🔄 Обновление всех компонентов шкафа...');

    // Обновляем фасады
    cabinet.updateFacadeSize(width, height, depth);

    // Обновляем средник (если есть)
    if (cabinet.hasMullion()) {
      cabinet.updateMullionSize(
        width,
        depth,
        height - 2 * SHELF_HEIGHT - PODIUM_HEIGHT,
      );
    }

    // Обновляем полки (если есть)
    if (cabinet.shelfManager.getShelves().length !== 0) {
      cabinet.updateShelfSize(width, height, depth);
    }

    // Добавляем небольшую задержку для гарантии обновления всех компонентов
    await this.delay(100);
  }

  // Вспомогательный метод для задержки
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public updateDoorFasade(newFasade: FacadeType, material: MMaterial, handle: IHandle): void {
    const cabinet = this.sceneManagerService.getCabinet();

    const cabinetSize: Size = {
      width: cabinet.getCabinetParams().dimensions.general.width,
      height: cabinet.getCabinetParams().dimensions.general.height,
      depth: cabinet.getCabinetParams().dimensions.general.depth,
    };
    const doorType: CabinetSubType = cabinet.getCabinetType();
    const isIntegratedHandle = newFasade === 'INTEGRATED_HANDLE';
    const doorSize: Size = FacadeManager.calculateDoorSize(
      cabinetSize.width,
      cabinetSize.height,
      isIntegratedHandle,
      doorType,
    );
    // {
    //   width:
    //     cabinet.getDoorType() === 'double'
    //       ? cabinet.getCabinetParams().dimensions.width / 2 - WALL_THICKNESS / 2
    //       : cabinet.getCabinetParams().dimensions.width,
    //   height: cabinet.getCabinetParams().dimensions.height - CLEARANCE,
    //   depth: WALL_THICKNESS
    // };

    // Создаём новую дверь с обновленным фасадом
    const newDoor: Facade = {
      id: cabinet.getCabinetParams().components.facades.facadeItems.length,
      facadeType: newFasade,
      cutHeight: cabinet.getCabinetParams().components.facades.facadeItems[0].cutHeight,
      material: material,
      handle: handle,
      countLoops: cabinet.getCabinetParams().components.facades.facadeItems[0].cutHeight,
      size: doorSize,
      positionFacade: { x: 0, y: 0, z: 0 },
      positionLoops: cabinet.getCabinetParams().components.facades.facadeItems[0].positionLoops,
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

  // Метод для обновления значения в контроллере ширины
  private updateWidthControllerValue(newWidth: number): void {
    // Находим контроллер ширины в GUI
    const widthController = this.gui.__controllers.find(
      (controller) => controller.property === 'width',
    );

    if (widthController) {
      // Обновляем значение контроллера без вызова onChange
      widthController.setValue(newWidth);
      console.log(`✅ GUI контроллер ширины обновлен до ${newWidth}мм`);
    } else {
      console.warn('❌ Не удалось найти контроллер ширины в GUI');
    }
  }

  // Диапазон ширины
  private getWidthRange(type: string): { min: number; max: number } {
    switch (type) {
      case 'single':
        return { min: 350, max: 550 };
      case 'double':
        return { min: 700, max: 1100 };
      case 'rack':
        return { min: 700, max: 1100 };
      case 'angular':
        return { min: 800, max: 1500 };
      default:
        return { min: 300, max: 600 };
    }
  }

  /**
   *
   *
   * @private Создаём контроллер для редактирования глубины и высоты выреза
   * @param {Cabinet} cabinet
   * @return {*}  {void}
   * @memberof Step2
   */
  private createCutoutControllers(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (this.cutoutFolder) return; // уже открыт

    this.cutoutFolder = this.gui.addFolder('Параметры выреза под плинтус');

    /* --- гарантируем стартовые значения 83 и 25 --- */
    const cutoutPlinth = cabinet.getCabinetParams().features.cutoutPlinth;
    if (cutoutPlinth.height === undefined) cutoutPlinth.height = 83; // мм
    if (cutoutPlinth.depth === undefined) cutoutPlinth.depth = 25; // мм

    this.cutoutFolder
      .add(cutoutPlinth, 'height', 20, 83, 1)
      .name('Высота выреза (мм)')
      .onChange((val: number) => {
        cutoutPlinth.height = val;
        cabinet.updateCabinetParams(cabinet.getCabinetParams());
      });

    this.cutoutFolder
      .add(cutoutPlinth, 'depth', 5, 35, 1)
      .name('Глубина выреза (мм)')
      .onChange((val: number) => {
        cutoutPlinth.depth = val;
        cabinet.updateCabinetParams(cabinet.getCabinetParams());
      });

    this.cutoutFolder.open();
  }

  private removeCutoutControls(): void {
    if (this.cutoutFolder) {
      this.gui.removeFolder(this.cutoutFolder);
      this.cutoutFolder = null;
    }
  }
}
