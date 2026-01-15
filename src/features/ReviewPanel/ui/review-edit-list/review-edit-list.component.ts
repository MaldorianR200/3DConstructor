import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IReview } from 'src/entities/Review';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-review-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './review-edit-list.component.html',
  styleUrl: './review-edit-list.component.scss',
})
export class ReviewsEditListComponent {
  @Input() reviews$: Observable<IReview[]> = new Observable<IReview[]>();
  @Input() curEditReview$ = new BehaviorSubject<IReview | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(review: IReview) {
    this.curEditReview$.next(review);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
