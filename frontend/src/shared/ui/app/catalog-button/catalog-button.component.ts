import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MenuService } from 'src/shared/api/menu.service';

@Component({
  selector: 'app-catalog-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-button.component.html',
  styleUrl: './catalog-button.component.scss',
})
export class CatalogButtonComponent implements OnInit {
  isMenuOpen: boolean;
  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.menuState$.subscribe((menu) => {
      this.isMenuOpen = !menu;
    });
  }
}
