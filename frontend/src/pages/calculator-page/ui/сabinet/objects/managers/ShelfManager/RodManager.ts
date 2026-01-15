import * as THREE from 'three';
import { RodType } from '../../../model/Rod';

export class FullRodCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private height: number,
    private radius: number,
    private length: number,
  ) {
    super();
  }

  override getPoint(t: number): THREE.Vector3 {
    const r = this.radius;
    const h = this.height;
    const l = this.length;

    // Длина всех участков: 4 дуги по πr/2 и 4 прямых (2 по height, 2 по length - 2*r)
    const arc = (Math.PI * r) / 2;
    const total = 2 * (h - 2 * r) + 2 * (l - 2 * r) + 4 * arc;

    const d = t * total;

    let acc = 0;

    // 1. Левая вертикальная прямая вверх
    const seg1 = h - 2 * r;
    if (d < acc + seg1) {
      return new THREE.Vector3(-l / 2, -h + d, 0);
    }
    acc += seg1;

    // 2. Левый верхний угол (дуга против часовой)
    const seg2 = arc;
    if (d < acc + seg2) {
      const angle = (d - acc) / r;
      return new THREE.Vector3(-l / 2 + r * (1 - Math.cos(angle)), -r + r * Math.sin(angle), 0);
    }
    acc += seg2;

    // 3. Верхняя горизонтальная прямая
    const seg3 = l - 2 * r;
    if (d < acc + seg3) {
      return new THREE.Vector3(-l / 2 + r + (d - acc), 0, 0);
    }
    acc += seg3;

    // 4. Правый верхний угол (дуга по часовой)
    const seg4 = arc;
    if (d < acc + seg4) {
      const angle = Math.PI / 2 - (d - acc) / r; // угол от π/2 до 0 по мере движения
      return new THREE.Vector3(
        l / 2 - r + r * Math.cos(angle), // X: сдвигаемся от правого края влево
        -h + r * Math.sin(angle), // Y: сдвигаемся сверху вниз
        0,
      );
    }
    acc += seg4;

    // 5. Правая вертикальная прямая вниз
    const seg5 = h - 2 * r;
    if (d < acc + seg5) {
      return new THREE.Vector3(l / 2, -h + r + (d - acc), 0);
    }
    acc += seg5;

    // 6. Правый нижний угол (дуга по часовой)
    const seg6 = arc;
    if (d < acc + seg6) {
      const angle = 0 - (d - acc) / r;
      return new THREE.Vector3(l / 2 - r + r * Math.cos(angle), -r + r * Math.sin(angle), 0);
    }
    acc += seg6;

    // 7. Нижняя горизонтальная прямая
    const seg7 = l - 2 * r;
    if (d < acc + seg7) {
      return new THREE.Vector3(l / 2 - r - (d - acc), -h, 0);
    }
    acc += seg7;

    // 8. Левый нижний угол (дуга против часовой)
    const angle = (d - acc) / r;
    return new THREE.Vector3(-l / 2 + r * -Math.sin(angle), -h + r * (1 - Math.cos(angle)), 0);
  }

  public updateRodSize(shelf: THREE.Object3D): void {}
}

export function getRodTypeStub(depthCabinet: number): RodType {
  if (depthCabinet == 430) {
    return 'extendableRod';
  } else {
    return 'solidRod';
  }
}
