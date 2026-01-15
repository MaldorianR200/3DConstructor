import { BaseProduct } from 'src/entities/Product/model/types/baseProduct';
import { IProduct, ProductType } from 'src/entities/Product/model/types/product.model';
import { CabinetFactory } from './cabinetFactory';
import { SceneManagerService } from '../../../services/SceneManager.service';
import { ICabinet } from 'src/entities/Cabinet';

export class ProductFactory {
  static createProduct(type: ProductType, params: IProduct, sceneManager: SceneManagerService): BaseProduct<any> {
    switch (type) {
      case ProductType.Cabinet:
        return CabinetFactory.create(params as ICabinet, sceneManager);
      case ProductType.Table:
        throw new Error('Table implementation pending');
      default:
        throw new Error('Unknown product type');
    }
  }
}
