import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { ISeries } from 'src/entities/Series';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-series-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './series-edit-list.component.html',
  styleUrl: './series-edit-list.component.scss',
})
export class SeriessEditListComponent {
  @Input() seriess$: Observable<ISeries[]> = new Observable<ISeries[]>();
  @Input() curEditSeries$ = new BehaviorSubject<ISeries | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(series: ISeries) {
    this.curEditSeries$.next(series);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
