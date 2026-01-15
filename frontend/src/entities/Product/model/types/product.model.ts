import { ICabinetDimensions, MMaterial } from 'src/entities/Cabinet/model/types/cabinet.model';
import { IImage } from 'src/entities/Image';
import { Size } from 'src/pages/calculator-page/ui/сabinet/model/BaseModel';
import { DrawerBlocks } from 'src/pages/calculator-page/ui/сabinet/model/Drawers';
import { Facades } from 'src/pages/calculator-page/ui/сabinet/model/Facade';
import { CutoutPlinth, Lighting } from 'src/pages/calculator-page/ui/сabinet/model/Features';
import { Mullion } from 'src/pages/calculator-page/ui/сabinet/model/Mullion';
import { Shelves } from 'src/pages/calculator-page/ui/сabinet/model/Shelf';

// src/entities/Product/model/types.ts

export enum ProductType {
  Cabinet = 'cabinet',
  Table = 'table',
  Bed = 'bed',
}


export interface IProduct {
  id?: number;
  type: ProductType;
  series: string;
  name: string;
  dimensions: {
    general: Size; // Общие габариты: width, height, depth
  };
  appearance: {
    additionColor: MMaterial;
    visibleDtails: MMaterial;
    customization: boolean;
  };
}

// Теперь ICabinet расширяет IProduct
export interface ICabinet extends IProduct {
  type: ProductType.Cabinet;
  dimensions: ICabinetDimensions; // Ваши расширенные размеры
  features: {
    cutoutPlinth: CutoutPlinth;
    lighting?: Lighting;
  };
  components: {
    shelves: Shelves;
    drawers: DrawerBlocks;
    facades: Facades;
    mullion: Mullion;
  };
}
