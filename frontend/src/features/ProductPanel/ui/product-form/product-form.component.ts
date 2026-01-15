import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IProduct, ProductActions } from 'src/entities/Product';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-product-form',
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
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  @Input() product$: BehaviorSubject<IProduct | null> = new BehaviorSubject<IProduct | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  productForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
  ) {
    this.productForm = this.fb.group({
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
    const product: IProduct = this.productForm.value;
    this.store.dispatch(ProductActions.createProduct({ product }));
  }

  update() {
    const product: IProduct = this.productForm.value;
    product.id = this.product$.value?.id;
    this.store.dispatch(ProductActions.updateProduct({ product }));
  }

  delete() {
    const product = this.product$.value;
    if (product) {
      this.store.dispatch(ProductActions.deleteProduct({ id: product.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.product$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.productForm.get('name')?.setValue(item.name);
        // this.productForm.get('images')?.setValue(item.images);
      } else {
        this.productForm.reset();
      }
    });

    this.actions$.pipe(ofType(ProductActions.createProductSuccess)).subscribe(() => {
      this.productForm.reset();
    });
    this.actions$.pipe(ofType(ProductActions.updateProductSuccess)).subscribe(() => {
      this.productForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(ProductActions.deleteProductSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
