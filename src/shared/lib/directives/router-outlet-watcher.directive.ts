import { Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, Event, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appRouterOutletWatcher]',
  standalone: true,
})
export class RouterOutletWatcherDirective implements AfterViewInit, OnDestroy {
  private routerSubscription!: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngAfterViewInit() {
    this.checkRouterOutlet();

    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.checkRouterOutlet();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRouterOutlet() {
    const hasContent = this.activatedRoute.firstChild !== null;

    if (hasContent) {
      this.renderer.removeClass(this.el.nativeElement, 'empty');
      this.renderer.addClass(this.el.nativeElement, 'notEmpty');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'notEmpty');
      this.renderer.addClass(this.el.nativeElement, 'empty');
    }
  }
}
