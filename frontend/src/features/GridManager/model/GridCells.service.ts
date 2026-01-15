import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { updateGridItem } from 'src/entities/Grid/model/store/grid.actions';
import { GridConfig } from 'src/entities/Grid/model/types/grid.config';
import { GridTypes, IGrid, IGridConfig, IGridItem } from 'src/entities/Grid/model/types/grid.model';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';

@Injectable({
  providedIn: 'root',
})
export class GridCellsService {
  rowsDesktop: number = 10;
  columnsDesktop: number = 12;
  rowsTablet: number = 6;
  columnsTablet: number = 4;
  rowsMobile: number = 6;
  columnsMobile: number = 2;

  gridsDesktop: any[] = new Array(this.rowsDesktop * this.columnsDesktop);
  gridsTablet: any[] = new Array(this.rowsTablet * this.columnsTablet);
  gridsMobile: any[] = new Array(this.rowsMobile * this.columnsMobile);

  getSizeByType(type: GridTypes) {
    switch (type) {
      case GridTypes.DESKTOP:
        return { rows: this.rowsDesktop, columns: this.columnsDesktop };
      case GridTypes.TABLET:
        return { rows: this.rowsTablet, columns: this.columnsTablet };
      case GridTypes.MOBILE:
        return { rows: this.rowsMobile, columns: this.columnsMobile };
    }
  }

  setSizeByType(type: GridTypes, rows: number, array: any[]) {
    switch (type) {
      case GridTypes.DESKTOP:
        this.rowsDesktop = rows;
        this.gridsDesktop = array;
        break;
      case GridTypes.TABLET:
        this.rowsTablet = rows;
        this.gridsTablet = array;
        break;
      case GridTypes.MOBILE:
        this.rowsMobile = rows;
        this.gridsMobile = array;
        break;
    }
  }

  getArrayByType(type: GridTypes): any[] {
    switch (type) {
      case GridTypes.DESKTOP:
        return this.gridsDesktop;
      case GridTypes.TABLET:
        return this.gridsTablet;
      case GridTypes.MOBILE:
        return this.gridsMobile;
    }
  }
  adjustAllGridArray(gridItems: IGridItem[]) {
    this.adjustGridArray(gridItems, GridTypes.DESKTOP);
    this.adjustGridArray(gridItems, GridTypes.TABLET);
    this.adjustGridArray(gridItems, GridTypes.MOBILE);
  }

  adjustGridArray(gridItems: IGridItem[], type: GridTypes): any[] {
    const occupiedCells = new Set<string>();
    const { rows, columns } = this.getSizeByType(type);

    if (!gridItems || !gridItems?.length) return this.getArrayByType(type);

    // Проходим по всем элементам сетки и записываем все занятые ячейки
    gridItems.forEach((gridItem) => {
      const { rowStart, rowEnd, columnStart, columnEnd } = gridItem[type];

      for (let row = parseInt(rowStart.toString()); row < parseInt(rowEnd.toString()); row++) {
        for (
          let col = parseInt(columnStart.toString());
          col < parseInt(columnEnd.toString());
          col++
        ) {
          const cellKey = `${row}-${col}`;
          occupiedCells.add(cellKey);
        }
      }
    });

    // Пересчет количества строк, если есть элементы, выходящие за текущие границы
    const newRows = Math.max(rows, ...gridItems.map((item) => item[type]?.rowEnd ?? 0));

    // Инициализация массива сетки с учетом занятых ячеек
    const totalCells = newRows * columns;
    const freeCells = totalCells - occupiedCells.size + gridItems.length;
    const newGridArray = new Array(freeCells);

    this.setSizeByType(type, newRows, newGridArray);
    return newGridArray;
  }
}
