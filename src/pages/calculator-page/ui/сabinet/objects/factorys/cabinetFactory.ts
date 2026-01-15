import * as THREE from 'three';

import {
  DEPTH_EDGE_4MM,
  DEPTH_WIDTH_INTG_HADLE,
  FACADE_HEIGHT,
  FALSE_PANEL_WIDTH,
  INTERVAL_1_MM,
  PLINTH_RADIUS_MAX,
  PODIUM_HEIGHT,
  WALL_THICKNESS,
} from '../../constants';
import { SingleDoorCabinet } from '../../cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../../cabinetTypes/doubleDoorCabinet';
import { ICabinet } from 'src/entities/Cabinet';
import {
  MMaterial,
  ICabinetDimensions,
  ITexture,
  CabinetSubType,
} from 'src/entities/Cabinet/model/types/cabinet.model';
import { IColor } from 'src/entities/Color';
import { DimensionLines } from '../DimensionLines';
import { SceneManagerService } from '../../../services/SceneManager.service';
import {
  EDGE_04,
  EDGE_08,
  EDGE_NONE,
  EdgeMap,
  getCutThickness,
  Size,
  SizeWithEdges,
} from '../../model/BaseModel';
import { DrawerWarningService } from '../../../services/warnings/DrawerWarningService.service';
import { BaseCabinet } from '../../cabinetTypes/BaseCabinet';
import { ProductType } from 'src/entities/Product/model/types/product.model';

export abstract class CabinetFactory {
  static create(params: ICabinet, sceneManager: SceneManagerService): BaseCabinet {
    switch (params.subType) {
      case CabinetSubType.Single:
        return new SingleDoorCabinet(sceneManager, params);
      case CabinetSubType.Double:
        return new DoubleDoorCabinet(sceneManager, params);
      default:
        throw new Error(`Unknown cabinet subtype: ${params.subType}`);
    }
  }
   /** Возвращает начальные данные для Store или инициализации */
  abstract createDefaultParams(): ICabinet;

  static getFactory(type: CabinetSubType): CabinetFactory {
    switch (type) {
      case CabinetSubType.Single:
        return new SingleDoorCabinetFactory();
      case CabinetSubType.Double:
        return new DoubleDoorCabinetFactory();
      default:
        throw new Error(`Unsupported cabinet type: ${type}`);
    }
  }
  abstract createProduct(sceneManagerService: SceneManagerService, params: ICabinet): BaseCabinet;



  static getColors(): IColor[] {
    return [
      {
        id: 1,
        typeCategoryId: 1,
        name: 'Белый',
        hex: '#FFFFFF',
        active: true,
      },
      {
        id: 2,
        typeCategoryId: 1,
        name: 'Оранжевый',
        hex: '#c97b22',
        active: true,
      },
      {
        id: 3,
        typeCategoryId: 1,
        name: 'Жёлтый',
        hex: '#c7c922',
        active: true,
      },
      {
        id: 4,
        typeCategoryId: 1,
        name: 'Серый',
        hex: '#989c9b',
        active: true,
      },
      {
        id: 5,
        typeCategoryId: 1,
        name: 'Коричневый',
        hex: '#75511b',
        active: true,
      },
    ];
  }

  // protected getDefaultDimensions(): ICabinetDimensions {
  //   return {
  //     general: { width: 450, height: 2000, depth: 430 },

  //     wall: {
  //       width: WALL_THICKNESS,
  //       height: 2000,
  //       depth: 430,
  //       edges: { length: [EDGE_08, EDGE_04], width: [EDGE_04, EDGE_04] },
  //     },

  //     topShelf: {
  //       width: 418,
  //       height: WALL_THICKNESS,
  //       depth: 430,
  //       edges: { length: [EDGE_08, EDGE_04], width: EDGE_04 },
  //     },

  //     bottomShelf: {
  //       width: 418,
  //       height: WALL_THICKNESS,
  //       depth: 350,
  //       edges: { length: [EDGE_08, EDGE_04], width: EDGE_04 },
  //     },

  //     hdf: {
  //       width: 440,
  //       height: 1990,
  //       depth: DEPTH_EDGE_4MM,
  //     },

  //     falsePanelFacade: {
  //       width: 450 - 32,
  //       height: 85,
  //       depth: WALL_THICKNESS,
  //       edges: { length: EDGE_08, width: EDGE_NONE },
  //     },

  //     falsePanel: {
  //       width: 450 - 32,
  //       height: FACADE_HEIGHT,
  //       depth: WALL_THICKNESS,
  //       edges: { length: EDGE_08, width: EDGE_NONE },
  //     },

  //     falsePanelWall: {
  //       width: WALL_THICKNESS,
  //       height: FACADE_HEIGHT,
  //       depth: 430 - 16 * 3 - 35 - 4 - 10,
  //       edges: { length: EDGE_04, width: EDGE_04 },
  //     },
  //   };
  // }

  protected getDefaultDimensions(): ICabinetDimensions {
    return {
      general: { width: 450, height: 2000, depth: 430 },

      wall: {
        width: WALL_THICKNESS,
        height: 2000,
        depth: 430,
        edges: { length: [EDGE_08, EDGE_04], width: [EDGE_04, EDGE_04] },
      },

      topShelf: {
        width: 418,
        height: WALL_THICKNESS,
        depth: 430,
        edges: { length: [EDGE_08, EDGE_04], width: EDGE_NONE },
      },

      bottomShelf: {
        width: 418,
        height: WALL_THICKNESS,
        depth: 350,
        edges: { length: [EDGE_08, EDGE_NONE], width: EDGE_NONE },
      },

      hdf: { width: 440, height: 1990, depth: DEPTH_EDGE_4MM },

      falsePanelFacade: {
        width: 450 - 32,
        height: 85,
        depth: WALL_THICKNESS,
        edges: { length: EDGE_08, width: EDGE_NONE },
      },

      falsePanel: {
        width: 450 - 32,
        height: FACADE_HEIGHT,
        depth: WALL_THICKNESS,
        edges: { length: EDGE_08, width: EDGE_NONE },
      },

      falsePanelWall: {
        width: WALL_THICKNESS,
        height: FACADE_HEIGHT,
        depth: 430 - 16 * 3 - 35 - 4 - 10,
        edges: { length: EDGE_04, width: EDGE_04 },
      },
    };
  }

  protected getDefaultAppearance(): any {
    return {
      additionColor: {
        id: 1,
        name: 'Тёмное дерево',
        type: 'ldsp',
        price: 500,
        priceCoefficient: 1.0,
        active: true,
        color: {
          id: 4,
          typeCategoryId: 1,
          name: 'Коричневый',
          hex: '#75511b',
          priceCoefficient: 1.0,
          active: true,
        },
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/texture.png',
          displayOrder: 0,
        } as ITexture,
      } as MMaterial,
      visibleDtails: {
        id: 1,
        name: 'Тёмное дерево',
        type: 'ldsp',
        price: 500,
        priceCoefficient: 1.0,
        active: true,
        color: {
          id: 4,
          typeCategoryId: 1,
          name: 'Коричневый',
          hex: '#75511b',
          priceCoefficient: 1.0,
          active: true,
        },
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/texture.png',
          displayOrder: 0,
        } as ITexture,
      } as MMaterial,
    };
  }

  static getAvailableMaterials(): MMaterial[] {
    return [
      {
        active: true,
        id: 1,
        name: 'Тёмное дерево',
        type: 'ldsp', // Тип материала: 'ldsp' или 'mdf'
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/texture.png',
          displayOrder: 1,
        },
        color: {
          id: 5,
          typeCategoryId: 1,
          name: 'Коричневый',
          hex: '#75511b',
          active: true,
        },
      },
      {
        id: 2,
        active: true,
        name: 'Светлое дерево',
        type: 'ldsp',
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/H045_ST15.png',
          displayOrder: 1,
        },
        color: {
          id: 4,
          typeCategoryId: 1,
          name: 'Серый',
          hex: '#989c9b',
          active: true,
        },
      },
      {
        id: 3,
        name: 'Светлое дерево',
        type: 'mdf',
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/texture.png',
          displayOrder: 1,
        },
        color: {
          id: 4,
          typeCategoryId: 1,
          name: 'Серый',
          hex: '#989c9b',
          active: true,
        },
        active: true,
      },
      {
        id: 4,
        active: true,
        name: 'Бронза',
        type: 'mirror',
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/0011.jpg',
          displayOrder: 1,
        },
      },
      {
        id: 5,
        active: true,
        name: 'Графит',
        type: 'mirror',
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/графит-2.jpg',
          displayOrder: 1,
        },
      },
      {
        id: 6,
        active: true,
        name: 'Серебро',
        type: 'mirror',
        maxLength: 2700,
        texture: {
          id: 1,
          path: '../../../shared/assets/textures/silver.jpg',
          displayOrder: 1,
        },
      },
    ];
  }
}

// class DoubleDoorCabinetFactory extends CabinetFactory {
//   createProduct(sceneManagerService: SceneManagerService, params: ICabinet): DoubleDoorCabinet {
//       return new DoubleDoorCabinet(sceneManagerService, params);
//     // const cabinetParams = this.createDefaultParams();
//     // const dimensionLines = new DimensionLines(
//     //   sceneManagerSerivece,
//     //   cabinetParams.dimensions.general.height,
//     // );
//     // return new DoubleDoorCabinet(sceneManagerSerivece, cabinetParams, dimensionLines);
//   }

class SingleDoorCabinetFactory extends CabinetFactory {
  createProduct(sceneManagerService: SceneManagerService, params: ICabinet): SingleDoorCabinet {
     return new SingleDoorCabinet(sceneManagerService, params);
    // const cabinetParams = this.createDefaultParams();
    // const dimensionLines = new DimensionLines(
    //   sceneManagerService,
    //   cabinetParams.dimensions.general.height,
    // );
    // return new SingleDoorCabinet(sceneManagerService, cabinetParams);
  }

  createDefaultParams(): ICabinet {
    return {
      subType: CabinetSubType.Single,
      type: ProductType.Cabinet,
      series: 'NEO',
      name: 'Шкаф-1',
      dimensions: this.getDefaultDimensions(),
      appearance: this.getDefaultAppearance(),
      features: {
        cutoutPlinth: {
          checkBox: false,
          depth: 0,
          height: 0,
          radius: 5,
        },
        cutoutFacade: false,
      },
      components: {
        shelves: {
          checkBox: false,
          shelfItems: [],
        },
        drawers: {
          checkBox: false,
          drawerBlocks: [],
        },
        facades: {
          checkBox: true,
          klok: false,
          facadeItems: [
            {
              id: 1,
              facadeType: 'PUSH_OPENING',
              cutHeight: 16,
              size: { width: 448, height: 1984, depth: 16 },
              originalHeight: 0,
              positionLoops: 'right-side',
              mirrors: {
                checkbox: false,
                mirrorItems: [],
              },
              handle: {
                id: 1,
                name: '57',
                type: 'OVERHEAD_HANDLE',
                size: {
                  width: 10,
                  height: 10,
                  depth: 10,
                },
                active: true,
                indentX: 0,
                indentY: 900,
                isMoveIndentX: false,
                position: { x: 0, y: 0, z: 0 },
                path: '',
              },
              countLoops: 5,
              material: CabinetFactory.getAvailableMaterials()[0],
              positionFacade: { x: 0, y: 0, z: 0 },
              limiters: false,
            },
          ],
        },
        mullion: {
          checkBox: false,
          size: undefined,
          material: undefined,
          position: undefined,
        },
        // rod: {
        //   type: 'centralMountingRod',
        //   length: 0,
        //   active: true,
        // },
      },
    };
  }
}

class DoubleDoorCabinetFactory extends CabinetFactory {
  createProduct(sceneManagerService: SceneManagerService, params: ICabinet): DoubleDoorCabinet {
      return new DoubleDoorCabinet(sceneManagerService, params);
    // const cabinetParams = this.createDefaultParams();
    // const dimensionLines = new DimensionLines(
    //   sceneManagerSerivece,
    //   cabinetParams.dimensions.general.height,
    // );
    // return new DoubleDoorCabinet(sceneManagerSerivece, cabinetParams, dimensionLines);
  }

  createDefaultParams(): ICabinet {
    const dimensions = this.getDefaultDimensions();
    dimensions.general.width = 900; // Double the width for double door cabinet

    return {
      subType: CabinetSubType.Double,
      type: ProductType.Cabinet,
      series: 'NEO',
      name: 'Шкаф двойной',
      dimensions: dimensions,
      appearance: this.getDefaultAppearance(),
      features: {
        cutoutPlinth: {
          checkBox: false,
          depth: 0,
          height: 0,
          radius: 5,
        },
        cutoutFacade: false,
      },
      components: {
        shelves: {
          checkBox: false,
          shelfItems: [],
        },
        drawers: {
          checkBox: false,
          drawerBlocks: [],
        },
        facades: {
          checkBox: true,
          klok: false,
          facadeItems: [
            {
              id: 1,
              facadeType: 'PUSH_OPENING',
              cutHeight: 16,
              size: { width: 448, height: 1984, depth: 16 },
              originalHeight: 0,
              positionLoops: 'right-side',
              handle: {
                id: 1,
                name: '57',
                type: 'OVERHEAD_HANDLE',
                size: {
                  width: 10,
                  height: 10,
                  depth: 10,
                },
                active: true,
                indentX: 0,
                indentY: 900,
                isMoveIndentX: false,
                position: { x: 0, y: 0, z: 0 },
                path: '',
              },
              countLoops: 5,
              material: CabinetFactory.getAvailableMaterials()[0],
              positionFacade: { x: 0, y: 0, z: 0 },
              mirrors: {
                checkbox: false,
                mirrorItems: [],
              },
              limiters: false,
            },
            {
              id: 2,
              facadeType: 'PUSH_OPENING',
              cutHeight: 16,
              size: { width: 448, height: 1984, depth: 16 },
              originalHeight: 0,
              positionLoops: 'left-side',
              handle: {
                id: 1,
                name: '57',
                type: 'OVERHEAD_HANDLE',
                size: {
                  width: 10,
                  height: 10,
                  depth: 10,
                },
                active: true,
                indentX: 0,
                indentY: 900,
                isMoveIndentX: false,
                position: { x: 0, y: 0, z: 0 },
                path: '',
              },
              countLoops: 5,
              material: CabinetFactory.getAvailableMaterials()[0],
              positionFacade: { x: 0, y: 0, z: 0 },
              mirrors: {
                checkbox: false,
                mirrorItems: [],
              },
              limiters: false,
            },
          ],
        },
        mullion: {
          checkBox: false,
          size: {
            width: 0,
            height: 0,
            depth: 0,
          },
          material: CabinetFactory.getAvailableMaterials()[0],
          position: { x: 0, y: 0, z: 0 },
        },
        // rod: {
        //   type: 'centralMountingRod',
        //   length: 0, // Длина штанги
        //   active: true,
        // },
      },
    };
  }
}

// class ShowcaseCabinetFactory extends CabinetFactory {
//   createCabinet(scene: THREE.Scene, camera: THREE.Camera): ICabinet {
//     const cabinet = this.createDefaultParams();
//     // Логика инициализации 3D-объекта для витрины
//     return cabinet;
//   }

//   createDefaultParams(): ICabinet {
//     const dimensions = this.getDefaultDimensions();
//     dimensions.general.height = 1800; // Уменьшаем высоту для витрины
//     dimensions.hdf.height = 1790;

//     return new ShowcaseCabinet(
//       'NEO',
//       dimensions,
//       this.getDefaultAppearance(),
//       {
//         cutoutPlinth: { checkBox: false, depth: 0, height: 0 },
//         lighting: { checkBox: true }, // Витрина обычно имеет подсветку
//       },
//       {
//         shelves: {
//           checkBox: true,
//           cutType: 'Вырез',
//           shelfItems: [
//             {
//               id: 1,
//               size: {
//                 width: dimensions.general.width - 32,
//                 height: WALL_THICKNESS,
//                 depth: dimensions.general.depth - 50,
//               },
//               position: { x: 0, y: dimensions.general.height / 2, z: 0 },
//               material: CabinetFactory.getAvailableMaterials()[0],
//             },
//           ],
//         },
//         drawers: {
//           checkBox: false,
//           drawerBlocks: [],
//         },
//         doors: {
//           checkBox: true,
//           doorItems: [
//             {
//               id: 1,
//               facadeType: 'GLASS_DOOR',
//               size: {
//                 width: dimensions.general.width - 20,
//                 height: dimensions.general.height - 100,
//                 depth: 10,
//               },
//               positionLoops: 'right-side',
//               handle: {
//                 active: true,
//                 handleId: 1,
//                 name: '57',
//               },
//               material: CabinetFactory.getAvailableMaterials()[0],
//               positionDoor: { x: 0, y: 0, z: 0 },
//             },
//           ],
//         },
//         mullion: {
//           checkBox: false,
//           size: undefined,
//           material: undefined,
//           position: undefined,
//         },
//       },
//     );
//   }
// }

// class AngularCabinetFactory extends CabinetFactory {
//   createCabinet(scene: THREE.Scene, camera: THREE.Camera): ICabinet {
//     const cabinet = this.createDefaultParams();
//     // Логика инициализации 3D-объекта для углового шкафа
//     return cabinet;
//   }

//   createDefaultParams(): ICabinet {
//     const dimensions = {
//       general: { width: 900, height: 2000, depth: 900 },
//       wall: { width: WALL_THICKNESS, height: 2000, depth: 900 },
//       topShelf: { width: 418, height: WALL_THICKNESS, depth: 418 },
//       bottomShelf: { width: 418, height: WALL_THICKNESS, depth: 350 },
//       hdf: { width: 440, height: 1990, depth: DEPTH_EDGE_4MM },
//       falsePanelFacade: { width: 450 - 32, height: 85, depth: WALL_THICKNESS },
//       falsePanel: { width: 450 - 32, height: FACADE_HEIGHT, depth: WALL_THICKNESS },
//       falsePanelWall: {
//         width: WALL_THICKNESS,
//         height: FACADE_HEIGHT,
//         depth: 430 - 16 * 3 - 35 - 4 - 10,
//       },
//     };

//     return new AngularCabinet(
//       'NEO',
//       dimensions,
//       this.getDefaultAppearance(),
//       {
//         cutoutPlinth: { checkBox: false, depth: 0, height: 0 },
//       },
//       {
//         shelves: {
//           checkBox: true,
//           cutType: 'Угловой вырез',
//           shelfItems: [
//             {
//               id: 1,
//               size: {
//                 width: dimensions.general.width / 2,
//                 height: WALL_THICKNESS,
//                 depth: dimensions.general.depth / 2,
//               },
//               position: { x: 0, y: dimensions.general.height / 3, z: 0 },
//               material: CabinetFactory.getAvailableMaterials()[0],
//             },
//           ],
//         },
//         drawers: {
//           checkBox: false,
//           drawerBlocks: [],
//         },
//         doors: {
//           checkBox: true,
//           doorItems: [
//             {
//               id: 1,
//               facadeType: 'ANGULAR_DOOR',
//               size: {
//                 width: dimensions.general.width / 2,
//                 height: dimensions.general.height - 100,
//                 depth: 20,
//               },
//               positionLoops: 'right-side',
//               handle: {
//                 active: true,
//                 handleId: 1,
//                 name: '57',
//               },
//               material: CabinetFactory.getAvailableMaterials()[0],
//               positionDoor: { x: 0, y: 0, z: 0 },
//             },
//           ],
//         },
//         mullion: {
//           checkBox: false,
//           size: undefined,
//           material: undefined,
//           position: undefined,
//         },
//       },
//     );
//   }
// }

// class RackCabinetFactory extends CabinetFactory {
//   createCabinet(scene: THREE.Scene, camera: THREE.Camera): ICabinet {
//     const cabinet = this.createDefaultParams();
//     // Логика инициализации 3D-объекта для стеллажа
//     return cabinet;
//   }

//   createDefaultParams(): ICabinet {
//     const dimensions = {
//       general: { width: 800, height: 1800, depth: 400 },
//       wall: { width: WALL_THICKNESS, height: 1800, depth: 400 },
//       topShelf: { width: 800 - WALL_THICKNESS * 2, height: WALL_THICKNESS, depth: 400 },
//       bottomShelf: { width: 800 - WALL_THICKNESS * 2, height: WALL_THICKNESS, depth: 400 },
//       hdf: {
//         width: 800 - WALL_THICKNESS * 2,
//         height: 1800 - WALL_THICKNESS * 2,
//         depth: DEPTH_EDGE_4MM,
//       },
//       falsePanelFacade: { width: 0, height: 0, depth: 0 },
//       falsePanel: { width: 0, height: 0, depth: 0 },
//       falsePanelWall: { width: 0, height: 0, depth: 0 },
//     };

//     return new RackCabinet(
//       'NEO',
//       dimensions,
//       this.getDefaultAppearance(),
//       {
//         cutoutPlinth: { checkBox: false, depth: 0, height: 0 },
//       },
//       {
//         shelves: {
//           checkBox: true,
//           cutType: 'Прямая',
//           shelfItems: [
//             {
//               id: 1,
//               size: {
//                 width: dimensions.general.width - WALL_THICKNESS * 2,
//                 height: WALL_THICKNESS,
//                 depth: dimensions.general.depth,
//               },
//               position: { x: 0, y: 600, z: 0 },
//               material: CabinetFactory.getAvailableMaterials()[0],
//             },
//             {
//               id: 2,
//               size: {
//                 width: dimensions.general.width - WALL_THICKNESS * 2,
//                 height: WALL_THICKNESS,
//                 depth: dimensions.general.depth,
//               },
//               position: { x: 0, y: 1200, z: 0 },
//               material: CabinetFactory.getAvailableMaterials()[0],
//             },
//           ],
//         },
//         drawers: {
//           checkBox: false,
//           drawerBlocks: [],
//         },
//         doors: {
//           checkBox: false,
//           doorItems: [],
//         },
//         mullion: {
//           checkBox: false,
//           size: undefined,
//           material: undefined,
//           position: undefined,
//         },
//       },
//     );
//   }
// }
