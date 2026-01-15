import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from 'src/shared/api/base.service';
import { ILog } from '../types/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService extends BaseService {
  getAll(): Observable<ILog[]> {
    return this.http.get<ILog[]>(`${this.apiUrl}/user/log`);
  }
}
