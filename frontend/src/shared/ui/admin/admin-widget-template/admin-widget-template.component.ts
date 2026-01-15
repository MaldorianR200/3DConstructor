import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Routes } from 'src/shared/config/routes';
import { StackComponent } from 'src/shared/ui/app';

interface AdminWidgetTemplateProps {
  title: string;
  widgetsIconPath: string;
  link: string;
  countItems?: number;
  isSingular?: boolean;
}

@Component({
  selector: 'app-admin-widget-template',
  standalone: true,
  imports: [RouterLink, NgIf, StackComponent],
  templateUrl: './admin-widget-template.component.html',
  styleUrl: './admin-widget-template.component.scss',
})
export class AdminWidgetTemplateComponent {
  @Input() props!: AdminWidgetTemplateProps;
  routes = Routes;
}
