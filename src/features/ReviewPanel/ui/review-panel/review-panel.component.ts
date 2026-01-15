import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IReview, ReviewSelectors } from 'src/entities/Review';
import { StackComponent } from 'src/shared/ui/app';
import { ReviewFormComponent } from '../review-form/review-form.component';
import { ReviewsEditListComponent } from '../review-edit-list/review-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-review-panel',
  standalone: true,
  imports: [
    ReviewFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    ReviewsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './review-panel.component.html',
  styleUrl: './review-panel.component.scss',
})
export class ReviewPanelComponent implements OnInit {
  isEdit: boolean = false;
  reviews$: Observable<IReview[]>;
  curEditReview$ = new BehaviorSubject<IReview | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.reviews$ = this.store.select(ReviewSelectors.selectAllReviews);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const reviewId = parseInt(queryParams['id'], 0);
      if (this.isEdit && reviewId) {
        this.store.select(ReviewSelectors.selectReviewById(reviewId)).subscribe((review) => {
          if (review) {
            this.curEditReview$.next(review);
          }
        });
      } else {
        this.curEditReview$.next(null);
      }
    });

    this.curEditReview$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
