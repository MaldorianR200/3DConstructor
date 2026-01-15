import { Injectable } from '@angular/core';
import { GridActions, IGridItem } from 'src/entities/Grid';
import {
  GridTypes,
  IGrid,
  IGridItemData,
  IIntersectionData,
} from 'src/entities/Grid/model/types/grid.model';
import { GridPositionService } from './GridPosition.service';
import { GridCellsService } from './GridCells.service';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class GridIntersectionService extends GridPositionService {
  constructor(
    private store: Store<AppState>,
    private GridCellsService: GridCellsService,
  ) {
    super(GridCellsService);
  }

  setIntersectionData(
    item1: IGridItem,
    item2: IGridItem,
    type: GridTypes,
    gridId: number,
  ): IIntersectionData[] {
    const drag: IGridItemData = item1[type];
    const stand: IGridItemData = item2[type];
    const intersections: IIntersectionData[] = [];

    // Если нет пересечение
    if (this.doBlocksOverlap(drag, stand)) {
      // Если заходит справа
      if (drag.columnEnd >= stand.columnEnd && drag.columnStart <= stand.columnEnd) {
        if (
          drag.rowEnd > stand.rowStart &&
          drag.rowStart < stand.rowEnd &&
          drag.rowStart > stand.rowStart
        ) {
          // звезда сверзу
          intersections.push({
            positionX: stand.columnEnd - stand.columnStart,
            positionY: drag.rowStart - stand.rowStart,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
        if (
          drag.rowStart < stand.rowEnd &&
          drag.rowEnd > stand.rowStart &&
          drag.rowEnd < stand.rowEnd
        ) {
          // звезда снизу
          intersections.push({
            positionX: stand.columnEnd - stand.columnStart,
            positionY: drag.rowEnd - stand.rowStart,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
      }

      // Если заходит слева
      if (drag.columnEnd >= stand.columnStart && drag.columnStart <= stand.columnStart) {
        // console.log('Element is intersecting from the left');
        if (
          drag.rowEnd > stand.rowStart &&
          drag.rowStart < stand.rowEnd &&
          drag.rowStart > stand.rowStart
        ) {
          // console.log('Intersection at top detected');
          // звезда сверзу
          intersections.push({
            positionX: 0,
            positionY: drag.rowStart - stand.rowStart,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
        if (
          drag.rowStart < stand.rowEnd &&
          drag.rowEnd > stand.rowStart &&
          drag.rowEnd < stand.rowEnd
        ) {
          // console.log('Intersection at bottom detected');
          // звезда снизу
          intersections.push({
            positionX: 0,
            positionY: drag.rowEnd - stand.rowStart,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
      }

      // Если заходит сверху
      if (drag.rowEnd >= stand.rowStart && drag.rowStart <= stand.rowStart) {
        if (
          drag.columnStart > stand.columnStart &&
          drag.columnStart < stand.columnEnd &&
          drag.columnStart > stand.columnStart
        ) {
          // звезда слева
          intersections.push({
            positionX: drag.columnStart - stand.columnStart,
            positionY: 0,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
        if (
          drag.columnStart < stand.columnEnd &&
          drag.columnEnd > stand.columnStart &&
          drag.columnEnd < stand.columnEnd
        ) {
          // звезда справа
          intersections.push({
            positionX: drag.columnEnd - stand.columnStart,
            positionY: 0,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
      }

      // Если заходит снизу
      if (drag.rowStart <= stand.rowEnd && drag.rowEnd >= stand.rowEnd) {
        if (
          drag.columnStart > stand.columnStart &&
          drag.columnStart < stand.columnEnd &&
          drag.columnStart > stand.columnStart
        ) {
          // звезда слева
          intersections.push({
            positionX: drag.columnStart - stand.columnStart,
            positionY: stand.rowEnd - stand.rowStart,
            elementId: item1.entityId,
            // elementId: item1.entityId,
          });
        }
        if (
          drag.columnStart < stand.columnEnd &&
          drag.columnEnd > stand.columnStart &&
          drag.columnEnd < stand.columnEnd
        ) {
          // звезда справа
          intersections.push({
            positionX: drag.columnEnd - stand.columnStart,
            positionY: stand.rowEnd - stand.rowStart,
            // elementId: item1.entityId,
            elementId: item1.entityId,
          });
        }
      }
    }

    if (stand.intersection.data) {
      const intersectionWithOtherElement = stand.intersection.data.filter(
        // (item) => item.elementId !== item1.entityId,
        (item) => item.elementId !== item1.entityId,
      );
      intersections.push(...intersectionWithOtherElement);
    }

    const uniqueArray = intersections.filter(
      (item, index, self) =>
        index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item)),
    );

    const updatedHasElement: IGridItem = {
      ...item2,
      [type]: {
        ...item2[type],
        intersection: {
          ...item2[type].intersection,
          data: intersections,
        },
      },
    };
    this.store.dispatch(GridActions.updateGridItem({ id: gridId, item: updatedHasElement }));

    return intersections;
  }

  // Метод для обновления элемента с новыми координатами и пересечениями
  updateGridItemWithIntersection(
    gridId: number,
    currentItem: IGridItem,
    type: GridTypes,
    columnStart: number,
    columnEnd: number,
    rowStart: number,
    rowEnd: number,
    gridItems: IGridItem[],
  ): IGridItem {
    // Создание нового объекта с обновленными координатами
    const updatedItem: IGridItem = {
      ...currentItem,
      [type]: {
        ...currentItem[type],
        columnStart,
        columnEnd,
        rowStart,
        rowEnd,
      },
    };

    gridItems
      //  .filter(standItem => standItem.entityId !== updatedItem.entityId)
      .forEach((standItem) => {
        this.setIntersectionData(updatedItem, standItem, type, gridId);
      });

    // const uniqueArray = intersection.filter((item, index, self) =>
    //   index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item))
    // );

    // updatedItem = {
    //   ...updatedItem,
    //   [type]: {
    //     ...updatedItem[type],
    //     // intersection: {
    //     //   ...updatedItem[type].intersection,
    //     //   data: uniqueArray
    //     // }
    //   }
    // };

    return updatedItem;
  }
}
