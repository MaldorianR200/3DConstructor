import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INews } from '../types/news.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService extends BaseService {
  private entityEndPoint: string = 'news';

  // private openEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`;
  // private sequredEndPoint: string = `http://localhost:9000/${this.entityEndPoint}`;
  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`;
  private sequredEndPoint: string = `${this.apiUrl}/admin/${this.entityEndPoint}`;

  getAll(): Observable<INews[]> {
    return this.http.get<INews[]>(this.openEndPoint);
  }

  getById(id: number): Observable<INews> {
    return this.http.get<INews>(`${this.openEndPoint}/${id}`);
  }

  create(news: INews): Observable<INews> {
    const formData = this.convertToFormData(news);
    return this.http.post<INews>(this.sequredEndPoint, formData);
  }

  update(news: INews): Observable<INews> {
    const formData = this.convertToFormData(news);
    return this.http.patch<INews>(this.sequredEndPoint, formData);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
  }
}
