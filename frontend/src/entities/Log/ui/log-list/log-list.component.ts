import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import * as LogSelectors from '../../model/store/log.selectors';
import { ILog } from '../../model/types/log.model';
import { getLogs } from '../../model/store/log.actions';
import { formatIsoDate } from 'src/shared/lib/helpers/formatIsoDate';
import { FilterSearchPipe } from 'src/shared/lib/pipes/search.pipe';
import { HighlightDirective } from 'src/shared/lib/directives/highlight.directive';
import { AdminSearchComponent } from 'src/shared/ui/admin';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [CommonModule, FilterSearchPipe, HighlightDirective, AdminSearchComponent],
  templateUrl: './log-list.component.html',
  styleUrl: './log-list.component.scss',
})
export class LogListComponent implements OnInit {
  logs$: Observable<ILog[]>;
  mapperText: Record<string, string> = {
    authentication: 'Вошел в систему',
    create: 'Создание',
    delete: 'Удаление',
    update: 'Редактирование',
    upload: 'Загрузка',
    catalog: 'каталога',
    user: 'пользователя',
    'photo.gallery': 'фотогаллереи',
    price_list: 'прайс-листа',
    'update.self': 'Обновил свои данные',
    'delete.self': 'Удалил свой аккаунт',
    login: '',
  };
  searchText: string = '';

  constructor(private store: Store<AppState>) {
    this.logs$ = this.store.select(LogSelectors.selectAllLogs);
  }

  mapper(log: ILog): string[] {
    let type = '',
      name = '';

    if (log.type.includes('self')) return [this.mapperText[log.type], ''];

    if (this.mapperText[log.type]) type = this.mapperText[log.type];

    if (this.mapperText[log.name]) name = this.mapperText[log.name];

    return [type, name];
  }

  handleFormatDate(date: Date): string {
    return formatIsoDate(date);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
  }

  ngOnInit(): void {
    this.store.dispatch(getLogs());
  }
}
