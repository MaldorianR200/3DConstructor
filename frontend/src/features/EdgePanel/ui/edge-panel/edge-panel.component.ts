import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IEdge, EdgeSelectors } from 'src/entities/Edge';
import { StackComponent } from "src/shared/ui/app";
import { EdgeFormComponent } from "../edge-form/edge-form.component";
import { EdgesEditListComponent } from "../edge-edit-list/edge-edit-list.component";
import { AdminChangeActionComponent } from "src/shared/ui/admin/admin-change-action/admin-change-action.component";

@Component({
  selector: 'app-edge-panel',
  standalone: true,
  imports: [EdgeFormComponent, CommonModule, ReactiveFormsModule, StackComponent, EdgesEditListComponent, AdminChangeActionComponent],
  templateUrl: './edge-panel.component.html',
  styleUrl: './edge-panel.component.scss'
})
export class EdgePanelComponent implements OnInit {
  isEdit: boolean = false;
  edges$: Observable<IEdge[]>
  curEditEdge$ = new BehaviorSubject<IEdge | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<AppState>) {
    this.edges$ = this.store.select(EdgeSelectors.selectAllEdges);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.isEdit = queryParams['edit'];

      const edgeId = parseInt(queryParams['id'], 0)
      if (this.isEdit && edgeId) {
        this.store.select(EdgeSelectors.selectEdgeById(edgeId)).subscribe(edge => {
          if (edge) {
            this.curEditEdge$.next(edge);
          }
        });
      } else {
        this.curEditEdge$.next(null);
      }
    });

    this.curEditEdge$.subscribe(item => {
      if (item) {
        this.router.navigate([], { queryParams: { edit: true, id: item.id } });
      }
    })
  }
}

