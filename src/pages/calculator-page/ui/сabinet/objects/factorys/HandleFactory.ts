import { FacadeType, HandleType, IHandle } from '../../model/Facade';

export class HandleFactory {
  // Статический список ручек
  public static handles: IHandle[] = [
    {
      id: 1,
      name: 'Ручка 29',
      type: 'OVERHEAD_HANDLE',
      path: '../../../shared/assets/models/handle/handle_29.obj',
      indentX: 10, // ../../../shared/assets/textures/графит-2.jpg
      indentY: 1000,
      isMoveIndentX: true,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 10, height: 20, depth: 100 },
      active: true,
    },
    {
      id: 2,
      name: 'Ручка 57',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_57.obj',
      indentX: 0,
      indentY: 1000,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 10, height: 20, depth: 100 },
      active: true,
    },
    {
      id: 3,
      name: 'Ручка 53',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_53.obj',
      indentX: 0,
      indentY: 1000,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 10, height: 20, depth: 1100 },
      active: true,
    },
    {
      id: 5,
      name: 'Ручка 59',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_59.obj',
      indentX: 0,
      indentY: 1000,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 28, height: 15, depth: 1100 }, // depth - высота // height - ширина // width - глубина
      active: false,
    },
    {
      id: 6,
      name: 'Ручка 60',
      type: 'OVERHEAD_HANDLE',
      path: '../../../shared/assets/models/handle/handle_60.obj',
      indentX: 10,
      indentY: 1000,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 28, height: 15, depth: 110 }, // depth - высота // height - ширина // width - глубина
      active: false,
    },
    {
      id: 7,
      name: 'Ручка 62',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_62.obj',
      indentX: 0,
      indentY: 0,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 28, height: 15, depth: 1100 }, // depth - высота // height - ширина // width - глубина
      active: false,
    },
    {
      id: 8,
      name: 'Ручка 65',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_65.obj',
      indentX: 0,
      indentY: 0,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 29, height: 1200, depth: 15 }, // depth - высота // height - ширина // width - глубина
      active: false,
    },
    {
      id: 9,
      name: 'Ручка 66',
      type: 'END_HANDLE',
      path: '../../../shared/assets/models/handle/handle_66.obj',
      indentX: 0,
      indentY: 0,
      isMoveIndentX: false,
      position: { x: 0, y: 0, z: 0 },
      size: { width: 28, height: 15, depth: 1100 }, // depth - высота // height - ширина // width - глубина
      active: false,
    },
  ];

  // Получить все активные ручки
  public static getAvailableHandles(): IHandle[] {
    return this.handles.filter((h) => h.active);
  }

  // Получить ручку по имени
  public static getHandleByName(name: string): IHandle | undefined {
    return this.handles.find((h) => h.name === name);
  }

  static getHandlesByType(type: HandleType): IHandle[] {
    return this.handles.filter((handle) => handle.type === type);
  }

  static getDefaultHandle(type: HandleType): IHandle {
    return this.getHandlesByType(type)[0] || this.handles[0];
  }

  static getHandleTypeFromFacadeType(facadeType: FacadeType): HandleType {
    switch (facadeType) {
      case 'HANDLE':
        return 'OVERHEAD_HANDLE';

      default:
        return 'END_HANDLE'; // или по умолчанию
    }
  }
}
