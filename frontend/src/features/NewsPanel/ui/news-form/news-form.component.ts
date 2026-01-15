import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { INews, NewsActions } from 'src/entities/News';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-news-form',
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
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
})
export class NewsFormComponent implements OnInit {
  @Input() news$: BehaviorSubject<INews | null> = new BehaviorSubject<INews | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  newsForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.newsForm = this.fb.group({
      name: new FormControl(),
      description: new FormControl(),
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
    const news: INews = this.newsForm.value;
    this.store.dispatch(NewsActions.createNews({ news }));
  }

  update() {
    const news: INews = this.newsForm.value;
    news.id = this.news$.value?.id;
    this.store.dispatch(NewsActions.updateNews({ news }));
  }

  delete() {
    const news = this.news$.value;
    if (news) {
      this.store.dispatch(NewsActions.deleteNews({ id: news.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.news$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.newsForm.get('name')?.setValue(item.name);
        this.newsForm.get('description')?.setValue(item.description);
        this.newsForm.get('images')?.setValue(item.images);
      } else {
        this.newsForm.reset();
      }
    });

    this.actions$.pipe(ofType(NewsActions.createNewsSuccess)).subscribe(() => {
      this.newsForm.reset();
    });
    this.actions$.pipe(ofType(NewsActions.updateNewsSuccess)).subscribe(() => {
      this.newsForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(NewsActions.deleteNewsSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
