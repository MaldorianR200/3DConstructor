import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IReview } from 'src/entities/Review';
import { ReviewService } from 'src/entities/Review/model/api/review.service';
import { getReviews } from 'src/entities/Review/model/store/review.actions';
import { selectAllReviews } from 'src/entities/Review/model/store/review.selectors';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-reviews-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-slider.component.html',
  styleUrl: './reviews-slider.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReviewsSliderComponent implements AfterViewInit {
  title = 'swiper-elements';
  news$: Observable<IReview[]>;

  constructor(
    private store: Store<AppState>,
    private reviewService: ReviewService,
  ) {
    this.news$ = this.store.select(selectAllReviews);
    this.store.dispatch(getReviews());
    this.news$.subscribe((newss) => {
      console.log(newss);
    });
  }

  ngAfterViewInit(): void {
    // const swiperEl = document.querySelector('swiper-container') as SwiperContainer;
    // if (swiperEl) {
    //   swiperEl.initialize();
    // }

    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container') as SwiperContainer;
      if (swiperEl) {
        console.log('OK');
        swiperEl.initialize();
      } else {
        console.log('ERROR');
      }
    }, 0);
  }
}
