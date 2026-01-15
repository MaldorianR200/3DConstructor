import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IMilling } from 'src/entities/Milling';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from "src/shared/ui/admin";
import { StackComponent } from "src/shared/ui/app";

@Component({
  selector: 'app-milling-edit-list',
  standalone: true,
  imports: [CommonModule, FilterSearchPipe, AdminSearchComponent, StackComponent, HighlightDirective],
  templateUrl: './milling-edit-list.component.html',
  styleUrl: './milling-edit-list.component.scss'
})
export class MillingsEditListComponent {
  @Input() millings$: Observable<IMilling[]> = new Observable<IMilling[]>();
  @Input() curEditMilling$ = new BehaviorSubject<IMilling | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(milling: IMilling) {
    this.curEditMilling$.next(milling)
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
