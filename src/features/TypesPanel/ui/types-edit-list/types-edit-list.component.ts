import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { ITypes } from 'src/entities/Types';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-types-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './types-edit-list.component.html',
  styleUrl: './types-edit-list.component.scss',
})
export class TypessEditListComponent {
  @Input() typess$: Observable<ITypes[]> = new Observable<ITypes[]>();
  @Input() curEditTypes$ = new BehaviorSubject<ITypes | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(types: ITypes) {
    this.curEditTypes$.next(types);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
