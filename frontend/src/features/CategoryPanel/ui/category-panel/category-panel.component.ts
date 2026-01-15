import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ICategory, CategorySelectors } from 'src/entities/Category';
import { StackComponent } from 'src/shared/ui/app';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoriesEditListComponent } from '../category-edit-list/category-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-category-panel',
  standalone: true,
  imports: [
    CategoryFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    CategoriesEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './category-panel.component.html',
  styleUrl: './category-panel.component.scss',
})
export class CategoryPanelComponent implements OnInit {
  isEdit: boolean = false;
  categories$: Observable<ICategory[]>;
  curEditCategory$ = new BehaviorSubject<ICategory | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.categories$ = this.store.select(CategorySelectors.selectAllCategories);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const categoryId = parseInt(queryParams['id'], 0);
      if (this.isEdit && categoryId) {
        this.store
          .select(CategorySelectors.selectCategoryById(categoryId))
          .subscribe((category) => {
            if (category) {
              this.curEditCategory$.next(category);
            }
          });
      } else {
        this.curEditCategory$.next(null);
      }
    });

    this.curEditCategory$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
