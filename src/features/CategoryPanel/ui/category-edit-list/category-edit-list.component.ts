import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { ICategory } from 'src/entities/Category';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-category-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './category-edit-list.component.html',
  styleUrl: './category-edit-list.component.scss',
})
export class CategoriesEditListComponent {
  @Input() categories$: Observable<ICategory[]> = new Observable<ICategory[]>();
  @Input() curEditCategory$ = new BehaviorSubject<ICategory | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(category: ICategory) {
    this.curEditCategory$.next(category);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
