import * as THREE from 'three';
import { SceneManagerService } from '../../services/SceneManager.service';

export interface IDimensionLines {
  createDimensionLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    length: number,
    isShelf: boolean,
    isFirstShelf?: boolean,
    arrowSize?: number,
  ): THREE.Group;

  createTextSprite(message: string): THREE.Sprite;

  removeAllDimensionLines(): void;
}
