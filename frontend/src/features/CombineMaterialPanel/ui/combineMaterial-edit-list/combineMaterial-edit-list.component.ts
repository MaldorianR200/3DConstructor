import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL_STATIC } from 'global';
import { ICombineMaterial } from 'src/entities/CombineMaterial';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from "src/shared/ui/admin";
import { StackComponent } from "src/shared/ui/app";

@Component({
  selector: 'app-combineMaterial-edit-list',
  standalone: true,
  imports: [CommonModule, FilterSearchPipe, AdminSearchComponent, StackComponent, HighlightDirective],
  templateUrl: './combineMaterial-edit-list.component.html',
  styleUrl: './combineMaterial-edit-list.component.scss'
})
export class CombineMaterialsEditListComponent {
  @Input() combineMaterials$: Observable<ICombineMaterial[]> = new Observable<ICombineMaterial[]>();
  @Input() curEditCombineMaterial$ = new BehaviorSubject<ICombineMaterial | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;
  searchText: string = '';

  changeCur(combineMaterial: ICombineMaterial) {
    this.curEditCombineMaterial$.next(combineMaterial)
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }
}
