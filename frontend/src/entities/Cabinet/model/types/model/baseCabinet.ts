// import * as THREE from 'three';
// import { BaseProduct } from 'src/entities/Product/model/types/baseProduct';
// import { ICabinet, ProductType } from 'src/entities/Product/model/types/product.model';
// import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
// import { DrawerWarningService } from 'src/pages/calculator-page/ui/services/warnings/DrawerWarningService.service';
// import { DimensionLines } from 'src/pages/calculator-page/ui/сabinet/objects/DimensionLines';
// import { Size } from 'src/pages/calculator-page/ui/сabinet/model/BaseModel';
// import { SingleDoorCabinet } from 'src/pages/calculator-page/ui/сabinet/cabinetTypes/singleDoorCabinet';
// import { DoubleDoorCabinet } from 'src/pages/calculator-page/ui/сabinet/cabinetTypes/doubleDoorCabinet';
// import { ShelfManager } from 'src/pages/calculator-page/ui/сabinet/objects/managers/ShelfManager/ShelfManager';
// import { MullionManager } from 'src/pages/calculator-page/ui/сabinet/objects/managers/MullionManager/MullionManager';
// import { DrawerManager } from 'src/pages/calculator-page/ui/сabinet/objects/managers/DrawerManager/DrawerManager';
// import { FacadeManager } from 'src/pages/calculator-page/ui/сabinet/objects/managers/FacadeManager/FacadeManager';
// import { PODIUM_HEIGHT, SHELF_HEIGHT } from 'src/pages/calculator-page/ui/сabinet/constants';
// import { CabinetSubType, MMaterial } from '../cabinet.model';
// import { SectionManager } from 'src/pages/calculator-page/ui/сabinet/objects/managers/SectionManager/SectionManager';

// export abstract class BaseCabinet extends BaseProduct<ICabinet> {
//   private sceneManagerService: SceneManagerService;
//   private drawerWarningService: DrawerWarningService;

//   private cabinetGroup: THREE.Group;
//   // private cabinetImpl: BaseCabinet;
//   private cabinetParams: ICabinet;
//   private dimensionLines: DimensionLines;

//   public shelfManager!: ShelfManager;
//   public mullionManager!: MullionManager;
//   public drawerManager!: DrawerManager;
//   public facadeManager!: FacadeManager;
//   public sectionManager: SectionManager | null = null;

//   constructor(
//     sceneManagerService: SceneManagerService,
//     cabinetParams: ICabinet,
//     drawerWarningService: DrawerWarningService,
//   ) {
//     super(sceneManagerService, cabinetParams);
//     this.sceneManagerService = sceneManagerService;
//     this.drawerWarningService = drawerWarningService;
//     // console.log('Конструтор класса Cabinet, параметры:', cabinetParams.appearance.material);
//     this.cabinetParams = cabinetParams;
//     const size: Size = {
//       width: this.cabinetParams.dimensions.general.width,
//       height: this.cabinetParams.dimensions.general.height,
//       depth: this.cabinetParams.dimensions.general.depth,
//     };

//     this.dimensionLines = new DimensionLines(
//       this.sceneManagerService,
//       this.cabinetParams.dimensions.general.height,
//     );

//     // switch (cabinetParams.basicInfo.type) {
//     //   case ProductType.Single:
//     //     this.cabinetImpl = new SingleDoorCabinet(
//     //       this.sceneManagerService,
//     //       cabinetParams,
//     //       this.dimensionLines,
//     //     );
//     //     // console.log(this.cabinetImpl);
//     //     break;
//     //   case ProductType.Double:
//     //     this.cabinetImpl = new DoubleDoorCabinet(
//     //       this.sceneManagerService,
//     //       cabinetParams,
//     //       this.dimensionLines,
//     //     );
//     //     break;
//     //   default:
//     //     throw new Error(`Unsupported cabinet type: ${cabinetParams.basicInfo.type}`);
//     // }
//     // this.createCabinet();
//     this.initializeManagers();
//     // this.sceneManagerService.setCabinet(this); // <--- добавить
//     // this.cabinetImpl.initializeManagersAfterCabinetCreation();
//   }

//   protected initializeManagers() {
//     const size = this.params.dimensions.general;

//     this.shelfManager = new ShelfManager(this.sceneManager, this.dimensionLines, size);
//     this.mullionManager = new MullionManager(this.sceneManager, size);
//     this.drawerManager = new DrawerManager(
//       this.sceneManager,
//       this.sceneManager.drawerWarningService,
//       this.dimensionLines,
//       size,
//     );
//     this.facadeManager = new FacadeManager(this.sceneManager, this.dimensionLines);
//     this.sectionManager = new SectionManager(this.sceneManager, size.height);
//   }

//   // ОБЯЗАТЕЛЬНЫЙ МЕТОД из BaseProduct
//   // Вызывается в SceneManagerService после создания объекта
//   public build(): void {
//     this.group.clear(); // Очищаем старую геометрию группы
//     const cabinetGeometry = this.createCabinetGeometry();
//     this.group.add(cabinetGeometry); // Добавляем меши шкафа в основную группу продукта
//   }

//   public abstract createCabinetGeometry(): THREE.Group;

//   // public createCabinet(): void {
//   //   this.cabinetGroup = this.cabinetImpl.createCabinet(); // вернёт группу
//   //   // Обновляем currentCabinetGroup в сервисе
//   //   this.sceneManagerService.setCabinetGroup(this.cabinetGroup);
//   //   this.sceneManagerService.getScene().add(this.cabinetGroup); // добавляем сформированную группу на сцену
//   // }

//   // public getCabinetImpl(): BaseCabinet {
//   //   return this.cabinetImpl;
//   // }

//   // public getCabinetGroup(): THREE.Group {
//   //   return this.cabinetGroup;
//   // }
//   public getCabinetParams(): ICabinet {
//     return this.params;
//   }

//   public getCabinetSize(): Size {
//     return this.params.dimensions.general;
//   }

//   public getCabinetHeight(): number {
//     return this.params.dimensions.general.height;
//   }

//   public getCabinetWidth(): number {
//     return this.params.dimensions.general.width;
//   }
//   public getCabinetDepth(): number {
//     return this.params.dimensions.general.depth;
//   }

//   public getCabinetType(): CabinetSubType {
//     return this.params.type;
//   }

//   public hasMullion(): boolean {
//     return !!this.params.components.mullion?.checkBox;
//   }


//   // Управление секциями
//   public getSectionManager(): SectionManager | null {
//     return this.sectionManager;
//   }

//   public getPositionHinges(): PositionCutout {
//     return this.cabinetImpl.getCabinetParams().components.facades.facadeItems[0].positionLoops;
//   }

//   public updateRodType(newType: RodType): void {
//     this.cabinetImpl.updateRodType(newType);
//   }

//   public getDimensionLine(): DimensionLines {
//     return this.dimensionLines;
//   }

//   public updateCabinetSize(newSize: Size) {
//     this.cabinetImpl.facadeManager.updateCabinetSize(newSize);
//   }

//   public updateCabinetParams(newParams: ICabinet): void {
//     this.cabinetImpl.updateCabinetParams(newParams); // Делегируем обновление
//   }

//   public updateCabinetType(type: ProductType): void {
//     this.cabinetParams.basicInfo.type = type;
//     this.createCabinet();
//   }

//   public updateMaterialCabinet(newMaterial: MMaterial): void {
//     this.cabinetParams.appearance.additionColor = newMaterial;
//     this.cabinetParams.appearance.visibleDtails = newMaterial;
//   }

//   public updateSize({ width, height, depth }: { width?: number; height?: number; depth?: number }) {
//     const dimensions = this.getCabinetParams().dimensions.general;

//     if (width !== undefined) dimensions.width = width;
//     if (height !== undefined) dimensions.height = height;
//     if (depth !== undefined) dimensions.depth = depth;

//     this.updateCabinetParams(this.getCabinetParams());

//     // Обновляем все компоненты
//     this.updateShelfSize(dimensions.width, dimensions.height, dimensions.depth);
//     this.updateFacadeSize(dimensions.width, dimensions.height, dimensions.depth);
//     this.updateMullionSize(
//       dimensions.depth,
//       dimensions.height - 2 * SHELF_HEIGHT - PODIUM_HEIGHT,
//       this.getCabinetParams().components.shelves.shelfItems.length,
//     );
//   }

//   // public updateSize(width: number, height: number, depth: number): void {
//   //   this.cabinetParams.dimensions.general.width = width;
//   //   this.cabinetParams.dimensions.general.height = height;
//   //   this.cabinetParams.dimensions.general.depth = depth;
//   //   this.createCabinet();

//   //   // Обновляем размеры полок
//   //   // this.shelfManager.updateShelfSize({ width, height, depth });
//   //   // this.mullion.updateMullionSize({ width, height, depth });
//   // }

//   public updateGeneralMaterial(newMaterial: MMaterial): void {
//     // Оптимизировать работу! Не пересоздавать модель, а обновлять текущуюю
//     this.cabinetParams.appearance.additionColor = newMaterial;
//     this.cabinetParams.appearance.visibleDtails = newMaterial;
//     this.cabinetImpl.getCabinetParams().appearance.visibleDtails = newMaterial;
//     this.cabinetImpl.getCabinetParams().appearance.additionColor = newMaterial;
//     this.updateMullionMaterial(newMaterial);
//     this.updateShelfMaterial(newMaterial);
//     this.updateDrawerMaterial(newMaterial);
//     this.createCabinet();
//   }

//   public updateVisibleMaterial(newMaterial: MMaterial): void {
//     this.cabinetParams.appearance.visibleDtails = newMaterial;
//     this.cabinetImpl.getCabinetParams().appearance.visibleDtails = newMaterial;
//     this.applyMaterialToVisibleParts();
//     // this.createCabinet();
//   }

//   private applyMaterialToVisibleParts(): void {
//     try {
//       console.log('Updating visible parts material...');

//       // Путь к текстуре
//       const texturePath = this.cabinetParams.appearance.visibleDtails.texture.path;
//       // Создаем материал
//       const newMaterial = BaseCabinet.getMaterial(texturePath);
//       // Получаем группу шкафа
//       const cabinetGroup = this.sceneManagerService.getCabinetGroup();

//       // Функция для обновления материала с логированием
//       const updateMaterial = (obj: THREE.Object3D, name: string, isRotate: boolean) => {
//         console.log(`Processing ${name}:`, obj);

//         if (!obj) {
//           console.warn(`${name} not found!`);
//           return;
//         }

//         if (obj instanceof THREE.Group) {
//           console.log(`${name} is a Group, traversing...`);
//           let meshCount = 0;

//           obj.traverse((child) => {
//             if (child instanceof THREE.Mesh) {
//               // Пропускаем петли по ключевому слову в имени
//               if (
//                 child.name.includes('hinge') ||
//                 child.parent?.name.includes('hinge') ||
//                 child.name.includes('cabinetLeg') ||
//                 child.parent?.name.includes('cabinetLeg')
//               ) {
//                 console.log(`Skipping hinge mesh: ${child.name}`);
//                 return;
//               }
//               console.log(`Found mesh in ${name}:`, child);
//               child.material.dispose();
//               child.material = newMaterial;
//               child.material.needsUpdate = true;
//               if (isRotate) {
//                 BaseCabinet.rotateUVs(child.geometry);
//               }
//               meshCount++;
//             }
//           });

//           console.log(`Updated ${meshCount} meshes in ${name}`);
//         } else if (obj instanceof THREE.Mesh) {
//           console.log(`${name} is a Mesh, updating directly`);
//           obj.material = newMaterial;
//           obj.material.needsUpdate = true;
//           if (isRotate) {
//             BaseCabinet.rotateUVs(obj.geometry);
//           }
//         } else {
//           console.warn(`${name} is not a Group or Mesh:`, obj);
//         }
//       };

//       // Обновляем материалы
//       updateMaterial(cabinetGroup.getObjectByName('rightWallCabinet'), 'rightWallCabinet', false);
//       updateMaterial(cabinetGroup.getObjectByName('leftWallCabinet'), 'leftWallCabinet', false);
//       updateMaterial(cabinetGroup.getObjectByName('topCabinet'), 'topCabinet', false);

//       // Обновляем цоколь
//       const plinthGroup = this.sceneManagerService.getScene().getObjectByName('plinth');
//       if (plinthGroup) {
//         console.log('Found plinth group:', plinthGroup);
//         const plinthFacade = plinthGroup.getObjectByName('plinthFacade');
//         updateMaterial(plinthFacade, 'plinthFacade', false);
//       } else {
//         console.warn('Plinth group not found!');
//       }

//       console.log('Material update completed');
//     } catch (error) {
//       console.error('Error in applyMaterialToVisibleParts:', error);
//     }
//   }
//   public updateAdditionMaterial(newMaterial: MMaterial): void {
//     this.cabinetParams.appearance.additionColor = newMaterial;
//     this.cabinetImpl.getCabinetParams().appearance.additionColor = newMaterial;
//     this.applyMaterialToAdditionParts();
//   }

//   private applyMaterialToAdditionParts(): void {
//     const texturePath = this.cabinetParams.appearance.additionColor.texture.path;
//     const newMaterial = BaseCabinet.getMaterial(texturePath);
//     const cabinetGroup = this.sceneManagerService.getCabinetGroup();

//     const updateMaterial = (obj: THREE.Object3D, name: string, isRotate: boolean) => {
//       if (!obj) return;
//       obj.traverse((child) => {
//         if (child instanceof THREE.Mesh) {
//           if (child.name.includes('cabinetLeg') || child.parent?.name.includes('cabinetLeg')) {
//             console.log(`Skipping cabinetLeg mesh: ${child.name}`);
//             return;
//           }
//           child.material.dispose();
//           child.material = newMaterial;
//           child.material.needsUpdate = true;
//           if (isRotate) {
//             BaseCabinet.rotateUVs(child.geometry);
//           }
//         }
//       });
//     };

//     updateMaterial(cabinetGroup.getObjectByName('backWallCabinet'), 'backWallCabinet', false);
//     updateMaterial(cabinetGroup.getObjectByName('bottomCabinet'), 'bottomCabinet', false);
//     updateMaterial(cabinetGroup.getObjectByName('plinthFacadeAdd'), 'plinthFacadeAdd', false);
//     updateMaterial(cabinetGroup.getObjectByName('plinthFalseBack'), 'plinthFalseBack', false);
//     updateMaterial(cabinetGroup.getObjectByName('plinthFalseLeft'), 'plinthFalseLeft', false);
//     updateMaterial(cabinetGroup.getObjectByName('plinthFalseRight'), 'plinthFalseRight', false);

//     // Если шкаф двустворчатый
//     updateMaterial(cabinetGroup.getObjectByName('plinthCenter'), 'plinthCenter', false);

//     // Обновление материла полок
//     this.updateShelfMaterial(this.cabinetImpl.getCabinetParams().appearance.additionColor);
//     // Обновление материала ящиков
//     this.updateDrawerMaterial(this.cabinetImpl.getCabinetParams().appearance.additionColor);
//   }
//   public updateDepthForIntegratedHandle(facadeType: string): void {
//     // const depthOffset = isIntegratedHandle ? depth - DEPTH_WIDTH_INTG_HADLE : depth;
//     const sizeCabinet = this.cabinetParams.dimensions;
//     // Обновляем глубину полок
//     this.cabinetImpl.shelfManager.updateShelfSize(
//       {
//         width: sizeCabinet.general.width,
//         height: sizeCabinet.general.height,
//         depth: sizeCabinet.general.depth,
//       },
//       facadeType,
//     );

//     // Обновляем глубину средника
//     this.cabinetImpl.mullionManager.updateMullionSize(
//       sizeCabinet.general.width - WALL_THICKNESS * 2,
//       sizeCabinet.general.depth,
//       sizeCabinet.general.height - SHELF_HEIGHT * 2 - PODIUM_HEIGHT,
//       this.cabinetParams.dimensions.general.height,
//       facadeType,
//     );
//   }

//   public updateOtherFeatures(features: any): void {
//     this.cabinetParams.features.cutoutPlinth = features.cutoutPlinth;
//     this.cabinetParams.features.lighting = features.lighting;
//     this.createCabinet(); // Пересоздаем шкаф с новыми параметрами
//   }

//   public removeCabinet(): void {
//     if (this.cabinetGroup) {
//       this.sceneManagerService.getScene().remove(this.cabinetGroup);
//     }
//     this.dimensionLines.removeAllDimensionLines();
//   }

//   // Полки____________________________________________________________________________________________
//   public addShelf(shelfData: Shelf): void {
//     this.cabinetImpl.shelfManager.addShelf(shelfData, this.cabinetParams.dimensions.general);
//   }

//   public updateShelfMaterial(newMaterial: MMaterial): void {
//     this.cabinetImpl.shelfManager.updateMaterial(newMaterial);
//   }

//   public updateShelfSize(width: number, height: number, depth: number): void {
//     const cabinetSize: Size = { width: width, height: height, depth: depth };

//     this.cabinetImpl.shelfManager.updateShelfSize(cabinetSize, this.getFacadeType());
//   }

//   public updateShelfSizeByShelf(size: Size, selectedShelf: THREE.Object3D): void {
//     this.cabinetImpl.shelfManager.updateShelfSizeByShelf(size, selectedShelf);
//   }

//   public updateShelfPositionByShelf(position: Position, selectedShelf: THREE.Object3D): void {
//     this.cabinetImpl.shelfManager.updateShelfPositionByShelf(position, selectedShelf);
//   }

//   public updateRodSize(shelf: THREE.Object3D): void {
//     this.cabinetImpl.shelfManager.updateRodSize(shelf);
//   }

//   public getShelfManager(): ShelfManager {
//     return this.cabinetImpl.shelfManager;
//   }

//   public getShelves(): THREE.Object3D[] {
//     return this.cabinetImpl.shelfManager.getShelves();
//   }
//   public getShelvesMap(): Map<number, THREE.Object3D> {
//     return this.cabinetImpl.shelfManager.getShelvesMap();
//   }
//   public getShelvesThisId(): Map<number, THREE.Object3D> {
//     return this.cabinetImpl.shelfManager.getShelvesThisId();
//   }
//   public getIdShelve(shelf: THREE.Object3D): number {
//     return this.cabinetImpl.shelfManager.getIdShelve(shelf);
//   }
//   public getTotalShelves(): number {
//     return this.cabinetImpl.shelfManager.getTotalShelves();
//   }

//   /**
//    * Метод для получения высоты самой низкой полки
//    * @returns
//    */
//   public getLowestShelfHeight(): number | null {
//     return this.cabinetImpl.shelfManager.getLowestShelfHeight();
//   }
//   /**
//    *  Метод для получения высоты верхней полки
//    * @returns
//    */
//   public getHeightShelfHeight(): number | null {
//     return this.cabinetImpl.shelfManager.getHeightShelfHeight();
//   }

//   public removeShelf(idToRemove: number): void {
//     // Отфильтровать полки, исключив ту, у которой совпадает id
//     const updatedShelves = this.cabinetParams.components.shelves.shelfItems.filter(
//       (shelf) => shelf.id !== idToRemove,
//     );
//     // Обновить массив shelfItems в cabinetParams
//     this.cabinetParams.components.shelves.shelfItems = updatedShelves;
//     this.cabinetImpl.shelfManager.removeShelf(idToRemove);
//   }

//   public removeShelves(): void {
//     this.cabinetImpl.shelfManager.removeAllShelves();
//   }

//   // Средник__________________________________________________________________________________________
//   public createMullion(date: Mullion): void {
//     this.cabinetImpl.mullionManager.createMullion(date);
//     this.dimensionLines.updateDimensionLines(
//       this.getCabinetSize().width,
//       this.getCabinetSize().height,
//       this.getCabinetSize().depth,
//       35,
//     );
//   }

//   /**
//    * Метод для получение средника
//    */
//   public getMullion(): THREE.Object3D | null {
//     return this.getMullionManager().getMullion();
//   }

//   public addLegsToCenterPanel(plinthCenter: THREE.Object3D) {
//     this.cabinetImpl.addLegsToCenterPanel(plinthCenter);
//   }

//   public addLegsToPanel(plinthCenter: THREE.Object3D) {
//     this.cabinetImpl.addLegsToPanel(plinthCenter);
//   }

//   public getMullionManager(): MullionManager {
//     return this.cabinetImpl.mullionManager;
//   }

//   public getMullionHeight(): number {
//     return this.cabinetImpl.mullionManager.getMullionHeight();
//   }

//   public getWallThickness(): number {
//     return WALL_THICKNESS;
//   }

//   public updateMullion(): void {
//     const cabinet = this.sceneManagerService.getCabinet();
//     if (
//       cabinet.getCabinetParams().components.shelves.shelfItems.length > 0 ||
//       cabinet.getCabinetParams().components.drawers.drawerBlocks.length > 0
//     ) {
//       const lowestShelfPosition = cabinet.getShelfManager().getLowestShelfHeight();
//       if (lowestShelfPosition !== null) {
//         // Обновляем позицию средника
//         const mullionHeight = lowestShelfPosition; // - SHELF_HEIGHT * 2 - PODIUM_HEIGHT
//         console.log('mullionHeight: ', mullionHeight);
//         // Обновляем размеры средника
//         cabinet.updateMullionSize(
//           cabinet.getCabinetParams().dimensions.general.width,
//           cabinet.getCabinetParams().dimensions.general.depth,
//           mullionHeight - SHELF_HEIGHT * 4 - INTERVAL_1_MM * 2,
//           cabinet.getCabinetParams().components.shelves.shelfItems.length,
//         );
//       }
//     }
//   }

//   public updateMullionMaterial(newMaterial: MMaterial): void {
//     this.cabinetImpl.mullionManager.updateMaterial(newMaterial);
//   }

//   public updateMullionSize(
//     newWidth: number,
//     newDepth: number,
//     newHeight: number,
//     countShelf: number = 0,
//   ): void {
//     if (!this.hasMullion()) return;

//     const mullion = this.getMullion();
//     const mullionManager = this.getMullionManager();

//     this.cabinetImpl.mullionManager.updateMullionSize(
//       newWidth,
//       newDepth,
//       newHeight,
//       this.cabinetParams.dimensions.general.height,
//       this.getFacadeType(),
//       countShelf,
//     );

//     // Обновляем позицию центральной панели и ножек
//     const plinthCenter = mullionManager.getPlinthCenter();
//     if (plinthCenter) {
//       // Сохраняем текущую позицию X перед обновлением
//       const currentXPosition = plinthCenter.position.x;

//       // Обновляем позицию панели
//       plinthCenter.position.x = currentXPosition;

//       // Всегда добавляем ножки при обновлении
//       this.addLegsToPanel(plinthCenter);
//     }
//   }

//   public updateMullionPosition(): void {
//     const { height, depth } = this.cabinetParams.dimensions.general;
//     this.cabinetImpl.mullionManager.updateMullionPosition(depth, height, WALL_THICKNESS);
//   }
//   public updateMullionPositionX(newX: number): void {
//     if (this.cabinetImpl.mullionManager.getMullion()) {
//       this.cabinetImpl.mullionManager.getMullion().position.x = newX;
//       this.getCabinetParams().components.mullion.position.x = newX;
//     }
//   }
//   public removeMullion(): void {
//     this.cabinetImpl.mullionManager.removeMullion();
//     this.dimensionLines.updateDimensionLines(
//       this.getCabinetSize().width,
//       this.getCabinetSize().height,
//       this.getCabinetSize().depth,
//       35,
//     );
//   }

//   // Двери________________________________________________________________________________________
//   // Двери type: 'single' | 'double' | 'swing'

//   public getFacadeManager(): FacadeManager {
//     return this.cabinetImpl.facadeManager;
//   }
//   public addFacade(facade: Facade, cabinetType: ProductType, cabinetSize: Size): void {
//     this.cabinetParams.components.facades.facadeItems[0] = facade;
//     this.cabinetImpl.facadeManager.addFacade(facade, cabinetType, cabinetSize);
//   }
//   public addFacadeToScene(facade: Facade): void {
//     this.cabinetParams.components.facades.facadeItems[0] = facade;
//     this.cabinetImpl.facadeManager.addFacade(
//       facade,
//       this.getCabinetParams().basicInfo.type,
//       this.getCabinetParams().dimensions.general,
//     );
//   }
//   public updateFacade(facade: Facade, cabinetType: ProductType, cabinetSize: Size): void {
//     this.cabinetParams.components.facades.facadeItems[0] = facade;
//     this.cabinetImpl.facadeManager.updateDoor(facade, cabinetType, cabinetSize);
//   }

//   public updateFacadeSize(width: number, height: number, depth: number): void {
//     const cabinetSize: Size = { width, height, depth };
//     const facadeItems = this.cabinetParams.components.facades?.facadeItems;
//     if (!facadeItems || facadeItems.length === 0) return;

//     this.cabinetImpl.facadeManager.updateFacadeSize(
//       cabinetSize,
//       this.getProductType(),
//       this.getFacadeType(),
//       facadeItems,
//     );
//   }

//   // УБРАТЬ!!!!
//   // public updateFacadeSize(width: number, height: number, depth: number): void {
//   //   const cabinetSize: Size = { width, height, depth };
//   //   // console.log('cabinetSize in updateDoorSize: ', cabinetSize);
//   //   const facadeItems = this.cabinetParams.components.facades?.facadeItems;
//   //   if (!facadeItems || facadeItems.length === 0) return;

//   //   const cabinetType = this.getCabinetType();
//   //   const isIntegratedHandle = this.getFacadeType() === 'INTEGRATED_HANDLE';
//   //   const facadeType = this.getFacadeType();
//   //   const productType = this.getProductType();
//   //   console.log(facadeItems);
//   //   facadeItems.forEach((facade, index) => {
//   //     const cutHeight = facade.cutHeight ?? 16;
//   //     const newFacadeSize: Size = FacadeManager.calculateDoorSize(
//   //       width,
//   //       height - cutHeight,
//   //       isIntegratedHandle,
//   //       productType,
//   //     );

//   //     if (!facade.originalHeight) {
//   //       facade.originalHeight = newFacadeSize.height;
//   //     }

//   //     facade.size = newFacadeSize;
//   //     facade.facadeType = facadeType;

//   //     facade.positionFacade = {
//   //       x: this.getFacadeXOffset(index, width, productType),
//   //       y: 0,
//   //       z: 0,
//   //     };

//   //     console.log('New door size:', newFacadeSize);
//   //     const facadeName = `facade_${facade.id}_${facade.positionLoops}`;
//   //     if (this.cabinetParams.components.facades.checkBox) {
//   //       const facadeObject = this.sceneManagerService.getObjectByName(facadeName);
//   //       if (facadeObject) {
//   //         this.cabinetImpl.facadeManager.addMirrorToFacade(facade, cabinetType, facadeObject);
//   //       }
//   //     }
//   //   });

//   //   // Вызов после forEach — для всех дверей сразу
//   //   this.cabinetImpl.facadeManager.updateFacadeSize(
//   //     cabinetSize,
//   //     cabinetType,
//   //     facadeType,
//   //     facadeItems,
//   //   );
//   // }

//   public updateFacadeCutHeightAndFacadeType(newCutHeight: number, cabinetSize: Size): void {
//     const doorItems = this.cabinetParams.components.facades?.facadeItems;
//     if (!doorItems || doorItems.length === 0) return;

//     const width = cabinetSize.width;
//     const adjustedHeight = cabinetSize.height - newCutHeight;

//     const facadeType = this.getFacadeType();
//     const isIntegratedHandle = facadeType === 'INTEGRATED_HANDLE';
//     const productType = this.getProductType();
//     const cabinetType: ProductType = this.getCabinetType();

//     // Обновляем параметры всех дверей
//     doorItems.forEach((doorParams) => {
//       doorParams.cutHeight = newCutHeight;

//       const newDoorSize: Size = FacadeManager.calculateDoorSize(
//         width,
//         adjustedHeight,
//         isIntegratedHandle,
//         productType,
//       );

//       if (!doorParams.originalHeight) {
//         doorParams.originalHeight = newDoorSize.height;
//       }

//       doorParams.size = newDoorSize;
//     });

//     // Общий вызов визуального обновления
//     this.cabinetImpl.facadeManager.updateFacadeSize(
//       cabinetSize,
//       cabinetType,
//       facadeType,
//       doorItems,
//     );
//   }
//   public updateFacadeFasade(newFasade: string): void {
//     this.cabinetImpl.facadeManager.updateDoorFasade(newFasade);
//   }
//   public updateFacadeMaterial(newMaterial): void {
//     this.cabinetImpl.facadeManager.updateDoorMaterial(newMaterial);
//   }
//   public updateFacadePositionLoops(newDirection: 'left-side' | 'right-side'): void {
//     this.cabinetImpl.facadeManager.updateDoorPositionLoops(newDirection);
//   }

//   public removeFacadesFromScene(): void {
//     this.cabinetImpl.facadeManager.clearSceneFacades(); // удаляет только меши, не массив данных
//   }

//   public removeFacades(): void {
//     this.cabinetImpl.facadeManager.clearFacades();
//   }

//   public getProductType(): ProductType {
//     if (this.cabinetParams.basicInfo.type == ProductType.Single) {
//       return ProductType.Single;
//     } else if (this.cabinetParams.basicInfo.type == ProductType.Double) {
//       return ProductType.Double;
//     } else {
//       return ProductType.Single;
//     }
//   }

//   // Блоки с ящиками________________________________________________________________________________________

//   public addBlock(drawerBlock: DrawerBlock, cabinetSize: Size, positionLoops: string): void {
//     this.cabinetImpl.drawerManager.addBlock(drawerBlock, cabinetSize, positionLoops);
//   }

//   public updateDrawerMaterial(newMaterial): void {
//     this.cabinetImpl.drawerManager.updateMaterial(newMaterial);
//   }

//   public updateBlockSize(
//     width: number,
//     height: number,
//     depth: number,
//     cabinetType: string,
//     countFP: number,
//   ): void {
//     const cabinetSize: Size = {
//       width: width,
//       height: height,
//       depth: depth,
//     };
//     this.cabinetImpl.drawerManager.updateBlocks(cabinetSize);
//   }
//   public setMaterialDrawer(newMaterial: MMaterial): void {
//     this.cabinetImpl.drawerManager.setMaterial(newMaterial);
//   }

//   public getDrawerManager(): DrawerManager {
//     return this.cabinetImpl.drawerManager;
//   }

//   public getTotalBlocks(): number {
//     return this.cabinetImpl.drawerManager.getTotalBlocks();
//   }
//   public getTotalDrawersBlock(id: number): number {
//     return this.cabinetImpl.drawerManager.getTotalDrawersBlock(id);
//   }

//   public getCountFalsePanel(): number {
//     const cabinet = this.sceneManagerService.getCabinet();
//     if (cabinet.getCabinetParams().basicInfo.type == 'single') {
//       return 1;
//     } else {
//       return 2;
//     }
//   }

//   public getBlockById(id: number): THREE.Object3D {
//     return this.cabinetImpl.drawerManager.getBlockById(id);
//   }

//   /**
//    * Метод для получения высоты самого низкого шкафчика
//    * @returns
//    */
//   // public getLowestDrawerHeight(): number | null {
//   //   return this.drawerManager.getLowestDrawerHeight();
//   // }
//   /**
//    *  Метод для получения высоты верхней полки
//    * @returns
//    */
//   // public getHeightDriverHeight(): number | null {
//   //   return this.drawerManager.getHeightDriverHeight();
//   // }

//   public removeDraver(id: number): void {
//     this.cabinetImpl.drawerManager.removeDrawer(id);
//   }

//   public removeBox(): void {
//     this.sceneManagerService.getCabinet().dimensionLines.removeAllSidePanelHeightLines();
//     this.cabinetImpl.drawerManager.removeBlocks();
//   }

//   // Методы для размерных линий
//   public updateInternalDimensionLines() {
//     const mullion = this.sceneManagerService.getCabinet().getMullion();
//     if (!mullion) return;
//     const cabinet = this.sceneManagerService.getCabinet();
//     const newSize: Size = {
//       width: cabinet.cabinetParams.dimensions.general.width,
//       height: cabinet.cabinetParams.dimensions.general.width,
//       depth: cabinet.cabinetParams.dimensions.general.width,
//     };
//     // Например: пересоздай размерные линии от боковин до средника
//     this.dimensionLines.updateDimensionLines(newSize.width, newSize.height, newSize.depth, 35); // или другой твой сервис/метод
//   }
// }
