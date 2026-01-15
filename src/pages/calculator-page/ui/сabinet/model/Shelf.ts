import { MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { IColor } from 'src/entities/Color';
import { PositionCutout } from './Facade';
import { Rod } from './Rod';
import { Position } from './BaseModel';

export interface Shelves {
  checkBox: boolean;
  topShelf?: Rod[];
  shelfItems: Shelf[];
}

export interface Shelf {
  id: number;
  size: Size;
  material: MMaterial;
  position: Position;
  cutout: ShelfType;
  positionCutout: PositionCutout;
  countCutout: number;
  section?: 'left' | 'right' | 'center';
  rods?: Rod[];
}

export type ShelfType = 'cutout' | 'recessed' | 'topCabinet';

export interface ShelfBoundary {
  cabinetHeight: number;
  minDistanceFromTop: number;
  holesCount: number;
  holeCenterFromTop: number;
}

// Полная таблица границ для полок
export const SHELF_BOUNDARIES: ShelfBoundary[] = [
  { cabinetHeight: 2000, minDistanceFromTop: 299, holesCount: 41, holeCenterFromTop: 307 },
  { cabinetHeight: 2025, minDistanceFromTop: 292, holesCount: 42, holeCenterFromTop: 300 },
  { cabinetHeight: 2050, minDistanceFromTop: 285, holesCount: 43, holeCenterFromTop: 293 },
  { cabinetHeight: 2075, minDistanceFromTop: 310, holesCount: 43, holeCenterFromTop: 318 },
  { cabinetHeight: 2100, minDistanceFromTop: 303, holesCount: 44, holeCenterFromTop: 311 },
  { cabinetHeight: 2125, minDistanceFromTop: 296, holesCount: 45, holeCenterFromTop: 304 },
  { cabinetHeight: 2150, minDistanceFromTop: 289, holesCount: 46, holeCenterFromTop: 297 },
  { cabinetHeight: 2175, minDistanceFromTop: 314, holesCount: 46, holeCenterFromTop: 322 },
  { cabinetHeight: 2200, minDistanceFromTop: 275, holesCount: 48, holeCenterFromTop: 283 },
  { cabinetHeight: 2225, minDistanceFromTop: 300, holesCount: 48, holeCenterFromTop: 308 },
  { cabinetHeight: 2250, minDistanceFromTop: 293, holesCount: 49, holeCenterFromTop: 301 },
  { cabinetHeight: 2275, minDistanceFromTop: 286, holesCount: 50, holeCenterFromTop: 294 },
  { cabinetHeight: 2300, minDistanceFromTop: 279, holesCount: 51, holeCenterFromTop: 287 },
  { cabinetHeight: 2325, minDistanceFromTop: 304, holesCount: 51, holeCenterFromTop: 312 },
  { cabinetHeight: 2350, minDistanceFromTop: 297, holesCount: 52, holeCenterFromTop: 305 },
  { cabinetHeight: 2375, minDistanceFromTop: 290, holesCount: 53, holeCenterFromTop: 298 },
  { cabinetHeight: 2400, minDistanceFromTop: 283, holesCount: 54, holeCenterFromTop: 291 },
  { cabinetHeight: 2425, minDistanceFromTop: 308, holesCount: 54, holeCenterFromTop: 316 },
  { cabinetHeight: 2450, minDistanceFromTop: 301, holesCount: 55, holeCenterFromTop: 309 },
  { cabinetHeight: 2475, minDistanceFromTop: 294, holesCount: 56, holeCenterFromTop: 302 },
  { cabinetHeight: 2500, minDistanceFromTop: 287, holesCount: 57, holeCenterFromTop: 295 },
  { cabinetHeight: 2525, minDistanceFromTop: 280, holesCount: 58, holeCenterFromTop: 288 },
  { cabinetHeight: 2550, minDistanceFromTop: 273, holesCount: 59, holeCenterFromTop: 281 },
  { cabinetHeight: 2575, minDistanceFromTop: 298, holesCount: 59, holeCenterFromTop: 306 },
  { cabinetHeight: 2600, minDistanceFromTop: 291, holesCount: 60, holeCenterFromTop: 299 },
  { cabinetHeight: 2625, minDistanceFromTop: 284, holesCount: 61, holeCenterFromTop: 292 },
  { cabinetHeight: 2650, minDistanceFromTop: 277, holesCount: 62, holeCenterFromTop: 285 },
  { cabinetHeight: 2675, minDistanceFromTop: 302, holesCount: 62, holeCenterFromTop: 310 },
  { cabinetHeight: 2700, minDistanceFromTop: 295, holesCount: 63, holeCenterFromTop: 303 },
  { cabinetHeight: 2725, minDistanceFromTop: 288, holesCount: 64, holeCenterFromTop: 296 },
  { cabinetHeight: 2750, minDistanceFromTop: 313, holesCount: 64, holeCenterFromTop: 321 },
];
