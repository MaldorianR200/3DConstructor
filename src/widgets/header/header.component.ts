import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Routes } from 'src/shared/config/routes';
import { CatalogButtonComponent } from '../../shared/ui/app/catalog-button/catalog-button.component';
import { MenuService } from 'src/shared/api/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive, CatalogButtonComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit {
  routes = Routes;
  isOpenDropdown: boolean = false;
  isMenuOpen = false;
  isMobileMenuOpen = false;
  isMobile: boolean = false;
  isTablet: boolean = false;
  isOverlayVisible: boolean = false;

  constructor(
    private router: Router,
    private headerService: MenuService,
  ) {}

  ngOnInit() {
    this.checkScreenSize();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.isMobile) {
        this.isMenuOpen = false; // Закрываем меню
        document.body.style.overflow = 'auto'; // Восстанавливаем прокрутку
      }
    });

    this.headerService.menuState$.subscribe((state) => {
      this.isMenuOpen = state;
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.isMobile) {
        this.headerService.setMenuState(false);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width <= 480;
    this.isTablet = width > 480 && width <= 1080;
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.headerService.toggleMenu();
    this.isOverlayVisible = this.isMenuOpen; // Показать оверлей, когда меню открыто
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';

    const headerElement = document.querySelector('.header-mobile');
    const homeOverlayImg = document.querySelector('.homeOverlay__img');
    const homeOverlayTitle = document.querySelector('.homeOverlay__title');
    if (this.isMenuOpen) {
      headerElement.classList.add('header--open');
      homeOverlayImg.classList.add('stretch');
      homeOverlayTitle.classList.add('hidden');
    } else {
      headerElement.classList.remove('header--open');
      homeOverlayImg.classList.remove('stretch');
      homeOverlayTitle.classList.remove('hidden');
    }
  }

  openDropdown() {
    this.isOpenDropdown = true;
  }

  closeDropdown() {
    this.isOpenDropdown = false;
  }

  toggleDropdown() {
    this.isOpenDropdown = !this.isOpenDropdown;
  }
}
