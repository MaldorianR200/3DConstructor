import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { ICategory, CategoryActions } from 'src/entities/Category';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-category-form',
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
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  @Input() category$: BehaviorSubject<ICategory | null> = new BehaviorSubject<ICategory | null>(
    null,
  );
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  categoryForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.categoryForm = this.fb.group({
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
    const category: ICategory = this.categoryForm.value;
    this.store.dispatch(CategoryActions.createCategory({ category }));
  }

  update() {
    const category: ICategory = this.categoryForm.value;
    category.id = this.category$.value?.id;
    this.store.dispatch(CategoryActions.updateCategory({ category }));
  }

  delete() {
    const category = this.category$.value;
    if (category) {
      this.store.dispatch(CategoryActions.deleteCategory({ id: category.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.category$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.categoryForm.get('name')?.setValue(item.name);
        this.categoryForm.get('images')?.setValue(item.images);
      } else {
        this.categoryForm.reset();
      }
    });

    this.actions$.pipe(ofType(CategoryActions.createCategorySuccess)).subscribe(() => {
      this.categoryForm.reset();
    });
    this.actions$.pipe(ofType(CategoryActions.updateCategorySuccess)).subscribe(() => {
      this.categoryForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(CategoryActions.deleteCategorySuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
