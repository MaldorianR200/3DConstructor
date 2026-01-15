import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PODIUM_HEIGHT, WALL_THICKNESS } from '../../сabinet/constants';
import { Subsection } from '../../сabinet/model/Subsection';

@Injectable({
  providedIn: 'root',
})
export class SectionHighlightService {
  private sectionHighlight: THREE.Mesh | null = null;
  private highlightMaterial: THREE.MeshBasicMaterial;
  private subsectionHighlights: THREE.Mesh[] = [];

  constructor() {
    // Создаем материал для подсветки
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x3f51b5,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });
  }

  /**
   * Подсвечивает выбранную секцию
   */
  highlightSection(section: 'left' | 'right' | 'center', scene: THREE.Scene, cabinet: any): void {
    this.clearHighlight(scene);

    const cabinetSize = cabinet.getCabinetSize();
    const cabinetWidth = cabinetSize.width;
    const cabinetHeight = cabinetSize.height;
    const hasMullion = cabinet.hasMullion();

    let sectionWidth: number;
    let sectionPositionX: number;
    let sectionDepth: number;

    if (hasMullion) {
      const mullion = cabinet.getMullion();
      const mullionPosition = mullion.position.x;

      switch (section) {
        case 'left':
          sectionWidth = cabinetWidth / 2 + mullionPosition - WALL_THICKNESS * 2;
          sectionPositionX = -cabinetWidth / 2 + WALL_THICKNESS + sectionWidth / 2;
          break;
        case 'right':
          sectionWidth = cabinetWidth / 2 - mullionPosition - WALL_THICKNESS * 2;
          sectionPositionX = cabinetWidth / 2 - WALL_THICKNESS - sectionWidth / 2;
          break;
        default:
          return;
      }
    } else {
      // Без средника - вся ширина
      sectionWidth = cabinetWidth - WALL_THICKNESS * 2;
      sectionPositionX = 0;
    }

    // Глубина подсветки - немного меньше глубины шкафа для видимости
    sectionDepth = cabinetSize.depth - 50;

    // Создаем геометрию для подсветки
    const highlightGeometry = new THREE.BoxGeometry(
      sectionWidth,
      cabinetHeight - PODIUM_HEIGHT - WALL_THICKNESS * 2,
      sectionDepth,
    );

    this.sectionHighlight = new THREE.Mesh(highlightGeometry, this.highlightMaterial);
    this.sectionHighlight.name = 'sectionHighlight';
    this.sectionHighlight.position.set(sectionPositionX, (cabinetHeight - PODIUM_HEIGHT) / 2, 0);

    // Устанавливаем рендер порядок чтобы подсветка была поверх других объектов
    this.sectionHighlight.renderOrder = 1;

    scene.add(this.sectionHighlight);

    console.log(`Section highlighted: ${section}`, {
      width: sectionWidth,
      positionX: sectionPositionX,
      height: cabinetHeight - PODIUM_HEIGHT - WALL_THICKNESS * 2,
      depth: sectionDepth,
    });
  }

  /**
   * Подсвечивает конкретную подсекцию
   */
  // highlightSubsection(subsection: Subsection, scene: THREE.Scene, cabinet: any): void {
  //   this.clearHighlight(scene);

  //   const cabinetSize = cabinet.getCabinetSize();
  //   const cabinetWidth = cabinetSize.width;
  //   const hasMullion = cabinet.hasMullion();

  //   let width = 0;
  //   let posX = 0;

  //   // ЛОГИКА ШИРИНЫ ПОДСВЕТКИ
  //   if (subsection.section === 'center' || !hasMullion) {
  //     // Вся ширина, если мы сверху или нет средника
  //     width = cabinetWidth - WALL_THICKNESS * 2;
  //     posX = 0;
  //   } else {
  //     // Расчет для левой/правой части (нижние секции)
  //     const mullionX = cabinet.getMullion().position.x;
  //     const halfWidth = cabinetWidth / 2;

  //     if (subsection.section === 'left') {
  //       const leftInner = -halfWidth + WALL_THICKNESS;
  //       const rightInner = mullionX - WALL_THICKNESS / 2;
  //       width = rightInner - leftInner;
  //       posX = leftInner + width / 2;
  //     } else {
  //       const leftInner = mullionX + WALL_THICKNESS / 2;
  //       const rightInner = halfWidth - WALL_THICKNESS;
  //       width = rightInner - leftInner;
  //       posX = leftInner + width / 2;
  //     }
  //   }

  //   const geometry = new THREE.BoxGeometry(
  //     width - 4,
  //     subsection.height - 4,
  //     cabinetSize.depth - 10,
  //   );
  //   const material = new THREE.MeshBasicMaterial({
  //     color: 0x4caf50,
  //     transparent: true,
  //     opacity: 0.3,
  //     depthTest: false,
  //   });

  //   const highlightMesh = new THREE.Mesh(geometry, material);
  //   highlightMesh.name = 'subsectionHighlight';
  //   highlightMesh.position.set(posX, subsection.yPosition, 0);
  //   highlightMesh.renderOrder = 10;
  //   scene.add(highlightMesh);
  // }

  highlightSubsection(subsection: Subsection, scene: THREE.Scene, cabinet: any): void {
    this.clearHighlight(scene);

    const cabinetSize = cabinet.getCabinetSize();
    const cabinetWidth = cabinetSize.width;
    const hasMullion = cabinet.hasMullion();
    const mullion = hasMullion ? cabinet.getMullion() : null;

    let width = 0;
    let posX = 0;

    // Если тип секции 'center' (благодаря логике из SectionInteractionService)
    if (subsection.section === 'center') {
      width = cabinetWidth - WALL_THICKNESS * 2;
      posX = 0;
    } else if (mullion) {
      // Стандартная логика для лево/право
      const mullionX = mullion.position.x;
      const halfWidth = cabinetWidth / 2;

      if (subsection.section === 'left') {
        const leftInner = -halfWidth + WALL_THICKNESS;
        const rightInner = mullionX - WALL_THICKNESS / 2;
        width = rightInner - leftInner;
        posX = leftInner + width / 2;
      } else {
        const leftInner = mullionX + WALL_THICKNESS / 2;
        const rightInner = halfWidth - WALL_THICKNESS;
        width = rightInner - leftInner;
        posX = leftInner + width / 2;
      }
    }

    const geometry = new THREE.BoxGeometry(
      width - 4,
      subsection.height - 4,
      cabinetSize.depth - 10,
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0x4caf50,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
    });

    const highlightMesh = new THREE.Mesh(geometry, material);
    highlightMesh.name = 'section_highlight_mesh';
    highlightMesh.position.set(posX, subsection.yPosition, 0);
    highlightMesh.renderOrder = 10;
    scene.add(highlightMesh);
  }

  /**
   * Подсвечивает подсекцию определенным цветом
   */
  highlightSubsectionWithColor(
    subsection: Subsection,
    scene: THREE.Scene,
    cabinet: any,
    color: number,
  ): void {
    const cabinetSize = cabinet.getCabinetSize();
    const cabinetWidth = cabinetSize.width;
    const hasMullion = cabinet.hasMullion();

    let sectionWidth: number;
    let sectionPositionX: number;

    if (hasMullion) {
      const mullion = cabinet.getMullion();
      const mullionPosition = mullion.position.x;

      switch (subsection.section) {
        case 'left':
          sectionWidth = cabinetWidth / 2 + mullionPosition - WALL_THICKNESS * 2;
          sectionPositionX = -cabinetWidth / 2 + WALL_THICKNESS + sectionWidth / 2;
          break;
        case 'right':
          sectionWidth = cabinetWidth / 2 - mullionPosition - WALL_THICKNESS * 2;
          sectionPositionX = cabinetWidth / 2 - WALL_THICKNESS - sectionWidth / 2;
          break;
        default:
          return;
      }
    } else {
      sectionWidth = cabinetWidth - WALL_THICKNESS * 2;
      sectionPositionX = 0;
    }

    const highlightGeometry = new THREE.BoxGeometry(
      sectionWidth,
      subsection.height,
      cabinetSize.depth - 50,
    );

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightMesh.position.set(sectionPositionX, subsection.yPosition, 0);

    highlightMesh.renderOrder = 1;
    scene.add(highlightMesh);
    this.subsectionHighlights.push(highlightMesh);
  }

  /**
   * Подсвечивает все доступные подсекции разными цветами
   */
  highlightAllSubsections(subsections: Subsection[], scene: THREE.Scene, cabinet: any): void {
    this.clearHighlight(scene);

    const colors = [0x4caf50, 0x2196f3, 0xff9800, 0x9c27b0, 0x795548];

    subsections.forEach((subsection, index) => {
      this.highlightSubsectionWithColor(subsection, scene, cabinet, colors[index % colors.length]);
    });
  }

  /**
   * Убирает подсветку секции
   */
  clearHighlight(scene: THREE.Scene): void {
    if (this.sectionHighlight) {
      scene.remove(this.sectionHighlight);
      this.sectionHighlight.geometry.dispose();
      this.sectionHighlight = null;
    }

    // Также удаляем по имени на случай, если объект был сохранен в сцене
    const existingHighlight = scene.getObjectByName('sectionHighlight');
    if (existingHighlight) {
      scene.remove(existingHighlight);
      if ((existingHighlight as THREE.Mesh).geometry) {
        (existingHighlight as THREE.Mesh).geometry.dispose();
      }
    }
  }

  /**
   * Обновляет цвет подсветки
   */
  setHighlightColor(color: number, opacity: number = 0.2): void {
    this.highlightMaterial.color.setHex(color);
    this.highlightMaterial.opacity = opacity;
  }

  /**
   * Устанавливает разные цвета для разных секций
   */
  setSectionColor(section: 'left' | 'right' | 'center'): void {
    const colors = {
      left: 0x4caf50, // Зеленый
      right: 0x9c27b0, // Фиолетовый
      center: 0x2196f3, // Синий
    };

    this.setHighlightColor(colors[section]);
  }

  /**
   * Проверяет, есть ли активная подсветка
   */
  hasActiveHighlight(): boolean {
    return this.sectionHighlight !== null;
  }

  /**
   * Уничтожает сервис и освобождает ресурсы
   */
  dispose(): void {
    this.highlightMaterial.dispose();
    if (this.sectionHighlight) {
      this.sectionHighlight.geometry.dispose();
    }
  }
}
