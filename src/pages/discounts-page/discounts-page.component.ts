import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PreviewCalculatorComponent } from 'src/widgets/preview-calculator/preview-calculator.component';
import { CubRubComponent } from '../calculator-page/cubrub';

@Component({
  selector: 'app-discounts-page',
  standalone: true,
  imports: [PreviewCalculatorComponent, CubRubComponent],
  templateUrl: './discounts-page.component.html',
  styleUrl: './discounts-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DiscountsPageComponent {}
