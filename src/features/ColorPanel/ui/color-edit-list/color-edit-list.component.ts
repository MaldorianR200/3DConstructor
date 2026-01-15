import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IColor } from 'src/entities/Color';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-color-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './color-edit-list.component.html',
  styleUrl: './color-edit-list.component.scss',
})
export class ColorsEditListComponent {
  @Input() colors$: Observable<IColor[]> = new Observable<IColor[]>();
  @Input() curEditColor$ = new BehaviorSubject<IColor | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(color: IColor) {
    this.curEditColor$.next(color);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
  getColorStyle(color: IColor) {
    return { 'background-color': color.hex.startsWith('#') ? color.hex : `#${color.hex}` };
  }
}
