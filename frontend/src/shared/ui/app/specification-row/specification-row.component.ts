import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-specification-row',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './specification-row.component.html',
  styleUrl: './specification-row.component.scss',
})
export class SpecificationRowComponent {
  @Input() grid: 'grid' | 'short-grid';
}
