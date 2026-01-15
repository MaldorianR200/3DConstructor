import * as THREE from 'three';

export interface Rod {
  type: RodType;
  position: 'left' | 'right' | 'full';
  length?: number; // Длина штанги
}

// Определяем интерфейс для материалов
export interface RodMaterials {
  rod: THREE.MeshStandardMaterial;
  tip: THREE.MeshStandardMaterial;
  holder: THREE.MeshStandardMaterial;
}

export type RodType = 'extendableRod' | 'solidRod' | 'centralMountingRod';
