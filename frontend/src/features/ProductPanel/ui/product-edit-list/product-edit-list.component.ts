import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IProduct } from 'src/entities/Product';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-product-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './product-edit-list.component.html',
  styleUrl: './product-edit-list.component.scss',
})
export class ProductsEditListComponent {
  @Input() products$: Observable<IProduct[]> = new Observable<IProduct[]>();
  @Input() curEditProduct$ = new BehaviorSubject<IProduct | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(product: IProduct) {
    this.curEditProduct$.next(product);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
