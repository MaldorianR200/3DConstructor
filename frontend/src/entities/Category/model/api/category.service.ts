import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICategory } from '../types/category.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseService {
  private entityEndPoint: string = 'categories';

  // private openEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`
  // private sequredEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`
  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.openEndPoint);
  }

  getParent(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.openEndPoint}/parent`);
  }

  getNoChildren(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.openEndPoint}/no-children`);
  }

  /*   getById(id: number): Observable<ICategory> {
      return this.http.get<ICategory>(`${this.openEndPoint}/${id}`);
    } */

  getBySeoId(id: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${this.openEndPoint}/seo/${id}`);
  }

  getPossibleParentById(id: number): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.openEndPoint}/possible-parent/${id}`);
  }

  create(category: ICategory): Observable<ICategory> {
    const formData = this.convertToFormData(category);
    return this.http.post<ICategory>(this.sequredEndPoint, formData);
  }

  update(category: ICategory): Observable<ICategory> {
    const formData = this.convertToFormData(category);
    return this.http.patch<ICategory>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
