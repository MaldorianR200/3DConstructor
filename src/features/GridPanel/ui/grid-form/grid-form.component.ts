import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGrid, IIGrid, GridActions } from 'src/entities/Grid';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent,
} from 'src/shared/ui/admin';
import { StackComponent } from 'src/shared/ui/app';
import { AdminSelectComponent } from '../../../../shared/ui/admin/admin-select/admin-select.component';
import { GridEntity, GridPages } from 'src/entities/Grid/model/types/grid.model';
import { GridService } from 'src/entities/Grid/model/api/grid.service';

@Component({
  selector: 'app-grid-form',
  standalone: true,
  imports: [
    NgIf,
    AdminFormComponent,
    AdminInputComponent,
    AdminButtonComponent,
    StackComponent,
    AdminModalComponent,
    AdminSelectComponent,
  ],
  templateUrl: './grid-form.component.html',
  styleUrl: './grid-form.component.scss',
})
export class GridFormComponent implements OnInit {
  @Input() grid$: BehaviorSubject<IGrid | null> = new BehaviorSubject<IGrid | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  gridForm: FormGroup;
  gridsPages: string[] = [];
  gridsEntities: string[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions,
    private gridService: GridService,
  ) {
    this.gridForm = this.fb.group({
      page: new FormControl(),
      entityType: new FormControl(),
      categoryId: new FormControl(),
    });
    this.gridsPages = Object.values(GridPages);
    this.gridsEntities = Object.values(GridEntity);
  }

  deleteChangeOpen() {
    this.isOpenDelete = !this.isOpenDelete;
  }

  submit() {
    if (this.isCreate) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    // const grid: IGrid = this.gridForm.value;
    const grid: IGrid = { ...this.gridForm.value, gridItems: [] };
    // const iiGrid = this.gridService.convertToIIGrid(grid);
    // console.log('DEBUG_create:' + iiGrid.grid.gridItems);
    this.store.dispatch(GridActions.createGrid({ grid }));
  }

  update() {
    const grid: IGrid = this.gridForm.value;
    grid.id = this.grid$.value?.id;
    console.log('Update grid: ', grid);
    this.store.dispatch(GridActions.updateGrid({ grid }));
  }

  delete() {
    const grid = this.grid$.value;
    if (grid) {
      this.store.dispatch(GridActions.deleteGrid({ id: grid.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.grid$.subscribe((item) => {
      this.isCreate = !item;
      if (item) {
        this.gridForm.get('page')?.setValue(item.page);
      } else {
        this.gridForm.reset();
      }
    });

    this.actions$.pipe(ofType(GridActions.createGridSuccess)).subscribe(() => {
      this.gridForm.reset();
    });
    this.actions$.pipe(ofType(GridActions.updateGridSuccess)).subscribe(() => {
      this.gridForm.reset();
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(GridActions.deleteGridSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });

    this.gridsPages = Object.keys(GridPages);
  }
}
