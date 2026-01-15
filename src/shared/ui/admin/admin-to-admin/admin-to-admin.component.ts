import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Routes } from 'src/shared/config/routes';

@Component({
  selector: 'app-admin-to-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-to-admin.component.html',
  styleUrl: './admin-to-admin.component.scss',
})
export class AdminToAdminComponent {
  routes = Routes;
}
