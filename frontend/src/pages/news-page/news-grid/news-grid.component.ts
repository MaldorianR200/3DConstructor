/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { INews } from 'src/entities/News';
import { NewsService } from 'src/entities/News/model/api/news.service';
import { getNews } from 'src/entities/News/model/store/news.actions';
import { selectAllNews } from 'src/entities/News/model/store/news.selectors';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-news-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-grid.component.html',
  styleUrl: './news-grid.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewsGridComponent implements OnInit, AfterViewInit {
  news$: Observable<INews[]>;
  selectedNew!: INews;
  isModalOpen = false;

  swiperConfig = {
    pagination: true,
    navigation: true,
    loop: true,
    spaceBetween: 10,
    slidesPerView: 1,
  };

  constructor(
    private store: Store<AppState>,
    private newsService: NewsService,
  ) {
    this.news$ = this.store.select(selectAllNews);
    this.store.dispatch(getNews());
  }

  ngAfterViewInit(): void {
    const swiperEl = document.querySelector('swiper-container') as SwiperContainer;
    if (swiperEl) {
      swiperEl.initialize();
    }
  }

  ngOnInit(): void {
    this.news$.subscribe((newss) => {
      console.log(newss);
    });
  }

  openModal(newsItem: INews) {
    this.selectedNew = newsItem;
    this.isModalOpen = true;

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

  closeModal() {
    this.isModalOpen = false;
  }
}
