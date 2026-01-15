/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { INews } from 'src/entities/News';
import { NewsService } from 'src/entities/News/model/api/news.service';
import { getNews } from 'src/entities/News/model/store/news.actions';
import { selectAllNews } from 'src/entities/News/model/store/news.selectors';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-news-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-slider.component.html',
  styleUrl: './news-slider.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewsSliderComponent implements AfterViewInit {
  title = 'swiper-elements';
  news$: Observable<INews[]>;

  constructor(
    private store: Store<AppState>,
    private newsService: NewsService,
  ) {
    this.news$ = this.store.select(selectAllNews);
    this.store.dispatch(getNews());
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
