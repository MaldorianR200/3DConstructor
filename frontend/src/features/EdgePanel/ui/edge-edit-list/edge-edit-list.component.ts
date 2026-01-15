import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IEdge } from 'src/entities/Edge';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from "src/shared/ui/admin";
import { StackComponent } from "src/shared/ui/app";

@Component({
  selector: 'app-edge-edit-list',
  standalone: true,
  imports: [CommonModule, FilterSearchPipe, AdminSearchComponent, StackComponent, HighlightDirective],
  templateUrl: './edge-edit-list.component.html',
  styleUrl: './edge-edit-list.component.scss'
})
export class EdgesEditListComponent {
  @Input() edges$: Observable<IEdge[]> = new Observable<IEdge[]>();
  @Input() curEditEdge$ = new BehaviorSubject<IEdge | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(edge: IEdge) {
    this.curEditEdge$.next(edge)
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
