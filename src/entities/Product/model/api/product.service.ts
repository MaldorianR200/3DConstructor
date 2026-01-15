import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../types/product.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  private entityEndPoint: string = 'product';

  // private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  // private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`
  // private openEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`
  // private sequredEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`
  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}s`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.openEndPoint);
  }

  getById(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.openEndPoint}/${id}`);
  }

  create(product: IProduct): Observable<IProduct> {
    const formData = this.convertToFormData(product);
    return this.http.post<IProduct>(this.sequredEndPoint, formData);
  }

  update(product: IProduct): Observable<IProduct> {
    const formData = this.convertToFormData(product);
    return this.http.patch<IProduct>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
