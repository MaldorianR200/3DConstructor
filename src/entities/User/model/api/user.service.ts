import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { IUser, IUserForm } from '../types/user';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  private sequredEndPoint: string = `${this.apiUrl}/admin`;

  getAll(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.sequredEndPoint);
  }

  create(user: IUserForm): Observable<IUser> {
    const formData = this.convertToFormData(user);
    return this.http.post<IUser>(this.sequredEndPoint, formData);
  }

  update(user: IUserForm): Observable<IUser> {
    const formData = this.convertToFormData(user);
    return this.http.patch<IUser>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<null> {
    return this.http.delete<null>(`${this.sequredEndPoint}/${id}`);
  }
}
