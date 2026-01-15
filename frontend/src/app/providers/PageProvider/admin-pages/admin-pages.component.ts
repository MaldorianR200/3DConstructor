import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from 'src/widgets/admin/admin-sidebar/admin-sidebar.component';
import { AppState } from '../../StoreProvider/app.store';
import { Store } from '@ngrx/store';
import { loadLoginFromLocalStorage } from 'src/features/Auth/model/store/auth.actions';
import { getProducts } from 'src/entities/Product/model/store/product.actions';
import { getCategories } from 'src/entities/Category/model/store/category.actions';
import { getGrids } from 'src/entities/Grid/model/store/grid.actions';
import { getColors } from 'src/entities/Color/model/store/color.actions';
import { getNews } from 'src/entities/News/model/store/news.actions';
import { getMaterials } from 'src/entities/Material/model/store/material.actions';
import { getActionsss } from '../../../../entities/Actionss/model/store/actionss.actions';
import { getFastenerss } from '../../../../entities/Fasteners/model/store/fasteners.actions';
import { getFurnitures } from '../../../../entities/Furniture/model/store/furniture.actions';
import { getSeriess } from '../../../../entities/Series/model/store/series.actions';
import { getTypess } from '../../../../entities/Types/model/store/types.actions';
import { getSpecifications } from '../../../../entities/Specification/model/store/specification.actions';
import { getMillings } from '../../../../entities/Milling/model/store/milling.actions';
import { getEdges } from '../../../../entities/Edge/model/store/edge.actions';
import { getCombineMaterials } from '../../../../entities/CombineMaterial/model/store/combineMaterial.actions';

@Component({
  selector: 'app-admin-pages',
  standalone: true,
  imports: [AdminSidebarComponent, RouterOutlet],
  templateUrl: './admin-pages.component.html',
  styleUrl: './admin-pages.component.scss',
})
export class AdminPagesComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadLoginFromLocalStorage());

    this.store.dispatch(getProducts());
    this.store.dispatch(getCategories());
    this.store.dispatch(getGrids());
    this.store.dispatch(getColors());
    this.store.dispatch(getNews());
    this.store.dispatch(getMaterials());
    this.store.dispatch(getActionsss());
    this.store.dispatch(getFastenerss());
    this.store.dispatch(getFurnitures());
    this.store.dispatch(getSeriess());
    this.store.dispatch(getTypess());
    this.store.dispatch(getSpecifications());
    this.store.dispatch(getMillings());
    this.store.dispatch(getEdges());
    this.store.dispatch(getCombineMaterials());
  }
}
