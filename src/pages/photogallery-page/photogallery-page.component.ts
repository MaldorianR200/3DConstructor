import { Component, HostListener, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, of } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { GridTypes, IGrid, IGridItem } from 'src/entities/Grid';
import { selectGridByPageRoute } from 'src/entities/Grid/model/store/grid.selectors';
import { Routes } from 'src/shared/config/routes';
import { CommonModule } from '@angular/common';
import { GridManagerComponent } from 'src/features/GridManager/ui/GridManager/GridManager.component';
import { getGrids } from 'src/entities/Grid/model/store/grid.actions';
import { GridManagerService } from 'src/features/GridManager/model/GridManager.service';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import { GridService } from 'src/entities/Grid/model/api/grid.service';

@Component({
  selector: 'app-photogallery-page',
  standalone: true,
  imports: [GridManagerComponent, CommonModule],
  templateUrl: './photogallery-page.component.html',
  styleUrl: './photogallery-page.component.scss',
})
export class PhotogalleryPageComponent implements OnInit {
  gridId: number;
  maxItemsToShow: number = 56;
  platformType: GridTypes; // Тип платформы (desktop, tablet, mobile)
  showAllGrid: boolean = false;
  gridTypes = GridTypes;

  gridItems$: Observable<IGridItem[]>;
  visibleItemsCount: number = 14;
  gridItemCount: number = 0;

  constructor(
    private store: Store<AppState>,
    private gridManagerService: GridManagerService,
    private checkPlatformService: CheckPlatformService,
    private gridService: GridService,
  ) {
    this.store.dispatch(getGrids());
    // console.log('All GRIDS:' + getGrids().type);
  }

  ngOnInit() {
    this.store.select(selectGridByPageRoute(Routes.PHOTOGALLERY)).subscribe((grid) => {
      // console.log('DEBUG_PHOTOGALLERY_Selected grid:', grid);
      if (grid) {
        this.gridId = grid.id;
        this.gridManagerService.setGrid(grid);
        // this.gridItems$ = of(grid.grid.items);
        // this.gridItems$ = of(grid.items);
      } else {
        // если undefine
        console.warn('No grid found for route:', Routes.PHOTOGALLERY);
        // this.createDefaultGrid();
      }
    });
  }

  showAll() {
    this.showAllGrid = true;
  }
}
