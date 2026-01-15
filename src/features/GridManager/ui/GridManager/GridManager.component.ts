import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BASE_URL_STATIC } from 'global';
import { Observable, startWith, Subscription, take } from 'rxjs';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { IGrid } from 'src/entities/Grid';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import Swiper from 'swiper';
import { SwiperContainer } from 'swiper/element';
import { GridConfig } from 'src/entities/Grid/model/types/grid.config';
import { GridTypes, IGridConfig, GridActions, GridSelectors } from 'src/entities/Grid';
import { AdminButtonComponent } from 'src/shared/ui/admin';
import { GridComponent } from '../Grid/Grid.component';
import { GridCellsService } from '../../model/GridCells.service';
import { GridEntitiesComponent } from '../GridEntities/GridEntities.component';
import { GridSettingsComponent } from '../GridSettings/GridSettings.component';
import { selectIsAdmin } from 'src/features/Auth/model/store/auth.selectors';
import { AuthService } from 'src/features/Auth';

@Component({
  selector: 'app-grid-manager',
  standalone: true,
  imports: [
    CommonModule,
    GridComponent,
    AdminButtonComponent,
    GridEntitiesComponent,
    GridSettingsComponent,
  ],
  templateUrl: './GridManager.component.html',
  styleUrls: ['./GridManager.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridManagerComponent implements OnInit, OnDestroy {
  @Input() gridId: number;
  @Input() type: GridTypes; // Input для типа сетки
  @Input() items: any[];
  // @Input() visibleItemsCount: number;

  // entities$: Observable<any[]>;
  entities$: Observable<any[]>;
  grid: IGrid;
  gridTypes = GridTypes;
  // isAdmin = false;
  isAdmin$: Observable<boolean>;
  currentScreenType: GridTypes;

  config: IGridConfig;
  baseUrlStatic: string = BASE_URL_STATIC;
  swiperInstance: Swiper | null = null;

  private subscription: Subscription = new Subscription();

  constructor(
    private store: Store<AppState>,
    private checkPlatformService: CheckPlatformService,
    public gridCellsService: GridCellsService,
  ) {
    this.isAdmin$ = this.store.select(selectIsAdmin);
    // DEBUG
    // this.isAdmin$.subscribe((item) => {
    //   console.log('Selector isAdmin: ' + item);
    // });
  }

  ngOnInit(): void {
    this.determineScreenType();

    this.store.select(GridSelectors.selectGridById(this.gridId)).subscribe((grid) => {
      // console.log('DEBUG_Selected grid:', grid);
      this.grid = grid;
      this.updateConfig();
    });

    window.addEventListener('resize', () => {
      this.determineScreenType();
    });
  }

  determineScreenType() {
    console.log(this.checkPlatformService.isMobile());
    if (this.checkPlatformService.isMobile()) {
      this.currentScreenType = GridTypes.MOBILE;
    } else if (this.checkPlatformService.isTablet()) {
      this.currentScreenType = GridTypes.TABLET;
    } else {
      this.currentScreenType = GridTypes.DESKTOP;
    }
  }

  initializeSwipers() {
    const swiperEl = document.querySelector('.grids') as SwiperContainer;
    swiperEl?.initialize();
    this.swiperInstance = swiperEl?.swiper;
  }

  updateConfig() {
    this.config = GridConfig[this.grid.entityType];
    this.store.dispatch(this.config.getAction());
    this.entities$ = this.store.select(this.config.selectAll);

    this.subscription.add(
      this.entities$.subscribe(() => {
        if (this.checkPlatformService.isBrowser) {
          this.initializeSwipers();
        }
      }),
    );
  }

  // save() {
  //   this.store
  //     .select(GridSelectors.selectGridById(this.gridId))
  //     .subscribe((item) => {
  //       // console.log('ITEM: ' + item);
  //       this.store.dispatch(GridActions.updateGrid({ grid: item }));
  //     })
  //     .unsubscribe();
  // }
  save() {
    console.log('ID_GRID:' + this.gridId);

    this.store
      .select(GridSelectors.selectGridById(this.gridId))
      .pipe(take(1)) // Используем take(1) для подписки, чтобы избежать утечек памяти
      .subscribe((item) => {
        console.log(item, '<- метод save() в GridManager');
        if (item) {
          // Вносим измененяи в сетку
          this.store.dispatch(GridActions.updateGrid({ grid: item }));
        } else {
          console.error('Сетка не найдена');
        }
      });
  }

  isCurrentScreenType(type: GridTypes): boolean {
    return this.currentScreenType === type;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
