import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { INews } from 'src/entities/News';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
@Component({
  selector: 'app-news-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './news-edit-list.component.html',
  styleUrl: './news-edit-list.component.scss',
})
export class NewssEditListComponent {
  @Input() news$: Observable<INews[]> = new Observable<INews[]>();
  @Input() curEditNews$ = new BehaviorSubject<INews | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(news: INews) {
    this.curEditNews$.next(news);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
