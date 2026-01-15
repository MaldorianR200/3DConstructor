import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-news-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-overlay.component.html',
  styleUrl: './news-overlay.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewsOverlayComponent {}
