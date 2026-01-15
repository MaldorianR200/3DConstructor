import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-shelf-warning-overlay',
  standalone: true,
  imports: [NgIf],
  templateUrl: './shelf-warning-overlay.component.html',
  styleUrl: './shelf-warning-overlay.component.scss',
})
export class ShelfWarningOverlayComponent {
  isVisible = false;
  message = '';

  show(message: string): void {
    this.message = message;
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
  }
}
