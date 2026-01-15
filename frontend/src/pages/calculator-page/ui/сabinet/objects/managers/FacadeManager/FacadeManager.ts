import * as THREE from 'three';
import { DimensionLines } from '../../DimensionLines';
import { Facade, FacadeType, HandleType, IHandle, Mirror } from '../../../model/Facade';
import {
  CLEARANCE,
  DEEP_04MM,
  INTERVAL_1_MM,
  PODIUM_HEIGHT,
  WALL_THICKNESS,
} from '../../../constants';
import { CabinetGridManagerService } from 'src/pages/calculator-page/ui/services/CabinetGridManagerService.service';
import { OBJLoader, Reflector } from 'three-stdlib';
import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { BaseCabinet } from '../../../cabinetTypes/BaseCabinet';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { IMaterial } from 'src/entities/Material';

export class FacadeManager {
  private sceneManagerService: SceneManagerService;
  private dimensionLines: DimensionLines;
  private facades: Map<number, THREE.Object3D> = new Map();
  private mirrors: Map<number, THREE.Object3D> = new Map();
  private doorCounter = 0;
  private positionLoops;
  private cabinetSize: Size;
  constructor(sceneManagerService: SceneManagerService, dimensionLines: DimensionLines) {
    this.sceneManagerService = sceneManagerService;
    this.dimensionLines = dimensionLines;
  }

  public addFacade(facade: Facade, cabinetType: CabinetSubType, cabinetSize: Size): void {
    this.clearFacades();
    console.log(`facadeSIZE: ${facade.size.width} ${facade.size.height} ${facade.size.depth}`);
    this.cabinetSize = cabinetSize;

    const material = facade.material;
    // const material = this.fasade.material;
    const doorMaterial = BaseCabinet.getMaterial(material.texture.path);

    console.log('Выбран тип фасада: ', facade.facadeType);

    let facadeObjects: THREE.Object3D[] = [];

    switch (facade.facadeType) {
      case 'PUSH_OPENING':
        facadeObjects = this.addPushOpeningFacade(facade, cabinetType, doorMaterial);
        break;
      case 'INTEGRATED_HANDLE':
        this.addIntegratedHandleFacade(facade, cabinetType, doorMaterial); // Реализовать добавление зеркала для интегрированной ручки
        break;
      case 'HANDLE':
        console.log('!!!!!!!!!!!!!!!!HANDLE!!!!!!!!!!!!!!!!!');
        console.log(facade);
        // Проверяем тип ручки
        if (facade.handle.type === 'OVERHEAD_HANDLE') {
          facadeObjects = this.addOverheadHandleFacade(facade, cabinetType, doorMaterial);
        } else if (facade.handle?.type === 'END_HANDLE') {
          facadeObjects = this.addEndHandleFacade(facade, cabinetType, doorMaterial);
        } else {
          console.warn('Неизвестный тип ручки или ручка не установлена');
        }
        break;
      default:
        alert('Не выбран тип фасада! Выберите фасад и повторите попытку!');
        console.error('Unknown facade type:', facade.facadeType);
        return;
    }

    // Автоматическое добавление зеркала, если чекбокс активен
    if (facade.mirrors?.checkbox) {
      facadeObjects.forEach((facadeObj) => {
        this.addMirrorToFacade(facade, cabinetType, facadeObj);
      });
    }
  }

  private addIntegratedHandleFacade(
    door: Facade,
    cabinetType: CabinetSubType,
    material: THREE.Material,
  ): void {
    const width = door.size.width;
    const height = door.originalHeight ?? door.size.height;
    const depth = door.size.depth;

    const loader = new OBJLoader();

    loader.load(
      '../../../shared/assets/models/ldsp_facade.obj', //../../../shared/assets/textures/texture.png
      (object) => {
        // Вычисляем габариты модели
        const bbox = new THREE.Box3().setFromObject(object);
        const modelSize = new THREE.Vector3();
        bbox.getSize(modelSize);

        // Вычисляем центр модели
        const modelCenter = new THREE.Vector3();
        bbox.getCenter(modelCenter);

        // Смещаем модель так, чтобы её центр был в начале координат
        object.position.sub(modelCenter);

        // Определяем масштаб, чтобы подогнать под нужные размеры
        const scaleX = width / modelSize.x;
        const scaleY = height / modelSize.y;
        const scaleZ = depth / modelSize.z;
        console.log('Size door: ', scaleX, ' ', scaleY, ' ', scaleZ);
        object.scale.set(scaleX, scaleY, scaleZ);

        // Применяем материал
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        object.name = `facade_${door.id}_${door.positionLoops}`;

        // Размещаем дверь в сцене
        if (cabinetType === CabinetSubType.Single) {
          object.position.set(
            -width / 2 - WALL_THICKNESS * 2 + INTERVAL_1_MM * 3,
            -WALL_THICKNESS - WALL_THICKNESS / 2 - INTERVAL_1_MM * 3,
            depth * 14 - INTERVAL_1_MM,
          ); // Настройка позиции

          this.sceneManagerService.addObject(object);
        } else if (cabinetType === CabinetSubType.Double) {
          const leftDoor = object.clone();
          const rightDoor = object.clone();

          leftDoor.position.set(-width / 2, height / 2, 0);
          rightDoor.position.set(width / 2, height / 2, 0);

          this.sceneManagerService.addObject(leftDoor, rightDoor); // Теперь двойные двери тоже в списке
          // Добавляем к массиву объектов
        } else {
          console.warn('Unknown doorType!');
          return;
        }
      },
      (xhr) => console.log(`Loading door: ${(xhr.loaded / xhr.total) * 100}%`),
      (error) => console.error('Error loading door model:', error),
    );
  }

  private addPushOpeningFacade(
    door: Facade,
    cabinetType: CabinetSubType,
    material: THREE.Material,
  ): THREE.Object3D[] {
    const createdFacades: THREE.Object3D[] = [];

    const width = door.size.width;
    const cutHeight = door.cutHeight ?? 16;
    const visibleHeight = this.cabinetSize.height - cutHeight;

    const depth = WALL_THICKNESS;

    const doorSize: Size = { width: width, height: visibleHeight, depth: depth };
    const yPosition = this.cabinetSize.height / 2 - PODIUM_HEIGHT / 2 + cutHeight / 2 - 2; // -2 мм зазор
    // console.log('facadeSize: ', doorSize);
    // console.log('facade.facadeType: ', cabinetType);
    console.log('this.facades');
    console.log(this.facades);
    if (cabinetType === CabinetSubType.Single) {
      const doorMesh = BaseCabinet.createMesh(doorSize, material);
      doorMesh.name = `facade_${door.id}_${door.positionLoops}`;
      doorMesh.userData['type'] = 'facade';
      doorMesh.visible = this.sceneManagerService
        .getCabinet()
        .getCabinetParams().components.facades.checkBox;
      console.log(doorMesh.name);
      // Устанавливаем позицию двери относительно шкафа
      const xOffset = 0;
      doorMesh.position.set(
        xOffset,
        yPosition,
        this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 1,
      );

      this.sceneManagerService.addObject(doorMesh);
      this.facades.set(this.doorCounter++, doorMesh);
      createdFacades.push(doorMesh);
    } else {
      for (let i = 0; i < 2; i++) {
        console.log('Facade_' + i);
        const doorMesh = BaseCabinet.createMesh(doorSize, material);
        doorMesh.name = `facade_${door.id}_${i == 0 ? 'left' : 'right'}`;
        doorMesh.visible = this.sceneManagerService
          .getCabinet()
          .getCabinetParams().components.facades.checkBox;
        // Устанавливаем позицию двери относительно шкафа
        let xOffset = i == 0 ? -doorSize.width / 2 : doorSize.width / 2;
        xOffset += i == 0 ? -INTERVAL_1_MM : INTERVAL_1_MM;
        doorMesh.position.set(
          xOffset,
          yPosition,
          this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 3,
        );

        this.sceneManagerService.addObject(doorMesh);
        this.facades.set(this.doorCounter++, doorMesh);
        createdFacades.push(doorMesh);
      }
    }

    return createdFacades;
  }

  private addOverheadHandleFacade(
    facade: Facade,
    cabinetType: CabinetSubType,
    material: THREE.Material,
  ): THREE.Object3D[] {
    const createdFacades: THREE.Object3D[] = [];

    const width = facade.size.width;
    const cutHeight = facade.cutHeight ?? 16;
    const visibleHeight = this.cabinetSize.height - cutHeight;
    const depth = WALL_THICKNESS;

    const handle = facade.handle;
    const handleOffset = handle?.indentX || 10;

    const doorSize: Size = { width, height: visibleHeight, depth };
    const yPosition = this.cabinetSize.height / 2 - PODIUM_HEIGHT / 2 + cutHeight / 2 - 2;
    if (cabinetType === CabinetSubType.Single) {
      const doorMesh = BaseCabinet.createMesh(doorSize, material);
      doorMesh.name = `facade_${facade.id}_${facade.positionLoops}`;
      doorMesh.userData['type'] = 'facade';

      doorMesh.position.set(
        0,
        yPosition,
        this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM,
      );
      this.sceneManagerService.addObject(doorMesh);
      this.facades.set(this.doorCounter++, doorMesh);
      createdFacades.push(doorMesh);

      if (handle) {
        const isRight = facade.positionLoops == 'right-side';
        const handleX = isRight ? -width / 2 + handleOffset : width / 2 - handleOffset;
        this.loadHandleModel(
          handle,
          doorMesh,
          new THREE.Vector3(handleX, 0, WALL_THICKNESS / 2),
          'OVERHEAD_HANDLE',
          facade.size,
        );
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const doorMesh = BaseCabinet.createMesh(doorSize, material);
        doorMesh.name = `facade_${facade.id}_${i == 0 ? 'left' : 'right'}`;
        doorMesh.userData['type'] = 'facade';

        let xOffset = i == 0 ? -doorSize.width / 2 : doorSize.width / 2;
        xOffset += i == 0 ? -INTERVAL_1_MM : INTERVAL_1_MM;

        doorMesh.position.set(
          xOffset,
          yPosition,
          this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 3,
        );
        this.sceneManagerService.addObject(doorMesh);
        this.facades.set(this.doorCounter++, doorMesh);
        createdFacades.push(doorMesh);

        if (handle) {
          const handleX =
            i == 0
              ? width / 2 - handleOffset - handle.size.width / 2
              : -width / 2 + handleOffset + handle.size.width / 2;

          this.loadHandleModel(
            handle,
            doorMesh,
            new THREE.Vector3(handleX, 0, WALL_THICKNESS / 2),
            'OVERHEAD_HANDLE',
            facade.size,
          );
        }
      }
    }
    return createdFacades;
  }

  private addEndHandleFacade(
    facade: Facade,
    cabinetType: CabinetSubType,
    material: THREE.Material,
  ): THREE.Object3D[] {
    const createdFacades: THREE.Object3D[] = [];

    const width = facade.size.width;
    const cutHeight = facade.cutHeight ?? 16;
    const visibleHeight = this.cabinetSize.height - cutHeight;
    const depth = WALL_THICKNESS;

    const handle = facade.handle;

    const doorSize: Size = { width, height: visibleHeight, depth };
    const yPosition = this.cabinetSize.height / 2 - PODIUM_HEIGHT / 2 + cutHeight / 2 - 2;
    const yHandlePosition = -visibleHeight / 2 + handle.size.depth / 2;
    const isRight = facade.positionLoops == 'right-side';

    if (cabinetType === CabinetSubType.Single) {
      const doorMesh = BaseCabinet.createMesh(doorSize, material);
      doorMesh.name = `facade_${facade.id}_${facade.positionLoops}`;
      doorMesh.position.set(
        0,
        yPosition,
        this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM,
      );
      this.sceneManagerService.addObject(doorMesh);
      this.facades.set(this.doorCounter++, doorMesh);
      createdFacades.push(doorMesh);
      if (handle) {
        const handleX = isRight
          ? -width / 2 + handle.size.height / 2 - 1
          : width / 2 - handle.size.height / 2 + 1;

        this.loadHandleModel(
          handle,
          doorMesh,
          new THREE.Vector3(handleX, yHandlePosition, WALL_THICKNESS / 2 - 2),
          'END_HANDLE',
          facade.size,
        );
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const doorMesh = BaseCabinet.createMesh(doorSize, material);
        doorMesh.name = `facade_${facade.id}_${i == 0 ? 'left' : 'right'}`;

        let xOffset = i == 0 ? -doorSize.width / 2 : doorSize.width / 2;
        xOffset += i == 0 ? -INTERVAL_1_MM : INTERVAL_1_MM;

        doorMesh.position.set(
          xOffset,
          yPosition,
          this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 3,
        );
        this.sceneManagerService.addObject(doorMesh);
        this.facades.set(this.doorCounter++, doorMesh);
        createdFacades.push(doorMesh);

        if (handle) {
          let handleX: number;

          if (i === 0) {
            // левая створка
            handleX = width / 2 - handle.size.height / 2 + 0.5;
          } else {
            // правая створка
            handleX = -width / 2 + handle.size.height / 2 - 0.5;
          }

          this.loadHandleModel(
            handle,
            doorMesh,
            new THREE.Vector3(handleX, yHandlePosition, WALL_THICKNESS / 2 - 2),
            'END_HANDLE',
            facade.size,
            i == 0 ? 'left-side' : 'right-side',
          );
        }
      }
    }

    return createdFacades;
  }

  private loadHandleModel(
    handle: IHandle,
    parentDoor: THREE.Object3D,
    position: THREE.Vector3,
    handleType: HandleType,
    facadeSize: Size,
    side?: 'left-side' | 'right-side',
  ) {
    const loader = new OBJLoader();
    loader.load(
      handle.path,
      (object) => {
        const bbox = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        object.position.sub(center);

        const scaleX = handle.size.width / size.x;
        const scaleY = handle.size.height / size.y;
        const scaleZ = handle.size.depth / size.z;
        object.scale.set(scaleX, scaleY, scaleZ);

        if (handleType === 'OVERHEAD_HANDLE') {
          object.rotateX(Math.PI / 2);
        } else {
          if (side === 'left-side') {
            object.rotation.set(Math.PI / 2, -Math.PI, Math.PI / 2);
          } else {
            object.rotation.set(Math.PI / 2, 0, Math.PI / 2);
          }
        }

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({ color: 0x333333 });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
        // Важно: записываем данные ДО того, как добавим на сцену
        object.userData = {
          type: 'handle',
          handleData: handle, // Передаем ссылку на объект IHandle
          side: side,
        };
        object.name = `handle_${side}`;

        // Расчет стартовой локальной позиции на основе indent из модели
        const localY = -facadeSize.height / 2 + handle.indentY + handle.size.height / 2;
        let localX = 0;

        if (handleType === 'OVERHEAD_HANDLE') {
          localX =
            side === 'left-side'
              ? facadeSize.width / 2 - handle.indentX - handle.size.width / 2
              : -facadeSize.width / 2 + handle.indentX + handle.size.width / 2;
        } else {
          localX =
            side === 'left-side'
              ? facadeSize.width / 2 - handle.size.height / 2
              : -facadeSize.width / 2 + handle.size.height / 2;
        }

        object.position.set(
          localX,
          localY,
          WALL_THICKNESS / 2 + (handleType === 'END_HANDLE' ? -2 : 2),
        );

        // Обновляем позицию в самой модели данных
        handle.position = { x: object.position.x, y: object.position.y, z: object.position.z };

        parentDoor.add(object);

        // Отрисовка начальных размеров
        this.dimensionLines.updateHandleDimensions(object, parentDoor, handle);
      },
      undefined,
      (err) => console.error(`Ошибка загрузки модели ручки ${handle.path}:`, err),
    );
  }

  public addMirrorToFacade(
    facade: Facade,
    cabinetType: CabinetSubType,
    facadeObject: THREE.Object3D,
  ): void {
    console.log(
      '____________________________________________addMirrorFacade____________________________________________',
    );
    console.log(facade);
    if (!facade.mirrors || !facade.mirrors.checkbox) {
      // Если чекбокс выключен, то удаляем зеркала
      // console.error('Mirror not initialized for this facade');
      facadeObject.children
        .filter((child) => child.name.startsWith(`mirror_`))
        .forEach((child) => facadeObject.remove(child));
      return;
    }

    // Проверяем наличие материала
    if (!facade.mirrors.mirrorItems?.length || !facade.mirrors.mirrorItems[0].material) {
      console.error('Mirror material not defined for this facade');
      return;
    }
    const mirrorItem = facade.mirrors.mirrorItems[0];
    const facadeWidth = facade.size.width;
    const cutHeight = facade.cutHeight ?? 16;
    const visibleHeight = this.cabinetSize.height - cutHeight;
    // Определяем сторону фасада (left/right)
    const facadeSide = facadeObject.name.includes('left') ? 'left' : 'right';
    const doorDepth = WALL_THICKNESS;

    // --- Определяем отступ под зеркало ---
    let indent = 0;
    if (facade.facadeType === 'HANDLE' && facade.handle?.type === 'OVERHEAD_HANDLE') {
      indent = facade.handle.indentX; // берём отступ из ручки
    }
    const widthMirror =
      cabinetType === CabinetSubType.Single
        ? facade.size.width - indent * 2
        : facade.size.width - indent * 3;
    const mirrorSize: Size = {
      width: widthMirror,
      height: visibleHeight,
      depth: DEEP_04MM,
    };
    const yPosition = 0;
    const mirrorZ = doorDepth / 2 + DEEP_04MM / 2 + 0.1;

    // Загружаем текстуру
    const textureLoader = new THREE.TextureLoader();
    const mirrorTexture = textureLoader.load(mirrorItem.material.texture.path);
    mirrorTexture.wrapS = THREE.RepeatWrapping;
    mirrorTexture.wrapT = THREE.RepeatWrapping;
    mirrorTexture.repeat.set(1, 1);

    // Создаем материал
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      map: mirrorTexture,
      metalness: 0.3,
      roughness: 0.2,
      envMap: this.sceneManagerService.getEnvMap(),
      envMapIntensity: 1.5,
    });

    // Удаляем старые зеркала этой стороны
    facadeObject.children
      .filter((child) => child.name.startsWith(`mirror_${facadeSide}_`))
      .forEach((child) => facadeObject.remove(child));

    // Создаем новое зеркало с уникальным именем
    const mirrorCount = (facadeObject.userData['countMirror'] || 0) + 1;
    const mirrorMesh = BaseCabinet.createMesh(mirrorSize, mirrorMaterial);

    // Формируем уникальное имя зеркала
    mirrorMesh.name = `mirror_${facadeSide}_${mirrorCount}`;
    mirrorMesh.userData['id'] = mirrorCount;

    // позиция зеркала с учётом отступов
    let x = 0;
    if (facade.facadeType === 'HANDLE') {
      if (cabinetType === CabinetSubType.Single) {
        // если ручка слева — сдвигаем вправо
        if (facade.handle.position?.x <= facade.size.width / 2) {
          x = indent;
        } else {
          // если справа — сдвигаем влево
          x = -indent;
        }
      } else if (cabinetType === CabinetSubType.Double) {
        if (facadeObject.name.includes('left')) {
          x = -indent - indent / 2; // зеркало смещается внутрь
        } else {
          x = indent + indent / 2; // для правой створки смещаем влево
        }
      }
    }

    mirrorMesh.position.set(x, yPosition, mirrorZ);

    facadeObject.add(mirrorMesh);
    facadeObject.userData['countMirror'] = mirrorCount;

    // === Обновляем модель фасада ===
    facade.mirrors.mirrorItems = [
      {
        ...mirrorItem,
        size: mirrorSize,
        position: { x, y: yPosition, z: mirrorZ },
      },
    ];
  }

  public deleteAllMirrors(): void {
    // Пройтись по всем дверям
    for (const facade of this.facades.values()) {
      // Находим все зеркала в door.children
      const mirrors = facade.children.filter(
        (child) => child.name.startsWith('mirror_left_') || child.name.startsWith('mirror_right_'),
      );

      // Удаляем каждое зеркало
      mirrors.forEach((mirror) => {
        facade.remove(mirror);
      });

      // Сбрасываем счётчик зеркал
      facade.userData['countMirror'] = 0;
    }

    // Очищаем данные в параметрах фасадов
    const cabinet = this.sceneManagerService.getCabinet();
    const params = cabinet.getCabinetParams();
    params.components.facades.facadeItems.forEach((facade) => {
      if (facade.mirrors) {
        facade.mirrors.mirrorItems = [];
      }
    });
  }
  public deleteMirror(doorObject: THREE.Object3D): void {
    // Находим все зеркала на этом фасаде
    const mirrors = doorObject.children.filter(
      (child) => child.name.startsWith('mirror_left_') || child.name.startsWith('mirror_right_'),
    );

    // Удаляем последнее добавленное зеркало
    if (mirrors.length > 0) {
      const lastMirror = mirrors[mirrors.length - 1];
      doorObject.remove(lastMirror);

      // Обновляем счетчик
      const currentCount = doorObject.userData['countMirror'] || 0;
      doorObject.userData['countMirror'] = Math.max(0, currentCount - 1);
    }
  }

  public deleteMirrorById(id: number): void {
    for (const door of this.facades.values()) {
      // Ищем зеркало с указанным ID
      const mirror = door.children.find(
        (child) =>
          child.name.startsWith('mirror_left_') ||
          (child.name.startsWith('mirror_right_') && child.userData['id'] == id),
      );

      if (mirror) {
        door.remove(mirror);

        // Обновляем параметры фасада
        // const cabinet = this.sceneManagerService.getCabinet();
        // const params = cabinet.getCabinetParams();

        // // Определяем индекс фасада по имени двери
        // const doorIndex = door.name.includes('left') ? 0 : 1;
        // if (params.components.facades.facadeItems[doorIndex]?.mirrors?.mirrorItems) {
        //     params.components.facades.facadeItems[doorIndex].mirrors.mirrorItems = [];
        // }

        // cabinet.updateCabinetParams(params);
        break;
      }
    }
  }

  private addMDF(facade: Facade, cabinetType: CabinetSubType, material: THREE.Material): void {}

  private createDoorMesh(
    facade: Facade,
    cabinetType: CabinetSubType,
    doorSize: Size,
    material: THREE.Material,
  ): void {
    if (cabinetType === CabinetSubType.Single) {
      const doorMesh = BaseCabinet.createMesh(doorSize, material);
      doorMesh.name = `facade_${facade.id}_${facade.positionLoops}`;

      const xOffset = 0;
      doorMesh.position.set(
        xOffset,
        this.cabinetSize.height / 2,
        this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 3,
      );

      this.sceneManagerService.addObject(doorMesh);
      this.facades.set(this.doorCounter++, doorMesh);
    } else {
      for (let i = 0; i < 2; i++) {
        const doorMesh = BaseCabinet.createMesh(doorSize, material);
        doorMesh.name = `facade_${facade.id}_${i === 0 ? 'left' : 'right'}`;

        let xOffset = i === 0 ? -doorSize.width / 2 : doorSize.width / 2;
        xOffset += i === 0 ? -INTERVAL_1_MM : INTERVAL_1_MM;
        doorMesh.position.set(
          xOffset,
          this.cabinetSize.height / 2,
          this.cabinetSize.depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 3,
        );

        this.sceneManagerService.addObject(doorMesh);
        this.facades.set(this.doorCounter++, doorMesh);
      }
    }
  }

  public updateDoor(door: Facade, cabinetType: CabinetSubType, cabinetSize: Size): void {
    console.log(`Обновление двери с фасадом: ${door.facadeType}`);

    const isFacadeVisible = this.sceneManagerService.getCabinet().getCabinetParams().components
      .facades.checkBox;
    // this.fasade.type = door.fasadeType;
    // this.fasade.material = door.material;
    // Удаляем старые двери
    this.clearFacades();

    // Добавляем новые двери в зависимости от конфигурации
    this.addFacade(door, cabinetType, cabinetSize);

    // Устанавливаем видимость новых дверей
    this.facades.forEach((facadeMesh) => {
      facadeMesh.visible = isFacadeVisible;
      isFacadeVisible ? facadeMesh.layers.enable(0) : facadeMesh.layers.disable(0);
    });
  }

  public updateDoorMaterial(newMaterial: MMaterial): void {
    const isFacadeVisible = this.sceneManagerService.getCabinet().getCabinetParams().components
      .facades.checkBox; // Проверяем checkBox

    const material = BaseCabinet.getMaterial(newMaterial.texture.path);
    // 1. Обновление материалов в Map<number, Mesh> doors
    (this.facades as Map<number, THREE.Object3D>).forEach((doorMesh, index) => {
      if (doorMesh instanceof THREE.Mesh) {
        doorMesh.material = material;
        // Устанавливаем видимость в зависимости от checkBox
        doorMesh.visible = isFacadeVisible;
        isFacadeVisible ? doorMesh.layers.enable(0) : doorMesh.layers.disable(0);
      } else if (doorMesh instanceof THREE.Object3D) {
        doorMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.visible = isFacadeVisible;
            isFacadeVisible ? child.layers.enable(0) : child.layers.disable(0);
          }
        });
      }
    });
    // 2. Обновление материалов в созданных объектах сцены
    const createdObjects = this.sceneManagerService.getObjects();
    createdObjects.forEach((object) => {
      if (object.name?.startsWith('facade')) {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Обновляем только если это именно фасад, а не ручка/зеркало
            if (child.name?.startsWith('mirror_') || child.parent?.name?.includes('handle_')) {
              return; // пропускаем зеркала и ручки
            }
            child.material = material;
            child.visible = isFacadeVisible;
            isFacadeVisible ? child.layers.enable(0) : child.layers.disable(0);
          }
        });
      }
    });
  }

  public updateDoorFasade(newFasade: string): void {}

  public updateFacadeSize(
    cabinetSize: Size,
    cabinetType: CabinetSubType,
    facadeType: FacadeType,
    facades: Facade[],
  ): void {
    this.cabinetSize = cabinetSize;

    if (facades.length === 0 || this.facades.size === 0) {
      console.warn(`Нет дверей! ${this.facades.size}`);
      return;
    }
    const { width, height, depth } = cabinetSize;
    const isIntegratedHandle = facadeType === 'INTEGRATED_HANDLE';

    // === Пересчёт параметров фасадов ===
    facades.forEach((facade, index) => {
      const cutHeight = facade.cutHeight ?? 16;
      const newFacadeSize: Size = FacadeManager.calculateDoorSize(
        width,
        height - cutHeight,
        isIntegratedHandle,
        cabinetType,
      );

      if (!facade.originalHeight) {
        facade.originalHeight = newFacadeSize.height;
      }

      facade.size = newFacadeSize;
      facade.facadeType = facadeType;

      facade.positionFacade = {
        x: this.getFacadeXOffset(index, width, cabinetType),
        y: 0,
        z: 0,
      };

      const facadeName = `facade_${facade.id}_${facade.positionLoops}`;
      console.log('facadeName: ', facadeName);
      if (facade.mirrors?.checkbox) {
        const facadeObject = this.sceneManagerService.getObjectByName(facadeName);
        if (facadeObject) {
          this.addMirrorToFacade(facade, cabinetType, facadeObject);
        }
      }
    });

    // === Обновление геометрии Mesh’ей на сцене ===
    const yPosition =
      this.cabinetSize.height / 2 - PODIUM_HEIGHT / 2 + (facades[0].cutHeight ?? 0) / 2;
    console.log(facades);
    console.log(this.facades);
    if (facades.length === 1 && this.facades.size === 1) {
      const door = facades[0];
      const mesh = Array.from(this.facades.values())[0];

      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(door.size.width, door.size.height, door.size.depth);
        mesh.position.set(0, yPosition, depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 2);
      }
    } else if (facades.length === 2 && this.facades.size === 2) {
      const meshArray = Array.from(this.facades.values());
      facades.forEach((door, i) => {
        const mesh = meshArray[i];
        if (!(mesh instanceof THREE.Mesh)) return;

        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(door.size.width, door.size.height, door.size.depth);

        let xOffset = i === 0 ? -width / 4 : width / 4;
        xOffset += i === 0 ? -INTERVAL_1_MM : INTERVAL_1_MM;

        mesh.position.set(xOffset, yPosition, depth / 2 + WALL_THICKNESS / 2 + INTERVAL_1_MM * 2);
      });
    }
  }
  private getFacadeXOffset(index: number, width: number, doorType: CabinetSubType): number {
    if (doorType === 'double') {
      const halfWidth = width / 2;
      return index == 0 ? -halfWidth - INTERVAL_1_MM : halfWidth + INTERVAL_1_MM;
    }
    return 0;
  }

  private updateMeshGeometry(mesh: THREE.Mesh, size: Size): void {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
  }

  // Общий метод для расчета размеров двери
  public static calculateDoorSize(
    width: number,
    height: number,
    isIntegratedHandle: boolean,
    doorType: CabinetSubType,
  ): Size {
    const calculatedWidth =
      doorType == CabinetSubType.Double ? width / 2 - INTERVAL_1_MM * 2 : width - INTERVAL_1_MM * 2;
    return {
      width: calculatedWidth,
      height,
      depth: WALL_THICKNESS,
    };
  }

  /**
   *
   * @param newDirection - новое направление открывания двери
   */
  public updateDoorPositionLoops(newDirection: 'left-side' | 'right-side'): void {
    console.log('updateDoorPositionLoops');
    // Получаем текущие параметры кабинета
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetParams = cabinet.getCabinetParams();
    const facadeItems = cabinetParams.components.facades.facadeItems;

    // Удаляем все существующие фасады
    this.clearFacades();

    facadeItems[0].positionLoops = newDirection;
    console.log(facadeItems[0]);
    const cabinetSize = cabinetParams.dimensions.general;
    const cabinetType = cabinetParams.subType;
    // Обновляем локальное значение
    this.positionLoops = newDirection;
    this.doorCounter = 0;
    // Пересоздаем фасады с новыми параметрами
    this.addFacade(facadeItems[0], cabinetType, cabinetSize);

    // --- Сдвигаем зеркало для одностворчатого шкафа ---
    if (
      cabinetType === CabinetSubType.Single &&
      facadeItems[0].mirrors?.checkbox &&
      facadeItems[0].handle?.type === 'OVERHEAD_HANDLE'
    ) {
      const facadeObject = Array.from(this.facades.values())[0]; // берём первую дверь
      const mirrorObjects = facadeObject.children.filter((child) =>
        child.name.startsWith('mirror_'),
      );

      mirrorObjects.forEach((mirror) => {
        // Смещение в зависимости от нового направления
        const shift = facadeItems[0].handle.indentX;
        mirror.position.x = newDirection === 'left-side' ? -shift : shift;
      });
    }
  }

  public updateCabinetSize(newSize: Size): void {
    this.cabinetSize = newSize;
  }

  public hasDoors(): boolean {
    return this.facades.size > 0;
  }

  public showFacades(): void {
    const isFacadeVisible = this.sceneManagerService.getCabinet().getCabinetParams().components
      .facades.checkBox;

    this.facades.forEach((facadeMesh) => {
      facadeMesh.visible = isFacadeVisible;
      isFacadeVisible ? facadeMesh.layers.enable(0) : facadeMesh.layers.disable(0);

      // Включаем зеркала фасада
      facadeMesh.children
        .filter((child) => child.name.startsWith('mirror_'))
        .forEach((child) => (child.visible = true));
    });
  }

  public updateFacadeVisibility(): void {
    const isFacadeVisible = this.sceneManagerService.getCabinet().getCabinetParams().components
      .facades.checkBox;

    this.facades.forEach((facadeMesh) => {
      facadeMesh.visible = isFacadeVisible;
      isFacadeVisible ? facadeMesh.layers.enable(0) : facadeMesh.layers.disable(0);

      // Также обновляем видимость зеркал
      facadeMesh.children
        .filter((child) => child.name.startsWith('mirror_'))
        .forEach((child) => {
          child.visible = isFacadeVisible;
        });
    });

    // Обновляем созданные объекты сцены
    const createdObjects = this.sceneManagerService.getObjects();
    createdObjects.forEach((object) => {
      if (object.name?.startsWith('facade')) {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.visible = isFacadeVisible;
            isFacadeVisible ? child.layers.enable(0) : child.layers.disable(0);
          }
        });
      }
    });
  }

  public hideDoors(): void {
    this.facades.forEach((facadeMesh) => {
      facadeMesh.layers.disable(0); // Отключаем слой по умолчанию (чтобы Raycaster их игнори
      facadeMesh.visible = false; // Полностью скрываем

      // Выключаем зеркала фасада
      facadeMesh.children
        .filter((child) => child.name.startsWith('mirror_'))
        .forEach((child) => {
          child.visible = false;
          child.layers.disable(0); // чтобы Raycaster не ловил клик
        });
    });
  }

  public clearSceneFacades(): void {
    console.log('Заходим в clearSceneDoors!');
    this.facades.forEach((mesh, id) => {
      console.log('Удаляем: ', mesh.name);
      this.sceneManagerService.deleteObject(mesh); // удаляем объект из сцены
    });
    this.facades.clear(); // очищаем Map, но данные в cabinetParams остаются
  }

  public clearFacades(): void {
    console.log('Удаление дверей...');
    this.sceneManagerService.getObjects().forEach((obj) => {
      if (obj instanceof THREE.Object3D && obj.name.startsWith('facade')) {
        // console.log(`Удаляем дверь: ${obj.name}`);

        // Удаляем объект из сцены
        this.sceneManagerService.deleteObject(obj);
      }
    });
    this.facades.clear();
    this.doorCounter = 0;
    console.log('Удаление завершено.');
  }
}
