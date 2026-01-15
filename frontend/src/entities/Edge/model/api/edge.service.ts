import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEdge, IEdgeResponse } from '../types/edge.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root'
})
export class EdgeService extends BaseService {
  private entityEndPoint: string = 'edge';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable < IEdgeResponse > {
    return this.http.get < IEdgeResponse > (this.openEndPoint);
}

getById(id: number): Observable < IEdge> {
  return this.http.get < IEdge> (`${this.openEndPoint}/${id}`);
  }

create(edge: IEdge): Observable < IEdge> {
  const formData = this.convertToFormData(edge)
return this.http.post < IEdge> (this.sequredEndPoint, formData);
  }

update(edge: IEdge): Observable < IEdge> {
  const formData = this.convertToFormData(edge)
return this.http.patch < IEdge> (this.sequredEndPoint2, formData);
  }

deleteById(id: number): Observable < void> {
  return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
}
}
