import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CabinetFactory } from '../сabinet/objects/factorys/cabinetFactory';
import { ICabinet } from 'src/entities/Cabinet';
import { SceneManagerService } from './SceneManager.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import {
  createCabinet,
  deleteCabinet,
  updateCabinet,
} from 'src/entities/Cabinet/model/store/cabinet.actions';
import { SingleDoorCabinet } from '../сabinet/cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../сabinet/cabinetTypes/doubleDoorCabinet';

@Injectable({ providedIn: 'root' })
export class CabinetService {
  private cabinet: SingleDoorCabinet | DoubleDoorCabinet | null = null;

  constructor(
    private sceneManager: SceneManagerService,
    private store: Store<AppState>,
  ) {}

  // initializeCabinet() {
  //   if (!this.cabinet) {
  //     this.cabinet = new Cabinet(
  //       this.sceneManager.getScene(),
  //       this.sceneManager.getCamera(),
  //       CabinetFactory.createDefaultParams(),
  //     );
  //   }
  // }

  createCabinet(cabinet: ICabinet) {
    this.store.dispatch(createCabinet({ cabinet }));
  }

  updateCabinet(cabinet: ICabinet) {
    this.store.dispatch(updateCabinet({ cabinet }));
  }

  deleteCabinet(id: number) {
    this.store.dispatch(deleteCabinet({ id }));
  }

  getCabinet(): SingleDoorCabinet | DoubleDoorCabinet | null {
    return this.cabinet;
  }
}
