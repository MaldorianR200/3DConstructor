import { Component, EventEmitter, Input, Output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { GridActions, GridTypes, IGridItem } from 'src/entities/Grid';
import { IGridSettings, IIntersectionData } from 'src/entities/Grid/model/types/grid.model';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { Store } from '@ngrx/store';
import { getGridSettings } from 'src/entities/Grid/model/store/grid.actions';
import { selectGridSettings } from 'src/entities/Grid/model/store/grid.selectors';
import { AuthService } from 'src/features/Auth';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';

@Component({
  selector: 'app-grid-item',
  templateUrl: 'GridItem.component.html',
  styleUrls: ['GridItem.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class GridItemComponent implements OnDestroy, OnInit {
  @Input() gridItem: IGridItem;
  @Input() type: GridTypes;
  @Input() entities$: Observable<any>;
  @Input() gridItemSizeY: number;
  @Input() gridItemSizeX: number;
  @Input() pauseSwiper: () => void;

  @Output() startDragging: EventEmitter<any> = new EventEmitter<any>();
  @Output() startResizing: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateGridItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() dragging: EventEmitter<{
    gridItem: IGridItem;
    newRowStart: number;
    newColumnStart: number;
  }> = new EventEmitter();

  baseUrlStatic = BASE_URL_STATIC;
  settings: IGridSettings;
  isAdmin$: Observable<boolean>;
  @Input() gridId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
  ) {
    // this.store.select(selectGridSettings).subscribe((value) => {
    //   this.settings = value;
    // });
    this.store
      .select(selectGridSettings)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.settings = value;
      });
    this.store.dispatch(GridActions.loadGridSettingsFromLocalStorage());
  }
  ngOnInit() {
    this.isAdmin$ = this.store.select(selectIsAdmin);
    // this.isAdmin$.subscribe((item) => {
    //   console.log('Selector isAdmin: ' + item);
    // })
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Возвращает CSS-стили для каждого элемента на основе side и position
  getStylesIntersection(
    intersection: IIntersectionData[],
    indexFirst: number,
    indexSecond: number,
  ): { [key: string]: string } {
    return {
      '--positionX-first': intersection?.[indexFirst]?.positionX.toString(),
      '--positionY-first': intersection?.[indexFirst]?.positionY.toString(),
      '--positionX-second': intersection?.[indexSecond]?.positionX.toString(),
      '--positionY-second': intersection?.[indexSecond]?.positionY.toString(),
    };
  }

  handleStartDragging(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.startDragging.emit(this.gridItem);
    document.addEventListener('mousemove', this.handleDragging);
    document.addEventListener('mouseup', this.handleStopDragging);
  }
  handleDragging = (e: MouseEvent | TouchEvent) => {
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    const newRowStart = Math.round(clientY / this.gridItemSizeY) || 0;
    const newColumnStart = Math.round(clientX / this.gridItemSizeX) || 0;

    this.dragging.emit({ gridItem: this.gridItem, newRowStart, newColumnStart });
  };

  handleStopDragging = (e: MouseEvent) => {
    document.removeEventListener('mousemove', this.handleDragging);
    document.removeEventListener('mouseup', this.handleStopDragging);
  };

  handleStartDraggingTouch(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.startDragging.emit(this.gridItem);

    // Скрыть кнопки
    this.toggleButtonsVisibility(true);

    document.addEventListener('touchmove', this.handleDraggingTouch);
    document.addEventListener('touchend', this.handleStopDraggingTouch);
  }

  handleDraggingTouch = (e: TouchEvent) => {
    const touch = e.touches[0]; // Используем первое касание
    const newRowStart = Math.floor(touch.clientY / this.gridItemSizeY);
    const newColumnStart = Math.floor(touch.clientX / this.gridItemSizeX);
    this.dragging.emit({ gridItem: this.gridItem, newRowStart, newColumnStart });
  };

  toggleButtonsVisibility(isDragging: boolean) {
    const buttons = document.querySelectorAll('.index-button');
    buttons.forEach((button) => {
      if (isDragging) {
        button.classList.add('hide-buttons');
      } else {
        button.classList.remove('hide-buttons');
      }
    });
  }

  handleStopDraggingTouch = (e: TouchEvent) => {
    document.removeEventListener('touchmove', this.handleDraggingTouch);
    document.removeEventListener('touchend', this.handleStopDraggingTouch);

    // Вернуть видимость кнопок
    this.toggleButtonsVisibility(false);
  };

  handleStartResizing(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.startResizing.emit(this.gridItem);
  }

  incrementZIndex() {
    // Клонируем gridItem для создания изменяемого объекта
    // let updatedGridItem = {
    //   ...this.gridItem,
    //   [this.type]: {
    //     ...this.gridItem[this.type],
    //     intersection: {
    //       ...this.gridItem[this.type].intersection,
    //       zIndex: parseInt(this.gridItem[this.type].intersection.zIndex.toString()) + 1,
    //     },
    //   },
    // };
    const updatedGridItem = {
      ...this.gridItem,
      [this.type]: {
        ...this.gridItem[this.type],
        intersection: {
          ...this.gridItem[this.type]?.intersection, // Используйте опциональную цепочку
          zIndex: this.gridItem[this.type]?.intersection?.zIndex
            ? this.gridItem[this.type].intersection.zIndex + 1
            : 1, // Добавьте условие на случай, если zIndex не существует
        },
      },
    };
    this.updateGridItem.emit(updatedGridItem);
  }

  decrementZIndex() {
    // Клонируем gridItem для создания изменяемого объекта
    // let updatedGridItem = {
    //   ...this.gridItem,
    //   [this.type]: {
    //     ...this.gridItem[this.type],
    //     intersection: {
    //       ...this.gridItem[this.type].intersection,
    //       zIndex: parseInt(this.gridItem[this.type].intersection.zIndex.toString()) - 1,
    //     },
    //   },
    // };

    const updatedGridItem = {
      ...this.gridItem,
      [this.type]: {
        ...this.gridItem[this.type],
        intersection: {
          ...this.gridItem[this.type]?.intersection, // Используйте опциональную цепочку
          zIndex: this.gridItem[this.type]?.intersection?.zIndex
            ? this.gridItem[this.type].intersection.zIndex + -1
            : 1, // Добавьте условие на случай, если zIndex не существует
        },
      },
    };

    this.updateGridItem.emit(updatedGridItem);
  }

  delete() {
    console.log('Удаление элемента под id: ' + this.gridItem.entityId); // debug
    this.store.dispatch(GridActions.deleteGridItem({ id: this.gridId, item: this.gridItem }));
  }

  getEntity(entityId: number): Observable<any> {
    return this.entities$.pipe(map((entities) => entities.find((entity) => entity.id == entityId)));
  }
}
