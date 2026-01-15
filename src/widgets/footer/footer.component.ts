import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Routes } from 'src/shared/config/routes';
import { FooterCatalogComponent } from './footer-catalog/footer-catalog.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgClass, FooterCatalogComponent, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  isGray: boolean = false;
  showFooterCatalog: boolean = true;

  constructor(private router: Router) {
    this.isGray = this.checkIsGray(this.router.url);
  }

  checkShowFooterCatalog(url: string): boolean {
    return url !== `/${Routes.CALCULATOR}`;
  }
  checkIsGray(url: string): boolean {
    return url === `/${Routes.CATALOG}` || url === `/${Routes.CALCULATOR}`;
  }

  ngOnInit(): void {
    this.showFooterCatalog = this.checkShowFooterCatalog(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isGray = this.checkIsGray(event.url);
        this.showFooterCatalog = this.checkShowFooterCatalog(event.url);
      }
    });
  }

  getNowYear(): number {
    const now = new Date();
    return now.getFullYear();
  }
}
