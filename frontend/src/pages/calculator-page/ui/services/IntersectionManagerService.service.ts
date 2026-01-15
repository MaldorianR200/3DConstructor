import * as THREE from 'three';
import { Injectable } from '@angular/core';
import { CabinetGridManagerService } from './CabinetGridManagerService.service';
import { PositionCutout } from '../сabinet/model/Facade';

@Injectable({ providedIn: 'root' })
export class IntersectionManagerService {
  private collidingObjects = new Set<THREE.Object3D>();

  constructor() {}

  public highlightObjectsOnMove(
    movingObject: THREE.Object3D,
    scene: THREE.Scene,
    gridColor: number = 0x0000ff,
  ): void {
    const objects: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (
        child !== movingObject &&
        !child.name.includes('shelfDimensionLine') &&
        (child.name.startsWith('shelf') ||
          child.name.startsWith('mullion') ||
          child.name.startsWith('topShelf_') ||
          child.name.startsWith('drawerBlock_'))
      ) {
        objects.push(child);
      }
    });
    let isColliding = false;
    const newCollidingObjects = new Set<THREE.Object3D>();
    console.log('movingObject name:', movingObject.name);
    for (const otherObject of objects) {
      const distance = this.calculateDistance(movingObject, otherObject);
      const isMovingShelf = movingObject.name.startsWith('shelf');
      const isMovingMullion = movingObject.name.startsWith('mullion');
      const isMullion = otherObject.name.startsWith('mullion');
      const isMovingDrawer = movingObject.name.startsWith('drawerBlock');
      console.log('isMovingDrawer: ', isMovingDrawer);
      if (isMovingShelf && distance < 112) {
        this.highlightObject(otherObject, 0xff0000);
        newCollidingObjects.add(otherObject);
        isColliding = true;
      } else if (isMovingShelf && isMullion) {
        const isVerticallyAligned =
          Math.abs(movingObject.position.x - otherObject.position.x) < 0.1;

        if (isVerticallyAligned) {
          this.highlightObject(otherObject, 0xff0000);
          this.highlightObject(movingObject, 0xff0000);
          newCollidingObjects.add(otherObject);
          newCollidingObjects.add(movingObject);
          isColliding = true;
        }
      } else if (isMovingMullion) {
        this.highlightObject(otherObject, 0xff0000);
        this.highlightObject(movingObject, 0xff0000);
        newCollidingObjects.add(otherObject);
        newCollidingObjects.add(movingObject);
        isColliding = true;
      } else if (isMovingDrawer) {
        console.log('DRAWER!');
        this.highlightObject(otherObject, 0xff0000);
        this.highlightObject(movingObject, 0xff0000);
        newCollidingObjects.add(otherObject);
        newCollidingObjects.add(movingObject);
        isColliding = true;
      }
    }

    this.removePreviousHighlights(this.collidingObjects, newCollidingObjects);
    this.collidingObjects = newCollidingObjects;

    const movingObjectColor = isColliding ? gridColor : 0x00ff00;
    this.highlightObject(movingObject, movingObjectColor);
  }

  /**
   *  Пересечение полки с петлей
   * @param shelf
   * @param hinges
   * @returns
   */
  public checkShelfHingeIntersections(
    shelf: THREE.Object3D,
    hinges: THREE.Object3D[],
  ): PositionCutout | null {
    const intersectedSides: ('left' | 'right')[] = [];

    // Обновляем матрицу для точных мировых координат
    shelf.updateMatrixWorld(true);
    const shelfBox = new THREE.Box3().setFromObject(shelf);

    for (const hinge of hinges) {
      hinge.updateMatrixWorld(true);
      const hingeBox = new THREE.Box3().setFromObject(hinge);

      if (shelfBox.intersectsBox(hingeBox)) {
        const hingeWorldPosition = new THREE.Vector3();
        hinge.getWorldPosition(hingeWorldPosition);

        // console.log('hinge world x: ', hingeWorldPosition.x);

        const side = hingeWorldPosition.x < 0 ? 'left' : 'right';
        if (!intersectedSides.includes(side)) {
          intersectedSides.push(side);
        }
      }
    }

    console.log(intersectedSides);

    if (intersectedSides.length === 2) return 'both';
    if (intersectedSides.includes('left')) return 'left-side';
    if (intersectedSides.includes('right')) return 'right-side';
    return null;
  }

  public findTopShelfInGroup(group: THREE.Object3D): THREE.Object3D | null {
    if (group.name.startsWith('topShelf_')) {
      return group;
    }

    for (const child of group.children) {
      const result = this.findTopShelfInGroup(child);
      if (result) return result;
    }

    return null;
  }

  public static findIntersectedDrawerBlock(
    newBlockBox: THREE.Box3,
    scene: THREE.Scene,
  ): THREE.Object3D | null {
    for (const object of scene.children) {
      if (object.name.startsWith('drawerBlock_')) {
        const existingBox = new THREE.Box3().setFromObject(object);
        if (newBlockBox.intersectsBox(existingBox)) {
          return object;
        }
      }
    }
    return null;
  }

  public static checkMullionIntersections(mullion: THREE.Object3D, scene: THREE.Scene): boolean {
    if (!mullion) return false;

    const mullionBox = new THREE.Box3().setFromObject(mullion);
    const allObjects = scene.children;
    let hasIntersection = false;

    for (const object of allObjects) {
      if (object === mullion || object.name.includes('dimension')) continue;

      const objectBox = new THREE.Box3().setFromObject(object);
      if (mullionBox.intersectsBox(objectBox)) {
        hasIntersection = true;
        break;
      }
    }

    if (hasIntersection) {
      CabinetGridManagerService.highlightObjectWithGrid(mullion, 0x0000ff);
    } else {
      CabinetGridManagerService.removeGridHighlight(mullion);
    }

    return hasIntersection;
  }

  private calculateDistance(object1: THREE.Object3D, object2: THREE.Object3D): number {
    return object1.position.distanceTo(object2.position);
  }

  private highlightObject(object: THREE.Object3D, color: number): void {
    if (object instanceof THREE.Group) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          CabinetGridManagerService.highlightObjectWithGrid(child, color);
        }
      });
    } else if (object instanceof THREE.Mesh) {
      CabinetGridManagerService.highlightObjectWithGrid(object, color);
    }
  }

  // private highlightObject(object: THREE.Object3D, color: number): void {
  //   CabinetGridManagerService.highlightObjectWithGrid(object, color);
  // }

  private removePreviousHighlights(
    previousObjects: Set<THREE.Object3D>,
    currentObjects: Set<THREE.Object3D>,
  ): void {
    previousObjects.forEach((obj) => {
      if (!currentObjects.has(obj)) {
        CabinetGridManagerService.removeGridHighlight(obj);
      }
    });
  }
}
