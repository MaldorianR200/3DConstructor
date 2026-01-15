import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReview } from '../types/review.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewService extends BaseService {
  private entityEndPoint: string = 'review';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<IReview[]> {
    return this.http.get<IReview[]>(this.openEndPoint);
  }

  getById(id: number): Observable<IReview> {
    return this.http.get<IReview>(`${this.openEndPoint}/${id}`);
  }

  create(review: IReview): Observable<IReview> {
    const formData = this.convertToFormData(review);
    return this.http.post<IReview>(this.sequredEndPoint, formData);
  }

  update(review: IReview): Observable<IReview> {
    const formData = this.convertToFormData(review);
    return this.http.patch<IReview>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
