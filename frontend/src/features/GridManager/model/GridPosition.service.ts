import { Injectable } from '@angular/core';
import { GridTypes, IGrid, IGridItemData } from 'src/entities/Grid';
import { GridCellsService } from './GridCells.service';

@Injectable({
  providedIn: 'root',
})
export class GridPositionService {
  constructor(private gridCellsService: GridCellsService) {}

  private _findAndExpand(type: GridTypes, grid: IGrid): IGridItemData {
    let { rows, columns } = this.gridCellsService.getSizeByType(type);

    let position = this._findPosition(type, rows, columns, grid);

    while (!position) {
      rows++;
      position = this._findPosition(type, rows, columns, grid);
    }

    return position!;
  }

  private _findPosition(
    type: GridTypes,
    rows: number,
    columns: number,
    grid: IGrid,
  ): IGridItemData | null {
    for (let currentRow = 1; currentRow <= rows; currentRow++) {
      for (let currentCol = 1; currentCol <= columns; currentCol++) {
        const newBlock: IGridItemData = {
          rowStart: currentRow,
          rowEnd: currentRow + 1,
          columnStart: currentCol,
          columnEnd: currentCol + 1,
          intersection: {
            id: Date.now(),
            gridItemId: 0,
            zIndex: 1,
            data: [],
          },
        };

        const isPositionAvailable = !grid.items?.some((item) => {
          if (item[type]) {
            return this.doBlocksOverlap(item[type], newBlock);
          }
          return false;
        });

        if (isPositionAvailable) {
          return newBlock;
        }
      }
    }
    return null;
  }

  doBlocksOverlap(item1: IGridItemData, item2: IGridItemData): boolean {
    return !(
      item1.columnEnd <= item2.columnStart ||
      item1.columnStart >= item2.columnEnd ||
      item1.rowEnd <= item2.rowStart ||
      item1.rowStart >= item2.rowEnd
    );
  }

  getFreePosition(grid: IGrid): {
    desktop: IGridItemData;
    tablet: IGridItemData;
    mobile: IGridItemData;
  } {
    const desktopPosition = this._findAndExpand(GridTypes.DESKTOP, grid);
    const tabletPosition = this._findAndExpand(GridTypes.TABLET, grid);
    const mobilePosition = this._findAndExpand(GridTypes.MOBILE, grid);

    return {
      desktop: desktopPosition!,
      tablet: tabletPosition!,
      mobile: mobilePosition!,
    };
  }
}
