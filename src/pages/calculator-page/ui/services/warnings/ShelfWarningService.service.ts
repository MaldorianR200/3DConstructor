import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ShelfWarningData {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShelfWarningService {
  private showWarningSubject = new Subject<ShelfWarningData>();

  // Observable для подписки компонента Overlay
  onShowWarning(): Observable<ShelfWarningData> {
    return this.showWarningSubject.asObservable();
  }

  // Метод для вызова предупреждения
  showWarning(message: string): void {
    this.showWarningSubject.next({ message });
  }
}
