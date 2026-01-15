import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscribable, map } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { CategorySelectors } from 'src/entities/Category';
import { NewsSelectors } from 'src/entities/News';
import { ProductSelectors } from 'src/entities/Product';
import { GridSelectors } from 'src/entities/Grid';
import { Routes } from 'src/shared/config/routes';
import { AdminWidgetTemplateComponent } from 'src/shared/ui/admin';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';
import { MaterialSelectors } from 'src/entities/Material';
import { EdgeSelectors } from 'src/entities/Edge';
import { ColorSelectors } from 'src/entities/Color';
import { FurnitureSelectors } from 'src/entities/Furniture';
import { FastenersSelectors } from 'src/entities/Fasteners';
import { ActionssSelectors } from 'src/entities/Actionss';
import { TypesSelectors } from 'src/entities/Types';
import { SeriesSelectors } from 'src/entities/Series';
import { SpecificationSelectors } from 'src/entities/Specification';
import { MillingSelectors } from 'src/entities/Milling';
import { CombineMaterialSelectors } from 'src/entities/CombineMaterial';

@Component({
  selector: 'app-admin-main-page',
  standalone: true,
  imports: [AdminWidgetTemplateComponent, CommonModule, RouterOutlet],
  templateUrl: './admin-main-page.component.html',
  styleUrl: './admin-main-page.component.scss',
})
export class AdminMainPageComponent implements OnInit {
  routes = Routes;
  productsCount$: Observable<number>;
  categoriesCount$: Observable<number>;
  newsCount$: Observable<number> | Subscribable<number> | Promise<number>;
  materialsCount$: Observable<number>;
  edgesCount$: Observable<number>;
  colorsCount$: Observable<number>;
  furnituresCount$: Observable<number>;
  fastenersCount$: Observable<number>;
  actionsCount$: Observable<number>;
  typesCount$: Observable<number>;
  seriesCount$: Observable<number>;
  specificationsCount$: Observable<number>;
  millingsCount$: Observable<number>;
  combine_materialsCount$: Observable<number>;

  constructor(private store: Store<AppState>) {
    this.productsCount$ = this.store.select(ProductSelectors.selectProductsCount);
    this.categoriesCount$ = this.store.select(CategorySelectors.selectCategoriesCount);
    this.newsCount$ = this.store.select(NewsSelectors.selectNewsCount);
    this.materialsCount$ = this.store.select(MaterialSelectors.selectMaterialsCount);
    this.edgesCount$ = this.store.select(EdgeSelectors.selectEdgesCount);
    this.colorsCount$ = this.store.select(ColorSelectors.selectColorsCount);
    this.furnituresCount$ = this.store.select(FurnitureSelectors.selectFurnituresCount);
    this.fastenersCount$ = this.store.select(FastenersSelectors.selectFastenerssCount);
    this.actionsCount$ = this.store.select(ActionssSelectors.selectActionsssCount);
    this.typesCount$ = this.store.select(TypesSelectors.selectTypessCount);
    this.seriesCount$ = this.store.select(SeriesSelectors.selectSeriessCount);
    this.specificationsCount$ = this.store.select(SpecificationSelectors.selectSpecificationsCount);
    this.millingsCount$ = this.store.select(MillingSelectors.selectMillingsCount);
    this.combine_materialsCount$ = this.store.select(CombineMaterialSelectors.selectCombineMaterialsCount);

    this.store.select(selectIsAdmin).subscribe((item) => console.log(item));
  }
  ngOnInit(): void {}
}
