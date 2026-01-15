import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IUser, UserSelectors } from 'src/entities/User';
import { StackComponent } from 'src/shared/ui/app';
import { AdminSelectComponent, AdminChangeActionComponent } from 'src/shared/ui/admin';
import { UsersEditListComponent } from '../users-edit-list/users-edit-list.component';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    ReactiveFormsModule,
    StackComponent,
    AdminChangeActionComponent,
    UsersEditListComponent,
    UserFormComponent,
    AdminSelectComponent,
  ],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent implements OnInit {
  isEdit: boolean = false;
  users$: Observable<IUser[]>;
  curEditUser$: BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.users$ = this.store.select(UserSelectors.selectAllUsers);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const userId = parseInt(queryParams['id'], 0);
      if (this.isEdit && userId) {
        this.store.select(UserSelectors.selectUserById(userId)).subscribe((user) => {
          if (user) {
            this.curEditUser$.next(user);
          }
        });
      } else {
        this.curEditUser$.next(null);
      }
    });

    this.curEditUser$.subscribe((item) => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    });
  }
}
