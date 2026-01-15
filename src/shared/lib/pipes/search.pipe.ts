import { Pipe, PipeTransform } from '@angular/core';
import { formatIsoDate } from '../helpers/formatIsoDate';

@Pipe({
  name: 'filterSearch',
  standalone: true,
})
export class FilterSearchPipe implements PipeTransform {
  transform<T>(items: T[] | null, searchText: string, properties: (keyof T)[]): T[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter((item) =>
      properties.some((prop) => {
        const value = item[prop];
        if (this.isDate(value)) {
          return formatIsoDate(value as Date)
            .toLowerCase()
            .includes(searchText);
        }
        return value != null && value.toString().toLowerCase().includes(searchText);
      }),
    );
  }

  private isDate(value: any): boolean {
    return value instanceof Date || !isNaN(Date.parse(value));
  }
}
