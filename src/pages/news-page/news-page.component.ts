import { Component } from '@angular/core';
import { HeaderComponent } from '../../widgets/header/header.component';
import { FooterComponent } from '../../widgets/footer/footer.component';
import { NewsOverlayComponent } from './news-overlay/news-overlay.component';
import { NewsGridComponent } from './news-grid/news-grid.component';
import { NewsSliderComponent } from './news-slider/news-slider.component';
import { Store } from '@ngrx/store';
import { NewsService } from 'src/entities/News/model/api/news.service';
import { ActivatedRoute } from '@angular/router';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { Observable } from 'rxjs';
import { INews } from 'src/entities/News';
import { selectAllNews } from 'src/entities/News/model/store/news.selectors';
import { getNews } from 'src/entities/News/model/store/news.actions';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [NewsOverlayComponent, NewsGridComponent, NewsSliderComponent],
  templateUrl: './news-page.component.html',
  styleUrl: './news-page.component.scss',
})
export class NewsPageComponent {}
