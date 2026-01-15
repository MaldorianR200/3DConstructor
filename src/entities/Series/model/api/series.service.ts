import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISeries, ISeriesResponse } from '../types/series.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class SeriesService extends BaseService {
  private entityEndPoint: string = 'series';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`;

  getAll(): Observable<ISeriesResponse> {
    return this.http.get<ISeriesResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<ISeries> {
    return this.http.get<ISeries>(`${this.openEndPoint}/${id}`);
  }

  create(series: ISeries): Observable<ISeries> {
    const formData = this.convertToFormData(series);
    return this.http.post<ISeries>(this.sequredEndPoint, formData);
  }

  update(series: ISeries): Observable<ISeries> {
    const formData = this.convertToFormData(series);
    return this.http.patch<ISeries>(this.sequredEndPoint2, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
