import * as THREE from 'three';
import { TextureCache } from './TextureCache';

export type HdfType = 'drawerHDF' | 'cabinetHDF';

export class MaterialProvider {
  static getHdfMaterials(type: HdfType): THREE.Material[] {
    const backMap = TextureCache.getTexture('../../../shared/assets/textures/backWall.jpg');
    const frontMap = TextureCache.getTexture('../../../shared/assets/textures/front.jpg');

    const back = new THREE.MeshStandardMaterial({ map: backMap });
    const front = new THREE.MeshStandardMaterial({ map: frontMap });

    switch (type) {
      case 'drawerHDF':
        return [back, back, front, back, back, back];
      case 'cabinetHDF':
        return [back, back, back, back, front, back];
      default:
        console.warn(`Unknown HDF type: ${type}`);
        return [back, back, front, back, back, back];
    }
  }

  static async getHdfMaterialsAsync(type: HdfType): Promise<THREE.Material[]> {
    const [backMap, frontMap] = await Promise.all([
      TextureCache.loadTextureAsync('../../../shared/assets/textures/backWall.jpg'),
      TextureCache.loadTextureAsync('../../../shared/assets/textures/front.jpg'),
    ]);

    const back = new THREE.MeshStandardMaterial({ map: backMap });
    const front = new THREE.MeshStandardMaterial({ map: frontMap });

    if (type === 'cabinetHDF') {
      return [back, back, back, back, front, back];
    }
    return [back, back, front, back, back, back];
  }
}
