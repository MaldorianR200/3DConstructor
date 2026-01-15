import * as THREE from 'three';
import { DrawerBlock, DrawerSize } from '../model/Drawers';
import { Position, Size } from '../model/BaseModel';
import { ShelfBoundary } from '../model/Shelf';

export interface IDrawerDimensionLines {
  addDrawerDimensionLines(
    drawerBlock: DrawerBlock,
    cabinetSize: Size,
    drawerSize: DrawerSize,
    position: Position,
    arrowSize?: number,
  ): void;

  removeDrawerDimensionLines(drawerBlock: DrawerBlock): void;

  updateDrawerBlockDimensionLines(drawerBlock: THREE.Object3D, newPosition: Position): void;

  addSidePanelHeight(
    id: number,
    width: number,
    sideHeight: number,
    depth: number,
    positionBlock: Position,
    arrowSize: number,
  ): void;

  removeSidePanelHeightLineById(id: number): void;

  removeAllSidePanelHeightLines(): void;
}
