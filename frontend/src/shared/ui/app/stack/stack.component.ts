import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
})
export class StackComponent {
  @Input() direction: 'row' | 'column' = 'row';
  @Input() gap: string = '16px';
  @Input() fullWidth: boolean = false;
  @Input() alignItems: string = 'start';
  @Input() justifyContent: string = 'start';
  @Input() wrap: 'wrap' | 'nowrap' = 'nowrap';
  @Input() border?: 'table' | 'none';
}
