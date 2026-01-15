// grid.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGrid, IIGrid } from '../types/grid.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class GridService extends BaseService {
  private entityEndPoint = 'grids';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;
  getAll(): Observable<IGrid[]> {
    return this.http.get<IGrid[]>(this.openEndPoint);
  }

  getById(id: number): Observable<IGrid> {
    return this.http.get<IGrid>(`${this.openEndPoint}/${id}`);
  }

  create(grid: IGrid): Observable<IGrid> {
    const formData = this.convertToFormData(grid);
    return this.http.post<IGrid>(this.sequredEndPoint, formData);
  }
  // create(grid: IGrid): Observable<IIGrid> {
  //   const formData = this.convertToFormData(grid);
  //   console.log(formData);
  //   return this.http.post<IIGrid>(this.sequredEndPoint, formData);
  // }

  update(grid: IGrid): Observable<IGrid> {
    // const iiGrid = this.convertToIIGrid(grid);
    const formData = this.convertToFormData(grid);
    // console.log('FormDate update:' + formData);
    return this.http.patch<IGrid>(`${this.sequredEndPoint}`, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }

  // Новый метод для преобразования IGrid в IIGrid
  convertToIIGrid(grid: IGrid): IIGrid {
    return {
      id: grid.id,
      grid: grid,
    };
  }
}
