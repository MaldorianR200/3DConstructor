import { Injectable } from '@angular/core';
import { IGridItem, GridTypes } from 'src/entities/Grid';
import Swiper from 'swiper';

@Injectable({
  providedIn: 'root',
})
export class GridCalculationService {
  calculateGridPosition(
    e: MouseEvent,
    gridElement: DOMRect,
    gridItemSizeX: number,
    gridItemSizeY: number,
    swiperInstanceTranslate: number,
  ): { columnEnd: number; rowEnd: number } {
    const columnEnd = Math.ceil(
      (e.clientX - gridElement.left - swiperInstanceTranslate) / gridItemSizeX,
    );
    const rowEnd = Math.ceil((e.clientY - gridElement.top + window.scrollY) / gridItemSizeY);
    return { columnEnd, rowEnd };
  }

  calculateGridItemSize(
    gridItem: IGridItem,
    type: GridTypes,
  ): { widthGridItem: number; heightGridItem: number } {
    const widthGridItem = gridItem[type].columnEnd - gridItem[type].columnStart;
    const heightGridItem = gridItem[type].rowEnd - gridItem[type].rowStart;
    return { widthGridItem, heightGridItem };
  }
}
