import exp from 'node:constants';

export const GUI_POSITION_STYLE = {
  top: '6rem !important',
  right: '0rem !important',
  width: '5rem !important',
  zIndex: '100 !important',
};

export const GUI_SIZE = {
  width: '40rem !important',
  height: '5rem !important',
  depth: '5rem !important',
};

// Базовые размеры комнаты
export const WIDTH_ROOM = 10000;
export const HEIGHT_ROOM = 3000;
export const DEPTH_ROOM = 9000;

export const DEEP_04MM = 4;
export const SHELF_HEIGHT = 16; // Фиксированная высота полки в мм
export const SHELF_POSITION_OFFSET = 32; // Шаг застверловки
export const MIN_DISTANCE_BETWEEN_SHELVES = 112;
export const SHELF_MIN_POSITION = 256; // 300 + 117
export const SHELF_MAX_TOP_POSITION = 299;
export const SHELF_MAX_POSITION_OFFSET = 112;
export const MIN_DISTANCE_SHELF_DRAWER_BLOCK = 112; // Min расстояние между полкой и блоком ящиков
export const DRAWER_GAP = 30; // мм — зазор между ящиками

export const PLINTH_RADIUS_MIN = 25;
export const PLINTH_RADIUS_MAX = 35;

export const WIDTH_RANGES = {
  single: { min: 500, max: 1000 },
  double: { min: 1000, max: 2000 },
  showcase: { min: 500, max: 1500 },
};
export const HEIGHT_RANGE = { min: 2000, max: 2750 };
export const DEPTH_OPTIONS = [430, 580];

export const TOLERANCE = 1;

export const WALL_THICKNESS = 16; // Толщина стенок
export const PODIUM_HEIGHT = 85; // Высота фасадного цоколя
export const FACADE_HEIGHT = 80; // Высота всех остальных фальшпанелей в цоколе

export const CLEARANCE = 16; // Зазор между полом и фасадом
export const DEPTH_WIDTH_INTG_HADLE = 32;
export const DEPTH_EDGE_8MM = 8;
export const DEPTH_EDGE_4MM = 4;

export const DEPTH_EDGE_08MM = 0.8;
export const DEPTH_EDGE_04MM = 0.4;

export const SINGLE_STEP = 25; // Шаг для одностворчатого шкафа
export const DOUBLE_STEP = 50; // Шаг для двустворчатого шкафа
export const SNOWCASE_STEP = 25; // Шаг для витрины

export const DRAVER_MIN_POSITION = 256;
export const DRAVER_POSITION_OFFSET = 32;
export const DEEP_DRAVER_IN_CABINET = 80;
export const FALSE_PANEL_TOP = 80;
export const FALSE_PANEL_WIDTH = 50;
export const HEIGHT_WALL_DRAWER = 144;
export const MIN_SECTION_WIDTH = 300; // Минимальная ширина для добавления блока
export const CRITICAL_SECTION_WIDTH = 350; // Ширина, при которой нельзя добавлять блок

export const DRAWER_SPACING = 30;
export const DEPTH_FACADE = 0.8;

export const SIDEWALL_INDENTATION = 8;
export const INTERVAL_1_MM = 1;
export const INTERVAL_4_MM = 4;

const LDSP_FACADE_TYPES = ['ЛДСП', 'ЛДСП с интегрированной ручкой', 'ЛДСП с зеркалом'];
const MDF_FACADE_TYPES = ['МДФ 19', 'МДФ 22'];

const LDSP_OPEN_TYPES = {
  ЛДСП: ['С ручкой', 'От нажатия'],
};

export const MANUFACTURER_LDSP = {
  ldsp1: 'ЛДСП1',
  ldsp2: 'ЛДСП2',
  ldsp3: 'ЛДСП3',
};

export const TYPE_MATERIAL = {
  ldsp1: 'ЛДСП1',
  ldsp2: 'ЛДСП2',
  ldsp3: 'ЛДСП3',
  mdf: 'mdf',
};

export const MATERIALS_TYPES = {
  ldsp: 'ЛДСП',
  mdf: 'МДФ',
};

// PROFILE_HANDLE = 'ЛДСП с профиль-ручкой на торце',

// export const FACADE_TYPES = {
//   integrated_handle: 'ЛДСП с интегрированной ручкой',
//   push_opening: 'ЛДСП с открыванием от нажатия',
//   overlaid_handle: 'ЛДСП с накладной ручкой',
//   end_handle: 'ЛДСП с торцевой ручкой',
//   profile_handle: 'ЛДСП с профиль-ручкой на торце',
//   mirror: 'ЛДСП с зеркалом',
// };

export const MDF_CATEGORIES = {
  category1: ['Белый глянец FB R910/BNC', 'RAL9001', 'RAL9003'],
  category2: ['CS010', 'CS012', 'RAL9010'],
  category3: ['Все остальные цвета по RAL, CS, NCS'],
};

export const MDF_VARITIES = {
  variety1: ['МДФ 19 мм эмаль матовая', 'МДФ 19 мм эмаль глянец'],
  variety2: ['МДФ 22 мм эмаль с интегрированной ручкой', 'МДФ 22 мм эмаль с фрезеровкой'],
};
