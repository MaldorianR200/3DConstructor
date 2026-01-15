import { Injectable } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryService } from 'src/entities/Category';

@Injectable({
  providedIn: 'root',
})
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> => {
    const id = route.paramMap.get('id');
    if (id) {
      return this.categoryService.getBySeoId(id).pipe(
        catchError((error) => {
          return of(null);
        }),
      );
    } else {
      return this.categoryService.getParent().pipe(
        catchError((error) => {
          return of(null);
        }),
      );
    }
  };
}
