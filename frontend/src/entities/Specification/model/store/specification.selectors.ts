import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { selectAllTypess } from '../../../Types/model/store/types.selectors';
import { selectAllMaterials } from '../../../Material/model/store/material.selectors';
import { selectAllFurnitures } from '../../../Furniture/model/store/furniture.selectors';
import { selectAllColors } from '../../../Color/model/store/color.selectors';
import { selectAllActionsss } from '../../../Actionss/model/store/actionss.selectors';
import { selectAllFastenerss } from '../../../Fasteners/model/store/fasteners.selectors';
import { SpecificationState } from './specification.reducer';
import { selectAllMillings } from '../../../Milling/model/store/milling.selectors';
import { selectAllCombineMaterials } from '../../../CombineMaterial/model/store/combineMaterial.selectors';

export const selectSpecificationState = createFeatureSelector<SpecificationState>(
  Slices.SPECIFICATION,
);

// Селекторы для списка спецификаций
export const selectAllSpecifications = createSelector(
  selectSpecificationState,
  (state: SpecificationState) => state.specifications,
);

export const selectSpecificationById = (specificationId: number) =>
  createSelector(selectSpecificationState, (state: SpecificationState) =>
    state.specifications.find((specification) => specification.id === specificationId),
  );

export const selectSpecificationsCount = createSelector(
  selectSpecificationState,
  (state: SpecificationState) => state.specifications.length,
);

export const selectSpecificationError = createSelector(
  selectSpecificationState,
  (state: SpecificationState) => state.error,
);

// Селекторы для формы спецификации
export const selectTypesProduct = createSelector(selectAllTypess, (types) =>
  types
    .filter((type) => type.type === 'PRODUCT' && type.active)
    .map((type) => ({
      value: type.id!,
      label: type.name,
    })),
);

export const selectTypesFurniture = createSelector(selectAllTypess, (types) =>
  types
    .filter((type) => type.type === 'FURNITURE' && type.active)
    .map((type) => ({
      value: type.id!,
      label: type.name,
    })),
);

export const selectTypesExecution = createSelector(selectAllTypess, (types) =>
  types
    .filter((type) => type.type === 'EXECUTION' && type.active)
    .map((type) => ({
      value: type.id!,
      label: type.name,
    })),
);
export const selectMaterialOptions = createSelector(
  selectAllMaterials,
  selectAllTypess,
  (materials, types) =>
    materials
      .filter((item) => item.active)
      .map((item) => {
        // Находим тип материала для отображения в label
        const materialType = types.find(type => type.id === item.typeId);
        const typeName = materialType ? materialType.name : 'Неизвестный тип';

        return {
          value: item.id!,
          label: `${item.name} (${typeName})`,
          price: item.price,
        };
      })
);

export const selectCombineMaterialOptions = createSelector(selectAllCombineMaterials, (combineMaterial) =>
  combineMaterial
    .filter((item) => item.active)
    .map((item) => ({
      value: item.id!,
      label: item.name,
    })),
);

export const selectFurnitureOptions = createSelector(selectAllFurnitures, (furniture) =>
  furniture
    .filter((item) => item.active)
    .map((item) => ({
      value: item.id!,
      label: item.name,
      price: item.price,
    })),
);

export const selectMillingOptions = createSelector(
  selectAllMillings,
  (millings) =>
    millings
      .filter((item) => item.active)
      .map((item) => ({
        value: item.id!,
        label: item.name,
        price: item.steps?.reduce((acc, step) => acc + (step.price * step.count), 0) ?? 0,
      }))
);


export const selectColorCategoryOptions = createSelector(
  selectAllTypess,
  (colorCategory) =>
    colorCategory
      .filter((item) => item.active && item.type == "COLOR_CATEGORY")
      .map((item) => ({
        value: item.id!,
        label: item.name,
      })),
);

export const selectColorOptions = createSelector(selectAllColors, (color) =>
  color
    .filter((item) => item.active)
    .map((item) => ({
      value: item.id!,
      label: item.name,
    })),
);

export const selectOperationOptions = createSelector(selectAllActionsss, (operation) =>
  operation
    .filter((item) => item.active)
    .map((item) => ({
      value: item.id!,
      label: item.name,
      price: item.price,
    })),
);

export const selectFastenerOptions = createSelector(selectAllFastenerss, (fastener) =>
  fastener
    .filter((item) => item.active)
    .map((item) => ({
      value: item.id!,
      label: item.name,
      price: item.price,
    })),
);

export const selectTypeNameById = (id: number) =>
  createSelector(selectAllTypess, (types) => {
    const type = types.find((t) => t.id === id);
    return type ? type.name : '';
  });
