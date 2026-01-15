import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGridSettings } from 'src/entities/Grid/model/types/grid.model';
import { GridActions } from 'src/entities/Grid';
import { selectGridSettings } from 'src/entities/Grid/model/store/grid.selectors';
import { BlobOptions } from 'buffer';
import { loadGridSettingsFromLocalStorage } from 'src/entities/Grid/model/store/grid.actions';
import { LOCAL_STORAGE_GRID_SETTINGS } from 'src/shared/const/localstorage';
import { BrowserStorageService } from 'src/shared/lib/providers/localstorage.service';
import { Observable } from 'rxjs';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';

@Component({
  selector: 'app-grid-settings',
  templateUrl: './GridSettings.component.html',
  styleUrls: ['./GridSettings.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class GridSettingsComponent {
  settingsForm: FormGroup;
  isAdmin$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private storageService: BrowserStorageService,
  ) {
    const settings = JSON.parse(this.storageService.getItem(LOCAL_STORAGE_GRID_SETTINGS) || 'null');
    this.settingsForm = this.fb.group({
      dragging: new FormControl(!!settings?.dragging),
      resizing: new FormControl(!!settings?.resizing),
      zIndex: new FormControl(!!settings?.zIndex),
      deleting: new FormControl(!!settings?.deleting),
    });

    this.store.dispatch(loadGridSettingsFromLocalStorage());

    this.settingsForm.valueChanges.subscribe(() => {
      this.onFormChange();
    });

    this.isAdmin$ = this.store.select(selectIsAdmin);
    this.isAdmin$.subscribe((item) => {
      console.log('Selector isAdmin: ' + item);
    });
  }

  onFormChange() {
    this.store.dispatch(GridActions.setGridSettings({ settings: this.settingsForm.value }));
  }
}
