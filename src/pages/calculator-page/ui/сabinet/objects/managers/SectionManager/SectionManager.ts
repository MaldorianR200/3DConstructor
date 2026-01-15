// ui/сabinet/objects/managers/SectionManager/SectionManager.ts
import * as THREE from 'three';
import { MIN_SECTION_WIDTH, WALL_THICKNESS } from '../../../constants';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import { SectionHighlightService } from 'src/pages/calculator-page/ui/services/section/SectionHighlightService.service';


export type SectionType = 'left' | 'right' | 'center';

export interface Section {
  type: SectionType;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  position: THREE.Vector3;
  width: number;
  height: number;
  depth: number;
  hasContent: boolean;
}

export class SectionManager {
  private sceneManagerService: SceneManagerService;
  private sectionHighlight: SectionHighlightService;
  private highlightMesh: THREE.Mesh | null = null;
  private sections: Map<SectionType, Section> = new Map();

  constructor(sceneManagerService: SceneManagerService, sectionHighlight: SectionHighlightService) {
    this.sceneManagerService = sceneManagerService;
    this.sectionHighlight = sectionHighlight;
    // this.calculateSections();
  }

    /**
   * Инициализация менеджера секций (вызывается после создания кабинета)
   */
  public initialize(): void {
    this.calculateSections();
  }

  /**
   * Пересчитывает границы всех секций
   */
  public calculateSections(): void {
    this.sections.clear();

    const cabinetParams = this.sceneManagerService.getCabinet().getCabinetParams();
    const hasMullion = this.sceneManagerService.getCabinet().hasMullion();
    const mullionPosition = hasMullion
      ? this.sceneManagerService.getCabinet().getMullion().position.x
      : 0;

    const innerWidth = cabinetParams.dimensions.general.width - 2 * WALL_THICKNESS;
    const innerHeight = cabinetParams.dimensions.general.height - 2 * WALL_THICKNESS;
    const innerDepth = cabinetParams.dimensions.general.depth - 10; // Отступ от задней стенки

    if (!hasMullion) {
      // Одна центральная секция
      const centerSection: Section = {
        type: 'center',
        bounds: {
          minX: -innerWidth / 2,
          maxX: innerWidth / 2,
          minY: -innerHeight / 2,
          maxY: innerHeight / 2,
          minZ: -innerDepth / 2,
          maxZ: innerDepth / 2,
        },
        position: new THREE.Vector3(0, 0, 0),
        width: innerWidth,
        height: innerHeight,
        depth: innerDepth,
        hasContent: this.checkSectionHasContent('center')
      };
      this.sections.set('center', centerSection);
    } else {
      // Две секции: левая и правая
      const leftSectionWidth =
        mullionPosition + cabinetParams.dimensions.general.width / 2 - WALL_THICKNESS;
      const rightSectionWidth = innerWidth - leftSectionWidth - WALL_THICKNESS;

      const leftSection: Section = {
        type: 'left',
        bounds: {
          minX: -cabinetParams.dimensions.general.width / 2 + WALL_THICKNESS,
          maxX: mullionPosition,
          minY: -innerHeight / 2,
          maxY: innerHeight / 2,
          minZ: -innerDepth / 2,
          maxZ: innerDepth / 2,
        },
        position: new THREE.Vector3(
          (-cabinetParams.dimensions.general.width / 2 + WALL_THICKNESS + mullionPosition) / 2,
          0,
          0
        ),
        width: leftSectionWidth,
        height: innerHeight,
        depth: innerDepth,
        hasContent: this.checkSectionHasContent('left')
      };

      const rightSection: Section = {
        type: 'right',
        bounds: {
          minX: mullionPosition,
          maxX: cabinetParams.dimensions.general.width / 2 - WALL_THICKNESS,
          minY: -innerHeight / 2,
          maxY: innerHeight / 2,
          minZ: -innerDepth / 2,
          maxZ: innerDepth / 2,
        },
        position: new THREE.Vector3(
          mullionPosition + rightSectionWidth / 2,
          0,
          0
        ),
        width: rightSectionWidth,
        height: innerHeight,
        depth: innerDepth,
        hasContent: this.checkSectionHasContent('right')
      };

      this.sections.set('left', leftSection);
      this.sections.set('right', rightSection);
    }
  }




 public calculateSectionParams(
    targetSection: 'left' | 'right' | 'center',
    hasMullion: boolean,
    cabinetWidth: number,
    mullionPosition: number,
  ): { availableWidth: number; positionX: number } | null {

    const innerWidth = cabinetWidth; //- 2 * WALL_THICKNESS;

    if (hasMullion) {
      // Рассчитываем ширины для левой и правой частей
      const leftSectionWidth = mullionPosition - (-cabinetWidth / 2) - WALL_THICKNESS - WALL_THICKNESS / 2;
      const rightSectionWidth = (cabinetWidth / 2) - mullionPosition - WALL_THICKNESS / 2 - WALL_THICKNESS;

      if (targetSection.includes('left')) {
        if (leftSectionWidth < MIN_SECTION_WIDTH) {
          return null;
        }
        const centerX = (-cabinetWidth / 2 + mullionPosition) / 2;
        return {
          availableWidth: leftSectionWidth,
          positionX: centerX + WALL_THICKNESS / 4,
        };
      }

      if (targetSection.includes('right')) {
        if (rightSectionWidth < MIN_SECTION_WIDTH) {
          return null;
        }
        const centerX = (mullionPosition + cabinetWidth / 2) / 2;
        return {
          availableWidth: rightSectionWidth,
          positionX: centerX - WALL_THICKNESS / 4,
        };
      }

      console.warn(`Секция "${targetSection}" не поддерживается при наличии средника.`);
      return null;
    }

    // Без средника — одна центральная секция
    if (targetSection.includes('center')) {
      if (innerWidth < MIN_SECTION_WIDTH) {
        return null;
      }
      return { availableWidth: innerWidth, positionX: 0 };
    }

    console.warn(`Секция "${targetSection}" не существует без средника.`);
    return null;
  }

    /**
   * Альтернативный метод расчета параметров секции (из SectionManagerService)
   */
  public calculateSectionParamsAlt(
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
   * Определяет секцию по центру блока
   */
  public getSectionByCenter(block: THREE.Object3D): 'left' | 'right' | 'center' {
    if (block.position.x == 0) {
      return 'center';
    }
    return block.position.x < 0 ? 'left' : 'right';
  }

    /**
   * Определяет секцию по позиции объекта (из SectionManagerService)
   */
  public getSectionByPosition(object: THREE.Object3D): 'left' | 'right' | 'center' {
    const positionX = object.position.x;

    // Пороговое значение для определения секции
    const threshold = 10; // мм

    if (positionX < -threshold) return 'left';
    if (positionX > threshold) return 'right';
    return 'center';
  }


  /**
   * Определяет секцию, в которой находится блок, с учётом его размеров
   */
  public getSectionForBlock(block: THREE.Object3D): SectionType | null {
    const box = new THREE.Box3().setFromObject(block);
    const leftX = box.min.x;
    const rightX = box.max.x;

    for (const [sectionType, section] of this.sections) {
      if (rightX >= section.bounds.minX && leftX <= section.bounds.maxX) {
        return sectionType;
      }
    }
    return null;
  }
  public getSectionAtPoint(point: THREE.Vector3): SectionType | null {
    for (const [sectionType, section] of this.sections) {
      if (this.isPointInSection(point, section)) {
        return sectionType;
      }
    }
    return null;
  }


  /**
   * Проверяет, находится ли точка в секции
   */
  private isPointInSection(point: THREE.Vector3, section: Section): boolean {
    return (
      point.x >= section.bounds.minX &&
      point.x <= section.bounds.maxX &&
      point.y >= section.bounds.minY &&
      point.y <= section.bounds.maxY &&
      point.z >= section.bounds.minZ &&
      point.z <= section.bounds.maxZ
    );
  }

  /**
   * Получает информацию о секции
   */
  public getSection(sectionType: SectionType): Section | null {
    return this.sections.get(sectionType) || null;
  }

  /**
   * Получает все секции
   */
  public getAllSections(): Map<SectionType, Section> {
    return new Map(this.sections);
  }

  /**
   * Проверяет, есть ли в секции содержимое
   */
  private checkSectionHasContent(sectionType: SectionType): boolean {
    const cabinet = this.sceneManagerService.getCabinet();

    // Проверяем полки
    const shelves = cabinet.getCabinetParams().components.shelves?.shelfItems || [];
    const hasShelves = shelves.some((shelf) => {
      if (!shelf.position) return false;
      const shelfSection = this.getSectionAtPoint(
        new THREE.Vector3(shelf.position.x, shelf.position.y, shelf.position.z)
      );
      return shelfSection === sectionType;
    });

    // Проверяем ящики
    const drawers =
      cabinet.getCabinetParams().components.drawers?.drawerBlocks || [];
    const hasDrawers = drawers.some((drawer) => {
      const drawerSection = this.getSectionAtPoint(
        new THREE.Vector3(drawer.position.x, drawer.position.y, drawer.position.z)
      );
      return drawerSection === sectionType;
    });

    return hasShelves || hasDrawers;
  }

     /**
   * Подсвечивает выбранную секцию
   */
  public highlightSection(sectionType: SectionType, scene: THREE.Scene): void {
    // Устанавливаем цвет в зависимости от секции через SectionHighlightService
    this.sectionHighlight.setSectionColor(sectionType);

    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return;

    // Используем SectionHighlightService для подсветки
    this.sectionHighlight.highlightSection(sectionType, scene, cabinet);
  }

   /**
   * Убирает подсветку секции
   */
  public clearHighlight(scene: THREE.Scene): void {
    this.sectionHighlight.clearHighlight(scene);
  }



  /**
   * Получает доступную ширину для секции
   */
  public getAvailableWidth(sectionType: SectionType): number {
    const section = this.getSection(sectionType);
    return section ? section.width : 0;
  }

  /**
   * Получает позицию X для центра секции
   */
  public getSectionCenterX(sectionType: SectionType): number {
    const section = this.getSection(sectionType);
    return section ? section.position.x : 0;
  }

  /**
   * Обновляет состояние секций (вызывать при изменении содержимого шкафа)
   */
  public updateSections(): void {
    this.calculateSections();
  }

  /**
   * Проверяет, достаточно ли места в секции для добавления элемента
   */
  public hasSpaceForElement(sectionType: SectionType, elementWidth: number): boolean {
    const section = this.getSection(sectionType);
    return section ? section.width >= elementWidth : false;
  }

  /**
   * Получает читаемое название секции
   */
  public static getSectionName(sectionType: SectionType): string {
    const names = {
      left: 'Левая',
      right: 'Правая',
      center: 'Центральная',
    };
    return names[sectionType];
  }
}
