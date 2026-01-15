import * as THREE from 'three';

export interface ISectionDimensionLines {
  updateSectionHeightLines(
    width: number,
    height: number,
    depth: number,
    arrowSize: number,
  ): void;
  onObjectAddedOrRemoved(): void;
  removeAllSectionLines(): void;
}
