import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { getGrids } from 'src/entities/Grid/model/store/grid.actions';
import { selectGridByPageRoute } from 'src/entities/Grid/model/store/grid.selectors';
import { GridManagerService } from 'src/features/GridManager/model/GridManager.service';
import { GridManagerComponent } from 'src/features/GridManager/ui/GridManager/GridManager.component';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-reviews-grid',
  standalone: true,
  imports: [GridManagerComponent, CommonModule],
  templateUrl: './reviews-grid.component.html',
  styleUrl: './reviews-grid.component.scss',
})
export class ReviewsGridComponent implements OnInit {
  gridId: number;

  constructor(
    private store: Store<AppState>,
    private gridManagerService: GridManagerService,
  ) {
    this.store.dispatch(getGrids());
  }

  ngOnInit() {
    this.store.select(selectGridByPageRoute(Routes.REVIEWS)).subscribe((item) => {
      this.gridId = item?.id;
      this.gridManagerService.setGrid(item);
    });
  }
}
