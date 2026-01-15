import * as THREE from 'three';
import { ICabinet } from 'src/entities/Cabinet';

import { DEPTH_EDGE_4MM, FACADE_HEIGHT, WALL_THICKNESS } from '../../constants';
import {
  CabinetSubType,
  ITexture,
  MMaterial,
} from 'src/entities/Cabinet/model/types/cabinet.model';

import { IColor } from 'src/entities/Color';
import { ProductType } from 'src/entities/Product/model/types/product.model';

export class CabinetFactory {
  static createDefaultCabinet(scene: THREE.Scene, camera: THREE.Camera): ICabinet {
    const cabinet = this.createDefaultParams();
    // Здесь можно добавить логику инициализации 3D-объекта для сцены
    return cabinet;
  }

  static createDefaultParams(): ICabinet {
    return {
      type: ProductType.Cabinet,
      subType: CabinetSubType.Single,
      series: 'NEO',
      name: 'Шкаф-1',
      dimensions: {
        general: { width: 450, height: 2000, depth: 430 },
        wall: { width: WALL_THICKNESS, height: 2000, depth: 430 },
        topShelf: { width: 418, height: WALL_THICKNESS, depth: 430 },
        bottomShelf: { width: 418, height: WALL_THICKNESS, depth: 350 },
        hdf: { width: 440, height: 1990, depth: DEPTH_EDGE_4MM },
        falsePanelFacade: { width: 450 - 32, height: 85, depth: WALL_THICKNESS },
        falsePanel: { width: 450 - 32, height: FACADE_HEIGHT, depth: WALL_THICKNESS },
        falsePanelWall: {
          width: WALL_THICKNESS,
          height: FACADE_HEIGHT,
          depth: 430 - 16 * 3 - 35 - 4 - 10,
        },
      },

      appearance: {
        additionColor: {
          id: 1,
          name: 'Тёмное дерево',
          type: 'ldsp',
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
          active: true,
          color: {
            id: 4,
            typeCategoryId: 1,
            name: 'Коричневый',
            hex: '#75511b',
            active: true,
          },
          texture: {
            id: 1,
            path: '../../../shared/assets/textures/texture.png',
            displayOrder: 0,
          } as ITexture,
        } as MMaterial,
        customization: false,
      },

      features: {
        cutoutPlinth: {
          checkBox: false,
          depth: 0,
          height: 0,
          radius: 5,
        },
        cutoutFacade: false,
        lighting: { checkBox: false },
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
          checkBox: false,
          klok: false,
          facadeItems: [
            {
              id: 1,
              facadeType: 'PUSH_OPENING',
              size: { width: 0, height: 0, depth: 0 },
              positionLoops: 'right-side',
              material: {
                id: 1,
                name: 'Тёмное дерево',
                type: 'ldsp', // Тип материала: 'ldsp' или 'mdf'
                maxLength: 2850,
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
                active: true,
              },
              positionFacade: { x: 0, y: 0, z: 0 },
              cutHeight: 16,
              limiters: false,
              countLoops: 0,
            },
          ],
        },
        mullion: {
          checkBox: false,
          size: undefined,
          material: undefined,
          position: undefined,
        },
      },
    };
  }

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
}
