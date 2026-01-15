import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-home-about',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './home-about.component.html',
  styleUrl: './home-about.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeAboutComponent implements AfterViewInit, OnInit {
  routes: Routes;
  @ViewChild('videoElement') videoRef: ElementRef<HTMLVideoElement>;
  isMuted = true; // начальное состояние звука
  isTabletVersion: boolean = false;
  isMobileVersion: boolean = false;
  ngOnInit() {
    this.checkScreenSize();
  }

  ngAfterViewInit() {
    if (this.videoRef) {
      this.videoRef.nativeElement.muted = this.isMuted;
    }
  }

  toggleSound() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      this.isMuted = !this.isMuted;
      video.muted = this.isMuted;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const width = window.innerWidth;
    this.isTabletVersion = width > 768 && width <= 1024;
    this.isMobileVersion = width <= 768;
  }
}
