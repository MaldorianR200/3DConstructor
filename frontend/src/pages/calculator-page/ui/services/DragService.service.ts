import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { SceneManagerService } from './SceneManager.service';

@Injectable({ providedIn: 'root' })
export class DragService {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(private sceneManager: SceneManagerService) {}

  selectObject(event: MouseEvent): THREE.Object3D | null {
    const intersects = this.raycast(event);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  private raycast(event: MouseEvent): THREE.Intersection<THREE.Object3D>[] {
    const rect = this.sceneManager.getRenderer().domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.getCamera());
    return this.raycaster.intersectObjects(this.sceneManager.getScene().children, true);
  }
}
