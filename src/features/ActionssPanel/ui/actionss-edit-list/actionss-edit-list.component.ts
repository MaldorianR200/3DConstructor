import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IActionss } from 'src/entities/Actionss';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-actionss-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './actionss-edit-list.component.html',
  styleUrl: './actionss-edit-list.component.scss',
})
export class ActionsssEditListComponent {
  @Input() actionsss$: Observable<IActionss[]> = new Observable<IActionss[]>();
  @Input() curEditActionss$ = new BehaviorSubject<IActionss | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(actionss: IActionss) {
    this.curEditActionss$.next(actionss);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
