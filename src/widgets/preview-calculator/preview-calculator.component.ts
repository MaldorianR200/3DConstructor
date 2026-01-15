import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-preview-calculator',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './preview-calculator.component.html',
  styleUrl: './preview-calculator.component.scss',
})
export class PreviewCalculatorComponent {
  routes = Routes;
}
