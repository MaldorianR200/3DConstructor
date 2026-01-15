import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IProduct, ProductSelectors } from 'src/entities/Product';
import { StackComponent } from 'src/shared/ui/app';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductsEditListComponent } from '../product-edit-list/product-edit-list.component';
import { AdminChangeActionComponent } from 'src/shared/ui/admin/admin-change-action/admin-change-action.component';

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [
    ProductFormComponent,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    ProductsEditListComponent,
    AdminChangeActionComponent,
  ],
  templateUrl: './product-panel.component.html',
  styleUrl: './product-panel.component.scss',
})
export class ProductPanelComponent implements OnInit {
  isEdit: boolean = false;
  products$: Observable<IProduct[]>;
  curEditProduct$ = new BehaviorSubject<IProduct | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const productId = parseInt(queryParams['id'], 0);
      if (this.isEdit && productId) {
        this.store.select(ProductSelectors.selectProductById(productId)).subscribe((product) => {
          if (product) {
            this.curEditProduct$.next(product);
          }
        });
      } else {
        this.curEditProduct$.next(null);
      }
    });

    this.curEditProduct$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
