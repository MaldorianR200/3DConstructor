import { CommonModule } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, pipe } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { BASE_URL_STATIC } from 'global';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGrid, IGridItem, GridActions } from 'src/entities/Grid';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import { GridPositionService } from '../../model/GridPosition.service';
import { GridCellsService } from '../../model/GridCells.service';
import { selectGridById } from 'src/entities/Grid/model/store/grid.selectors';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';

@Component({
  selector: 'app-grid-entities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './GridEntities.component.html',
  styleUrls: ['./GridEntities.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridEntitiesComponent implements AfterViewInit {
  @Input() grid: IGrid;
  @Input() entities$: Observable<any[]>;
  baseUrlStatic = BASE_URL_STATIC;
  isAdmin$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private gridPositionService: GridPositionService,
    private checkPlatformService: CheckPlatformService,
  ) {
    this.isAdmin$ = this.store.select(selectIsAdmin);
  }

  entityInGrid(entity: any): boolean {
    // return !!this.grid.grid.items?.find((item) => item.entityId == entity.id);
    return !!this.grid.items?.find((item) => item.entityId == entity.id);
  }

  toGrid(entity: any) {
    const { desktop, tablet, mobile } = this.gridPositionService.getFreePosition(this.grid);
    console.log(this.gridPositionService.getFreePosition(this.grid));
    const newGridItem: IGridItem = {
      entityId: entity.id,
      desktop: desktop,
      tablet: tablet,
      mobile: mobile,
    };
    0;
    // console.log('DEBUG_GridEntities_IGridItem: ' + newGridItem.entityId);
    this.store.dispatch(GridActions.createGridItem({ id: this.grid.id, item: newGridItem }));
  }

  ngAfterViewInit(): void {
    if (this.checkPlatformService.isBrowser) {
      const swiperEl1 = document.querySelector('.entities') as SwiperContainer;

      this.entities$.subscribe((items) => {
        if (items) {
          swiperEl1?.initialize();
          console.log('DEBUG_GridEntities_Swiper initialized with items:', items);
        } else {
          console.log('DEBUG_GridEntities_No items to initialize Swiper with.');
        }
      });
    }
  }
}
