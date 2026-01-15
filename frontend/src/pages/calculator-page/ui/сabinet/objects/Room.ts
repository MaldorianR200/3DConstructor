import * as THREE from 'three';
import { RoomDimensions } from '../model/RoomDimensions';
import { PODIUM_HEIGHT } from '../constants';

export class Room {
  private walls: { [key: string]: THREE.Mesh } = {};
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  constructor(
    private scene: THREE.Scene,
    private renderer: THREE.WebGLRenderer,
    private roomDimensions: RoomDimensions,
  ) {
    this.addRoom();
  }

  private addRoom(): void {
    const { width, height, depth } = this.roomDimensions;

    // ===== ТЕКСТУРЫ =====
    const floorTexture = this.textureLoader.load(
      'shared/assets/textures/room/Contractors-Choice-Premium-White-Oak-7-inch-Hardwood-Flooring.jpg',
    );
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    floorTexture.minFilter = THREE.LinearMipMapLinearFilter;
    floorTexture.magFilter = THREE.LinearFilter;
    floorTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const wallTexture = this.textureLoader.load(
      'shared/assets/textures/room/serenissima_cir_eclettica_silk_bianco.jpg',
    );
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    wallTexture.minFilter = THREE.LinearMipMapLinearFilter;
    wallTexture.magFilter = THREE.LinearFilter;
    wallTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      side: THREE.DoubleSide,
    });

    // ===== ПОЛ =====
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -PODIUM_HEIGHT / 2 - 3, 0);
    floor.receiveShadow = true;
    floor.name = 'floor';
    this.scene.add(floor);

    // ===== СТЕНЫ =====
    const wallThickness = 4;
    const wallHeight = height;
    const wallYPosition = height / 2 - PODIUM_HEIGHT / 2 - 3;

    // Левая стена
    this.createWall(
      'leftWall',
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial,
      -width / 2 + wallThickness / 2,
      wallYPosition,
      0,
    );

    // Правая стена
    this.createWall(
      'rightWall',
      new THREE.BoxGeometry(wallThickness, wallHeight, depth),
      wallMaterial,
      width / 2 - wallThickness / 2,
      wallYPosition,
      0,
    );

    // Задняя стена
    this.createWall(
      'backWall',
      new THREE.BoxGeometry(width, wallHeight, wallThickness),
      wallMaterial,
      0,
      wallYPosition,
      -depth / 2 + wallThickness / 2,
    );

    // Передняя стена
    const frontWall = this.createWall(
      'frontWall',
      new THREE.BoxGeometry(width, wallHeight, wallThickness),
      wallMaterial,
      0,
      wallYPosition,
      depth / 2 - wallThickness / 2,
    );
    frontWall.rotation.y = Math.PI;
  }

  private createWall(
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    rotationY: number = 0,
  ): THREE.Mesh {
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.receiveShadow = true;
    wall.castShadow = true;
    wall.name = name;
    this.scene.add(wall);
    this.walls[name] = wall;

    return wall;
  }

  public updateRoomDimensions(dimensions: RoomDimensions): void {
    this.roomDimensions = dimensions;

    // Удаляем старые стены и пол
    Object.values(this.walls).forEach((wall) => this.scene.remove(wall));
    this.scene.remove(this.scene.getObjectByName('floor_2')!);
    this.walls = {};

    // Добавляем новые
    this.addRoom();
  }

  public getWalls(): { [key: string]: THREE.Mesh } {
    return this.walls;
  }

  public getRoomDimensions(): RoomDimensions {
    return this.roomDimensions;
  }
}
export { RoomDimensions };
