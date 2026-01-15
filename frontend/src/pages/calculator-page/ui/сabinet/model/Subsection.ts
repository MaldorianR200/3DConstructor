import * as THREE from 'three';

export interface Subsection {
  section: 'left' | 'right' | 'center';
  yStart: number; // Нижняя граница области (Y)
  yEnd: number;   // Верхняя граница области (Y)
  height: number; // Высота области
  yPosition: number; // Центральная точка по Y (для размещения подсветки)
}

export interface SectionState {
  left: Subsection[];
  right: Subsection[];
  center: Subsection[];
}
