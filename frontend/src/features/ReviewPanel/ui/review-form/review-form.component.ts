import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IReview, ReviewActions } from 'src/entities/Review';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    AdminImagesLoaderMultipleComponent,
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss',
})
export class ReviewFormComponent implements OnInit {
  @Input() review$: BehaviorSubject<IReview | null> = new BehaviorSubject<IReview | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  reviewForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.reviewForm = this.fb.group({
      name: new FormControl(),
      images: new FormControl(),
    });
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    if (this.isCreate) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    const review: IReview = this.reviewForm.value;
    this.store.dispatch(ReviewActions.createReview({ review }));
  }

  update() {
    const review: IReview = this.reviewForm.value;
    review.id = this.review$.value?.id;
    this.store.dispatch(ReviewActions.updateReview({ review }));
  }

  delete() {
    const review = this.review$.value;
    if (review) {
      this.store.dispatch(ReviewActions.deleteReview({ id: review.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.review$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.reviewForm.get('name')?.setValue(item.name);
        this.reviewForm.get('images')?.setValue(item.images);
      } else {
        this.reviewForm.reset();
      }
    });

    this.actions$.pipe(ofType(ReviewActions.createReviewSuccess)).subscribe(() => {
      this.reviewForm.reset();
    });
    this.actions$.pipe(ofType(ReviewActions.updateReviewSuccess)).subscribe(() => {
      this.reviewForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(ReviewActions.deleteReviewSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
