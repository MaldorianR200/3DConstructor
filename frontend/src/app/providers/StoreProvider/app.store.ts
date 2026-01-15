import { ActionReducerMap } from '@ngrx/store';
import { LogState, logReducer, LogEffects } from 'src/entities/Log';
import { SeoState, seoReducer, SeoEffects } from 'src/entities/Seo';
import { UserState, userReducer, UserEffects } from 'src/entities/User';
import { AuthState, authReducer, AuthEffects } from 'src/features/Auth';

import { CategoryState, categoryReducer, CategoryEffects } from 'src/entities/Category';
import { ProductState, productReducer, ProductEffects } from 'src/entities/Product';
import { GridState, gridReducer } from 'src/entities/Grid/model/store/grid.reducer';
import { GridEffects } from 'src/entities/Grid/model/store/grid.effects';

import { Slices } from 'src/shared/config/storeSlicesConfig';

import { CabinetEffects } from 'src/entities/Cabinet/model/store/cabinet.effects';
import { cabinetReducer, CabinetState } from 'src/entities/Cabinet/model/store/cabinet.reducer';
import { MaterialEffects } from 'src/entities/Material/model/store/material.effects';
import { NewsEffects } from 'src/entities/News/model/store/news.effects';

import { NewsState, newsReducer } from 'src/entities/News/model/store/news.reducer';
import { colorReducer, ColorState } from 'src/entities/Color/model/store/color.reducer';
import { ColorEffects } from 'src/entities/Color/model/store/color.effects';
import { MaterialState, materialReducer } from 'src/entities/Material/model/store/material.reducer';
import { FastenersEffects } from '../../../entities/Fasteners/model/store/fasteners.effects';
import { FurnitureEffects } from '../../../entities/Furniture/model/store/furniture.effects';
import { ActionssEffects } from '../../../entities/Actionss/model/store/actionss.effects';
import {
  furnitureReducer,
  FurnitureState,
} from '../../../entities/Furniture/model/store/furniture.reducer';
import {
  fastenersReducer,
  FastenersState,
} from '../../../entities/Fasteners/model/store/fasteners.reducer';
import {
  actionssReducer,
  ActionssState,
} from '../../../entities/Actionss/model/store/actionss.reducer';
import { typesReducer, TypesState } from '../../../entities/Types/model/store/types.reducer';
import { seriesReducer, SeriesState } from '../../../entities/Series/model/store/series.reducer';
import { TypesEffects } from '../../../entities/Types/model/store/types.effects';
import { SeriesEffects } from '../../../entities/Series/model/store/series.effects';
import { SpecificationEffects } from '../../../entities/Specification/model/store/specification.effects';
import {
  specificationReducer,
  SpecificationState,
} from '../../../entities/Specification/model/store/specification.reducer';
import { millingReducer, MillingState } from '../../../entities/Milling/model/store/milling.reducer';
import { MillingEffects } from '../../../entities/Milling/model/store/milling.effects';
import { EdgeEffects } from '../../../entities/Edge/model/store/edge.effects';
import { edgeReducer, EdgeState } from '../../../entities/Edge/model/store/edge.reducer';
import { CombineMaterialEffects } from '../../../entities/CombineMaterial/model/store/combineMaterial.effects';
import { CombineMaterialState, combineMaterialReducer } from '../../../entities/CombineMaterial/model/store/combineMaterial.reducer';

export const appEffects = [
  AuthEffects,
  UserEffects,
  LogEffects,
  SeoEffects,

  ProductEffects,
  CategoryEffects,
  GridEffects,

  CabinetEffects,
  MaterialEffects,
  NewsEffects,
  ColorEffects,
  FastenersEffects,
  FurnitureEffects,
  ActionssEffects,
  TypesEffects,
  SeriesEffects,
  SpecificationEffects,
  MillingEffects,
  EdgeEffects,
  CombineMaterialEffects,
];

export interface AppState {
  [Slices.AUTH]: AuthState;
  [Slices.USER]: UserState;
  [Slices.LOG]: LogState;
  [Slices.SEO]: SeoState;

  [Slices.PRODUCT]: ProductState;
  [Slices.CATEGORY]: CategoryState;
  [Slices.GRIDS]: GridState;
  [Slices.CABINET]: CabinetState;

  [Slices.MATERIAL]: MaterialState;
  [Slices.NEWS]: NewsState;
  [Slices.COLOR]: ColorState;
  [Slices.FURNITURE]: FurnitureState;
  [Slices.FASTENERS]: FastenersState;
  [Slices.ACTIONSS]: ActionssState;
  [Slices.TYPES]: TypesState;
  [Slices.SERIES]: SeriesState;
  [Slices.SPECIFICATION]: SpecificationState;
  [Slices.MILLING]: MillingState;
  [Slices.EDGE]: EdgeState;
  [Slices.COMBINE_MATERIALS]: CombineMaterialState;
}

export const reducers: ActionReducerMap<AppState> = {
  [Slices.AUTH]: authReducer,
  [Slices.USER]: userReducer,
  [Slices.LOG]: logReducer,
  [Slices.SEO]: seoReducer,

  [Slices.PRODUCT]: productReducer,
  [Slices.CATEGORY]: categoryReducer,
  [Slices.GRIDS]: gridReducer,

  [Slices.CABINET]: cabinetReducer,

  [Slices.MATERIAL]: materialReducer,
  [Slices.NEWS]: newsReducer,
  [Slices.COLOR]: colorReducer,
  [Slices.FASTENERS]: fastenersReducer,
  [Slices.FURNITURE]: furnitureReducer,
  [Slices.ACTIONSS]: actionssReducer,
  [Slices.TYPES]: typesReducer,
  [Slices.SERIES]: seriesReducer,
  [Slices.SPECIFICATION]: specificationReducer,
  [Slices.MILLING]: millingReducer,
  [Slices.EDGE]: edgeReducer,
  [Slices.COMBINE_MATERIALS]: combineMaterialReducer,
};
