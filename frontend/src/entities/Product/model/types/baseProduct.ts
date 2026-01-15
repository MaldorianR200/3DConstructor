// BaseProduct.ts
import * as THREE from 'three';
import { IProduct } from './product.model';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { MMaterial } from 'src/entities/Cabinet/model/types/cabinet.model';

export abstract class BaseProduct<T extends IProduct> {
  protected group: THREE.Group;
  protected params: T;

  constructor(
    protected sceneManager: SceneManagerService,
    params: T,
  ) {
    this.params = params;
    this.group = new THREE.Group();
    this.group.name = `product_${params.type}_${params.id || Date.now()}`;
  }

  public getGroup(): THREE.Group { return this.group; }
  public getParams(): T { return this.params; }

  // Метод сборки, вызываемый после создания
  public abstract build(): void;

  // Общие методы для всех изделий
  public abstract updateSize(width: number, height: number, depth: number): void;
  public abstract updateMaterial(material: MMaterial): void;

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
