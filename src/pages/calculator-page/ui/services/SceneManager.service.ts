import { Injectable } from '@angular/core';
import { Room, RoomDimensions } from '../сabinet/objects/Room';
import { Lighting } from '../сabinet/objects/Lighting';

import { OrbitControls } from 'three-stdlib';
import * as THREE from 'three';
import {
  ICabinet,
  MMaterial,
  CabinetSubType,
} from 'src/entities/Cabinet/model/types/cabinet.model';
import { SceneFactoryService } from './SceneFactoryService.service';
import { DEPTH_ROOM, HEIGHT_ROOM, WIDTH_ROOM } from '../сabinet/constants';
import { CabinetFactory } from '../сabinet/objects/factorys/cabinetFactory';
import { selectAllCabinets } from 'src/entities/Cabinet/model/store/cabinet.selectors';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { Store } from '@ngrx/store';
import { CabinetActions } from 'src/entities/Cabinet';
import { PositionCutout } from '../сabinet/model/Facade';
import { DrawerWarningService } from './warnings/DrawerWarningService.service';
import { ShelfWarningService } from './warnings/ShelfWarningService.service';
import { BaseProduct } from 'src/entities/Product/model/types/baseProduct';
import { BaseCabinet } from '../сabinet/cabinetTypes/BaseCabinet';
import { SingleDoorCabinet } from '../сabinet/cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../сabinet/cabinetTypes/doubleDoorCabinet';

@Injectable({ providedIn: 'root' })
export class SceneManagerService {
  private product: BaseProduct<any> | null = null;
  private currentCabinetGroup: THREE.Group | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private lighting: Lighting;
  private createdObjects: Set<THREE.Object3D>;
  private envMap: THREE.CubeTexture | null = null;
  private room: Room;
  private roomDimensions: RoomDimensions = {
    width: WIDTH_ROOM,
    height: HEIGHT_ROOM,
    depth: DEPTH_ROOM,
  };
  private initialized = false;

  private isInterfaceInitialized = false;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  // private currentCabinet: Cabinet | null = null;
  private currentProduct: BaseProduct<any> | null = null;

  constructor(
    private sceneFactory: SceneFactoryService,
    private store: Store<AppState>,
    public drawerWarningService: DrawerWarningService,
  ) {
    // this.store.select(selectAllCabinets).subscribe((cabinets) => {
    //   if (cabinets.length > 0) {
    //     this.setCabinet(new Cabinet(this.scene, this.camera, cabinets[0]));
    // }
    // });
  }

  // public setCabinet(cabinet: ICabinet): void {
  //   this.cabinet = cabinet;
  //   this.cabinetService.updateCabinet(cabinet); // Обновляем состояние в хранилище
  // }

  // public updateCabinetParams(cabinetParams: ICabinet): void {
  //   this.cabinet = { ...this.cabinet, ...cabinetParams };
  //   this.cabinetService.updateCabinet(this.cabinet); // Обновляем состояние в хранилище
  // }

  initialize(canvas: HTMLCanvasElement) {
    if (this.initialized) {
      // просто обновляем target canvas для renderer
      this.renderer.domElement.remove(); // убираем старый canvas
      this.renderer.domElement = canvas;
      canvas.replaceWith(this.renderer.domElement);
      return;
    }
    this.scene = this.sceneFactory.createScene();
    this.camera = this.sceneFactory.createCamera();
    this.renderer = this.sceneFactory.createRenderer(canvas);
    this.createdObjects = new Set();
    // this.sceneFactory.createLighting(this.scene);

    // Создаем одностворчатый шкаф при инициализации
    const factory = CabinetFactory.getFactory(CabinetSubType.Single);
    const params = factory.createDefaultParams();

     this.setProduct(params); 

    // this.store.dispatch(CabinetActions.createCabinet({ cabinet: singleDoorCabinet }));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    this.lighting = this.sceneFactory.createLighting(this.scene, this.renderer);

    this.room = new Room(this.scene, this.renderer, this.roomDimensions);

    this.animate(); // Запуск анимации
  }

  // public setCabinet(cabinet: Cabinet): void {
  //   this.cabinet = cabinet;
  //   // this.store.dispatch(CabinetActions.updateCabinet({ cabinet: cabinet.getCabinetParams() }));
  // }

  public getObjects(): Set<THREE.Object3D> {
    return this.createdObjects;
  }

  public getEnvMap(): THREE.CubeTexture {
    return this.envMap;
  }

  public addObject(...objects: THREE.Object3D[]): void {
    objects.forEach((object) => {
      this.scene.add(object);
      this.createdObjects.add(object);
    });
  }

  public getObjectByName(name: string): THREE.Object3D | null {
    return this.scene.getObjectByName(name);
  }

  public deleteObject(...objects: THREE.Object3D[]): void {
    objects.forEach((object) => {
      // Удаляем объект из сцены
      this.scene.remove(object);
      this.createdObjects.delete(object);
    });
  }

  public deleteObjectByName(name: string): void {
    const objectsToRemove: THREE.Object3D[] = [];

    this.scene.traverse((object) => {
      if (object.name == name) {
        objectsToRemove.push(object);
      }
    });

    this.createdObjects.forEach((object) => {
      if (object.name == name && !objectsToRemove.includes(object)) {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach((object) => {
      this.scene.remove(object);
      this.createdObjects.delete(object);

      if (object instanceof THREE.Group) {
        object.children.forEach((child) => {
          this.scene.remove(child);
          this.createdObjects.delete(child);
        });
      }
    });
  }

  setCurrentCabinet(cabinet: BaseCabinet): void {
    this.currentProduct = cabinet;
  }

  public removeAllShelves(): void {
    // Создание временного массива для полок, которые нужно удалить
    const shelvesToDelete: THREE.Object3D[] = [];

    // Обход всех объектов в createdObjects
    this.createdObjects.forEach((obj) => {
      if (obj instanceof THREE.Mesh && obj.name.startsWith('shelf')) {
        shelvesToDelete.push(obj);
      }
    });

    // Удаляем полки из сцены
    shelvesToDelete.forEach((obj) => {
      this.scene.remove(obj);
      this.createdObjects.delete(obj); // Удаляем полку из createdObjects (Set)
    });
  }

  public disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }

      // Обработка как одиночного, так и массива материалов
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((material) => {
        if (material) {
          // Если есть текстуры (карта), тоже освобождаем
          if ((material as any).map) {
            (material as any).map.dispose();
          }
          material.dispose();
        }
      });
    }

    // Рекурсивно обрабатываем дочерние объекты
    obj.children.forEach((child) => this.disposeObject(child));
  }

  public setProduct(params: ICabinet): void {
    // 1. Если продукт уже есть, полностью его уничтожаем (удаляем из сцены и чистим память)
    if (this.product) {
      this.product.dispose();
      this.product = null;
    }

    // 2. Создаем новый экземпляр через статический метод фабрики
    this.product = CabinetFactory.create(params, this);

    // 3. Собираем геометрию
    this.product.build();

    // 4. Добавляем группу продукта в сцену THREE.js
    this.scene.add(this.product.getGroup());

    this.currentCabinetGroup = this.product.getGroup();
  }

  public getProduct(): BaseProduct<any> | null {
    return this.product;
  }

  public getCabinet(): SingleDoorCabinet | DoubleDoorCabinet {
    if (this.product instanceof BaseCabinet) {
      if (this.product instanceof SingleDoorCabinet != false) {
        return this.product as SingleDoorCabinet;
      } else if (this.product instanceof DoubleDoorCabinet != false) {
        return this.product as DoubleDoorCabinet;
      }
    }
    throw new Error('Текущее изделие не является шкафом');
  }

  // Примерный метод получения петель (например, по именам объектов сцены)
  public getHinges(cabinetGroup: THREE.Group, positionCutout: PositionCutout): THREE.Object3D[] {
    const hinges: THREE.Object3D[] = [];
    console.log(positionCutout);
    const wallName = positionCutout == 'left-side' ? 'leftWallCabinet' : 'rightWallCabinet';
    const wall = cabinetGroup.getObjectByName(wallName) as THREE.Object3D;
    console.log('CHECK WALL: ', wall);
    if (!wall) return hinges;

    wall.traverse((child) => {
      if (child.name.startsWith(`${positionCutout}-hinge-`)) {
        // console.log(child);
        hinges.push(child);
      }
    });
    console.log('HINGES-[getHinges]: ', hinges);
    return hinges;
  }

  public getPlinthCenter(): THREE.Object3D {
    return this.scene.getObjectByName('plinthCenter');
  }

  // public updateCabinetParams(updateParams: Partial<ICabinet>): void {
  //   if (!this.product) return;

  //   const newParams = { ...this.product.getParams(), ...updateParams };

  //   // Удаляем старый шкаф из сцены
  //   this.removeCabinet();

  //   // Создаём новый шкаф с обновлёнными параметрами
  //   // const newCabinet = new BaseCabinet(this, newParams);
  //   // this.product = newCabinet;

  //   // this.product.updateCabinetParams(newParams);

  //   // 3. Используем существующий метод setProduct, который вызовет Фабрику
  //   // и создаст либо SingleDoorCabinet, либо DoubleDoorCabinet автоматически
  //   this.setProduct(newParams);

  //   // this.store.dispatch(CabinetActions.updateCabinet({ cabinet: newParams }));
  // }

  public updateCabinetParams(updateParams: Partial<ICabinet>): void {
    if (!this.product) return;

    // 1. Собираем новые параметры
    const currentParams = this.product.getParams();
    const newParams = { ...currentParams, ...updateParams } as ICabinet;

    // 2. Вызываем setProduct.
    // Он сам вызовет dispose() старого шкафа, создаст новый класс через фабрику и вызовет build()
    this.setProduct(newParams);
  }

  public setCabinetGroup(group: THREE.Group) {
    this.currentCabinetGroup = group;
  }

  public getCabinetGroup(): THREE.Group | null {
    // return this.cabinet.getCabinetGroup();
    return this.currentCabinetGroup;
  }

  clearCabinetGroup(): void {
    // console.log(this.currentCabinetGroup);
    if (this.currentCabinetGroup) {
      this.scene.remove(this.currentCabinetGroup);
      this.createdObjects.delete(this.currentCabinetGroup); // Удаление из коллекции объектов
      this.currentCabinetGroup = null; // Очистить ссылку на группу
    }
  }

  public clearScene(): void {
    // Удаляем все объекты из сцены
    this.scene.children.slice().forEach((child) => {
      // Чтобы безопасно удалить меши и их материалы
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }

      this.scene.remove(child);
    });

    // Очищаем все созданные объекты
    this.createdObjects.clear();

    // Обнуляем ссылки на кабинет и комнату
    this.product = null;
    // Комнату можешь оставить или пересоздавать отдельно
    // this.room = null;
  }

  public removeCabinet(): void {
    if (!this.product) return;

    // Удаляем все объекты шкафа из сцены
    this.getObjects().forEach((object) => {
      this.scene.remove(object);

      // Очистка ресурсов
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Очищаем set созданных объектов
    this.createdObjects.clear();

    // Обнуляем текущий шкаф
    this.product = null;
  }

  public getSelectedObject(event: MouseEvent): THREE.Object3D | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      return intersects[0].object;
    }

    return null;
  }

  // public getObjectByName(name: string): THREE.Object3D {

  // }

  public enableCameraControls(): void {
    this.controls.enabled = true;
  }

  public disableCameraControls(): void {
    this.controls.enabled = false;
  }

  // Метод для переключения состояния управления камерой
  public setCameraControl(isActive: boolean): void {
    if (isActive) {
      this.enableCameraControls(); // Включаем управление камерой
    } else {
      this.disableCameraControls(); // Выключаем управление камерой
    }
  }

  private updateWallVisibility(): void {
    const { width, height } = this.room.getRoomDimensions();
    const walls = this.room.getWalls();

    const leftIsHide = this.camera.position.x > width / 2;
    const rightIsHide = this.camera.position.x < -width / 2;
    const frontIsHide = this.camera.position.z > height / 2;
    const backIsHide = this.camera.position.z < -height / 2;

    walls['leftWall'].visible = !leftIsHide;
    walls['rightWall'].visible = !rightIsHide;
    walls['frontWall'].visible = !frontIsHide;
    walls['backWall'].visible = !backIsHide;
  }

  // public setRoomDimensions(width: number, height: number, depth: number): void {
  //   this.room.updateRoomDimensions({ width, height, depth });
  //   this.ui.updateRoom('width', width); // Обновим параметры в UI
  //   this.ui.updateRoom('height', height); // Обновим параметры в UI
  //   this.ui.updateRoom('depth', depth); // Обновим параметры в UI
  // }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public remove(objectName: string): void {
    const object = this.scene.getObjectByName(objectName);
    if (object) {
      this.scene.remove(object);
    }
  }

  private animate(): void {
    if (!this.renderer) {
      console.error('Renderer is undefined.');
      return;
    }
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.updateWallVisibility();
    this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {
    const height = window.innerHeight - 108;
    this.camera.aspect = window.innerWidth / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, height);
    this.updateWallVisibility();
  }
}
