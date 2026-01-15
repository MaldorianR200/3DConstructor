import { CabinetSubType, MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import {
  CRITICAL_SECTION_WIDTH,
  DEEP_DRAVER_IN_CABINET,
  DEPTH_EDGE_4MM,
  DEPTH_EDGE_8MM,
  FALSE_PANEL_WIDTH,
  INTERVAL_1_MM,
  MIN_SECTION_WIDTH,
  WALL_THICKNESS,
} from '../constants';
import { EDGE_08, getCutThickness, Position } from './BaseModel';

export interface FalsePanelBase {
  size: Size;
  posLeft: Position;
  posRight: Position;
  count: number;
}
export interface FalsePanelAdd {
  size: Size;
  posLeft: Position;
  posRight: Position;
  count: number;
}
export interface FalsePanelShelf {
  size: Size;
  count: number;
}

export interface DrawerBlocks {
  checkBox: boolean;
  drawerBlocks: DrawerBlock[];
}

export interface DrawerBlock {
  id: number;
  material: MMaterial;
  fullSize: FullDrawerBlockSize;
  fullDrawerSize: FullDrawerSize;
  position: Position;
  section: 'center' | 'left' | 'right';
  drawerItems: Drawer[];
}

export interface Drawer {
  id: number;
  position: Position;
}

export interface DrawerPositions {
  leftWall: Position;
  rightWall: Position;

  fasade: Position;
  back: Position;
  front: Position;
  leftWallDrawer: Position;
  rightWallDrawer: Position;
  hdf: Position;
  frontPanelTop: Position;
  backPanelTop: Position;
  frontPanelBottom: Position;
  backPanelBottom: Position;
  topShelf: Position;
  bottomPanel: Position;
}

// Размеры каждого элемента ящика
export interface FullDrawerSize {
  facade: Size,
  wall: Size,
  backFront: Size,
  hdf: Size,
}

// Интерфейс, описывающий размеры всего блока с ящиками
export interface FullDrawerBlockSize {
  shelf: {
    size: Size;
    position: Position; // Позиция верхней полки
  };
  wall: {
    size: Size;
    posLeft: Position;
    posRight: Position;
  };
  falsePanel_50: FalsePanelBase; // Фальшпанели по 50мм
  falsePanelAdd: FalsePanelAdd; // Дополнительные фальшпанели
  falsePanelW: FalsePanelShelf; // Фальшпанели по ширине
}

export interface DrawerSize {
  facadeHeight: number; // Высота фасада
  blockHeight: number; // Высота всего блока
  sideHeight: number; // Высота боковины
}

// Заранее заданные размеры для ящиков
export const DrawerSizeMap: Record<number, DrawerSize> = {
  1: {
    facadeHeight: 207,
    blockHeight: 272,
    sideHeight: 240,
  },
  2: {
    facadeHeight: 217,
    blockHeight: 528,
    sideHeight: 496,
  },
  3: {
    facadeHeight: 220,
    blockHeight: 784,
    sideHeight: 752,
  },
  4: {
    facadeHeight: 221,
    blockHeight: 1008,
    sideHeight: 1040,
  },
  5: {
    facadeHeight: 222,
    blockHeight: 1264,
    sideHeight: 1296,
  },
};

// Функция для расчета параметров будущего блока ящиков
// export function calculateDrawerBlockParameters(
//   blocks: number,
//   cabinetWidth: number,
//   cabinetHeight: number,
//   cabinetDepth: number,
//   hasMullion: boolean,
//   mullionPosition: number,
//   countFP: number,
//   wallThickness: number = WALL_THICKNESS,
// ): {
//   size: DrawerSize;
//   fullSize: FullDrawerBlockSize;
//   fullDrawerSize: FullDrawerSize;
//   availableWidth: number;
//   positionX: number;
//   targetSection: 'left' | 'right' | 'center';
//   isValid: boolean;
//   errorMessage?: string;
// } {
//   const size = DrawerSizeMap[blocks];

//   // Вычисляем ширину секций
//   let leftSectionWidth = 0;
//   let rightSectionWidth = 0;

//   if (hasMullion) {
//     // Со средником: ширина шкафа / 2 - WALL_THICKNESS - WALL_THICKNESS / 2
//     const halfCabinet = cabinetWidth / 2 - wallThickness - wallThickness / 2;
//     leftSectionWidth = halfCabinet + mullionPosition;
//     rightSectionWidth = halfCabinet - mullionPosition;
//   } else {
//     // Без средника: ширина шкафа - WALL_THICKNESS * 2
//     leftSectionWidth = cabinetWidth - 2 * wallThickness;
//     rightSectionWidth = cabinetWidth - 2 * wallThickness;
//   }

//   // Определяем, в какую секцию добавлять блок
//   let targetSection: 'left' | 'right' | 'center' = 'center';
//   let availableWidth = 0;
//   let positionX = 0;

//   if (hasMullion) {
//     // Проверяем правую секцию сначала
//     if (rightSectionWidth > CRITICAL_SECTION_WIDTH && rightSectionWidth >= MIN_SECTION_WIDTH) {
//       targetSection = 'right';
//       availableWidth = rightSectionWidth;
//       positionX = mullionPosition + rightSectionWidth / 2;
//     }
//     // Если правая не подходит, проверяем левую
//     else if (leftSectionWidth > CRITICAL_SECTION_WIDTH && leftSectionWidth >= MIN_SECTION_WIDTH) {
//       targetSection = 'left';
//       availableWidth = leftSectionWidth;
//       positionX = mullionPosition - leftSectionWidth / 2;
//     } else {
//       return {
//         size,
//         fullSize: {} as FullDrawerBlockSize,
//         fullDrawerSize: {} as FullDrawerSize,
//         availableWidth: 0,
//         positionX: 0,
//         targetSection: 'center',
//         isValid: false,
//         errorMessage: 'Недостаточно места для блока с ящиками в обеих секциях шкафа.',
//       };
//     }
//   } else {
//     // Без средника - добавляем по центру
//     if (cabinetWidth - 2 * wallThickness <= CRITICAL_SECTION_WIDTH) {
//       return {
//         size,
//         fullSize: {} as FullDrawerBlockSize,
//         fullDrawerSize: {} as FullDrawerSize,
//         availableWidth: 0,
//         positionX: 0,
//         targetSection: 'center',
//         isValid: false,
//         errorMessage: 'Невозможно добавить блок с ящиками: ширина шкафа слишком мала (≤ 350мм).',
//       };
//     }
//     targetSection = 'center';
//     availableWidth = cabinetWidth - 2 * wallThickness;
//     positionX = 0;
//   }

//   // Проверяем, достаточно ли места
//   if (availableWidth < MIN_SECTION_WIDTH) {
//     return {
//       size,
//       fullSize: {} as FullDrawerBlockSize,
//       fullDrawerSize: {} as FullDrawerSize,
//       availableWidth: 0,
//       positionX: 0,
//       targetSection,
//       isValid: false,
//       errorMessage: `Недостаточно места для блока с ящиками в ${targetSection} секции.`,
//     };
//   }

//   // Вычисляем размеры элементов блока
//   const { fullSize, fullDrawerSize } = calculateDrawerElements(
//     blocks,
//     availableWidth,
//     cabinetHeight,
//     cabinetDepth,
//     countFP,
//   );

//   return {
//     size: { ...size },
//     fullSize,
//     fullDrawerSize,
//     availableWidth,
//     positionX,
//     targetSection,
//     isValid: true,
//   };
// }

// export function calculateDrawerBlockParameters(
//   blocks: number,
//   cabinetWidth: number,
//   cabinetHeight: number,
//   cabinetDepth: number,
//   hasMullion: boolean,
//   mullionPosition: number,
//   countFP: number,
//   wallThickness: number = WALL_THICKNESS,
// ): {
//   size: DrawerSize;
//   fullSize: FullDrawerBlockSize;
//   fullDrawerSize: FullDrawerSize;
//   availableWidth: number;
//   positionX: number;
//   targetSection: 'left' | 'right' | 'center';
//   isValid: boolean;
//   errorMessage?: string;
// } {
//   const size = DrawerSizeMap[blocks];

//   // Вычисляем ширину секций (используем ту же логику, что и в calculateAvailableSections)
//   let targetSection: 'left' | 'right' | 'center' = 'center';
//   let availableWidth = 0;
//   let positionX = 0;

//   if (hasMullion) {
//     const totalInnerWidth = cabinetWidth - 2 * wallThickness;
//     const mullionCenter = mullionPosition;

//     const leftSectionWidth = mullionCenter + totalInnerWidth / 2 - wallThickness / 2;
//     const rightSectionWidth = totalInnerWidth - leftSectionWidth - wallThickness;

//     // Проверяем правую секцию сначала
//     if (rightSectionWidth > CRITICAL_SECTION_WIDTH && rightSectionWidth >= MIN_SECTION_WIDTH) {
//       targetSection = 'right';
//       availableWidth = rightSectionWidth;
//       positionX = mullionCenter + rightSectionWidth / 2 + wallThickness / 2;
//     }
//     // Если правая не подходит, проверяем левую
//     else if (leftSectionWidth > CRITICAL_SECTION_WIDTH && leftSectionWidth >= MIN_SECTION_WIDTH) {
//       targetSection = 'left';
//       availableWidth = leftSectionWidth;
//       positionX = mullionCenter - leftSectionWidth / 2 - wallThickness / 2;
//     } else {
//       return {
//         size,
//         fullSize: {} as FullDrawerBlockSize,
//         fullDrawerSize: {} as FullDrawerSize,
//         availableWidth: 0,
//         positionX: 0,
//         targetSection: 'center',
//         isValid: false,
//         errorMessage: 'Недостаточно места для блока с ящиками в обеих секциях шкафа.',
//       };
//     }
//   } else {
//     // Без средника - добавляем по центру
//     if (cabinetWidth - 2 * wallThickness <= CRITICAL_SECTION_WIDTH) {
//       return {
//         size,
//         fullSize: {} as FullDrawerBlockSize,
//         fullDrawerSize: {} as FullDrawerSize,
//         availableWidth: 0,
//         positionX: 0,
//         targetSection: 'center',
//         isValid: false,
//         errorMessage: 'Невозможно добавить блок с ящиками: ширина шкафа слишком мала (≤ 350мм).',
//       };
//     }
//     targetSection = 'center';
//     availableWidth = cabinetWidth - 2 * wallThickness;
//     positionX = 0;
//   }

//   // Проверяем, достаточно ли места
//   if (availableWidth < MIN_SECTION_WIDTH) {
//     return {
//       size,
//       fullSize: {} as FullDrawerBlockSize,
//       fullDrawerSize: {} as FullDrawerSize,
//       availableWidth: 0,
//       positionX: 0,
//       targetSection,
//       isValid: false,
//       errorMessage: `Недостаточно места для блока с ящиками в ${targetSection} секции.`,
//     };
//   }

//   // Вычисляем размеры элементов блока с учётом секции
//   const { fullSize, fullDrawerSize } = calculateDrawerElements(
//     blocks,
//     availableWidth,
//     cabinetHeight,
//     cabinetDepth,
//     countFP,
//   );

//   return {
//     size: { ...size },
//     fullSize,
//     fullDrawerSize,
//     availableWidth,
//     positionX,
//     targetSection,
//     isValid: true,
//   };
// }

// Функция для получения размера ящика по количеству блоков
export function calculateDrawerElements(
  typeProduct: CabinetSubType,
  hasMullion: boolean,
  blocks: number,
  width: number,
  height: number,
  depth: number,
  countFP: number,
): { size: DrawerSize; fullSize: FullDrawerBlockSize; fullDrawerSize: FullDrawerSize } {
  const size = DrawerSizeMap[blocks];

  // Позиция верхней полки
  const topShelfPosition: Position = {
    x: 0,
    y: size.blockHeight - WALL_THICKNESS,
    z: 0,
  };

  // Позиция низа (если есть)
  const bottomPosition: Position = {
    x: 0,
    y: 0,
    z: 0,
  };

  // {
  //       width:
  //         width - 4 * WALL_THICKNESS - getCutThickness(EDGE_08) * 2,
  //       height: size.facadeHeight - getCutThickness(EDGE_08) * 2,
  //       depth: depth - DEEP_DRAVER_IN_CABINET,
  //     },

  // Вычисляем размеры для полки сверху и снизу
  let shelfSize: Size;
  let facadeSize: Size;
  let backFrontSize: Size;
  let falsePanelWSize: Size;
  let hdfSize: Size;
  if (typeProduct.includes(CabinetSubType.Single)) {
    shelfSize = {
      width: width - WALL_THICKNESS * 2,
      height: WALL_THICKNESS,
      depth: depth - DEEP_DRAVER_IN_CABINET,
    };
    facadeSize = {
      width: width - 4 * WALL_THICKNESS - WALL_THICKNESS / 2 - FALSE_PANEL_WIDTH - getCutThickness(EDGE_08) * 2,
      height: size.facadeHeight - getCutThickness(EDGE_08) * 2,
      depth: depth - DEEP_DRAVER_IN_CABINET,
    };
    backFrontSize = {
      width: width - FALSE_PANEL_WIDTH - WALL_THICKNESS * 6,
      height: size.sideHeight, // size.facadeHeight - 4 * WALL_THICKNESS,
      depth: WALL_THICKNESS,
    };
    falsePanelWSize = {
      width: width - WALL_THICKNESS * 4,
      height: size.sideHeight - 10,
      depth: WALL_THICKNESS,
    };
    hdfSize = {
      width: width - WALL_THICKNESS * 5 - FALSE_PANEL_WIDTH,
      height: DEPTH_EDGE_4MM,
      depth: depth - DEEP_DRAVER_IN_CABINET,
    };
  } else if (typeProduct.includes(CabinetSubType.Double)) {
    if (hasMullion) {
      shelfSize = {
        width: width,
        height: WALL_THICKNESS,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      };
      facadeSize = {
        width: width - FALSE_PANEL_WIDTH - WALL_THICKNESS * 2 - WALL_THICKNESS / 2 - getCutThickness(EDGE_08) * 2 ,
        height: size.facadeHeight - getCutThickness(EDGE_08) * 2,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      };
      backFrontSize = {
        width: width - FALSE_PANEL_WIDTH - WALL_THICKNESS + INTERVAL_1_MM * 2,
        height: size.sideHeight, // size.facadeHeight - 4 * WALL_THICKNESS,
        depth: WALL_THICKNESS,
      };
      falsePanelWSize = {
        width: width - WALL_THICKNESS * 2,
        height: size.sideHeight - 10,
        depth: WALL_THICKNESS,
      };
      hdfSize = {
        width:width - WALL_THICKNESS * 5 - FALSE_PANEL_WIDTH,
        height: DEPTH_EDGE_4MM,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      };
    } else {
      shelfSize = {
        width: width - WALL_THICKNESS * 2,
        height: WALL_THICKNESS,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      };
      facadeSize = {
        width: width - FALSE_PANEL_WIDTH * 2 - 4 * WALL_THICKNESS - WALL_THICKNESS / 2 - getCutThickness(EDGE_08) * 2,
        height: size.facadeHeight - getCutThickness(EDGE_08) * 2,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      };
      backFrontSize = {
        width: width - FALSE_PANEL_WIDTH * 2 + INTERVAL_1_MM * 4,
        height: size.sideHeight, // size.facadeHeight - 4 * WALL_THICKNESS,
        depth: WALL_THICKNESS,
      };
      falsePanelWSize = {
        width: width - WALL_THICKNESS * 4,
        height: size.sideHeight - 10,
        depth: WALL_THICKNESS,
      };
      hdfSize = {
        width: width - WALL_THICKNESS * 5 - FALSE_PANEL_WIDTH * 2,
        height: DEPTH_EDGE_4MM,
        depth: depth - DEEP_DRAVER_IN_CABINET,
    };
    }
  }

  // Размеры и позиции элементов блока
  const fullSize: FullDrawerBlockSize = {
    shelf: {
      size: shelfSize,
      position: topShelfPosition,
    },
    wall: {
      size: {
        width: WALL_THICKNESS,
        height: size.sideHeight,
        depth: depth - DEEP_DRAVER_IN_CABINET,
      },
      posLeft: {
        x: 0,
        y: 0,
        z: 0,
      },
      posRight: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    falsePanel_50: {
      size: {
        width: FALSE_PANEL_WIDTH,
        height: size.sideHeight,
        depth: WALL_THICKNESS,
      },
      posLeft: {
        x: -width / 2 + FALSE_PANEL_WIDTH / 2,
        y: 0,
        z: 0,
      },
      posRight: {
        x: width / 2 - FALSE_PANEL_WIDTH / 2,
        y: 0,
        z: 0,
      },
      count: countFP,
    },
    falsePanelAdd: {
      size: {
        width: FALSE_PANEL_WIDTH,
        height: size.sideHeight - 10,
        depth: WALL_THICKNESS,
      },
      posLeft: {
        x: -width / 2 + FALSE_PANEL_WIDTH / 2,
        y: 10,
        z: 0,
      },
      posRight: {
        x: width / 2 - FALSE_PANEL_WIDTH / 2,
        y: 10,
        z: 0,
      },
      count: countFP,
    },
    falsePanelW: {
      size: falsePanelWSize,
      count: 4,
    },
  };

  // Размеры и позиции элементов ящика
  const fullDrawerSize: FullDrawerSize = {
    facade: facadeSize,

    wall: {
      width: WALL_THICKNESS,
      height: size.sideHeight,
      depth: depth - DEEP_DRAVER_IN_CABINET,
    },
    backFront: backFrontSize,
    hdf: hdfSize,
  };

  return {
    size: { ...size },
    fullSize,
    fullDrawerSize,
  };
}
