import { Injectable } from '@angular/core';
import { SceneManagerService } from 'src/pages/calculator-page/ui/services/SceneManager.service';
import * as THREE from 'three';
import { INTERVAL_1_MM, PODIUM_HEIGHT, SHELF_HEIGHT, WALL_THICKNESS } from '../../../constants';
@Injectable({
  providedIn: 'root',
})
export class MullionShelfInteractionService {
  constructor(private sceneManagerService: SceneManagerService) {}

  /**
   * Перемещает средник вверх, под следующую полку
   */
  moveMullionUp(selectedMullion: THREE.Object3D): boolean {
    if (!selectedMullion) return false;

    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return false;

    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetDepth();
    const shelves = cabinet.shelfManager.getShelves();

    if (shelves.length === 0) return false;

    // Получаем текущую высоту средника
    const currentMullionHeight = cabinet.mullionManager.getMullionHeight();
    const currentMullionTop = selectedMullion.position.y + currentMullionHeight / 2;

    // Ищем следующую полку выше текущего положения средника
    const nextShelf = this.findNextShelfAbove(currentMullionTop, shelves);

    if (nextShelf) {
      // Перемещаем средник под эту полку
      this.moveMullionUnderShelf(selectedMullion, nextShelf, 'up');
      return true;
    } else {
      // Если выше нет полок, ставим средник на всю высоту
      const fullHeight = cabinet.getCabinetHeight() - PODIUM_HEIGHT - WALL_THICKNESS;
      this.updateMullionFullHeight(selectedMullion, fullHeight);
      return true;
    }
  }

  /**
   * Перемещает средник вниз, под следующую полку
   */
  moveMullionDown(selectedMullion: THREE.Object3D): boolean {
    if (!selectedMullion) return false;

    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return false;

    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetDepth();
    const shelves = cabinet.shelfManager.getShelves();

    if (shelves.length === 0) return false;

    // Получаем текущую высоту средника
    const currentMullionHeight = cabinet.mullionManager.getMullionHeight();
    const currentMullionBottom = selectedMullion.position.y - currentMullionHeight / 2;

    // Ищем следующую полку ниже текущего положения средника
    const nextShelf = this.findNextShelfBelow(currentMullionBottom, shelves);

    if (nextShelf) {
      // Перемещаем средник под эту полку
      this.moveMullionUnderShelf(selectedMullion, nextShelf, 'down');
      return true;
    } else {
      // Если ниже нет полок, ставим средник в минимальное положение
      this.moveMullionToBottom(selectedMullion);
      return true;
    }
  }

  /**
   * Находит следующую полку выше указанной позиции
   */
  private findNextShelfAbove(positionY: number, shelves: THREE.Object3D[]): THREE.Object3D | null {
    let closestShelf: THREE.Object3D | null = null;
    let minDistance = Infinity;

    for (const shelf of shelves) {
      const shelfBottom = shelf.position.y - SHELF_HEIGHT / 2;
      const distance = shelfBottom - positionY;

      // Ищем самую близкую полку выше текущего положения
      if (distance > 0 && distance < minDistance) {
        closestShelf = shelf;
        minDistance = distance;
      }
    }

    return closestShelf;
  }

  /**
   * Находит следующую полку ниже указанной позиции
   */
  private findNextShelfBelow(positionY: number, shelves: THREE.Object3D[]): THREE.Object3D | null {
    let closestShelf: THREE.Object3D | null = null;
    let minDistance = Infinity;

    for (const shelf of shelves) {
      const shelfTop = shelf.position.y + SHELF_HEIGHT / 2;
      const distance = positionY - shelfTop;

      // Ищем самую близкую полку ниже текущего положения
      if (distance > 0 && distance < minDistance) {
        closestShelf = shelf;
        minDistance = distance;
      }
    }

    return closestShelf;
  }

  /**
   * Перемещает средник под указанную полку
   */
  private moveMullionUnderShelf(
    mullion: THREE.Object3D,
    targetShelf: THREE.Object3D,
    direction: 'up' | 'down',
  ): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetDepth();

    // Определяем новую высоту средника
    let newHeight: number;
    let newPositionY: number;

    if (direction === 'up') {
      // При движении вверх: средник заканчивается под полкой
      const shelfBottom = targetShelf.position.y - SHELF_HEIGHT / 2;
      newHeight = shelfBottom - PODIUM_HEIGHT - INTERVAL_1_MM;
      newPositionY = PODIUM_HEIGHT + newHeight / 2;
    } else {
      // При движении вниз: средник начинается под полкой
      const shelfBottom = targetShelf.position.y - SHELF_HEIGHT / 2;
      newHeight = shelfBottom - PODIUM_HEIGHT - INTERVAL_1_MM;
      newPositionY = PODIUM_HEIGHT + newHeight / 2;
    }

    // Обновляем размеры средника
    cabinet.updateMullionSize(cabinetWidth, cabinetDepth, newHeight);
    mullion.position.y = newPositionY;

    // Обновляем состояние полок
    this.updateShelfStatesAfterMullionMove(mullion);

    console.log(
      `Средник перемещен ${direction === 'up' ? 'вверх' : 'вниз'} под полку на высоту ${newHeight}мм`,
    );
  }

  /**
   * Обновляет состояние полок после перемещения средника
   */
  private updateShelfStatesAfterMullionMove(mullion: THREE.Object3D): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const shelves = cabinet.shelfManager.getShelves();
    const mullionHeight = cabinet.mullionManager.getMullionHeight();
    const mullionTop = mullion.position.y + mullionHeight / 2;
    const mullionBottom = mullion.position.y - mullionHeight / 2;

    shelves.forEach((shelf) => {
      const shelfBottom = shelf.position.y - SHELF_HEIGHT / 2;
      const shelfTop = shelf.position.y + SHELF_HEIGHT / 2;

      // Проверяем, пересекается ли полка со средником
      const intersects = shelfBottom < mullionTop && shelfTop > mullionBottom;

      if (intersects) {
        // Полка пересекается со средником - она должна быть разделенной
        shelf.userData['fullWidth'] = false;
        console.log(`Полка ${shelf.name} стала разделенной`);
      } else {
        // Полка не пересекается со средником - она должна быть полной ширины
        shelf.userData['fullWidth'] = true;
        console.log(`Полка ${shelf.name} стала полной ширины`);
      }
    });
  }

  /**
   * Устанавливает средник на полную высоту
   */
  private updateMullionFullHeight(mullion: THREE.Object3D, fullHeight: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetDepth();

    cabinet.updateMullionSize(cabinetWidth, cabinetDepth, fullHeight);
    mullion.position.y = cabinet.getCabinetHeight() / 2;

    // Обновляем состояние полок
    this.setAllShelvesFullWidth(false);

    console.log(`Средник установлен на полную высоту: ${fullHeight}мм`);
  }

  /**
   * Перемещает средник в самое нижнее положение
   */
  private moveMullionToBottom(mullion: THREE.Object3D): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetDepth();

    // Минимальная высота средника
    const minHeight = SHELF_HEIGHT * 2 + INTERVAL_1_MM * 2;

    cabinet.updateMullionSize(cabinetWidth, cabinetDepth, minHeight);
    mullion.position.y = PODIUM_HEIGHT + minHeight / 2;

    // Обновляем состояние полок
    this.updateShelfStatesAfterMullionMove(mullion);

    console.log(`Средник перемещен в нижнее положение: ${minHeight}мм`);
  }

  /**
   * Устанавливает всем полкам флаг полной ширины
   */
  private setAllShelvesFullWidth(flag: boolean): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const shelves = cabinet.shelfManager.getShelves();

    shelves.forEach((shelf) => {
      shelf.userData['fullWidth'] = flag;
    });
  }

  /**
   * Удаляет средник
   */
  deleteMullion(mullion: THREE.Object3D): boolean {
    const cabinet = this.sceneManagerService.getCabinet();
    if (!cabinet) return false;

    const mullionManager = cabinet.mullionManager;
    if (!mullionManager) return false;

    mullionManager.removeMullion();

    // Перемещаем центральную панель цоколя по центру
    const plinthCenter = this.sceneManagerService.getScene().getObjectByName('plinthCenter');
    if (plinthCenter) {
      plinthCenter.position.x = 0;
    }

    if (plinthCenter) {
      // Удалить все дочерние объекты с именем 'cabinetLeg'
      for (let i = plinthCenter.children.length - 1; i >= 0; i--) {
        const child = plinthCenter.children[i];
        if (child.name == 'cabinetLeg') {
          plinthCenter.remove(child);
        }
      }
    }

    // Обновляем блоки ящиков
    const drawerManager = cabinet.drawerManager;
    if (drawerManager) {
      drawerManager.updateBlocks(cabinet.getCabinetSize());
    }

    return true;
  }
}
