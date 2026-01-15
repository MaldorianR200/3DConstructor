import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-meta-tags-provider',
  standalone: true,
  template: '',
})
export class MetaTagsProviderComponent implements OnInit {
  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  private updateMetaTags(title: string, description: string) {
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'title', content: title });
  }

  private getChildRoute(activatedRoute: ActivatedRoute): ActivatedRoute {
    return activatedRoute.firstChild
      ? this.getChildRoute(activatedRoute.firstChild)
      : activatedRoute;
  }

  private getRouteData() {
    this.getChildRoute(this.activatedRoute).data.subscribe((data) => {
      let { item, title, description } = data;

      if (item) {
        // Отдельные страницы сущностей
        title = title.replace('ITEM_NAME', item.name);
        description = description.replace('ITEM_NAME', item.name);
      }

      if (title && description) {
        this.updateMetaTags(title, description);
      }
    });
  }

  private subscribeToRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getRouteData();
      }
    });
  }

  ngOnInit(): void {
    this.getRouteData();
    this.subscribeToRouterEvents();
  }
}
