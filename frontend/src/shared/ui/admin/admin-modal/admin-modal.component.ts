import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss',
})
export class AdminModalComponent {
  @Input() isOpen: boolean = false;
  @Output() handleChangeOpen: EventEmitter<void> = new EventEmitter<void>();
}
