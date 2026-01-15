import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PreviewCalculatorComponent } from 'src/widgets/preview-calculator';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, PreviewCalculatorComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CatalogPageComponent {}
