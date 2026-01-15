import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IGrid } from 'src/entities/Grid';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-grid-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './grid-edit-list.component.html',
  styleUrl: './grid-edit-list.component.scss',
})
export class GridsEditListComponent {
  @Input() grids$: Observable<IGrid[]> = new Observable<IGrid[]>();
  @Input() curEditGrid$ = new BehaviorSubject<IGrid | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(grid: IGrid) {
    this.curEditGrid$.next(grid);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
