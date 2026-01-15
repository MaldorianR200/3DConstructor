import * as THREE from 'three';
import { DimensionLines } from '../../DimensionLines';
import { Mullion } from '../../../model/Mullion';
import { ICabinet } from 'src/entities/Cabinet';
import { CabinetGridManagerService } from 'src/pages/calculator-page/ui/services/CabinetGridManagerService.service';
import {
  DEPTH_EDGE_08MM,
  DEPTH_WIDTH_INTG_HADLE,
  INTERVAL_1_MM,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  WALL_THICKNESS,
} from '../../../constants';
import { RoundedBoxGeometry } from 'three-stdlib';
import { IColor } from 'src/entities/Color';
import { MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { BaseCabinet } from '../../../cabinetTypes/BaseCabinet';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { zip } from 'rxjs';

/**
 * class для управления средником в шкафу
 */
export class MullionManager {
  private mullion: THREE.Object3D | null = null;
  private sceneManagerService: SceneManagerService;
  private size: Size;
  dimensionLines: any;

  constructor(sceneManagerService: SceneManagerService, size: Size) {
    this.sceneManagerService = sceneManagerService;
    this.size = size;
  }

  public createMullion(date: Mullion): void {
    if (this.mullion) {
      this.removeMullion();
    }
    // Присваем глобальные размеры шкафа для size
    this.size = date.size;
    const sizeMullion: Size = date.size;
    let plinth;

    const mullionMaterial = BaseCabinet.getMaterial(date.material.texture.path);
    // Материал для кромки
    // const edgeMaterial = new THREE.MeshStandardMaterial({
    //   color: date.material.color.hex,
    // });
    const edgeMaterial = BaseCabinet.getMaterial(date.material.texture.path);
    // Геометрия средника
    const mullionGeometry = new THREE.BoxGeometry(
      sizeMullion.width,
      sizeMullion.height,
      sizeMullion.depth,
    );
    const mullionMesh = new THREE.Mesh(mullionGeometry, mullionMaterial);
    mullionMesh.position.set(date.position.x, date.position.y, date.position.z);
    mullionMesh.name = `mullion`;

    // Смещаем центральную панель в цоколе на 16мм от средника
    this.shiftPlinthCenter(WALL_THICKNESS);

    // Передняя кромка 0.8 мм (всегда)
    const frontEdge = new THREE.Mesh(
      new RoundedBoxGeometry(sizeMullion.width, sizeMullion.height, 0.8, 2, 0.2),
      edgeMaterial,
    );
    frontEdge.position.set(0, 0, sizeMullion.depth / 2 + DEPTH_EDGE_08MM / 2);
    frontEdge.name = `frontEdgeMullion`;
    mullionMesh.add(frontEdge);

    this.sceneManagerService.addObject(mullionMesh);
    this.mullion = mullionMesh;

    // Добавляем горизонтальную размерную линию
    // this.dimensionLines.addMullionHorizontalDimensionLine(
    //   mullionMesh,
    //   this.size.width,
    //   this.size.height,
    //   WALL_THICKNESS,
    // );
  }

  public getMullion(): THREE.Object3D | null {
    return this.mullion;
  }

  public getMullionHeight(): number {
    return this.size.height;
  }

  /**
 * Проверяет, пересекается ли средник с полкой
 */
public doesMullionIntersectShelf(shelf: THREE.Object3D): boolean {
  if (!this.mullion) return false;

  const mullionHeight = this.size.height;
  const mullionTop = this.mullion.position.y + mullionHeight / 2;
  const mullionBottom = this.mullion.position.y - mullionHeight / 2;

  const shelfHeight = SHELF_HEIGHT;
  const shelfTop = shelf.position.y + shelfHeight / 2;
  const shelfBottom = shelf.position.y - shelfHeight / 2;

  return shelfBottom < mullionTop && shelfTop > mullionBottom;
}

/**
 * Получает полки, которые пересекаются со средником
 */
public getIntersectingShelves(shelves: THREE.Object3D[]): THREE.Object3D[] {
  return shelves.filter(shelf => this.doesMullionIntersectShelf(shelf));
}

/**
 * Получает следующую полку выше средника
 */
public getNextShelfAbove(shelves: THREE.Object3D[]): THREE.Object3D | null {
  if (!this.mullion) return null;

  const mullionTop = this.mullion.position.y + this.size.height / 2;
  return this.findClosestShelfAbove(mullionTop, shelves);
}

/**
 * Получает следующую полку ниже средника
 */
public getNextShelfBelow(shelves: THREE.Object3D[]): THREE.Object3D | null {
  if (!this.mullion) return null;

  const mullionBottom = this.mullion.position.y - this.size.height / 2;
  return this.findClosestShelfBelow(mullionBottom, shelves);
}

/**
 * Находит ближайшую полку выше указанной позиции
 */
private findClosestShelfAbove(positionY: number, shelves: THREE.Object3D[]): THREE.Object3D | null {
  let closestShelf: THREE.Object3D | null = null;
  let minDistance = Infinity;

  for (const shelf of shelves) {
    const shelfBottom = shelf.position.y - SHELF_HEIGHT / 2;
    const distance = shelfBottom - positionY;

    // Ищем самую близкую полку выше текущего положения
    // Используем небольшой зазор, чтобы не считать ту же самую позицию
    if (distance > INTERVAL_1_MM && distance < minDistance) {
      closestShelf = shelf;
      minDistance = distance;
    }
  }

  return closestShelf;
}

/**
 * Находит ближайшую полку ниже указанной позиции
 */
private findClosestShelfBelow(positionY: number, shelves: THREE.Object3D[]): THREE.Object3D | null {
  let closestShelf: THREE.Object3D | null = null;
  let minDistance = Infinity;

  for (const shelf of shelves) {
    const shelfTop = shelf.position.y + SHELF_HEIGHT / 2;
    const distance = positionY - shelfTop;

    // Ищем самую близкую полку ниже текущего положения
    // Используем небольшой зазор, чтобы не считать ту же самую позицию
    if (distance > INTERVAL_1_MM && distance < minDistance) {
      closestShelf = shelf;
      minDistance = distance;
    }
  }

  return closestShelf;
}

/**
 * Рассчитывает оптимальную высоту для средника на основе полок
 */
public calculateOptimalMullionHeight(shelves: THREE.Object3D[], direction: 'up' | 'down'): number {
  if (!this.mullion) return this.size.height;

  let targetShelf: THREE.Object3D | null = null;

  if (direction === 'up') {
    targetShelf = this.getNextShelfAbove(shelves);
  } else {
    targetShelf = this.getNextShelfBelow(shelves);
  }

  if (!targetShelf) {
    // Если нет полок в этом направлении, возвращаем текущую высоту
    return this.size.height;
  }

  if (direction === 'up') {
    // При движении вверх: средник должен закончиться под полкой
    const shelfBottom = targetShelf.position.y - SHELF_HEIGHT / 2;
    return shelfBottom - PODIUM_HEIGHT - INTERVAL_1_MM;
  } else {
    // При движении вниз: средник должен начаться под полкой
    const shelfBottom = targetShelf.position.y - SHELF_HEIGHT / 2;
    return shelfBottom - PODIUM_HEIGHT - INTERVAL_1_MM;
  }
}

  public updateMullionSize(
    newWidth: number,
    newDepth: number,
    newHeight: number,
    heightCabinet: number,
    facadeType: string,
    countShelf: number = 0,
  ): void {
    const isIntegratedHandle = facadeType === 'INTEGRATED_HANDLE';
    const depthOffset = isIntegratedHandle
      ? newDepth - DEPTH_WIDTH_INTG_HADLE - 4 - 5 - 0.8
      : newDepth - 4 - 5 - 0.8;
    const zPosition = isIntegratedHandle
      ? -DEPTH_WIDTH_INTG_HADLE / 2 + 2 - 2.5 + 1 + 0.4
      : 2 - 2.5 + 1 + 0.4;
    if (this.mullion) {
      this.size.width = newWidth;
      this.size.depth = newDepth;
      this.size.height = newHeight;

      if (countShelf == 0) {
        // Обновляеи основуную геометрию средника
        (this.mullion as THREE.Mesh).geometry.dispose();
        (this.mullion as THREE.Mesh).geometry = new THREE.BoxGeometry(
          WALL_THICKNESS,
          newHeight,
          depthOffset,
        );
        console.log('height Mullion: ', newHeight);
        // Обновите позицию
        const mullionPositionY = heightCabinet / 2;
        (this.mullion as THREE.Mesh).position.y = mullionPositionY;
        (this.mullion as THREE.Mesh).position.z = zPosition;
      } else {
        // Пересоздайте геометрию
        (this.mullion as THREE.Mesh).geometry.dispose();
        console.log('Новая высота: ', newHeight);
        (this.mullion as THREE.Mesh).geometry = new THREE.BoxGeometry(
          WALL_THICKNESS,
          newHeight,
          depthOffset,
        );
        // Обновите позицию
        const mullionPositionY = newHeight / 2 + PODIUM_HEIGHT / 2 + SHELF_HEIGHT;
        (this.mullion as THREE.Mesh).position.y = mullionPositionY;
        (this.mullion as THREE.Mesh).position.z = zPosition;
      }

      // Находим и обновляем кромку
      const frontEdge = this.mullion.children.find((child) => child.name === 'frontEdgeMullion');
      if (frontEdge) {
        // Удаляем старую геометрию кромки
        (frontEdge as THREE.Mesh).geometry.dispose();

        // Создаем новую геометрию кромки с учетом новых размеров
        (frontEdge as THREE.Mesh).geometry = new RoundedBoxGeometry(
          WALL_THICKNESS,
          newHeight,
          0.8,
          2,
          0.2,
        );

        // Обновляем позицию кромки относительно нового размера средника
        frontEdge.position.set(0, 0, depthOffset / 2 + DEPTH_EDGE_08MM / 2);
      }
    }
    // CabinetGridManagerService.removeGridHighlight(this.mullion);
    // CabinetGridManagerService.highlightObjectWithGrid(this.mullion, 0x00ff00);
  }

  public updateMullionSizeImmediately(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const mullion = cabinet.getMullion();
    if (!mullion) return;

    const shelves = Array.from(cabinet.shelfManager.getShelves().values())
      .filter((shelf) => shelf.position.y > PODIUM_HEIGHT)
      .sort((a, b) => a.position.y - b.position.y);

    if (shelves.length === 0) {
      // Нет полок → средник на всю высоту
      const fullHeight = cabinet.getCabinetHeight() - PODIUM_HEIGHT - WALL_THICKNESS;
      this.updateMullionSize(
        cabinet.getCabinetSize().width,
        cabinet.getCabinetDepth(),
        fullHeight,
        cabinet.getCabinetHeight(),
        cabinet.getFacadeType(),
      );
      mullion.position.y = cabinet.getCabinetHeight() / 2;
      return;
    }

    const bottomShelf = shelves[0];
    const isBottomShelfSplit = bottomShelf.position.x !== 0;

    if (!isBottomShelfSplit) {
      // Нижняя полка во всю ширину → средник ограничен по её высоте
      const newHeight =
        bottomShelf.position.y - PODIUM_HEIGHT + WALL_THICKNESS + WALL_THICKNESS / 2;

      this.updateMullionSize(
        cabinet.getCabinetSize().width,
        cabinet.getCabinetDepth(),
        newHeight,
        cabinet.getCabinetHeight(),
        cabinet.getFacadeType(),
      );

      mullion.position.y = PODIUM_HEIGHT + newHeight / 2 - WALL_THICKNESS * 2;
    } else {
      // Нижняя полка смещена влево/вправо
      // ищем следующую "полную" полку
      const nextFullShelf = shelves.find((shelf) => shelf.position.x === 0);

      if (nextFullShelf) {
        // Ограничиваем по следующей полной полке
        const newHeight =
          nextFullShelf.position.y - PODIUM_HEIGHT + WALL_THICKNESS + WALL_THICKNESS / 2;

        this.updateMullionSize(
          cabinet.getCabinetSize().width,
          cabinet.getCabinetDepth(),
          newHeight,
          cabinet.getCabinetHeight(),
          cabinet.getFacadeType(),
        );

        mullion.position.y = PODIUM_HEIGHT + newHeight / 2 - SHELF_HEIGHT * 2;
      } else {
        // Нет полной полки выше → до самой крыши
        console.log('Нет полной полки выше → до самой крыши');
        const fullHeight = cabinet.getCabinetHeight() - PODIUM_HEIGHT - SHELF_HEIGHT * 2;
        console.log('cabinet.getCabinetHeight(): ', cabinet.getCabinetHeight());
        this.updateMullionSize(
          cabinet.getCabinetSize().width,
          cabinet.getCabinetDepth(),
          fullHeight,
          cabinet.getCabinetHeight(),
          cabinet.getFacadeType(),
        );

        mullion.position.y = cabinet.getCabinetHeight() / 2;
      }
    }
  }

  public updateMullionPosition(depth: number, height: number, wallThickness: number = 1): void {
    if (this.mullion) {
      if (depth === 480) {
        this.mullion.position.set(0, height / 2, -depth / 2 + 560);
      } else if (depth === 580) {
        this.mullion.position.set(0, height / 2, INTERVAL_1_MM * 2);
      }
    }
  }

  /**
   *
   *
   * @private - обновление материал
   * @param {MMaterial} newMaterial - Новый материал с текстурой и цветом
   * @memberof mullionManager
   */
  public updateMaterial(newMaterial: MMaterial): void {
    if (!this.mullion) return;

    // 1. Обновляем основной материал средника
    const mullionMesh = this.mullion as THREE.Mesh;

    // Проверяем, что материал существует и является MeshStandardMaterial
    if (mullionMesh.material instanceof THREE.MeshStandardMaterial) {
      // Если нужно полностью заменить материал (с текстурой)
      const newMullionMaterial = BaseCabinet.getMaterial(newMaterial.texture.path);
      mullionMesh.material = newMullionMaterial;
    }

    const frontEdge = this.mullion.getObjectByName('frontEdgeMullion') as THREE.Mesh;
    if (frontEdge && frontEdge.material instanceof THREE.MeshStandardMaterial) {
      frontEdge.material.color.set(newMaterial.color.hex);
    }
  }

  /*--------Методы для центральной планки в цоколе--------*/
  public getPlinthCenter(): THREE.Mesh | null {
    try {
      // 1. Находим группу DoubleCabinet в сцене
      const cabinetGroup = this.sceneManagerService
        .getScene()
        .getObjectByName('DoubleCabinet') as THREE.Group;

      if (!cabinetGroup) {
        console.warn('DoubleCabinet group not found in scene');
        return null;
      }

      // 2. Находим группу plinth внутри DoubleCabinet
      const plinthGroup = cabinetGroup.getObjectByName('plinth') as THREE.Group;

      if (!plinthGroup) {
        console.warn('plinth group not found in DoubleCabinet');
        return null;
      }

      // 3. Ищем центральную панель в группе plinth
      const centerPanel = plinthGroup.getObjectByName('plinthCenter') as THREE.Mesh;

      if (!centerPanel) {
        console.warn('plinthCenter not found in plinth group');
        return null;
      }

      return centerPanel instanceof THREE.Mesh ? centerPanel : null;
    } catch (error) {
      console.error('Error while finding plinth center:', error);
      return null;
    }
  }

  public shiftPlinthCenter(offsetX: number): void {
    const plinth = this.getPlinthCenter();
    if (plinth) {
      plinth.position.x += offsetX;
    }
  }

  public resetPlinthCenterPosition(): void {
    const plinth = this.getPlinthCenter();
    if (plinth) {
      plinth.position.x = 0;
    }
  }

  public removeMullion(): void {
    if (this.mullion) {
      this.sceneManagerService.deleteObject(this.mullion);
      this.mullion = null;
      this.resetPlinthCenterPosition();
    }
  }
}
