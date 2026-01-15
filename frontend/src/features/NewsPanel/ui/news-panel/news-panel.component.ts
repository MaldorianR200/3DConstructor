import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { INews, NewsSelectors } from 'src/entities/News';
import { StackComponent } from 'src/shared/ui/app';
import { NewsFormComponent } from '../news-form/news-form.component';
import { NewssEditListComponent } from '../news-edit-list/news-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [
    NewsFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    NewssEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './news-panel.component.html',
  styleUrl: './news-panel.component.scss',
})
export class NewsPanelComponent implements OnInit {
  isEdit: boolean = false;
  news$: Observable<INews[]>;
  curEditNews$ = new BehaviorSubject<INews | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.news$ = this.store.select(NewsSelectors.selectAllNews);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const newsId = parseInt(queryParams['id'], 0);
      if (this.isEdit && newsId) {
        this.store.select(NewsSelectors.selectNewsById(newsId)).subscribe((news) => {
          if (news) {
            this.curEditNews$.next(news);
          }
        });
      } else {
        this.curEditNews$.next(null);
      }
    });

    this.curEditNews$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
