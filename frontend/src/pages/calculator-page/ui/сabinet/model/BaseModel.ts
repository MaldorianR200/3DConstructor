export interface Size {
  width: number;
  height: number;
  depth: number;
}

// Толщина кромки может быть 0, 0.4 или 0.8
export interface EdgeThickness {
  name: string; // "Кромка 0.8" или "Кромка 0.4"
  type: 'edge_08' | 'edge_04' | 'none';
  thickness: number; // 0.8 или 0.4 (может быть 0 для отсутствия)
}

export function getCutThickness(edge: EdgeThickness): number {
  switch (edge.type) {
    case 'edge_08':
      return 0.5; // вместо 0.8
    case 'edge_04':
      return 0; // вместо 0.4
    default:
      return 0;
  }
}

export const EDGE_NONE: EdgeThickness = { name: 'Нет кромки', type: 'none', thickness: 0 };
export const EDGE_08: EdgeThickness = { name: 'Кромка 0.8', type: 'edge_08', thickness: 0.5 };
export const EDGE_04: EdgeThickness = { name: 'Кромка 0.4', type: 'edge_04', thickness: 0 };

// Кромки по сторонам детали
export interface EdgeMap {
  length?: EdgeThickness | [EdgeThickness, EdgeThickness]; // одна длина или две длины (верх/низ)
  width?: EdgeThickness | [EdgeThickness, EdgeThickness]; // одна ширина или две ширины (левая/правая)
}

// Размер с кромками
export interface SizeWithEdges extends Size {
  edges?: EdgeMap; // опционально, если кромка отсутствует
}
export interface Position {
  x: number;
  y: number;
  z: number;
}
