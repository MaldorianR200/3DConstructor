import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { ISpecification } from 'src/entities/Specification';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import { Store } from '@ngrx/store';
import { selectTypeNameById } from 'src/entities/Specification/model/store/specification.selectors';
import { switchMap } from 'rxjs/operators';

export interface ISpecificationWithNames extends ISpecification {
  typeProductName: string;
  typeExecutionName: string;
}

@Component({
  selector: 'app-specification-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './specification-edit-list.component.html',
  styleUrl: './specification-edit-list.component.scss',
})
export class SpecificationsEditListComponent implements OnInit {
  @Input() specifications$: Observable<ISpecification[]> = new Observable<ISpecification[]>();
  @Input() curEditSpecification$ = new BehaviorSubject<ISpecification | null>(null);

  specificationsWithNames$: Observable<ISpecificationWithNames[]> = of([]);
  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.specificationsWithNames$ = this.specifications$.pipe(
      map(specs => {
        if (!specs || specs.length === 0) {
          return [];
        }

        // Создаем массив observables для каждой спецификации
        const specObservables = specs.map(spec =>
          combineLatest([
            this.getTypeProductName(spec.typeProductId),
            this.getTypeExecutionName(spec.typeExecutionId)
          ]).pipe(
            map(([typeProductName, typeExecutionName]) => ({
              ...spec,
              typeProductName,
              typeExecutionName
            }))
          )
        );

        return combineLatest(specObservables);
      }),
      switchMap(observableArray => observableArray)
    );
  }

  changeCur(specification: ISpecification) {
    this.curEditSpecification$.next(specification);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }

  getTypeProductName(id: number | null | undefined): Observable<string> {
    return this.store.select(selectTypeNameById(id));
  }

  getTypeExecutionName(id: number | null | undefined): Observable<string> {
    return this.store.select(selectTypeNameById(id));
  }
}
