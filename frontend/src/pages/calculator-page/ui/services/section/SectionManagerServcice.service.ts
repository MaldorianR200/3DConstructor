import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PODIUM_HEIGHT, WALL_THICKNESS } from '../../сabinet/constants';
import { SectionHighlightService } from './SectionHighlightService.service';

@Injectable({
  providedIn: 'root',
})
export class SectionManagerService {
  constructor(private sectionHighlight: SectionHighlightService) {}

   /**
   * Подсвечивает выбранную секцию
   */
  highlightSection(section: 'left' | 'right' | 'center', scene: THREE.Scene, cabinet: any): void {
    console.log('SectionManagerService: highlightSection called for', section);

    // Устанавливаем цвет в зависимости от секции
    this.sectionHighlight.setSectionColor(section);
    this.sectionHighlight.highlightSection(section, scene, cabinet);

    console.log('SectionManagerService: highlightSection completed');
  }


    /**
   * Убирает подсветку секции
   */
  clearHighlight(scene: THREE.Scene): void {
    this.sectionHighlight.clearHighlight(scene);
  }

  /**
   * Вычисляет параметры секции для добавления элементов
   */
  calculateSectionParams(
    section: 'left' | 'right' | 'center',
    hasMullion: boolean,
    cabinetWidth: number,
    mullionPosition: number,
  ): { availableWidth: number; positionX: number } | null {
    if (hasMullion) {
      switch (section) {
        case 'left':
          const leftWidth = cabinetWidth / 2 + mullionPosition - WALL_THICKNESS * 2;
          const leftPositionX = -cabinetWidth / 4 + mullionPosition / 2;
          return { availableWidth: leftWidth, positionX: leftPositionX };

        case 'right':
          const rightWidth = cabinetWidth / 2 - mullionPosition - WALL_THICKNESS * 2;
          const rightPositionX = cabinetWidth / 4 + mullionPosition / 2;
          return { availableWidth: rightWidth, positionX: rightPositionX };

        default:
          return null;
      }
    } else {
      // Без средника
      const centerWidth = cabinetWidth - WALL_THICKNESS * 2;
      return { availableWidth: centerWidth, positionX: 0 };
    }
  }

  /**
   * Определяет секцию по позиции объекта
   */
  getSectionByCenter(object: THREE.Object3D): 'left' | 'right' | 'center' {
    const positionX = object.position.x;

    // Пороговое значение для определения секции
    const threshold = 10; // мм

    if (positionX < -threshold) return 'left';
    if (positionX > threshold) return 'right';
    return 'center';
  }
}
