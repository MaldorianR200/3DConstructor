import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root',
})
export class SeoService extends BaseService {
  getRobots(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}robots.txt`, { responseType: 'text' as 'json' });
  }

  updateRobots(content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/seo/robots`, content);
  }

  generateSiteMap(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seo/generate-sitemap`);
  }
}
