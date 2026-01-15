import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from 'src/entities/User/model/types/user';
import { BASE_URL_STATIC } from 'global';
import { CommonModule, NgFor } from '@angular/common';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-users-edit-list',
  standalone: true,
  imports: [NgFor, CommonModule, StackComponent],
  templateUrl: './users-edit-list.component.html',
  styleUrl: './users-edit-list.component.scss',
})
export class UsersEditListComponent {
  @Input() users$: Observable<IUser[]> = new Observable<IUser[]>();
  @Input() curEditUser$ = new BehaviorSubject<IUser | null>(null);

  baseUrlStatic: string = BASE_URL_STATIC;

  changeCur(product: IUser) {
    this.curEditUser$.next(product);
  }
}
