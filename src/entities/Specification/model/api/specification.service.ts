import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISpecification, ISpecificationResponse } from '../types/specification.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class SpecificationService extends BaseService {
  private entityEndPoint: string = 'specification';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`;
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`;

  getAll(): Observable<ISpecificationResponse> {
    return this.http.get<ISpecificationResponse>(this.openEndPoint);
  }

  getById(id: number): Observable<ISpecification> {
    return this.http.get<ISpecification>(`${this.openEndPoint}/${id}`);
  }

  create(specification: ISpecification): Observable<ISpecification> {
    return this.http.post<ISpecification>(this.sequredEndPoint, specification, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  update(specification: ISpecification): Observable<ISpecification> {
    return this.http.patch<ISpecification>(this.sequredEndPoint2, specification, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
