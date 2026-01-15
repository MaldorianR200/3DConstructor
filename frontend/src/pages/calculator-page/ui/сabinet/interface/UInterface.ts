import { GUI } from 'dat.gui';
// import { Params } from '../model/Params';

import { SceneManagerService } from '../../services/SceneManager.service';

import { Step1 } from './steps/Step1';
import { Step2 } from './steps/Step2';
import { Step3 } from './steps/Step3';
import { Step4 } from './steps/Step4';
import { Step5 } from './steps/Step5';
import { BaseCabinet } from '../cabinetTypes/BaseCabinet';
import { SingleDoorCabinet } from '../cabinetTypes/singleDoorCabinet';
import { DoubleDoorCabinet } from '../cabinetTypes/doubleDoorCabinet';

export class UInterface {
  private static instance: UInterface;
  private gui: GUI;

  private cabinet: SingleDoorCabinet | DoubleDoorCabinet;
  private currentStep: number = 1; // Текущий этап

  constructor(private sceneManagerService: SceneManagerService) {
    // this.cabinetParams = cabinetParams;
    this.cabinet = this.sceneManagerService.getCabinet();

    this.initGUI();
  }

  public static getInstance(sceneManagerService: SceneManagerService): UInterface {
    if (UInterface.instance) {
      UInterface.instance.dispose(); // Убедитесь, что старый интерфейс уничтожен
    }
    UInterface.instance = new UInterface(sceneManagerService); // cabinetParams,
    return UInterface.instance;
  }

  private initGUI(): void {
    this.gui = new GUI();
    this.applyStyles();
    this.goToStep(1);
  }

  private applyStyles(): void {
    const guiElement = this.gui.domElement;
    guiElement.classList.add('dat-gui'); // класс для настройки отображения
    guiElement.style.position = 'absolute';
    guiElement.style.top = '100px';
    guiElement.style.right = '10px';
    guiElement.style.width = '400px !important';
    guiElement.style.background = 'rgba(0, 0, 0, 0.8)';
    guiElement.style.borderRadius = '10px';
    guiElement.style.color = 'white';
    guiElement.style.fontFamily = 'Arial, sans-serif';
    // console.log('Применение стилей к GUI:', guiElement);
  }

  public goToStep(step: number): void {
    this.currentStep = step;
    this.clearGUI();

    switch (step) {
      case 1:
        new Step1(this.gui, this.sceneManagerService).init();
        break;
      case 2:
        new Step2(this.gui, this.sceneManagerService).init();
        break;
      case 3:
        new Step3(this.gui, this.sceneManagerService).init();
        break;
      case 4:
        new Step4(this.gui, this.sceneManagerService).init();
        break;
      case 5:
        new Step5(this.gui, this.sceneManagerService).init();
        break;
      default:
        console.warn('Неизвестный шаг');
    }
  }

  private clearGUI(): void {
    if (this.gui) {
      try {
        this.gui.destroy();
      } catch (error) {
        console.warn('Ошибка при удалении GUI:', error);
      }
      this.gui = null;
    }
    this.gui = new GUI();
  }

  public dispose(): void {
    try {
      if (this.gui) {
        this.gui.destroy();
      }
    } catch (error) {
      console.warn('Ошибка при удалении GUI:', error);
    }

    UInterface.instance = null;
  }
}
