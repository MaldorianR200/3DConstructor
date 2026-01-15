import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_VERSION, BASE_URL } from 'global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuState = new BehaviorSubject<boolean>(false);
  menuState$ = this.menuState.asObservable();

  toggleMenu() {
    this.menuState.next(!this.menuState.value);
  }

  setMenuState(state: boolean) {
    this.menuState.next(state);
  }
}
