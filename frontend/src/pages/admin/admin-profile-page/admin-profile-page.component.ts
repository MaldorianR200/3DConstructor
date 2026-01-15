import { Component } from '@angular/core';
import { ProfileFormComponent } from 'src/features/Auth';

@Component({
  selector: 'app-admin-profile-page',
  standalone: true,
  imports: [ProfileFormComponent],
  templateUrl: './admin-profile-page.component.html',
  styleUrl: './admin-profile-page.component.scss',
})
export class AdminProfilePageComponent {}
