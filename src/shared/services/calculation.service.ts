// src/app/services/calculation.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AppState } from '../../app/providers/StoreProvider/app.store';
import { IMilling } from '../../entities/Milling';
import { selectMillingById } from '../../entities/Milling/model/store/milling.selectors';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  constructor(private store: Store<AppState>) {}

  // Метод для вычисления общей стоимости по ID фрезеровки
  calculateTotalCostByMillingId(millingId: number): Observable<number> {
    return this.store.select(selectMillingById(millingId)).pipe(
      map((milling: IMilling | undefined) => {
        if (!milling || !milling.steps) return 0;

        return milling.steps.reduce((total, step) => {
          return total + (step.price * step.count);
        }, 0);
      })
    );
  }

  // Метод для вычисления стоимости из готового объекта фрезеровки
  calculateTotalCost(milling: IMilling): number {
    if (!milling || !milling.steps) return 0;

    return milling.steps.reduce((total, step) => {
      return total + (step.price * step.count);
    }, 0);
  }

  // Метод для вычисления стоимости из FormArray
  calculateTotalCostFromFormArray(stepArray: any[]): number {
    if (!stepArray || !Array.isArray(stepArray)) return 0;

    return stepArray.reduce((total, step) => {
      const price = step.price || 0;
      const count = step.count || 0;
      return total + (price * count);
    }, 0);
  }
}
