import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Routes } from 'src/shared/config/routes';
@Component({
  selector: 'app-footer-catalog',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './footer-catalog.component.html',
  styleUrl: './footer-catalog.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterCatalogComponent {
  routes: Routes;
  catalogTitle: string = 'Каталог товаров';

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (window.innerWidth <= 768) {
      this.catalogTitle = 'Каталог';
    } else {
      this.catalogTitle = 'Каталог товаров';
    }
  }
}
