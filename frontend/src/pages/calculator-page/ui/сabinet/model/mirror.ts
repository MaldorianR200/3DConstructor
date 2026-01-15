import { IColor } from 'src/entities/Color/model/types/color.model';

export enum MirrorColorKey {
  Silver = 'silver',
  Bronze = 'bronze',
  Graphite = 'graphite',
}

export const mirrorColorMap: Record<MirrorColorKey, IColor> = {
  [MirrorColorKey.Silver]: {
    id: 1,
    name: 'Серебро',
    hex: '#C0C0C0',
    typeCategoryId: 1,
    active: true,
  },
  [MirrorColorKey.Bronze]: {
    id: 2,
    name: 'Бронза',
    hex: '#CD7F32',
    typeCategoryId: 1,
    active: true,
  },
  [MirrorColorKey.Graphite]: {
    id: 3,
    name: 'Графит',
    hex: '#474A51',
    typeCategoryId: 1,
    active: true,
  },
};
