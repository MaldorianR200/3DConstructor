import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICombineMaterial, ICombineMaterialResponse } from '../types/combineMaterial.model';
import { BaseService } from 'src/shared/api/base.service';

@Injectable({
  providedIn: 'root'
})
export class CombineMaterialService extends BaseService {
  private entityEndPoint: string = 'combine-material';

  private openEndPoint: string = `${this.apiUrl}/${this.entityEndPoint}`
  private sequredEndPoint: string = `${this.apiUrl}/super-admin/${this.entityEndPoint}`
  private sequredEndPoint2: string = `${this.apiUrl}/admin/${this.entityEndPoint}/update`

  getAll(): Observable < ICombineMaterialResponse > {
    return this.http.get < ICombineMaterialResponse > (this.openEndPoint);
}

getById(id: number): Observable < ICombineMaterial> {
  return this.http.get < ICombineMaterial> (`${this.openEndPoint}/${id}`);
  }

create(combineMaterial: ICombineMaterial): Observable < ICombineMaterial> {
  const formData = this.convertToFormData(combineMaterial)
  return this.http.post < ICombineMaterial> (this.sequredEndPoint, combineMaterial);
  }

update(combineMaterial: ICombineMaterial): Observable < ICombineMaterial> {
  const formData = this.convertToFormData(combineMaterial)
return this.http.patch < ICombineMaterial> (this.sequredEndPoint2, combineMaterial);
  }

deleteById(id: number): Observable < void> {
  return this.http.delete<void>(`${this.sequredEndPoint}/${id}`);
}
}
