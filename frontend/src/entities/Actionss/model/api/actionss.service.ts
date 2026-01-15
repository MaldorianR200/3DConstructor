import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IActionss, IActionssResponse } from '../types/actionss.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class ActionssService extends BaseService {
  private entityEndPoint: string = 'action';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  // private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  // private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  // private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable<IActionssResponse> {
    return this.http.get<IActionssResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<IActionss> {
    return this.http.get<IActionss>(`${this.openEndPoint}/${id}`);
  }

  create(actionss: IActionss): Observable<IActionss> {
    const formData = this.convertToFormData(actionss);
    return this.http.post<IActionss>(this.sequredEndPoint, formData);
  }

  // update(actionss: IActionss): Observable<IActionss> {
  //   const formData = this.convertToFormData(actionss);
  //   return this.http.patch<IActionss>(this.sequredEndPoint2, formData);
  // }

  update(actionss: IActionss): Observable<IActionss> {
    const formData = this.convertToFormData(actionss);
    return this.http.patch<IActionss>(this.sequredEndPoint2 + '/update', formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
