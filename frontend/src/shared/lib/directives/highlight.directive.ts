import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight: string = '';
  @Input() search: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnChanges() {
    if (!this.search) {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', this.appHighlight);
      return;
    }

    const regex = new RegExp(`(${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = this.appHighlight.split(regex);
    if (parts.length === 1) {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', parts[0]);
      return;
    }

    const fragment = this.document.createDocumentFragment();
    parts.forEach((part, index) => {
      if (regex.test(part)) {
        const span = this.renderer.createElement('span');
        this.renderer.addClass(span, 'highlight');
        this.renderer.appendChild(span, this.renderer.createText(part));
        fragment.appendChild(span);
      } else {
        fragment.appendChild(this.document.createTextNode(part));
      }
    });

    this.renderer.setProperty(this.el.nativeElement, 'textContent', '');
    this.el.nativeElement.appendChild(fragment);
  }
}
