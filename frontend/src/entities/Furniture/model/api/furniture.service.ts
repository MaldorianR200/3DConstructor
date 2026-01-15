import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFurniture, IFurnitureResponse } from '../types/furniture.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class FurnitureService extends BaseService {
  private entityEndPoint: string = 'furniture';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  // private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  // private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  // private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable<IFurnitureResponse> {
    return this.http.get<IFurnitureResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<IFurniture> {
    return this.http.get<IFurniture>(`${this.openEndPoint}/${id}`);
  }

  create(Furniture: IFurniture): Observable<IFurniture> {
    const formData = this.convertToFormData(Furniture);
    return this.http.post<IFurniture>(this.sequredEndPoint, formData);
  }
  update(Furniture: IFurniture): Observable<IFurniture> {
    const formData = this.convertToFormData(Furniture);
    return this.http.patch<IFurniture>(this.sequredEndPoint2+'/update', formData);
  }

  // update(Furniture: IFurniture): Observable<IFurniture> {
  //   const formData = this.convertToFormData(Furniture);
  //   return this.http.patch<IFurniture>(this.sequredEndPoint2 + '/update', formData);
  // }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
