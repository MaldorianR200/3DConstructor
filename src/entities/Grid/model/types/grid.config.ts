import { selectAllCategories } from 'src/entities/Category/model/store/category.selectors';
import { selectAllProducts } from 'src/entities/Product/model/store/product.selectors';
import { GridEntity, IGridConfig } from './grid.model';
import { getCategories } from 'src/entities/Category/model/store/category.actions';
import { getProducts } from 'src/entities/Product/model/store/product.actions';

// Пример конфигурации, соответствующей типу EntityConfigMap
export const GridConfig: Record<GridEntity, IGridConfig> = {
  [GridEntity.CATEGORY]: {
    selectAll: selectAllCategories,
    getAction: getCategories,
  },
  [GridEntity.PRODUCT]: {
    selectAll: selectAllProducts,
    getAction: getProducts,
  },
  // [GridEntity.PHOTOGALLERY]: {
  //   selectAll: selectAll
  // },
  // [GridEntity.REVIEW]: {
  //   selectAll: selectAll
  // },
  // [GridEntity.NEWS]: {
  //   selectAll: selectAll
  // },
  // [GridEntity.DISCOUNT]: {
  //   selectAll: selectAll
  // }
};
