import * as THREE from 'three';

export class Lighting {
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private pointLight!: THREE.PointLight;
  constructor(
    private scene: THREE.Scene,
    private renderer: THREE.WebGLRenderer,
  ) {
    this.addLighting();
  }

  private addLighting(): void {
    // Направленный свет (основной источник)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    this.directionalLight.position.set(10, 10, 10).normalize();
    this.directionalLight.castShadow = true;

    // Настройки shadow camera для directional light
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 2000;
    this.directionalLight.shadow.camera.left = -500;
    this.directionalLight.shadow.camera.right = 500;
    this.directionalLight.shadow.camera.top = 500;
    this.directionalLight.shadow.camera.bottom = -500;

    this.scene.add(this.directionalLight);

    // Мягкий общий свет
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    // Тени
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
  }
}
