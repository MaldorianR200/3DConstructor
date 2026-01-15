import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, input } from '@angular/core';

@Component({
  selector: 'app-home-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-overlay.component.html',
  styleUrl: './home-overlay.component.scss',
})
export class HomeOverlayComponent {}
