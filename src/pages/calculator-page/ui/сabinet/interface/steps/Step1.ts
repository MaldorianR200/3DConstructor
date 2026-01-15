import { GUI } from 'dat.gui';
import { ICabinet } from 'src/entities/Cabinet';
import { UInterface } from '../UInterface';
import * as THREE from 'three';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { CabinetFactory } from '../../objects/factorys/cabinetFactory';
import { CabinetSubType, MMaterial } from 'src/entities/Cabinet/model/types/cabinet.model';
import { DrawerBlock } from '../../model/Drawers';
import { IColor } from 'src/entities/Color';
import { BaseCabinet } from '../../cabinetTypes/BaseCabinet';
import { ProductType } from 'src/entities/Product/model/types/product.model';

export class Step1 {
  private gui: GUI;
  private sceneManagerService: SceneManagerService;
  private subTypeController: any = null; // Для управления вторым списком

  constructor(gui: GUI, sceneManagerService: SceneManagerService) {
    this.gui = gui;
    this.sceneManagerService = sceneManagerService;
    this.applyStyles();
  }

  // public init(): void {
  //   const header = document.createElement('div');
  //   header.innerText = 'ШАГ 1';
  //   header.style.fontWeight = 'bold';
  //   header.style.fontSize = '16px';
  //   header.style.color = 'white';
  //   header.style.margin = '10px 0 5px 10px';
  //   this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);

  //   const product = this.sceneManagerService.getCabinet();
  //   // Проверяем, что материал является объектом, а не строкой
  //   if (product instanceof BaseCabinet) {
  //     const materialName = product.getCabinetParams().appearance.visibleDtails.name;
  //     const materialOptions = CabinetFactory.getAvailableMaterials();
  //     const selectedMaterial = materialOptions.find((m) => m.name.includes(materialName));
  //     if (selectedMaterial) {
  //       product.getCabinetParams().appearance.visibleDtails = selectedMaterial;
  //       console.warn(
  //         'Проверяем текстуру в Step1:\n',
  //         product.getCabinetParams().appearance.visibleDtails.texture,
  //       );
  //     } else {
  //       console.error('Материал не найден:', materialName);
  //       return;
  //     }
  //   }

  //   // Обновляем материал в сцене
  //   // this.updateMaterial(cabParam.appearance.generalMaterial);

  //   const typeController = this.gui
  //     .add(product.getCabinetParams(), 'type', {
  //       Одностворчатый: 'single',
  //       Двустворчатый: 'double',
  //       // Угловой: 'angular',
  //       // Стеллаж: 'rack',
  //     })
  //     .name('Тип изделия')
  //     .onChange((cabinetType: ProductType) => this.onTypeChange(cabinetType));

  //   // Выбор серии продукции
  //   const seriesController = this.gui
  //     .add(cabinet.getCabinetParams().basicInfo, 'series', {
  //       НЕО: 'NEO',
  //       КЛАССИК: 'classic',
  //     })
  //     .name('Серия продукции')
  //     .onChange((newSeries: string) => {
  //       console.log('Выбрана серия:', newSeries);
  //     });

  //   const materialOptions = CabinetFactory.getAvailableMaterials().filter(
  //     (material) => material.type.toLowerCase() === 'ldsp',
  //   );
  //   const colorOptions = CabinetFactory.getColors();

  //   // Определяем текущий материал из cabinetParams
  //   const defaultMaterial =
  //     materialOptions.find(
  //       (m) => m.name === cabinet.getCabinetParams().appearance.visibleDtails.name,
  //     ) || materialOptions[0];

  //   // console.log('Доступные материалы:', materialOptions);
  //   // console.log('Текущий материал:', cabinetParams.appearance.material);

  //   this.createMaterialGUI(materialOptions);

  //   this.gui
  //     .add(
  //       {
  //         next: () => UInterface.getInstance(this.sceneManagerService).goToStep(2),
  //       },
  //       'next',
  //     )
  //     .name('Далее');
  // }

  public init(): void {
    this.clearGUI(); // очищаем GUI перед инициализацией
    const header = document.createElement('div');
    header.id = 'gui-step-header';
    header.innerText = 'ШАГ 1';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.color = 'white';
    header.style.margin = '10px 0 5px 10px';
    this.gui.domElement.insertBefore(header, this.gui.domElement.firstChild);

    const product = this.sceneManagerService.getProduct();
    const params = product.getParams();

    // 1. Выбор категории изделия (ProductType)
    this.gui
      .add(params, 'type', {
        Шкафы: ProductType.Cabinet,
        'Столы (в разработке)': ProductType.Table,
      })
      .name('Категория')
      .onChange((newType: ProductType) => this.onCategoryChange(newType));

    // 2. Если выбран шкаф — рисуем выбор подтипа
    if (params.type === ProductType.Cabinet) {
      // this.renderCabinetSubTypeUI(params as ICabinet);
      const cabinetParams = params as ICabinet;
      this.gui
        .add(cabinetParams, 'subType', {
          Одностворчатый: CabinetSubType.Single,
          Двустворчатый: CabinetSubType.Double,
        })
        .name('Тип шкафа')
        .onChange((newSubType: CabinetSubType) => {
          // При смене подтипа создаем новые дефолтные параметры для этого типа
          const newParams = CabinetFactory.getFactory(newSubType).createDefaultParams();
          this.refreshProduct(newParams);
        });
    }

    // 3. Материалы (общие для изделия)
    this.createMaterialGUI();

    this.gui
      .add({ next: () => UInterface.getInstance(this.sceneManagerService).goToStep(2) }, 'next')
      .name('Далее');
  }

  private onCategoryChange(type: ProductType): void {
    if (type === ProductType.Cabinet) {
      // При выборе категории "Шкаф" по умолчанию создаем Single
      const defaultParams = CabinetFactory.getFactory(CabinetSubType.Single).createDefaultParams();
      this.refreshProduct(defaultParams);
    } else {
      alert('Этот тип изделия временно недоступен');
      this.init(); // Перерисовываем, чтобы вернуть значение в списке
    }
  }

  private renderCabinetSubTypeUI(params: ICabinet): void {
    // Удаляем старый контроллер подтипа, если он был
    if (this.subTypeController) {
      this.gui.remove(this.subTypeController);
    }

    this.subTypeController = this.gui
      .add(params, 'subType', {
        Одностворчатый: CabinetSubType.Single,
        Двустворчатый: CabinetSubType.Double,
      })
      .name('Тип шкафа')
      .onChange((newSubType: CabinetSubType) => {
        const newParams = CabinetFactory.getFactory(newSubType).createDefaultParams();
        this.refreshProduct(newParams);
      });
  }

  private refreshProduct(newParams: ICabinet): void {
  const oldCabinet = this.sceneManagerService.getCabinet();

  // Удаляем все размерные линии старого шкафа
  oldCabinet?.dimensionLines?.removeAllDimensionLines();
  oldCabinet?.dimensionLines?.removeSectionHeightLines?.();
  oldCabinet?.dimensionLines?.removeAllSidePanelHeightLines?.();
  oldCabinet?.dimensionLines?.clearAllHandleDimensions?.();

  // Сносим геометрию шкафа
  oldCabinet?.removeCabinet?.();

  // Сохраняем материал
  const currentProduct = this.sceneManagerService.getProduct();
  const currentMaterial = currentProduct?.getParams()?.appearance?.visibleDtails ?? null;

  if (currentMaterial) {
    newParams.appearance.visibleDtails = currentMaterial;
    newParams.appearance.additionColor = currentMaterial;
  }

  // Создаём новый продукт
  this.sceneManagerService.setProduct(newParams);

  UInterface.getInstance(this.sceneManagerService).goToStep(1);
}

  // private createMaterialGUI(): void {
  //   const product = this.sceneManagerService.getProduct();
  //   const materialOptions = CabinetFactory.getAvailableMaterials().filter(m => m.type === 'ldsp');

  //   this.gui.add({ mat: product.getParams().appearance.visibleDtails.name }, 'mat', materialOptions.map(m => m.name))
  //     .name('Цвет')
  //     .onChange((name) => {
  //       const mat = materialOptions.find(m => m.name === name);
  //       if (mat) {
  //         const cabinet = this.sceneManagerService.getCabinet();
  //         cabinet.updateVisibleMaterial(mat);
  //         cabinet.updateAdditionMaterial(mat);
  //       }
  //     });
  // }

  private createMaterialGUI(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const materialOptions = CabinetFactory.getAvailableMaterials().filter(
      (material) => material.type.toLowerCase() === 'ldsp',
    );
    const defaultMaterial =
      materialOptions.find(
        (m) => m.name === cabinet.getCabinetParams().appearance.additionColor.name,
      ) || materialOptions[0];

    // Создаём промежуточный объект для хранения выбранного материала
    const materialController = {
      selectedMaterialName: defaultMaterial.name,
    };

    this.gui
      .add(
        materialController,
        'selectedMaterialName',
        materialOptions.map((m) => m.name),
      )
      .name('Цвет изделия')
      .setValue(defaultMaterial.name)
      .onChange((materialName: string) => {
        const selectedMaterial = materialOptions.find((m) => m.name == materialName);
        if (selectedMaterial) {
          console.log('Выбран материал:', selectedMaterial);
          console.log('UPDATE MATERIAL:', cabinet.getCabinetParams());
          this.sceneManagerService.getCabinet().updateVisibleMaterial(selectedMaterial);
          this.sceneManagerService.getCabinet().updateAdditionMaterial(selectedMaterial);
        } else {
          console.error('Материал не найден:', materialName);
          return;
        }
      });
  }

  // private clearGUI(): void {
  //   const controllers = [...this.gui.__controllers];
  //   controllers.forEach(c => this.gui.remove(c));
  //   this.subTypeController = null;
  // }

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

  // private onTypeChange(cabinetType: ProductType): void {
  //   this.sceneManagerService.getCabinet().facadeManager.clearFacades();
  //   this.sceneManagerService.removeCabinet();

  //   const newCabinetParams = CabinetFactory.getFactory(cabinetType).createDefaultParams();

  //   // Сброс материала до первого из списка
  //   const availableMaterials = CabinetFactory.getAvailableMaterials().filter(
  //     (material) => material.type.toLowerCase() == 'ldsp',
  //   );
  //   const defaultMaterial = availableMaterials[0];
  //   newCabinetParams.appearance.visibleDtails = defaultMaterial;
  //   newCabinetParams.appearance.additionColor = defaultMaterial;

  //   const newCabinet = new Cabinet(
  //     this.sceneManagerService,
  //     newCabinetParams,
  //     this.sceneManagerService.drawerWarningService,
  //   );
  //   console.log('newCabinet');
  //   console.log(newCabinet);
  //   this.sceneManagerService.setCabinet(newCabinet);
  //   newCabinet.createCabinet();

  //   this.clearGUI();

  //   const typeController = this.gui
  //     .add(newCabinet.getCabinetParams().basicInfo, 'type', {
  //       Одностворчатый: 'single',
  //       Двустворчатый: 'double',
  //     })
  //     .name('Тип изделия')
  //     .onChange((newType: ProductType) => this.onTypeChange(newType));

  //   // Выбор серии продукции
  //   const seriesController = this.gui
  //     .add(newCabinet.getCabinetParams().basicInfo, 'series', {
  //       НЕО: 'NEO',
  //       КЛАССИК: 'classic',
  //     })
  //     .name('Серия продукции')
  //     .onChange((newSeries: string) => {
  //       console.log('Выбрана серия:', newSeries);
  //     });

  //   this.createMaterialGUI(availableMaterials);

  //   this.gui
  //     .add({ next: () => UInterface.getInstance(this.sceneManagerService).goToStep(2) }, 'next')
  //     .name('Далее');
  // }

  /**
   * Метод для очищения интерфейса
   */
  private clearGUI(): void {
    // Удаляем заголовок, если он уже есть
    const oldHeader = this.gui.domElement.querySelector('#gui-step-header');
    if (oldHeader) oldHeader.remove();

    // Удаляем все контроллеры
    const controllers = [...this.gui.__controllers];
    controllers.forEach((c) => this.gui.remove(c));

    // Удаляем папки
    for (const folderName in this.gui.__folders) {
      this.gui.removeFolder(this.gui.__folders[folderName]);
    }
  }

  // private clearGUI(): void {
  //   // Удаляет все контроллеры и папки из GUI
  //   const folders = this.gui.__folders;
  //   for (const folderName in folders) {
  //     const folder = folders[folderName];
  //     folder.close(); // закрыть папку
  //     this.gui.removeFolder(folder);
  //   }

  //   // Удаление отдельных контроллеров
  //   const controllers = [...this.gui.__controllers];
  //   controllers.forEach((controller) => {
  //     this.gui.remove(controller);
  //   });
  // }
}
