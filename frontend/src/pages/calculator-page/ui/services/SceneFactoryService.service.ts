import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Lighting } from '../сabinet/objects/Lighting';
@Injectable({ providedIn: 'root' })
export class SceneFactoryService {
  createScene(): THREE.Scene {
    return new THREE.Scene();
  }

  createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / (window.innerHeight - 8),
      1, // 0.25 near отвечает за замедление камеры
      20000,
    );
    camera.position.set(0, 500, 1500);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  }

  createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight - 108);
    renderer.shadowMap.enabled = true;
    return renderer;
  }

  createLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): Lighting {
    const light = new Lighting(scene, renderer);
    return light;
  }
}
