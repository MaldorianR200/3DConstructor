import { PODIUM_HEIGHT, WALL_THICKNESS } from "../../../constants";

// shelf-position.utils.ts
export interface ShelfPosition {
  height: number;
  bottomToCenter: number;
  bottomToShelf: number;
  holeCount: number;
  topToCenter: number;
  topToShelf: number;
}


/**
 * Получает доступные позиции полок для заданной высоты шкафа
 */
export function getAvailableShelfPositions(cabinetHeight: number): number[] {
  const positions: number[] = [];
  const step = 32; // шаг сетки

  // Минимальная высота от дна (256мм)
  const minHeightFromBottom = 256;
  // Максимальная высота до верха (высота шкафа - 256мм)
  const maxHeightFromBottom = cabinetHeight - 256;

  for (let y = minHeightFromBottom; y <= maxHeightFromBottom; y += step) {
    positions.push(y);
  }

  return positions;
}

/**
 * Привязывает позицию к ближайшей доступной позиции полки
 */
export function snapDrawerBlockPosition(positionY: number, cabinetHeight: number): number {
    const step = 32;
    const minLiftedY = 256;
    const maxY = cabinetHeight - 16; // Учитываем высоту полки

    // Порог для переключения между дном и поднятым положением
    const threshold = minLiftedY / 2; // 128мм

    if (positionY < threshold) {
        return PODIUM_HEIGHT / 2 + WALL_THICKNESS; // Привязка ко дну
    } else {
        // Привязка к сетке 32мм от 256мм
        let snappedY = Math.round(positionY / step) * step;
        return Math.max(minLiftedY, Math.min(snappedY, maxY));
    }
}

/**
 * Получает все допустимые позиции для блока с ящиками
 */
export function getAvailableDrawerBlockPositions(cabinetHeight: number): number[] {
    const positions: number[] = [0]; // Позиция на дне

    const step = 32;
    const minLiftedY = 256;
    const maxY = cabinetHeight - 16;

    // Добавляем позиции от 256мм с шагом 32мм
    for (let y = minLiftedY; y <= maxY; y += step) {
        positions.push(y);
    }

    return positions;
}

/**
 * Проверяет, является ли позиция допустимой для полки
 */
export function isValidShelfPosition(positionY: number, cabinetHeight: number): boolean {
  const availablePositions = getAvailableShelfPositions(cabinetHeight);
  return availablePositions.includes(positionY);
}
