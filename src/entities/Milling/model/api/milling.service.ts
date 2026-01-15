import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMilling, IMillingResponse } from '../types/milling.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root'
})
export class MillingService extends BaseService {
  private entityEndPoint: string = 'milling';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable < IMillingResponse > {
    return this.http.get < IMillingResponse > (this.openEndPoint);
}

getById(id: number): Observable < IMilling> {
  return this.http.get < IMilling> (`${this.openEndPoint}/${id}`);
  }

  create(milling: IMilling): Observable<IMilling> {
    return this.http.post<IMilling>(this.sequredEndPoint, milling);
  }

  update(milling: IMilling): Observable<IMilling> {
    return this.http.patch<IMilling>(this.sequredEndPoint2, milling);
  }

deleteById(id: number): Observable < void> {
  return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
}
}
