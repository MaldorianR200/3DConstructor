/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BASE_URL_STATIC } from 'global';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGrid } from 'src/entities/Grid';
import { updateGridItem } from 'src/entities/Grid/model/store/grid.actions';
import {
  GridTypes,
  IGridItem,
  IIntersection,
  IIntersectionData,
} from 'src/entities/Grid/model/types/grid.model';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import Swiper from 'swiper';
import { GridCellsService } from '../../model/GridCells.service';
import { GridItemComponent } from '../GridItem/GridItem.component';
import { GridCalculationService } from '../../model/GridCalculation.service';
import { GridIntersectionService } from '../../model/GridIntersection.service';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';

@Component({
  selector: 'app-grid-component',
  standalone: true,
  imports: [CommonModule, GridItemComponent],
  templateUrl: './Grid.component.html',
  styleUrls: ['./Grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gridId: number;
  @Input() gridItems: IGridItem[] = [];
  @Input() entities$: Observable<any[]>;
  @Input() type: GridTypes | null = null;
  @Input() swiperInstance: Swiper | null = null;

  baseUrlStatic = BASE_URL_STATIC;
  gridArray: any[] = [];
  gridSize: { rows: number; columns: number } | null = null;
  gridRect: DOMRect;
  gridItemSizeX: number = 0;
  gridItemSizeY: number = 0;
  desktopWidth: number = 0;
  isAdmin$: Observable<boolean>;
  drag: boolean = false;
  showMore: boolean = false;
  visibleRows: number = 12;

  draggingItem: IGridItem | null = null;
  resizingItem: IGridItem | null = null;

  private stopResizingHandler: (e: MouseEvent) => void;
  private stopDraggingHandler: (e: MouseEvent) => void;

  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(
    private checkPlatformService: CheckPlatformService,
    private cdr: ChangeDetectorRef,
    private store: Store<AppState>,
    private gridCalculationService: GridCalculationService,
    private gridIntersectionService: GridIntersectionService,
    public gridCellsService: GridCellsService,
  ) {
    this.isAdmin$ = this.store.select(selectIsAdmin);
  }

  ngOnInit(): void {
    this.gridCellsService.adjustGridArray(this.gridItems, this.type);
    this.gridArray = this.gridCellsService.getArrayByType(this.type);
    this.gridSize = this.gridCellsService.getSizeByType(this.type);

    // console.log(this.gridSize)
    // if (this.gridSize && this.gridSize.rows > 12) {
    //   console.log("Cheak if")
    //   this.visibleRows = 12;
    // } else {
    //   this.visibleRows = this.gridSize ? this.gridSize.rows : 0;
    // }

    if (this.checkPlatformService.isBrowser) {
      this.stopResizingHandler = (e) => this.stopResizing(e);
      this.stopDraggingHandler = (e) => this.stopDragging(e);
      document.addEventListener('mouseup', this.stopResizingHandler);
      document.addEventListener('mouseup', this.stopDraggingHandler);

      // Получаем значение переменной --desktop-width
      this.desktopWidth = parseInt(
        getComputedStyle(document.querySelector('body')).getPropertyValue('--desktop-width'),
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.checkPlatformService.isBrowser) {
      this.gridRect = document.querySelector(`.grid${this.type}`)?.getBoundingClientRect();

      if (this.gridRect) {
        this.gridItemSizeX = this.gridRect.width / this.gridSize.columns;
        this.gridItemSizeY = this.gridRect.height / this.gridSize.rows;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.checkPlatformService.isBrowser) {
      document.removeEventListener('mouseup', this.stopResizingHandler);
      document.removeEventListener('mouseup', this.stopDraggingHandler);
    }
  }

  // toggleShowMore() {
  //   this.showMore = !this.showMore;
  //   this.visibleRows = this.gridSize.rows;
  // }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.visibleRows = this.showMore ? this.gridSize.rows : 12;
  }

  pauseSwiper() {
    if (this.swiperInstance) {
      this.swiperInstance.allowTouchMove = false;
    }
  }

  resumeSwiper() {
    if (this.swiperInstance) {
      this.swiperInstance.allowTouchMove = true;
    }
  }

  incrementZIndex(item: IGridItem) {
    item[this.type].intersection.zIndex++;
    this.updateGridItem(item);
  }

  decrementZIndex(item: IGridItem) {
    item[this.type].intersection.zIndex--;
    this.updateGridItem(item);
  }

  startDragging(gridItem: IGridItem, event: MouseEvent) {
    this.draggingItem = gridItem;
    this.offsetX = event.clientX - gridItem[this.type].columnStart * this.gridItemSizeX;
    this.offsetY = event.clientY - gridItem[this.type].rowStart * this.gridItemSizeY;

    this.pauseSwiper();
  }

  onDragging(event: { gridItem: IGridItem; newRowStart: number; newColumnStart: number }) {
    if (this.draggingItem) {
      // Update the position of the dragging item
      // this.draggingItem[this.type].rowStart = event.newRowStart;
      // this.draggingItem[this.type].columnStart = event.newColumnStart;
      console.log(this.draggingItem, this.type, '<--- draggingItem and type');
      this.draggingItem = {
        ...this.draggingItem,
        [this.type]: {
          ...this.draggingItem[this.type],
          rowStart: event.newRowStart,
          columnStart: event.newColumnStart,
        },
      };

      // Update the grid item
      this.updateGridItem(this.draggingItem);
    }
  }

  startResizing(gridItem: IGridItem) {
    this.resizingItem = gridItem;
    this.pauseSwiper();
  }

  stopDragging(e: MouseEvent) {
    if (this.draggingItem) {
      // this.updateGridItem(this.draggingItem);
      this.draggingItem = null;
      this.resumeSwiper();
    }
  }

  // stopDragging(e: any) {
  //   if (this.draggingItem) {
  //     this.draggingItem = null;
  //     this.resumeSwiper();
  //   }
  // }

  stopResizing(e: any) {
    this.resizingItem = null;
    this.resumeSwiper();
  }

  dragging(e: MouseEvent) {
    if (this.draggingItem && this.gridSize) {
      const translate = this.swiperInstance.translate - (window.innerWidth - this.desktopWidth) / 2;

      const { columnEnd, rowEnd } = this.gridCalculationService.calculateGridPosition(
        e,
        this.gridRect,
        this.gridItemSizeX,
        this.gridItemSizeY,
        translate,
      );

      // Округляем до ближайших целых чисел, чтобы гарантировать, что мы остаемся на клетках
      const snappedColumn = Math.floor(columnEnd);
      const snappedRow = Math.floor(rowEnd);

      const { widthGridItem, heightGridItem } = this.gridCalculationService.calculateGridItemSize(
        this.draggingItem,
        this.type,
      );

      if (
        snappedColumn <= this.gridSize.columns - widthGridItem &&
        snappedRow <= this.gridSize.rows - heightGridItem &&
        snappedColumn > 0 &&
        snappedRow > 0
      ) {
        const updatedGridItem = this.gridIntersectionService.updateGridItemWithIntersection(
          this.gridId,
          this.draggingItem,
          this.type,
          snappedColumn,
          snappedColumn + widthGridItem,
          snappedRow,
          snappedRow + heightGridItem,
          this.gridItems,
        );

        this.updateGridItem(updatedGridItem);
      } else if (snappedRow > this.gridSize.rows - heightGridItem) {
        this.gridSize.rows += 1;
        const newGridArray = new Array(this.gridSize.rows * this.gridSize.columns);
        this.gridCellsService.setSizeByType(this.type, this.gridSize.rows, newGridArray);
      }

      this.gridArray = this.gridCellsService.adjustGridArray(this.gridItems, this.type);
    }
  }

  resizing(e: MouseEvent) {
    if (this.resizingItem) {
      const translate = this.swiperInstance.translate - (window.innerWidth - this.desktopWidth) / 2;
      let { columnEnd, rowEnd } = this.gridCalculationService.calculateGridPosition(
        e,
        this.gridRect,
        this.gridItemSizeX,
        this.gridItemSizeX,
        translate,
      );

      columnEnd++;
      rowEnd++;

      if (columnEnd <= this.gridSize.columns + 1 && rowEnd <= this.gridSize.rows + 1) {
        const updatedGridItem = this.gridIntersectionService.updateGridItemWithIntersection(
          this.gridId,
          this.resizingItem,
          this.type,
          this.resizingItem[this.type].columnStart,
          columnEnd,
          this.resizingItem[this.type].rowStart,
          rowEnd,
          this.gridItems,
        );

        this.updateGridItem(updatedGridItem);
      }
      if (rowEnd == this.gridSize.rows + 1) {
        this.gridSize.rows++;
        const newGridArray = new Array(this.gridSize.rows * this.gridSize.columns);
        this.gridCellsService.setSizeByType(this.type, this.gridSize.rows, newGridArray);
      }

      this.gridArray = this.gridCellsService.adjustGridArray(this.gridItems, this.type);
    }
  }

  moving(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.draggingItem) {
      this.dragging(e);
    } else if (this.resizingItem) {
      this.resizing(e);
    }
  }

  updateGridItem(updatedGridItem: IGridItem) {
    this.store.dispatch(updateGridItem({ id: this.gridId, item: updatedGridItem }));
    const updatedItems = this.gridItems.map((item) =>
      item.entityId == updatedGridItem.entityId ? updatedGridItem : item,
    );

    this.gridItems = [...updatedItems];
    this.cdr.markForCheck();
  }
}
