import { Component } from '@angular/core';
import { HomeOverlayComponent } from './home-overlay';
import { PreviewCalculatorComponent } from 'src/widgets/preview-calculator';
import { CatalogButtonComponent } from 'src/shared/ui/app';
import { CatalogPageComponent } from '../catalog-page/catalog-page.component';
import { AboutPageComponent } from '../about-page/about-page.component';
import { HomeAboutComponent } from './home-about/home-about.component';
import { HomeCatalogComponent } from './home-catalog/home-catalog.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HomeOverlayComponent,
    PreviewCalculatorComponent,
    CatalogButtonComponent,
    CatalogPageComponent,
    AboutPageComponent,
    HomeAboutComponent,
    HomeCatalogComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
