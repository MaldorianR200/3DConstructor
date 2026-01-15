import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICabinet } from '../types/cabinet.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class CabinetService extends BaseService {
  private entityEndPoint: string = 'cabinet';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<ICabinet[]> {
    return this.http.get<ICabinet[]>(this.openEndPoint);
  }

  getById(id: number): Observable<ICabinet> {
    return this.http.get<ICabinet>(`${this.openEndPoint}/${id}`);
  }

  create(cabinet: ICabinet): Observable<ICabinet> {
    const formData = this.convertToFormData(cabinet);
    return this.http.post<ICabinet>(this.sequredEndPoint, formData);
  }

  update(cabinet: ICabinet): Observable<ICabinet> {
    const formData = this.convertToFormData(cabinet);
    return this.http.patch<ICabinet>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
