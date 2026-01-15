import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-change-action',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './admin-change-action.component.html',
  styleUrl: './admin-change-action.component.scss',
})
export class AdminChangeActionComponent {
  @Input() isEdit: boolean = false;
}
