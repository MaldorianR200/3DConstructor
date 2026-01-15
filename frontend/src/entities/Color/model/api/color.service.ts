import { Injectable } from '@angular/core';
import { catchError, of, Observable, map, retry, tap } from 'rxjs';
import { ColorResponse, IColor } from '../types/color.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class ColorService extends BaseService {
  private entityEndPoint: string = 'color';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<ColorResponse> {
    return this.http.get<ColorResponse>(`${this.openEndPoint}`);
  }

  getById(id: number): Observable<IColor> {
    return this.http.get<IColor>(`${this.openEndPoint}/${id}`);
  }

  create(color: IColor): Observable<IColor> {
    const formData = this.convertToFormData(color);
    return this.http.post<IColor>(this.sequredEndPoint, formData);
  }

  update(color: IColor): Observable<IColor> {
    const formData = this.convertToFormData(color);
    return this.http.patch<IColor>(this.sequredEndPoint2 + '/update', formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
