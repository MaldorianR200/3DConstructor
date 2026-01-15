import { Component } from '@angular/core';
import { SeoFormComponent } from '../../../features/SeoPanel/ui/seo-form/seo-form.component';

@Component({
  selector: 'app-admin-seo-page',
  standalone: true,
  imports: [SeoFormComponent],
  templateUrl: './admin-seo-page.component.html',
  styleUrl: './admin-seo-page.component.scss',
})
export class AdminSeoPageComponent {}
