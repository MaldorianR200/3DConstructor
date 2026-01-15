import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IMaterial, IMaterialResponse } from '../types/material.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialService extends BaseService {
  private entityEndPoint: string = 'material';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}s`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`;

  getAll(): Observable<IMaterialResponse> {
    return this.http.get<IMaterialResponse>(`${this.openEndPoint}`);
  }

  getById(id: number): Observable<IMaterial> {
    return this.http.get<IMaterial>(`${this.openEndPoint}/${id}`);
  }

  create(material: IMaterial): Observable<IMaterial> {
    const formData = this.convertToFormData(material);
    return this.http.post<IMaterial>(this.sequredEndPoint, formData);
  }

  update(material: IMaterial): Observable<IMaterial> {
    const formData = this.convertToFormData(material);
    return this.http.patch<IMaterial>(this.sequredEndPoint2, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
