import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DrawerWarningAction } from '../../сabinet/warnings/drawer-warning-overlay/drawer-warning-overlay.component';

export interface DrawerWarningData {
  section: string;
  problemType: string;
  isSingleCabinet: boolean;
  hasMullion?: boolean;
  minWidth?: number;
  requiredDepth?: number;
  isAddingNew?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DrawerWarningService {
  private warningSubject = new Subject<DrawerWarningData>();
  private actionSubject = new Subject<DrawerWarningAction>();
  private isProcessing = false; // Добавить флаг защиты
  // Для показа предупреждения
  showWarning(data: DrawerWarningData) {
    this.warningSubject.next(data);
  }

  // Для получения действий пользователя
  onAction() {
    return this.actionSubject.asObservable();
  }

  // Для получения событий показа предупреждения
  onShowWarning() {
    return this.warningSubject.asObservable();
  }

  // Для отправки действия пользователя
  // sendAction(action: DrawerWarningAction) {
  //   this.actionSubject.next(action);
  // }

    // Для отправки действия пользователя - С ЗАЩИТОЙ ОТ РЕКУРСИИ
  sendAction(action: DrawerWarningAction) {
    if (this.isProcessing) {
      console.warn('🚫 DrawerWarningService: Action already being processed, skipping...');
      return;
    }

    try {
      this.isProcessing = true;
      console.log('🔄 DrawerWarningService: Sending action:', action);
      this.actionSubject.next(action);
    } finally {
      // Сбрасываем флаг после завершения цикла событий
      setTimeout(() => {
        this.isProcessing = false;
      }, 0);
    }
  }
}
