import { Injectable } from '@angular/core';
import { SceneManagerService } from './SceneManager.service';
import { DimensionLines } from '../сabinet/objects/DimensionLines';
import { FacadeManager } from '../сabinet/objects/managers/FacadeManager/FacadeManager';
import { DrawerManager } from '../сabinet/objects/managers/DrawerManager/DrawerManager';
import { MullionManager } from '../сabinet/objects/managers/MullionManager/MullionManager';
import { ShelfManager } from '../сabinet/objects/managers/ShelfManager/ShelfManager';
import { ICabinet } from 'src/entities/Cabinet';
import { DrawerWarningService } from './warnings/DrawerWarningService.service';
import { Size } from 'src/entities/Cabinet/model/types/cabinet.model';

@Injectable({
  providedIn: 'root',
})
export class CabinetManagerService {
  constructor(private sceneManagerService: SceneManagerService, private drawerWarningService: DrawerWarningService ) {}

  public createManagers(cabinetParams: ICabinet, dimensionLines: DimensionLines, size: Size) {
    const shelfManager = new ShelfManager(this.sceneManagerService, dimensionLines, size);
    const drawerManager = new DrawerManager(this.sceneManagerService, this.drawerWarningService, dimensionLines, size);
    const doorManager = new FacadeManager(this.sceneManagerService, dimensionLines);
    const mullionManager = new MullionManager(this.sceneManagerService, size);

    return {
      shelfManager,
      drawerManager,
      doorManager,
      mullionManager,
    };
  }
}
