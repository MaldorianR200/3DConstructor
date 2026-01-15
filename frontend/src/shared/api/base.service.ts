import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_VERSION, BASE_URL } from 'global';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected baseUrl: string = BASE_URL;
  protected apiUrl: string = `${this.baseUrl}api/${API_VERSION}`;

  constructor(protected http: HttpClient) {}

  protected convertToFormData(item: any): FormData {
    const formData = new FormData();

    const appendFormData = (data: any, parentKey: string | null = null) => {
      if (data === null || data === undefined || data === '') {
        // пропускаем пустые значения
        return;
      }

      if (data instanceof File) {
        formData.append(parentKey!, data);
      } else if (Array.isArray(data)) {
        data.forEach((value, index) => {
          appendFormData(value, `${parentKey}[${index}]`);
        });
      } else if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          appendFormData(data[key], parentKey ? `${parentKey}.${key}` : key);
        });
      } else {
        formData.append(parentKey!, data);
      }
    };

    appendFormData(item);
    return formData;
  }
}
