import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IFasteners } from 'src/entities/Fasteners';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-fasteners-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './fasteners-edit-list.component.html',
  styleUrl: './fasteners-edit-list.component.scss',
})
export class FastenerssEditListComponent {
  @Input() fastenerss$: Observable<IFasteners[]> = new Observable<IFasteners[]>();
  @Input() curEditFasteners$ = new BehaviorSubject<IFasteners | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(fasteners: IFasteners) {
    this.curEditFasteners$.next(fasteners);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
