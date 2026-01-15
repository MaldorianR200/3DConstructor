import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { updateGridItem } from 'src/entities/Grid/model/store/grid.actions';
import { GridConfig } from 'src/entities/Grid/model/types/grid.config';
import { GridTypes, IGrid, IGridConfig, IGridItem } from 'src/entities/Grid/model/types/grid.model';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import { GridCellsService } from './GridCells.service';
import { Mesh, BufferGeometry, NormalBufferAttributes, Material, Object3DEventMap } from 'three';

@Injectable({
  providedIn: 'root',
})
export class GridManagerService extends GridCellsService {
  grid: IGrid;
  config: IGridConfig;
  entities$: Observable<any[]>;

  constructor(
    private store: Store<AppState>,
    private checkPlatformService: CheckPlatformService,
  ) {
    super();
  }

  setGrid(grid: IGrid) {
    this.grid = grid;
    this.updateConfig();
  }

  updateConfig() {
    if (this.grid) {
      this.config = GridConfig[this.grid.entityType];
      this.store.dispatch(this.config.getAction());
      this.entities$ = this.store.select(this.config.selectAll);
    }
  }

  updateGridItem(updatedGridItem: IGridItem) {
    this.store.dispatch(updateGridItem({ id: this.grid.id, item: updatedGridItem }));

    //  const updatedItems = this.grid.grid.items.map((item) =>
    const updatedItems = this.grid.items.map((item) =>
      // item.entityId === updatedGridItem.entityId ? updatedGridItem : item,
      item.entityId === updatedGridItem.entityId ? updatedGridItem : item,
    );
    // this.grid.grid.items = [...updatedItems];
    this.grid.items = [...updatedItems];
  }
}
