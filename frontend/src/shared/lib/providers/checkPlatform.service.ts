import { Injectable, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CheckPlatformService {
  isBrowser: boolean;
  private currentWidth: number;
  private deviceType: 'mobile' | 'tablet' | 'desktop';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentWidth = this.isBrowser ? window.innerWidth : 0;
    this.deviceType = this.getDeviceType(this.currentWidth);

    if (this.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('resize', this.onResize.bind(this));
      });
    }
  }

  initializeDatGui() {
    if (this.isBrowser) {
      // Динамический импорт dat.gui только на клиенте
      import('dat.gui')
        .then((datGuiModule) => {
          const datGui = datGuiModule.default;
          // Ваш код с использованием dat.gui
        })
        .catch((error) => {
          console.error('Failed to load dat.gui', error);
        });
    }
  }

  private onResize(): void {
    if (this.isBrowser) {
      const newWidth = window.innerWidth;
      if (newWidth !== this.currentWidth) {
        this.currentWidth = newWidth;
        this.deviceType = this.getDeviceType(newWidth);
      }
    }
  }

  private getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width <= 767) {
      return 'mobile';
    } else if (width > 767 && width < 1025) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Возвращает текущий тип устройства
  getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    return this.deviceType;
  }

  // Helper methods
  isMobile(): boolean {
    return this.deviceType === 'mobile';
  }

  isTablet(): boolean {
    return this.deviceType === 'tablet';
  }

  isDesktop(): boolean {
    return this.deviceType === 'desktop';
  }
}
