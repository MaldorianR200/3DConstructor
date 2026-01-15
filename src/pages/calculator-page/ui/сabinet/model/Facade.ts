import { MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { IColor } from 'src/entities/Color';
import { Position } from './BaseModel';

export interface Facades {
  checkBox: boolean;
  klok: boolean;
  facadeItems: Facade[];
}

export interface Facade {
  id: number;
  facadeType: FacadeType;
  material: MMaterial;
  cutHeight: number;
  handle?: IHandle;
  countLoops: number;
  size: Size;
  originalHeight?: number;
  mirrors?: Mirrors;
  typeMilling?: string;
  positionFacade: Position;
  positionLoops: PositionCutout;
  limiters: boolean;
}

export interface Mirrors {
  checkbox: boolean;
  mirrorItems: Mirror[];
}

export interface Mirror {
  id: number;
  name: string;
  size: Size;
  position: Position;
  material: MMaterial;
}

export type PositionCutout = 'left-side' | 'right-side' | 'both' | 'none';

export interface IHandle {
  id: number;
  name: string;
  path: string;
  type: HandleType;
  indentX: number; // отступ по оси X от края фасада
  indentY: number; // отступ по оси Y от низа шкафа
  indentYFacade?: number; // отступ по оси Y от низа фасада
  isMoveIndentX?: boolean; // Флаг для возможности изменения отступа по X
  isMoveIndentY?: boolean; // Флаг для возможности изменения отступа по Y
  color?: IColor; // Нужно добавить цвеи для ручек
  position: Position;
  size: Size;
  active: boolean;
}

// Типы материалов фасада
export type FacadeMaterial = 'LDSP' | 'MDF';

// Типы ручек
export type HandleType = 'OVERHEAD_HANDLE' | 'END_HANDLE';

export const HandleTypeLabels: Record<HandleType, string> = {
  OVERHEAD_HANDLE: 'Накладная',
  END_HANDLE: 'Торцевая',
};

export type FacadeType = 'HANDLE' | 'PUSH_OPENING' | 'INTEGRATED_HANDLE';

export const FacadeMaterialLabels: Record<FacadeMaterial, string> = {
  LDSP: 'ЛДСП',
  MDF: 'МДФ',
};

export const FacadeTypes: Record<FacadeType, string> = {
  HANDLE: 'С ручкой',
  PUSH_OPENING: 'От нажатия',
  INTEGRATED_HANDLE: 'Интегрированной ручкой',
};
