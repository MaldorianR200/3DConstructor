import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ColorState } from './color.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { selectAllTypess } from '../../../Types/model/store/types.selectors';

export const selectColorState = createFeatureSelector<ColorState>(Slices.COLOR);

export const selectAllColors = createSelector(
  selectColorState,
  (state: ColorState) => state.colors,
);

export const selectColorById = (colorId: number) =>
  createSelector(selectColorState, (state: ColorState) =>
    state.colors.find((color) => color.id === colorId),
  );

export const selectColorsCount = createSelector(
  selectColorState,
  (state: ColorState): number => state.colors.length,
);

export const selectColorError = createSelector(
  selectColorState,
  (state: ColorState) => state.error,
);

export const selectTypeColorCategory = createSelector(
  selectAllTypess,
  (colorCategory) =>
    colorCategory
      .filter((item) => item.active && item.type == "COLOR_CATEGORY")
      .map((item) => ({
        value: item.id!,
        label: item.name,
      })),
);
