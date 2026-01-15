import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-table',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './header-table.component.html',
  styleUrl: './header-table.component.scss',
})
export class HeaderTableComponent {
  @Input() grid: 'grid' | 'short-grid' | 'other-grid';
}
