import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { register } from 'swiper/element/bundle';
import { enableProdMode } from '@angular/core';
import { environment } from 'environments/environment';
import { config } from './app/app.config.server';

const bootstrap = () => {
  return bootstrapApplication(AppComponent, config);
};

export default bootstrap;
