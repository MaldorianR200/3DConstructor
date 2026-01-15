import * as THREE from 'three';

export class TextureCache {
  private static cache = new Map<string, THREE.Texture>();

  static getTexture(path: string): THREE.Texture {
    if (!this.cache.has(path)) {
      const texture = new THREE.TextureLoader().load(path);
      this.cache.set(path, texture);
    }
    return this.cache.get(path)!;
  }

  static async loadTextureAsync(path: string): Promise<THREE.Texture> {
    if (this.cache.has(path)) return this.cache.get(path)!;

    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      new THREE.TextureLoader().load(path, resolve, undefined, reject);
    });

    this.cache.set(path, texture);
    return texture;
  }
}
