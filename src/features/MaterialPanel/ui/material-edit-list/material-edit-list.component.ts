import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { IMaterial } from 'src/entities/Material';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-material-edit-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterSearchPipe,
    AdminSearchComponent,
    StackComponent,
    HighlightDirective,
  ],
  templateUrl: './material-edit-list.component.html',
  styleUrl: './material-edit-list.component.scss',
})
export class MaterialsEditListComponent {
  @Input() materials$: Observable<IMaterial[]> = new Observable<IMaterial[]>();
  @Input() curEditMaterial$ = new BehaviorSubject<IMaterial | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(material: IMaterial) {
    this.curEditMaterial$.next(material);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
