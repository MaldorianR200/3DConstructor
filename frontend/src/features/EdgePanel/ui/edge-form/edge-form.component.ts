import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IEdge, EdgeActions } from 'src/entities/Edge';
import {
  AdminButtonComponent,
  AdminFormComponent,
  AdminInputComponent,
  AdminImagesLoaderMultipleComponent,
  AdminModalComponent
} from 'src/shared/ui/admin';
import { StackComponent } from "src/shared/ui/app";

@Component({
  selector: 'app-edge-form',
  standalone: true,
  imports: [NgIf, AdminFormComponent, AdminInputComponent, AdminButtonComponent, StackComponent, AdminModalComponent, AdminImagesLoaderMultipleComponent],
  templateUrl: './edge-form.component.html',
  styleUrl: './edge-form.component.scss'
})
export class EdgeFormComponent implements OnInit {
  @Input() edge$: BehaviorSubject<IEdge | null> = new BehaviorSubject<IEdge | null>(null);
  isCreate: boolean = false;
  isOpenDelete: boolean = false;
  edgeForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions
  ) {
    this.edgeForm = this.fb.group({
      name: new FormControl(),
      thickness: new FormControl(),
      active: new FormControl(),
      comment: new FormControl(),
    });
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
    const edge: IEdge = this.edgeForm.value;
    this.store.dispatch(EdgeActions.createEdge({ edge }));
  }

  update() {
    const edge: IEdge = this.edgeForm.value;
    edge.id = this.edge$.value?.id;
    this.store.dispatch(EdgeActions.updateEdge({ edge }));
  }

  delete() {
    const edge = this.edge$.value;
    if (edge) {
      this.store.dispatch(EdgeActions.deleteEdge({ id: edge.id! }));
      this.isOpenDelete = false;
    }
  }

  ngOnInit(): void {
    this.edge$.subscribe(item => {
      this.isCreate = !item;
      if (item) {
        this.edgeForm.get('name')?.setValue(item.name);
        this.edgeForm.get('thickness')?.setValue(item.thickness);
        this.edgeForm.get('active')?.setValue(item.active ?? true);
        this.edgeForm.get('comment')?.setValue(item.comment);

      } else {
        this.edgeForm.reset({
          active: true
        });
      }
    });

    this.actions$.pipe(ofType(EdgeActions.createEdgeSuccess)).subscribe(() => {
      this.edgeForm.reset({
          active: true
        });
    });
    this.actions$.pipe(ofType(EdgeActions.updateEdgeSuccess)).subscribe(() => {
      this.edgeForm.reset({
          active: true
        });
      this.router.navigate([], { queryParams: { edit: true } });
    });
    this.actions$.pipe(ofType(EdgeActions.deleteEdgeSuccess)).subscribe(() => {
      this.router.navigate([], { queryParams: { edit: true } });
    });
  }
}
