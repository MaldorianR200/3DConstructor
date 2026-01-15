import { Component } from '@angular/core';
import { LogListComponent } from 'src/entities/Log/ui/log-list/log-list.component';

@Component({
  selector: 'app-admin-history-page',
  standalone: true,
  imports: [LogListComponent],
  templateUrl: './admin-history-page.component.html',
  styleUrl: './admin-history-page.component.scss',
})
export class AdminHistoryPageComponent {}
