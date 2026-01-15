import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-button',
  standalone: true,
  imports: [],
  templateUrl: './admin-button.component.html',
  styleUrl: './admin-button.component.scss',
})
export class AdminButtonComponent {
  @Input() variant: '' | 'gray' | 'red' = '';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Output() handleClick: EventEmitter<void> = new EventEmitter<void>();

  onClick(): void {
    this.handleClick.emit();
  }
}
