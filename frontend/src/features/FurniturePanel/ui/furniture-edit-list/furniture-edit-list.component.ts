import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IFurniture } from 'src/entities/Furniture';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-furniture-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './furniture-edit-list.component.html',
  styleUrl: './furniture-edit-list.component.scss',
})
export class FurnituresEditListComponent {
  @Input() furnitures$: Observable<IFurniture[]> = new Observable<IFurniture[]>();
  @Input() curEditFurniture$ = new BehaviorSubject<IFurniture | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(furniture: IFurniture) {
    this.curEditFurniture$.next(furniture);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
