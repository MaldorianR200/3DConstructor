import { Component, OnInit } from '@angular/core';
import { UserPanelComponent } from 'src/features/UserPanel';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { getUsers } from 'src/entities/User/model/store/user.actions';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [UserPanelComponent],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(getUsers());
  }
}
