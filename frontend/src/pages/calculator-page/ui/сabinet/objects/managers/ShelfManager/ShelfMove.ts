import * as THREE from 'three';
import { SHELF_MIN_POSITION } from '../../../constants';

// Функция для снапинга с магнитом
export function snapWithMagnet(
  value: number,
  min: number,
  max: number,
  step: number,
  magnetZone: number,
  snapPoints: number[] = [],
): number {
  let result = value;

  // Проверка магнитов к заданным точкам (например, 256 мм или соседние полки)
  for (const point of snapPoints) {
    if (Math.abs(value - point) <= magnetZone) {
      result = point;
      break;
    }
  }

  // Магнит к нижнему и верхнему пределу
  if (Math.abs(value - min) <= magnetZone) result = min;
  if (Math.abs(value - max) <= magnetZone) result = max;

  // Ограничение диапазоном
  result = Math.max(min, Math.min(result, max));

  // Округление к ближайшему шагу
  result = Math.round(result / step) * step;

  return result;
}

export function getMinShelfPosition(
  selectedShelf: THREE.Object3D,
  allShelves: THREE.Object3D[],
): number {
  const minDistance = 112; // минимальное расстояние между полками
  const shelfY = selectedShelf.position.y;

  let minPos = SHELF_MIN_POSITION;

  for (const shelf of allShelves) {
    if (shelf === selectedShelf) continue; // пропускаем саму себя
    const y = shelf.position.y;
    if (y < shelfY && y + minDistance > minPos) {
      minPos = y + minDistance;
    }
  }

  return minPos;
}
