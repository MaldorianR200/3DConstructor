import { Component, EventEmitter, Output } from '@angular/core';
import { AdminInputComponent } from '../admin-input/admin-input.component';

@Component({
  selector: 'app-admin-search',
  standalone: true,
  imports: [AdminInputComponent],
  templateUrl: './admin-search.component.html',
  styleUrl: './admin-search.component.scss',
})
export class AdminSearchComponent {
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }
}
