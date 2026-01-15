import exp from 'node:constants';
import { IColor } from 'src/entities/Color';
import { IImage } from 'src/entities/Image';
import { Facades } from 'src/pages/calculator-page/ui/сabinet/model/Facade';
import { DrawerBlocks } from 'src/pages/calculator-page/ui/сabinet/model/Drawers';
import { CutoutPlinth, Lighting } from 'src/pages/calculator-page/ui/сabinet/model/Features';
import { Mullion } from 'src/pages/calculator-page/ui/сabinet/model/Mullion';
import { Rod } from 'src/pages/calculator-page/ui/сabinet/model/Rod';
import { Shelves } from 'src/pages/calculator-page/ui/сabinet/model/Shelf';
import { Material, Texture } from 'three';
import { Size, SizeWithEdges } from 'src/pages/calculator-page/ui/сabinet/model/BaseModel';
import { IProduct } from 'src/entities/Product';


export enum CabinetSubType {
  Single = 'single',
  Double = 'double',
  Showcase = 'showcase',
}

export interface ICabinet extends IProduct {
  id?: number;
  subType: CabinetSubType;
  // Размеры
  dimensions: ICabinetDimensions;
  // особенности
  features: {
    cutoutPlinth: CutoutPlinth; // вырез
    cutoutFacade: boolean;
    lighting?: Lighting; // подсветка
  };
  // компоненты шкафа
  components: {
    shelves: Shelves; // Полки
    drawers: DrawerBlocks; // Массив блоков с ящиками
    facades: Facades; // Двери
    mullion: Mullion; // Средник
    plinthCenter?: Size; // средняя панель под средником
  };
}

export interface ICabinetDimensions {
  general: Size; // Общие размеры шкафа, нужны для воссоздания шкафа в будущем
  wall: SizeWithEdges; // Размеры левой и правой стенки
  topShelf: SizeWithEdges; // Размеры верха шкафа
  bottomShelf: SizeWithEdges; // Размеры нижней полки шкафа в цоколе
  hdf: Size; // Задняя стенка без кромок
  falsePanelFacade: SizeWithEdges; // Фальшпанель фасада
  falsePanel: SizeWithEdges; // Фальшпанель
  falsePanelWall: SizeWithEdges; // Фальшпанели сбоку
}

export interface Wall {
  size: Size;
  numberCutouts: number;
}



export interface MMaterial {
  id: number;
  name: string;
  type: TypeMaterial; // 'ldsp' | 'mdf' | 'mirror'
  maxLength?: number;
  texture?: ITexture;
  color?: IColor;
  active: boolean;
}

export interface ITexture {
  id: number;
  path: string;
  displayOrder: number;
}

export type TypeMaterial = 'ldsp' | 'mdf' | 'mirror';

export { Size };
