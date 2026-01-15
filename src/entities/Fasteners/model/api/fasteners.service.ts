import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFasteners, IFastenersResponse } from '../types/fasteners.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class FastenersService extends BaseService {
  private entityEndPoint: string = 'fastener';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  // private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  // private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  // private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable<IFastenersResponse> {
    return this.http.get<IFastenersResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<IFasteners> {
    return this.http.get<IFasteners>(`${this.openEndPoint}/${id}`);
  }

  create(fasteners: IFasteners): Observable<IFasteners> {
    const formData = this.convertToFormData(fasteners);
    return this.http.post<IFasteners>(this.sequredEndPoint, formData);
  }
  update(fasteners: IFasteners): Observable<IFasteners> {
    const formData = this.convertToFormData(fasteners);
    return this.http.patch<IFasteners>(this.sequredEndPoint2 + '/update', formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
