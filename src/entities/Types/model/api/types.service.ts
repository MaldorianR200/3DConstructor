import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITypes, ITypesResponse } from '../types/types.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class TypesService extends BaseService {
  private entityEndPoint: string = 'types';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`;

  getAll(): Observable<ITypesResponse> {
    return this.http.get<ITypesResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<ITypes> {
    return this.http.get<ITypes>(`${this.openEndPoint}/${id}`);
  }

  create(types: ITypes): Observable<ITypes> {
    const formData = this.convertToFormData(types);
    return this.http.post<ITypes>(this.sequredEndPoint, formData);
  }

  update(types: ITypes): Observable<ITypes> {
    const formData = this.convertToFormData(types);
    return this.http.patch<ITypes>(this.sequredEndPoint2, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
