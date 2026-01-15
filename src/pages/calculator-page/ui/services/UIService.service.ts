import { Injectable } from '@angular/core';
import { UInterface } from '../сabinet/interface/UInterface';
import { SceneManagerService } from './SceneManager.service';
import { CabinetFactory } from '../сabinet/objects/factorys/cabinetFactory';
import { DrawerWarningService } from './warnings/DrawerWarningService.service';

@Injectable({ providedIn: 'root' })
export class UIService {
  private ui!: UInterface;
  private sceneManagerService: SceneManagerService;
  private drawerWarningService: DrawerWarningService;

  constructor(sceneManagerService: SceneManagerService, drawerWarningService: DrawerWarningService) {
    this.sceneManagerService = sceneManagerService;
    this.drawerWarningService = drawerWarningService;
  }

  initializeUI() {
    // console.log(
    //   'Инициализируем интерфейс и передаём созданные параметры:\n',
    //   this.sceneManagerService.getCabinet().getCabinetParams(),
    // );
    this.ui = UInterface.getInstance(this.sceneManagerService);
  }

  disposeUI() {
    if (this.ui) {
      this.ui.dispose();
    }
  }
}
