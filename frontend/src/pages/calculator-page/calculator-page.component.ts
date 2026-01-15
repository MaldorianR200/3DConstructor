import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomDimensions } from './ui/сabinet/model/RoomDimensions';
import { SceneManagerService } from './ui/services/SceneManager.service';
import { CheckPlatformService } from 'src/shared/lib/providers/checkPlatform.service';
import { trigger, style, transition, animate } from '@angular/animations';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

import { ShelfControlComponent } from './ui/сabinet/controllers/shelf-control';
import { MullionControlComponent } from './ui/сabinet/controllers/mullion-control';
import { CabinetGridManagerService } from './ui/services/CabinetGridManagerService.service';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { CabinetFactory } from './ui/сabinet/objects/factorys/cabinetFactory';
import {
  DEEP_DRAVER_IN_CABINET,
  DEPTH_EDGE_04MM,
  DEPTH_ROOM,
  DEPTH_WIDTH_INTG_HADLE,
  DRAVER_MIN_POSITION,
  HEIGHT_ROOM,
  INTERVAL_1_MM,
  PODIUM_HEIGHT,
  SHELF_HEIGHT,
  SHELF_MAX_TOP_POSITION,
  SHELF_MIN_POSITION,
  SHELF_POSITION_OFFSET,
  TOLERANCE,
  WALL_THICKNESS,
  WIDTH_ROOM,
} from './ui/сabinet/constants';
import { UInterface } from './ui/сabinet/interface/UInterface';
import { CabinetService } from './ui/services/CabinetService.service';
import { UIService } from './ui/services/UIService.service';
import { selectAllCabinets } from 'src/entities/Cabinet/model/store/cabinet.selectors';
import { CabinetActions, ICabinet } from 'src/entities/Cabinet';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { filter, Observable } from 'rxjs';
import { RoundedBoxGeometry } from 'three-stdlib';
import { IntersectionManagerService } from './ui/services/IntersectionManagerService.service';
import { ShelfType } from './ui/сabinet/model/Shelf';
import { BaseCabinet } from './ui/сabinet/cabinetTypes/BaseCabinet';
import { DrawerControlComponent } from './ui/сabinet/controllers/drawer-control';
import {
  calculateDrawerElements,
  Drawer,
  DrawerBlock,
  DrawerSizeMap,
} from './ui/сabinet/model/Drawers';

import { IHandle, PositionCutout } from './ui/сabinet/model/Facade';
import { FacadeControllerComponent } from './ui/сabinet/controllers/facade-controller';
import { MirrorControllerComponent } from './ui/сabinet/controllers/mirror-control';
import { RodControlComponent } from './ui/сabinet/controllers/rod-control';
import { CabinetSubType, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { Position } from './ui/сabinet/model/BaseModel';
import { getMinShelfPosition } from './ui/сabinet/objects/managers/ShelfManager/ShelfMove';
import { DragHandlerService } from './ui/сabinet/objects/managers/DragHandlerServices/DragHandlerService.service';
import { SectionControllerComponent } from './ui/сabinet/controllers/section-controller';
import { SectionManagerService } from './ui/services/section/SectionManagerServcice.service';
import { SectionInteractionService } from './ui/services/section/SectionInteractionService.service';
import { snapDrawerBlockPosition } from './ui/сabinet/objects/managers/DrawerManager/ShelfPosition.utils';
import {
  DrawerWarningAction,
  DrawerWarningOverlayComponent,
} from './ui/сabinet/warnings/drawer-warning-overlay/drawer-warning-overlay.component';
import {
  DrawerWarningData,
  DrawerWarningService,
} from './ui/services/warnings/DrawerWarningService.service';
import { Subsection } from './ui/сabinet/model/Subsection';
import { MullionShelfInteractionService } from './ui/сabinet/objects/managers/MullionManager/MullionShelfInteractionService.service';
import { ShelfWarningOverlayComponent } from './ui/сabinet/warnings/shelf-warning-overlay';
import { ShelfWarningService } from './ui/services/warnings/ShelfWarningService.service';
import { CubRubComponent } from './cubrub';

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShelfControlComponent,
    MullionControlComponent,
    DrawerControlComponent,
    DrawerWarningOverlayComponent,
    FacadeControllerComponent,
    MirrorControllerComponent,
    RodControlComponent,
    SectionControllerComponent,
    CubRubComponent,
  ],

  templateUrl: './calculator-page.component.html',
  styleUrls: ['./calculator-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CalculatorPageComponent implements OnInit, OnDestroy {
  // OnDestroy
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(DrawerWarningOverlayComponent) drawerWarningOverlay!: DrawerWarningOverlayComponent;
  @ViewChild(ShelfWarningOverlayComponent) shelfWarningOverlay!: ShelfWarningOverlayComponent;
  private roomDimensions: RoomDimensions = {
    width: WIDTH_ROOM,
    height: HEIGHT_ROOM,
    depth: DEPTH_ROOM,
  };
  // private SceneManagerService!: SceneManagerService;
  private dragControls!: DragControls;

  private ui!: UInterface;
  private isInterfaceInitialized: boolean = false;
  public hideUI = false;

  private collidingObjects: Set<THREE.Object3D> = new Set();
  public selectedShelf: THREE.Object3D | null = null;
  public selectedMullion: THREE.Object3D | null = null;
  public selectedDrawerBlock: THREE.Object3D | null = null;
  public selectedRod: THREE.Object3D | null = null;
  public selectedDoor: THREE.Object3D | null = null;
  public selectedMirror: THREE.Object3D | null = null;
  public selectedHandle: THREE.Object3D | null = null;

  public idShelf: number | null = null;
  public mirrorsEnabled: boolean = false;

  hasRodState: boolean = false;
  rodSideState: 'left' | 'right' | 'full' | null = null;

  private mouseStartPos: THREE.Vector2 = new THREE.Vector2();
  private shelfStartPos: THREE.Vector3 = new THREE.Vector3(); // Используем Vector3 для хранения начальной позиции
  private mullionStartPos: THREE.Vector3 = new THREE.Vector3(); // Используем Vector3 для хранения начальной позиции
  private drawerBlockStartPos: THREE.Vector3 = new THREE.Vector3();
  private doorStartPos: THREE.Vector3 = new THREE.Vector3();
  private mirrorStartPos: THREE.Vector3 = new THREE.Vector3();
  public selectedSection: 'left' | 'right' | 'center' | null = null;
  private sectionStartPos: THREE.Vector3 = new THREE.Vector3();

  private isDragging = false; // Флаг для отслеживания состояния перетаскивания
  private isCameraControlActive = true; // Флаг для управления активностью камеры

  private collidingShelves: Set<THREE.Object3D> = new Set(); // Для отслеживания пересекающихся полок
  private collidingMullions: Set<THREE.Object3D> = new Set();
  private collidingDrawers: Set<THREE.Object3D> = new Set();

  public selectedObject: THREE.Object3D | null = null;

  public cabinets$!: Observable<ICabinet[]>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,

    public sceneManagerService: SceneManagerService,
    private drawerWarningService: DrawerWarningService,
    private shelfWarningService: ShelfWarningService,
    private dragHandlerService: DragHandlerService,
    private checkPlatformService: CheckPlatformService,
    private intersectionManager: IntersectionManagerService,
    private sectionInteractionService: SectionInteractionService,
    private mullionShelfInteractionService: MullionShelfInteractionService,
    private uiService: UIService,
  ) {
    // this.store.select(selectAllCabinets).subscribe((cabinets) => {
    // if (cabinets.length > 0) {
    //   this.setCabinet(new Cabinet(this.scene, this.camera, cabinets[0]));
    // }
    // });
  }

  // createCabinet(cabinet: ICabinet) {
  //   this.store.dispatch(CabinetActions.createCabinet({ cabinet }));
  //   this.sceneManagerService.setCabinet(
  //     new Cabinet(
  //       this.sceneManagerService.getScene(),
  //       this.sceneManagerService.getCamera(),
  //       cabinet,
  //     ),
  //   );
  // }

  // updateCabinet(cabinet: ICabinet) {
  //   this.store.dispatch(CabinetActions.updateCabinet({ cabinet }));
  // }

  // deleteCabinet(id: number) {
  //   this.store.dispatch(CabinetActions.deleteCabinet({ id }));
  // }

  ngOnDestroy(): void {
    // this.uiService.disposeUI();
  }

  ngOnInit(): void {
    // Обрабатываем начальное состояние
    this.updateUIStateFromRoute();
    // Подписываемся на изменения маршрута
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateUIStateFromRoute();
    });

    if (this.checkPlatformService.isBrowser) {
      // console.log('Initializing SceneManagerService...');
      this.sceneManagerService.initialize(this.canvasRef.nativeElement);
      this.uiService.initializeUI();
    }
    this.cabinets$ = this.store.pipe(select(selectAllCabinets));

    // Подписываемся на изменения выбранной секции
    this.sectionInteractionService.selectedSection$.subscribe((section) => {
      this.selectedSection = section;
      // console.log('Section selection updated:', section);
    });
    // this.cabinets$.subscribe((cabinet) => {

    //   if (cabinet.length > 0) {
    //     this.sceneManagerService.setCabinet(
    //       new Cabinet(
    //         this.sceneManagerService.getScene(),
    //         this.sceneManagerService.getCamera(),
    //         cabinet[0],
    //       ),
    //     );
    //   }
    // });

    // if (this.checkPlatformService.isBrowser) {
    //   this.sceneManagerService.initialize(this.canvasRef.nativeElement);
    //   this.uiService.initializeUI();
    // }

    // Подписываемся на события показа предупреждения
    this.drawerWarningService.onShowWarning().subscribe((data: DrawerWarningData) => {
      if (this.drawerWarningOverlay) {
        this.drawerWarningOverlay.show(data);
      }
    });

    // Подписываемся на предупреждения о полках
    this.shelfWarningService.onShowWarning().subscribe((data) => {
      if (this.shelfWarningOverlay) {
        this.shelfWarningOverlay.show(data.message);
      }
    });

    // Подписываемся на действия пользователя
    this.drawerWarningService.onAction().subscribe((action) => {
      this.onDrawerWarningAction(action);
    });
  }

  onDrawerWarningAction(action: DrawerWarningAction): void {
    console.log('🔔 Drawer warning action received in parent:', action);

    if (action.type === 'removeDrawers') {
      console.log('🗑️ Removing drawers from section:', action.section);
      // Передаем действие обратно в DrawerManager через сервис
      this.drawerWarningService.sendAction(action);
    } else if (action.type === 'restoreWidth') {
      this.drawerWarningService.sendAction(action);
    } else if (action.type === 'restoreMullion') {
      console.log('↩️ Restoring mullion position');
      // this.restoreMullionPosition();
      // Также передаем действие в DrawerManager
      this.drawerWarningService.sendAction(action);
    }
  }

  private updateUIStateFromRoute(): void {
    // Получаем текущий активный маршрут
    let current = this.route;
    while (current.firstChild) {
      current = current.firstChild;
    }

    // Обновляем состояние hideUI
    this.hideUI = current.snapshot.data['hideUI'] || false;

    // Принудительно вызываем обнаружение изменений, если нужно
    // (может потребоваться, если изменение происходит вне зоны Angular)
    // this.cdr.detectChanges();
  }

  // Обработка события - "MouseDown"
  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.handleMouseDown(event);
  }

  private handleMouseDown(event: MouseEvent): void {
    // Проверяем, был ли клик по элементу UI
    const uiElement = (event.target as HTMLElement).closest(
      '.control-shelf, .control-panel, .control-mullion, button, .control-facade, .control-mirror, .control-rod',
    );
    if (uiElement) {
      return; // Игнорируем клики по UI элементам
    }
    if (event.button != 0) {
      return;
    }

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouseStartPos.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouseStartPos, this.sceneManagerService.getCamera());

    const intersects = raycaster.intersectObjects(
      this.sceneManagerService.getScene().children,
      true,
    );

    // Если клик не на объекте - снимаем выделение
    if (intersects.length == 0) {
      this.clearSelection();
      return;
    }

    let selectedObject = intersects[0].object;

    // ПРОВЕРЯЕМ КЛИК ПО БЛОКУ С ЯЩИКАМИ
    const drawerGroup = this.findParentDrawerGroup(selectedObject);
    if (drawerGroup) {
      selectedObject = drawerGroup;
      this.drawerBlockStartPos.copy(selectedObject.position);
      this.handleSelection(selectedObject, 'drawerBlock', event);
      return; // Выходим, если кликнули по блоку с ящиками
    }

    // ПРОВЕРЯЕМ КЛИК ПО СРЕДНИКУ (включая кромку)
    const mullionGroup = this.findParentMullionGroup(selectedObject);
    if (mullionGroup) {
      selectedObject = mullionGroup;
      this.handleSelection(selectedObject, 'mullion', event);
      return; // Выходим, если кликнули по среднику
    }

    // 3. ПРОВЕРКА: ПОЛКА (И КРОМКА ПОЛКИ) - ПЕРЕНЕСЕНО ВВЕРХ!
    // Важно проверить полку ДО проверки секции, иначе клик по полке может считаться кликом по секции
    if (
      selectedObject.name.startsWith('shelf') ||
      selectedObject.name.startsWith('frontEdgeShelf_')
    ) {
      let targetShelf = selectedObject;

      // Если кликнули по кромке, ищем родительскую полку
      if (selectedObject.name.startsWith('frontEdgeShelf_')) {
        const shelfParent = this.sceneManagerService
          .getCabinet()
          .shelfManager
          .findParentShelf(selectedObject);
        if (shelfParent) {
          targetShelf = shelfParent;
        }
      }

      // Проверка на штангу внутри полки (если нужно)
      const rodGroup = this.findParentRodGroup(selectedObject);
      if (rodGroup?.parent && !selectedObject.name.startsWith('frontEdgeShelf_')) {
        const parentShelf = rodGroup.parent.children.find((child) =>
          child.name.startsWith('shelf'),
        );
        if (parentShelf) targetShelf = parentShelf;
      }

      this.handleSelection(targetShelf, 'shelf', event);
      return;
    }

    const rodGroup = this.findParentRodGroup(selectedObject);
    if (rodGroup) {
      this.handleSelection(rodGroup, 'rod', event);
      return;
    }

    const handleGroup = this.findParentHandleGroup(selectedObject);
    if (handleGroup) {
      this.handleSelection(handleGroup, 'handle', event);
      return;
    }

    console.log('selectedObject');
    console.log(selectedObject);

    if (selectedObject.name.startsWith('facade')) {
      console.log(
        this.sceneManagerService.getCabinet().getCabinetParams().components.facades.facadeItems,
      );
      const hasMirror = this.sceneManagerService
        .getCabinet()
        .getCabinetParams()
        .components.facades.facadeItems.some((facade) => facade.mirrors.checkbox);
      if (hasMirror) {
        this.handleSelection(selectedObject, 'facade', event);
      }
      return;
    } else if (selectedObject.name.startsWith('mirror')) {
      // this.isDragging = true;
      // this.mirrorStartPos.copy(selectedObject.position);
      this.handleSelection(selectedObject, 'mirror', event);
    } else if (selectedObject.name.startsWith('topCabinet')) {
      this.handleSelection(selectedObject, 'topCabinet', event);
    } else if (selectedObject.name.startsWith('mullion')) {
      this.handleSelection(selectedObject, 'mullion', event);
    } else {
      this.clearSelection();

      this.sceneManagerService.setCameraControl(true);
    }

    const subsection = this.sectionInteractionService.detectSubsection(
      selectedObject,
      intersects[0].point,
    );
    if (subsection) {
      this.handleSubsectionSelection(subsection, event);
      return;
    }

    if (
      selectedObject.name === 'section_highlight_mesh' ||
      selectedObject.name === 'subsectionHighlight'
    ) {
      return;
    }
  }

  /**
   * Обрабатывает выделение секции
   */
  private handleSectionSelection(
    section: 'left' | 'right' | 'center', // Изменили тип параметра
    event: MouseEvent,
  ): void {
    // Убираем подсветку с предыдущей секции
    if (this.selectedSection && this.selectedSection !== section) {
      this.sectionInteractionService.clearSectionSelection();
    }

    // Используем сервис для выделения секции
    this.sectionInteractionService.selectSection(section);

    this.isDragging = false;
    this.sceneManagerService.setCameraControl(false);
  }

  /**
   * Выделение подсекций
   * @param subsection
   * @param event
   */
  private handleSubsectionSelection(subsection: Subsection, event: MouseEvent): void {
    // Снимаем выделение с объектов
    this.clearSelection();

    // Выделяем подсекцию через сервис
    this.sectionInteractionService.selectSubsection(subsection);

    // Сохраняем локально, если нужно для логики UI
    this.selectedSection = subsection.section;

    this.isDragging = false;
    this.sceneManagerService.setCameraControl(false);
  }

  /**
   * Находит родительскую группу средника
   */
  private findParentMullionGroup(obj: THREE.Object3D): THREE.Group | null {
    let current: THREE.Object3D | null = obj;
    while (current) {
      // Ищем основной средник или его кромку
      if (current.name.startsWith('mullion') || current.name.startsWith('frontEdgeMullion')) {
        // Если это кромка, ищем родительский средник
        if (current.name.startsWith('frontEdgeMullion')) {
          return current.parent as THREE.Group;
        }
        // Если это сам средник, возвращаем его
        return current as THREE.Group;
      }
      current = current.parent;
    }
    return null;
  }

  private findParentDrawerGroup(obj: THREE.Object3D): THREE.Group | null {
    let current: THREE.Object3D | null = obj;
    while (current) {
      // Ищем не только drawerBlock_, но и любые объекты, связанные с ящиками
      if (current.name.startsWith('drawerBlock_') || current.userData['isDrawer']) {
        return current as THREE.Group;
      }
      current = current.parent;
    }
    return null;
  }

  private findParentRodGroup(object: THREE.Object3D): THREE.Group | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.name.startsWith('rod_') && current instanceof THREE.Group) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private findParentHandleGroup(obj: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = obj;
    while (current) {
      // Проверяем по userData или по имени
      if (current.userData && current.userData['type'] === 'handle') {
        return current;
      }
      // Если в загруженной модели нет userData на верхнем уровне, проверяем имя
      if (current.name && current.name.startsWith('handle_')) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private clearSelection(): void {
    // Снимаем выделение с секции ТОЛЬКО через сервис
    this.sectionInteractionService.clearSectionSelection();

    // Сбрасываем локальную переменную
    this.selectedSection = null;

    // Снимаем выделение с полки
    if (this.selectedShelf) {
      CabinetGridManagerService.removeGridHighlight(this.selectedShelf);
      this.selectedShelf = null;
    }

    // Снимаем выделение со средника и всех его дочерних элементов
    if (this.selectedMullion) {
      if (this.selectedMullion instanceof THREE.Group) {
        this.selectedMullion.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            CabinetGridManagerService.removeGridHighlight(child);
          }
        });
      } else if (this.selectedMullion instanceof THREE.Mesh) {
        CabinetGridManagerService.removeGridHighlight(this.selectedMullion);
      }
      this.selectedMullion = null;
    }

    // Снимаем выделение с ящика
    if (this.selectedDrawerBlock) {
      if (this.selectedDrawerBlock instanceof THREE.Group) {
        this.selectedDrawerBlock.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            CabinetGridManagerService.removeGridHighlight(child);
          }
        });
      } else if (this.selectedDrawerBlock instanceof THREE.Mesh) {
        CabinetGridManagerService.removeGridHighlight(this.selectedDrawerBlock);
      }
      this.selectedDrawerBlock = null;
    }

    if (this.selectedDoor) {
      CabinetGridManagerService.removeGridHighlight(this.selectedDoor);
      this.selectedDoor = null;
    }

    if (this.selectedMirror) {
      CabinetGridManagerService.removeGridHighlight(this.selectedMirror);
      this.selectedMirror = null;
    }

    if (this.selectedRod) {
      if (this.selectedRod instanceof THREE.Group) {
        this.selectedRod.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            CabinetGridManagerService.removeGridHighlight(child);
          }
        });
      } else if (this.selectedRod instanceof THREE.Mesh) {
        CabinetGridManagerService.removeGridHighlight(this.selectedRod);
      }
      this.selectedRod = null;
    }

    this.selectedObject = null;
    this.isDragging = false;
    this.sceneManagerService.setCameraControl(true);
  }

  private handleSelection(object: THREE.Object3D, type: string, event: MouseEvent): void {
    //  console.log(`Handling selection: ${type} - ${object.name}`);

    // Очищаем предыдущее выделение
    this.clearSelection();

    this.selectedObject = object;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouseStartPos.set(event.clientX, event.clientY);
    switch (type) {
      case 'shelf':
        this.selectedShelf = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;

      case 'rod':
        this.selectedRod = object;
        console.log(this.selectedRod);
        if (object instanceof THREE.Group) {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              CabinetGridManagerService.highlightObjectWithGrid(child);
            }
          });
        } else if (object instanceof THREE.Mesh) {
          CabinetGridManagerService.highlightObjectWithGrid(object);
        }
        break;
      case 'mullion':
        this.selectedMullion = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;

      case 'drawerBlock':
        this.selectedDrawerBlock = object;
        // Подсвечиваем весь средник и все его дочерние элементы
        if (object instanceof THREE.Group) {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              CabinetGridManagerService.highlightObjectWithGrid(child);
            }
          });
        } else if (object instanceof THREE.Mesh) {
          CabinetGridManagerService.highlightObjectWithGrid(object);
        }
        break;

      case 'facade':
        this.selectedDoor = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;
      case 'handle':
        this.selectedHandle = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;

      case 'mirror':
        this.selectedMirror = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;

      case 'topCabinet':
        this.selectedShelf = object;
        CabinetGridManagerService.highlightObjectWithGrid(object);
        break;
    }
    console.log('this.selectedObject: ', this.selectedObject);
    // console.log('this.isDragging: ', this.isDragging);
    this.isDragging = true;
    if (type == 'shelf') {
      this.shelfStartPos.copy(object.position);
    } else if (type == 'mullion') {
      this.mullionStartPos.copy(object.position);
    } else if (type == 'drawerBlock') {
      this.drawerBlockStartPos.copy(object.position);
    }

    this.sceneManagerService.setCameraControl(false); // Отключить вращение камеры при выборе
  }

  // Обработка события - "Перемещение"
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.handleMouseMove(event);
  }

  // Обработка события - "MouseMove"
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.selectedObject) return;
    if (this.selectedObject.name == 'topCabinet') return;

    // Обработка разных типов объектов
    if (this.selectedShelf) {
      this.handleShelfMove(event);
    } else if (this.selectedDrawerBlock) {
      this.handleDrawerBlockMove(event);
    } else if (this.selectedHandle) {
      this.handleHandleMove(event);
    }

    this.updateCursor(event);
  }

  private handleShelfMove(event: MouseEvent): void {
    const cabinet = this.sceneManagerService.getCabinet();

    this.dragHandlerService.handleShelfDrag(
      this.selectedShelf,
      this.mouseStartPos,
      this.shelfStartPos,
      event,
      cabinet,
    );

    // Обновляем размер средника
    this.sceneManagerService.getCabinet().mullionManager.updateMullionSizeImmediately();

    this.sceneManagerService
      .getCabinet()
      .dimensionLines
      .getSectionDimensionLines()
      .updateSectionHeightLines();

    this.sceneManagerService.getCabinet().dimensionLines.updateInnerWidthLines();

    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  }

  private handleMullionMove(event: MouseEvent): void {
    const mouse = this.calculateMousePosition(event);
    const intersects = this.calculateIntersections(mouse);

    if (intersects.length > 0) {
      this.selectedMullion.position.x = intersects[0].point.x;
      this.sceneManagerService.getCabinet().mullionManager.updateMullionSizeImmediately();
    }
  }

  // ЯЩИКИ
  // ########################################################################################################
  private handleDrawerBlockMove(event: MouseEvent): void {
    const drawersInBlock = this.selectedDrawerBlock.userData['drawersCount'];
    if (drawersInBlock >= 5) {
      console.warn('Достигнуто максимальное кол-во ящиков в блоке - 5');
      return;
    }

    const mouse = this.calculateMousePosition(event);
    const intersects = this.calculateIntersections(mouse);

    if (intersects.length > 0) {
      this.handleDrawerBlockPosition(event, intersects[0].point.y);
    }
  }

  private handleDrawerBlockPosition(event: MouseEvent, newY: number): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const deltaY = this.mouseStartPos.y - event.clientY;
    const rawY = this.drawerBlockStartPos.y + deltaY;
    const cabinetHeight = cabinet.getCabinetHeight();
    const maxY = cabinetHeight - 16; // SHELF_HEIGHT
    const minLiftedY = PODIUM_HEIGHT + 256; // PODIUM_HEIGHT + 256

    // ПРИВЯЗКА К СЕТКЕ 32мм
    const snappedY = snapDrawerBlockPosition(rawY, cabinetHeight);

    // Проверяем минимальную высоту (256мм от дна)
    const finalY = Math.max(minLiftedY, snappedY);

    // let snappedY: number;
    // if (rawY < minLiftedY) {
    //   snappedY = deltaY > 0 ? minLiftedY : 0;
    // } else {
    //   snappedY = Math.round(rawY / step) * step;
    //   snappedY = Math.max(minLiftedY, Math.min(snappedY, maxY));
    // }

    this.selectedDrawerBlock.position.y = snappedY;

    // Обновляем userData и модель
    const blockId = this.selectedDrawerBlock.userData['id'];
    const newPosition = {
      x: this.selectedDrawerBlock.position.x,
      y: finalY,
      z: this.selectedDrawerBlock.position.z,
    };

    // console.log('this.selectedDrawerBlock.position.y:' + this.selectedDrawerBlock.position.y);

    cabinet
      .drawerManager
      .updateDrawerBlockPosition(this.selectedDrawerBlock.userData['id'], snappedY);

    // this.updateDrawerBlockUI(snappedY, cabinet);
    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  }

  private updateDrawerBlockUI(snappedY: number, cabinet: any): void {
    const drawersInBlock = this.selectedDrawerBlock.userData['drawersCount'];
    const cabinetWidth = cabinet.getCabinetSize().width;
    const cabinetDepth = cabinet.getCabinetSize().depth;
    const blockSize = DrawerSizeMap[drawersInBlock];

    const positionBlock: Position = {
      x: this.selectedDrawerBlock.position.x,
      y: snappedY,
      z: this.selectedDrawerBlock.position.z,
    };

    cabinet
      .getDimensionLine()
      .addSidePanelHeight(
        this.selectedDrawerBlock.userData['id'],
        cabinetWidth,
        blockSize.blockHeight,
        cabinetDepth,
        positionBlock,
        35,
      );

    cabinet
      .getDimensionLine()
      .updateDrawerBlockDimensionLines(this.selectedDrawerBlock, positionBlock);
  }
  // ########################################################################################################

  private calculateMousePosition(event: MouseEvent): THREE.Vector2 {
    return new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
  }

  private calculateIntersections(mouse: THREE.Vector2): THREE.Intersection[] {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManagerService.getCamera());
    return raycaster.intersectObjects(this.sceneManagerService.getScene().children);
  }

  private updateCursor(event: MouseEvent): void {
    const mouse = this.calculateMousePosition(event);
    const intersects = this.calculateIntersections(mouse);

    const hasInteractiveObject = intersects.some(
      (obj) =>
        obj.object.name.startsWith('shelf') ||
        obj.object.name.startsWith('mullion') ||
        obj.object.name.startsWith('door') ||
        obj.object.name.startsWith('drawer'),
    );

    this.canvasRef.nativeElement.style.cursor = this.isDragging
      ? 'grabbing'
      : hasInteractiveObject
        ? 'pointer'
        : 'auto';
  }

  public getPlinthCenterPanel(): THREE.Object3D | null {
    const scene = this.sceneManagerService.getScene();
    for (const child of scene.children) {
      if (child.name == 'plinthCenter') {
        return child;
      }
    }
    return null;
  }

  private updateMullionSize(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const mullion = cabinet.getMullion();
    if (!mullion) return;

    const shelves = Array.from(cabinet.shelfManager.getShelves().values());

    // Находим полки, которые находятся над подиумом и пересекаются со средником по оси X
    const sortedShelves = shelves
      .filter((shelf) => this.checkCollision(mullion, shelf))
      .sort((a, b) => a.position.y - b.position.y);

    const firstIntersectedShelf = sortedShelves[0]; // Самая нижняя полка из тех, что над средником

    if (firstIntersectedShelf) {
      // 1. Вычисляем высоту: от подиума до низа полки
      // Позиция полки (center) минус половина её толщины
      const shelfBottomY = firstIntersectedShelf.position.y - SHELF_HEIGHT / 2;
      const newMullionHeight = shelfBottomY - PODIUM_HEIGHT;

      // 2. Обновляем геометрию средника
      cabinet.mullionManager.updateMullionSize(
        cabinet.getCabinetWidth(),
        cabinet.getCabinetDepth(),
        newMullionHeight,
        cabinet.getCabinetHeight(),
        cabinet.getFacadeType(),
      );

      // 3. Вычисляем позицию центра средника:
      // Подиум + половина его новой высоты
      mullion.position.y = PODIUM_HEIGHT + newMullionHeight / 2;
    } else {
      // Если полок нет — средник на всю высоту шкафа
      const fullHeight = cabinet.getCabinetHeight() - WALL_THICKNESS * 2 - PODIUM_HEIGHT;

      cabinet.mullionManager.updateMullionSize(
        cabinet.getCabinetWidth(),
        cabinet.getCabinetDepth(),
        fullHeight,
        cabinet.getCabinetHeight(),
        cabinet.getFacadeType(),
      );

      mullion.position.y = PODIUM_HEIGHT + fullHeight / 2;
    }

    // Принудительно обновляем матрицы, чтобы изменения применились мгновенно
    mullion.updateMatrixWorld(true);
  }

  private checkCollision(mullion: THREE.Object3D, shelf: THREE.Object3D): boolean {
    if (!mullion || !shelf) return false;

    const mullionX = mullion.position.x;
    const shelfWidth = shelf.userData['size']?.width || shelf.scale.x;
    const shelfX = shelf.position.x;

    // Проверяем, попадает ли X средника в диапазон ширины полки
    const shelfLeft = shelfX - shelfWidth / 2;
    const shelfRight = shelfX + shelfWidth / 2;

    // Добавляем небольшой допуск (TOLERANCE)
    return mullionX >= shelfLeft - 1 && mullionX <= shelfRight + 1;
  }

  // Перемещение ручек (X и Y с шагом 1мм)
  private handleHandleMove(event: MouseEvent): void {
    if (!this.selectedHandle || !this.selectedHandle.parent) return;

    const facade = this.selectedHandle.parent as THREE.Mesh;
    const handleData = this.selectedHandle.userData['handleData'] as IHandle;
    const cabinet = this.sceneManagerService.getCabinet();
    const productType = cabinet.getCabinetType();

    if (!handleData) return;

    // Очищаем линии ТОЛЬКО активной ручки перед перерисовкой
    cabinet.dimensionLines.clearAllHandleDimensions();

    const facadeSize =
      facade.geometry instanceof THREE.BoxGeometry
        ? (facade.geometry as THREE.BoxGeometry).parameters
        : { width: facade.scale.x, height: facade.scale.y };

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManagerService.getCamera());

    const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(facade.quaternion);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, facade.position);

    const intersectPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
      const localPoint = facade.worldToLocal(intersectPoint.clone());

      // --- 1. РАСЧЕТ И ОГРАНИЧЕНИЕ ПО ОСИ Y (Высота) ---
      // С учетом подрезки фасада (cutHeight)
      // Центр фасада в local coordinates это 0. Низ фасада это -facadeSize.height / 2
      let rawIndentY = localPoint.y + facadeSize.height / 2 - handleData.size.height / 2;

      handleData.indentY = Math.round(rawIndentY);

      // Ограничения Y: от 0 (низ фасада) до верха фасада
      const minY = PODIUM_HEIGHT / 2;
      const maxY = facadeSize.height - handleData.size.height;
      handleData.indentY = Math.max(minY, Math.min(handleData.indentY, maxY));

      // --- 2. РАСЧЕТ И ОГРАНИЧЕНИЕ ПО ОСИ X ---
      if (handleData.type === 'OVERHEAD_HANDLE' && handleData.isMoveIndentX) {
        const isLeftFacade = facade.name.includes('left');
        let rawIndentX = isLeftFacade
          ? facadeSize.width / 2 - localPoint.x - handleData.size.width / 2
          : localPoint.x + facadeSize.width / 2 - handleData.size.width / 2;

        handleData.indentX = Math.round(rawIndentX);

        // Границы X: от 5мм до середины фасада (чтобы не уходить на чужую створку)
        const minX = 5;
        const maxX = facadeSize.width - handleData.size.width - 5;
        handleData.indentX = Math.max(minX, Math.min(handleData.indentX, maxX));
      }

      // Применяем позицию к текущей ручке
      this.applyHandlePosition(this.selectedHandle, facadeSize, handleData);

      // --- 3. ЗЕРКАЛИРОВАНИЕ (для Double) ---
      if (productType === CabinetSubType.Double) {
        this.syncHandlesMirror(handleData);
      }

      // Рисуем линии ТОЛЬКО у активной ручки
      cabinet.dimensionLines.updateHandleDimensions(this.selectedHandle, facade, handleData);
    }
  }
  /**
   * Применяет локальную позицию ручки.
   * Метод использует текущий data.indentX, независимо от того,
   * меняли мы его только что или он остался константным.
   */
  private applyHandlePosition(handleObj: THREE.Object3D, facadeSize: any, data: IHandle): void {
    const facade = handleObj.parent;
    if (!facade) return;

    // Y: Расчет всегда от низа фасада
    handleObj.position.y = -(facadeSize.height / 2) + data.indentY + data.size.height / 2;

    // X: Расчет позиции в зависимости от типа
    if (data.type === 'OVERHEAD_HANDLE') {
      const isLeftFacade = facade.name.includes('left');
      // Используем data.indentX (он либо новый из handleHandleMove, либо старый константный)
      handleObj.position.x = isLeftFacade
        ? facadeSize.width / 2 - data.indentX - data.size.width / 2
        : -(facadeSize.width / 2) + data.indentX + data.size.width / 2;
    } else {
      // Для END_HANDLE X обычно фиксирован на торце (логика из FacadeManager)
      const isLeftFacade = facade.name.includes('left');
      handleObj.position.x = isLeftFacade
        ? facadeSize.width / 2 - data.size.height / 2
        : -(facadeSize.width / 2) + data.size.height / 2;
    }

    // Сохраняем итоговые координаты
    data.position = { x: handleObj.position.x, y: handleObj.position.y, z: handleObj.position.z };
  }

  private syncHandlesMirror(sourceData: IHandle): void {
    const scene = this.sceneManagerService.getScene();
    const cabinet = this.sceneManagerService.getCabinet();
    const allFacades = scene.children.filter((obj) => obj.name.startsWith('facade_'));

    allFacades.forEach((facadeObj) => {
      const otherHandle = facadeObj.children.find(
        (child) => child.name.startsWith('handle_') && child !== this.selectedHandle,
      );

      if (otherHandle) {
        const otherData = otherHandle.userData['handleData'] as IHandle;
        if (!otherData) return;

        const mesh = facadeObj as THREE.Mesh;
        const otherFacadeSize =
          mesh.geometry instanceof THREE.BoxGeometry
            ? mesh.geometry.parameters
            : { width: mesh.scale.x, height: mesh.scale.y };

        // Синхронизируем отступы
        otherData.indentY = sourceData.indentY;
        otherData.indentX = sourceData.indentX;

        this.applyHandlePosition(otherHandle, otherFacadeSize, otherData);

        // ВАЖНО: Мы НЕ вызываем здесь updateHandleDimensions,
        // чтобы линии были только у одной ручки.
      }
    });

    // Обновляем параметры в Store/Config
    cabinet.getCabinetParams().components.facades.facadeItems.forEach((item) => {
      if (item.handle) {
        item.handle.indentX = sourceData.indentX;
        item.handle.indentY = sourceData.indentY;
      }
    });
  }

  // Обработка события - "MouseUp"
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.handleMouseUp(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      console.log('CHECK');
      this.isDragging = false;
      if (this.selectedShelf) {
        this.shelfStartPos.copy(this.selectedShelf.position);
        this.sceneManagerService.setCameraControl(true);
        // this.selectedShelf = null; // Сброс после завершения перемещения полки
      } else if (this.selectedRod) {
        this.sceneManagerService.setCameraControl(true);
      } else if (this.selectedDrawerBlock) {
        this.sceneManagerService.setCameraControl(true);
      } else if (this.selectedDoor) {
        this.sceneManagerService.setCameraControl(true);
      } else if (this.selectedMirror) {
        this.sceneManagerService.setCameraControl(true);
      } else if (this.selectedHandle) {
        this.sceneManagerService.setCameraControl(true);
      }
      this.canvasRef.nativeElement.style.cursor = 'auto';
      this.collidingObjects.clear();
    }
  }

  //_________________________________Методы для полок_________________________________

  private updateShelfControlPanel(shelf: THREE.Object3D | null): void {
    // Не обновляем выделение, если клик был по кнопке контроллера
    if (this.isClickFromControlPanel) {
      this.isClickFromControlPanel = false;
      return;
    }
    this.selectedShelf = shelf;
  }

  // Добавьте это свойство в класс
  private isClickFromControlPanel = false;

  public deleteShelf(shelf: THREE.Object3D): void {
    // this.ui.getCabinet().getDimensionLine().removeShelfDimensionLines();
    // this.SceneManagerService.getScene().remove(this.selectedShelf);
    this.selectedShelf = null;
    const idShelf = this.sceneManagerService.getCabinet().shelfManager.getIdShelve(shelf);
    this.sceneManagerService.getCabinet().removeShelf(idShelf);
    this.updateMullionSize();

    this.sceneManagerService.getCabinet().mullionManager.updateMullionSizeImmediately();
    this.sceneManagerService
      .getCabinet()
      .dimensionLines
      .getSectionDimensionLines()
      .updateSectionHeightLines();
  }

  public moveShelfCentre(shelf: THREE.Object3D): void {
    if (this.selectedShelf) {
      // Задаём размеры для полки
      const width = this.sceneManagerService.getCabinet().getCabinetWidth() - WALL_THICKNESS * 2;
      const height = SHELF_HEIGHT;
      let depth: number;
      let zPosition: number;
      if (this.sceneManagerService.getCabinet().getFacadeType() == 'INTEGRATED_HANDLE') {
        depth =
          this.sceneManagerService.getCabinet().getCabinetDepth() - DEPTH_WIDTH_INTG_HADLE - 4 - 5;
        // zPosition = -DEPTH_WIDTH_INTG_HADLE / 2 + 2 + 2.5;
      } else {
        depth = this.sceneManagerService.getCabinet().getCabinetDepth() - 4 - 5;
        // zPosition = 2 + 2.5;
      }

      const size = { width, height, depth };
      this.selectedShelf.position.x = 0; // Устанавливаем новую позицию полки
      // this.selectedShelf.position.z = zPosition;

      this.sceneManagerService
        .getCabinet()
        .shelfManager
        .updateShelfSizeByShelf(size, this.selectedShelf);
      this.intersectionManager.highlightObjectsOnMove(
        this.selectedShelf,
        this.sceneManagerService.getScene(),
      ); // Подсвечиваем объект во время перемещения

      // Обновляем кромку полки
      if (this.selectedShelf) {
        // this.updateShelfEdge(this.selectedShelf, width);
        this.sceneManagerService
          .getCabinet()
          .shelfManager
          .updateShelfEdge(
            this.selectedShelf,
            this.selectedShelf.userData['type'] as ShelfType,
            this.selectedShelf.userData['positionHinges'] as PositionCutout,
          );
      }
      // Обновляем размер средника
      this.sceneManagerService.getCabinet().mullionManager.updateMullionSizeImmediately();
    }
  }

  public moveShelf(direction: 'left' | 'right'): void {
    const mullion = this.sceneManagerService.getCabinet().getMullion();
    if (this.selectedShelf && mullion) {
      // Получаем текущие параметры полки и средника
      const cabinetWidth = this.sceneManagerService.getCabinet().getCabinetWidth();
      const mullionPos = mullion.position.x;

      // Удаляем существующие размерные линии для этой полки
      this.sceneManagerService
        .getCabinet()
        .dimensionLines
        .removeShelfDimensionLinesObj(this.selectedShelf);

      // Определяем новые размеры полки в зависимости от направления
      let width: number;
      let newPositionX: number;

      let depth: number;
      let zPosition: number;
      if (this.sceneManagerService.getCabinet().getFacadeType() == 'INTEGRATED_HANDLE') {
        depth =
          this.sceneManagerService.getCabinet().getCabinetDepth() - DEPTH_WIDTH_INTG_HADLE - 4 - 5; // учитываем 4мм и 5мм
        zPosition = -DEPTH_WIDTH_INTG_HADLE / 2;
      } else {
        depth = this.sceneManagerService.getCabinet().getCabinetDepth() - 4 - 5; // учитываем 4мм и 5мм
        zPosition = (2 + 2.5) / -2;
      }

      // Устанавливаем позицию полки в зависимости от направления
      switch (direction) {
        case 'left':
          if (mullionPos < 0) {
            width = cabinetWidth / 2 + mullionPos - WALL_THICKNESS * 2 + WALL_THICKNESS / 2;
            newPositionX = mullionPos - width / 2 - WALL_THICKNESS / 2;
          } else if (mullionPos > 0) {
            width = cabinetWidth / 2 + mullionPos - WALL_THICKNESS * 2 + WALL_THICKNESS / 2;
            newPositionX = mullionPos - width / 2 - WALL_THICKNESS / 2;
          } else {
            width = cabinetWidth / 2 - WALL_THICKNESS * 2 + WALL_THICKNESS / 2; // Полка от средника до правой стенки
            newPositionX = mullionPos - cabinetWidth / 4 + WALL_THICKNESS / 4;
          }

          break;
        case 'right':
          if (mullionPos < 0) {
            width = cabinetWidth / 2 - mullionPos - WALL_THICKNESS * 2 + WALL_THICKNESS / 2;
            newPositionX = mullionPos + width / 2 + WALL_THICKNESS / 2;
          } else if (mullionPos > 0) {
            width = cabinetWidth / 2 - mullionPos - WALL_THICKNESS * 2 + WALL_THICKNESS / 2;
            newPositionX = mullionPos + width / 2 + WALL_THICKNESS / 2;
          } else {
            width = cabinetWidth / 2 - WALL_THICKNESS * 2 + WALL_THICKNESS / 2; // Полка от средника до левой стенки
            newPositionX =
              mullionPos +
              this.sceneManagerService.getCabinet().getCabinetWidth() / 4 -
              WALL_THICKNESS / 4;
          }

          break;
      }
      console.log('width: ', width, 'newPositionX: ', newPositionX);

      const size = {
        width: width,
        height: SHELF_HEIGHT,
        depth: depth,
      };
      this.selectedShelf.userData['size'] = size;
      // Обновляем размеры и позицию полки
      // this.selectedShelf.position.x = newPositionX;
      this.sceneManagerService.getCabinet().shelfManager.updateShelfSizeByShelf(size, this.selectedShelf);
      this.sceneManagerService
        .getCabinet()
        .shelfManager.updateShelfPositionByShelf(
          { x: newPositionX, y: this.selectedShelf.position.y, z: this.selectedShelf.position.z },
          this.selectedShelf,
        );
      this.sceneManagerService
        .getCabinet()
        .shelfManager
        .updateShelfEdge(
          this.selectedShelf,
          this.selectedShelf.userData['type'] as ShelfType,
          this.selectedShelf.userData['positionHinges'] as PositionCutout,
        );
      // this.updateShelfEdge(this.selectedShelf, width);
      // Обновляем размерные линии полки (нужно доработать!!!!!!!!!!!!!!)
      // const dimensionLines = this.ui.getCabinet().getDimensionLine();
      // dimensionLines.addDimensionLines(
      //   size.width,
      //   size.height,
      //   size.depth,
      //   [this.selectedShelf],
      // );
      this.intersectionManager.highlightObjectsOnMove(
        this.selectedShelf,
        this.sceneManagerService.getScene(),
      ); // Подсвечиваем объект во время перемещения

      const shelvesMap = this.sceneManagerService.getCabinet().shelfManager.getShelvesMap();
      // обновляем размерные линии каждой полки
      this.sceneManagerService
        .getCabinet()
        .dimensionLines
        .updateAllShelfDimensionLines(
          [...shelvesMap.values()],
          this.sceneManagerService.getCabinet().getCabinetWidth(),
          this.sceneManagerService.getCabinet().getCabinetHeight(),
        );

      // Обновляем размер средника
      this.sceneManagerService.getCabinet().mullionManager.updateMullionSizeImmediately();
    }
  }

  // onAddRod(event: { shelf: THREE.Object3D; side: 'left' | 'right' | 'full' }) {
  //   this.sceneManagerService.getCabinet().getShelfManager().addRod(event.shelf, event.side);

  //   this.hasRodState =
  //     this.sceneManagerService.getCabinet().getShelfManager().getRodSides(event.shelf).length > 0;
  //   this.rodSideState = this.sceneManagerService
  //     .getCabinet()
  //     .getShelfManager()
  //     .getRodSide(event.shelf);
  // }

  public addRodShelf(event: { shelf: THREE.Object3D; side: 'left' | 'right' | 'full' }): void {
    console.log(`Добавляем штангу на ${event.side} в ${event.shelf.name}`);
    this.sceneManagerService.getCabinet().shelfManager.addRodShelf(event.shelf, event.side);

    // Важно: обновляем userData полки
    event.shelf.userData['hasRod'] = true;
    event.shelf.userData['rodSide'] = event.side;

    // Ключевое исправление: принудительно обновляем selectedShelf
    // Сохраняем текущую полку
    const currentShelf = this.selectedShelf;

    // Временно обнуляем selectedShelf
    this.selectedShelf = null;

    // Небольшая задержка для обновления Angular
    setTimeout(() => {
      // Восстанавливаем ссылку на полку (теперь с обновленными детьми - штангой)
      this.selectedShelf = currentShelf;
    }, 0);

    // Обновляем состояние для отображения текста
    this.hasRodState =
      this.sceneManagerService.getCabinet().shelfManager.getRodSides(event.shelf).length > 0;
    this.rodSideState = this.sceneManagerService
      .getCabinet()
      .shelfManager
      .getRodSide(event.shelf);
  }
  // Методы для штанги
  public onDeleteRod(rod: THREE.Object3D): void {
    console.log(rod);
    const parentShelf = this.sceneManagerService
      .getCabinet()
      .shelfManager
      .findParentShelf(rod);
    const side = rod.userData?.['side'] || 'full';
    console.log(parentShelf);
    if (parentShelf) {
      this.deleteRodShelf({ shelf: parentShelf, side });
      parentShelf.userData['hasRod'] = false;
      this.clearSelection();
    }
  }

  public shelfTypeChange(event: { shelf: THREE.Object3D; type: ShelfType }) {
    console.log(`Тип полки ${event.shelf.name} изменён на ${event.type}!`);
    this.sceneManagerService
      .getCabinet()
      .shelfManager
      .shelfTypeChange(event.shelf, event.type);
  }

  public deleteRodShelf(data: { shelf: THREE.Object3D; side?: 'left' | 'right' | 'full' }): void {
    const { shelf, side = 'full' } = data;

    console.log(`Удаляем штангу (${side}) из ${shelf.name}`);
    this.sceneManagerService.getCabinet().shelfManager.deleteRod(shelf, side);
  }

  // _________________________________Методы для средника_________________________________

  private updateMullionControlPanel(mullion: THREE.Object3D | null): void {
    this.selectedMullion = mullion;
  }

  public hasMullion(): boolean {
    return this.sceneManagerService.getCabinet().hasMullion();
  }

  public cabinetType(): CabinetSubType {
    return this.sceneManagerService.getCabinet().getCabinetType();
  }

  // private restoreMullionPosition(): void {
  //   const cabinet = this.sceneManagerService.getCabinet();
  //   const hasMullion = cabinet.hasMullion();

  //   if (hasMullion) {
  //     const mullion = cabinet.getMullion();
  //     const prevMullionPos = cabinet.getCabinetParams().components.mullion.position.x;

  //     mullion.position.x = prevMullionPos;
  //     cabinet.getCabinetParams().components.mullion.position.x = prevMullionPos;
  //     mullion.updateMatrixWorld();
  //     console.log(`↩️ Средник возвращён на позицию ${prevMullionPos}`);
  //   }
  // }

  private restoreMullionPosition(): void {
    const cabinet = this.sceneManagerService.getCabinet();
    if (cabinet.hasMullion()) {
      const mullion = cabinet.getMullion();
      const cabinetWidth = cabinet.getCabinetSize().width;

      // Получаем информацию о проблемной секции из сервиса
      const problemSection = this.getProblemSectionFromWarning();

      // Вычисляем оптимальную позицию для размещения блока в проблемной секции
      const optimalPosition = this.calculateOptimalMullionPosition(cabinetWidth, problemSection);

      console.log(
        `🔄 Moving mullion from ${mullion.position.x} to ${optimalPosition} for section ${problemSection}`,
      );

      // Устанавливаем средник на оптимальную позицию
      mullion.position.x = optimalPosition;
      cabinet.getCabinetParams().components.mullion.position.x = optimalPosition;
      mullion.updateMatrixWorld();

      console.log(
        `✅ Средник перемещён на оптимальную позицию для секции ${problemSection}: ${optimalPosition}мм`,
      );
    }
  }

  /**
   * Получает информацию о проблемной секции из сервиса предупреждений
   */
  private getProblemSectionFromWarning(): string {
    // Здесь можно получить информацию о том, для какой секции нужно освободить место
    // Пока используем логику определения по текущему положению средника
    const cabinet = this.sceneManagerService.getCabinet();
    const mullionPos = cabinet.getMullion().position.x;

    if (mullionPos > 0) {
      return 'left'; // Если средник справа, проблемная секция - левая
    } else if (mullionPos < 0) {
      return 'right'; // Если средник слева, проблемная секция - правая
    } else {
      return 'center'; // Если средник в центре, проблемная секция - центральная
    }
  }

  /**
   * Вычисляет оптимальную позицию средника для размещения блока в указанной секции
   */
  private calculateOptimalMullionPosition(cabinetWidth: number, targetSection: string): number {
    const MIN_BLOCK_WIDTH = 350; // минимальная ширина для комфортного размещения блока
    const OPTIMAL_BLOCK_WIDTH = 450; // оптимальная ширина для блока

    const halfWidth = cabinetWidth / 2;

    switch (targetSection) {
      case 'left':
        // Для левой секции: смещаем средник вправо, оставляя слева оптимальную ширину
        const leftOptimalPosition = OPTIMAL_BLOCK_WIDTH - halfWidth;
        return Math.min(leftOptimalPosition, halfWidth - MIN_BLOCK_WIDTH);

      case 'right':
        // Для правой секции: смещаем средник влево, оставляя справа оптимальную ширину
        const rightOptimalPosition = halfWidth - OPTIMAL_BLOCK_WIDTH;
        return Math.max(-rightOptimalPosition, -halfWidth + MIN_BLOCK_WIDTH);

      case 'center':
      default:
        // Для центральной секции: устанавливаем средник в центр
        // и обеспечиваем минимальную ширину для обеих секций
        const minPositionForCenter = MIN_BLOCK_WIDTH - halfWidth;
        const maxPositionForCenter = halfWidth - MIN_BLOCK_WIDTH;

        // Если невозможно обеспечить минимальную ширину для обеих секций,
        // выбираем позицию, которая максимизирует меньшую секцию
        if (minPositionForCenter > maxPositionForCenter) {
          // Невозможно обеспечить MIN_BLOCK_WIDTH для обеих секций
          // Выбираем позицию, которая уравнивает ширину секций
          return 0;
        } else {
          // Можно установить в центр
          return 0;
        }
    }
  }

  public moveMullionUp(mullion: THREE.Object3D): void {
    if (!this.selectedMullion) return;

    // Используем сервис для перемещения средника вверх
    const success = this.mullionShelfInteractionService.moveMullionUp(mullion);

    if (success) {
      // Обновляем визуальное отображение
      this.intersectionManager.highlightObjectsOnMove(mullion, this.sceneManagerService.getScene());

      // Обновляем размеры полок
      const cabinet = this.sceneManagerService.getCabinet();
      cabinet.shelfManager.updateShelfSize(cabinet.getCabinetSize(), cabinet.getFacadeType());

      // Обновляем размерные линии
      // this.updateDimensionLines();
    }
  }

  public moveMullionDown(mullion: THREE.Object3D): void {
    if (!this.selectedMullion) return;

    // 1. Выполняем логику перемещения (укорачивания/удлинения) в сервисе
    const success = this.mullionShelfInteractionService.moveMullionDown(mullion);

    if (success) {
      // 2. СРАЗУ вызываем локальное обновление размеров и позиции
      this.updateMullionSize();

      // 3. Обновляем остальное
      this.intersectionManager.highlightObjectsOnMove(mullion, this.sceneManagerService.getScene());
      const cabinet = this.sceneManagerService.getCabinet();
      cabinet.shelfManager.updateShelfSize(cabinet.getCabinetSize(), cabinet.getFacadeType());
      cabinet.sectionDimensionLines.updateSectionHeightLines();
    }
  }

  public deleteMullion(mullion: THREE.Object3D): void {
    // Используем сервис для удаления средника
    const success = this.mullionShelfInteractionService.deleteMullion(mullion);

    if (success) {
      this.selectedMullion = null;
    }
  }

  // _________________________________Методы для блоков с ящиками_________________________________

  private updateDrawerBlockControlPanel(drawerBlock: THREE.Object3D | null): void {
    this.selectedDrawerBlock = drawerBlock;
  }

  public deleteBlock(drawerBlock: THREE.Object3D): void {
    console.log('DELETE BLOCK');
    console.log(drawerBlock);
    console.log(drawerBlock.userData['drawerData']);
    const blockId = drawerBlock.userData['id'];
    this.sceneManagerService.getCabinet().dimensionLines.removeSidePanelHeightLineById(blockId);
    this.sceneManagerService
      .getCabinet()
      .dimensionLines
      .removeDimensionLineByName(`dimensionLine_blockHeight_${blockId}`);
    this.sceneManagerService
      .getCabinet()
      .dimensionLines
      .removeDrawerDimensionLines(drawerBlock.userData['drawerData']);
    this.sceneManagerService.getCabinet().drawerManager.removeBlock(drawerBlock);

    // Сбрасываем выбранный блок
    this.selectedDrawerBlock = null;
  }

  // ! Повесить update на размерные линии !
  public addDrawer(block: THREE.Object3D): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const { width, height, depth } = cabinet.getCabinetSize();

    const productType: CabinetSubType = cabinet.getCabinetType();
    const hasMullion: boolean = cabinet.hasMullion();

    const blockId = block.userData['id'];
    console.log(blockId);
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;
    console.log(drawerBlocks);
    const existingBlockIndex = drawerBlocks.findIndex((b) => b.id == blockId);
    if (existingBlockIndex == -1) {
      alert(`Нет блока с id: ${blockId}`);
      return;
    }

    // Обновляем ДАННЫЕ
    const drawerBlock = drawerBlocks[existingBlockIndex];
    if (drawerBlock.drawerItems.length == 5) {
      alert('Число ящиков может быть не больше 5!');
      return;
    }
    const totalBlockDrawers = block.userData['drawersCount'];
    // Текущая позиция блока (x)
    const currentX = this.selectedDrawerBlock.position.x;

    // Удаляем только 3D объект блока, но не модельные данные
    this.sceneManagerService.deleteObject(block);
    this.sceneManagerService.getCabinet().drawerManager.getBlockDrawersMap().delete(blockId);

    const newDrawer: Drawer = {
      id: totalBlockDrawers,
      position: { x: 0, y: 0, z: 0 },
    };

    const countFP = cabinet.getCabinetParams().subType === CabinetSubType.Single ? 1 : 2;
    const section: 'left' | 'right' | 'center' = this.sceneManagerService
      .getCabinet()
      .sectionManager
      .getSectionByCenter(block);

    const sectionParams = this.sceneManagerService
      .getCabinet()
      .sectionManager
      .calculateSectionParams(
        section,
        hasMullion,
        cabinet.getCabinetSize().width,
        hasMullion ? cabinet.getMullion().position.x : 0,
      );
    const { availableWidth, positionX } = sectionParams;

    const { fullSize, fullDrawerSize } = calculateDrawerElements(
      productType,
      hasMullion,
      totalBlockDrawers + 1,
      availableWidth,
      height,
      depth,
      countFP,
    );
    const newBlockSize: Size = {
      width: fullSize.shelf.size.width,
      height: height,
      depth: depth,
    };

    console.log('newBlockSize');
    console.log(newBlockSize);

    // Обновляем размеры блока
    drawerBlock.id = blockId;
    drawerBlock.position.x = currentX;
    drawerBlock.fullSize = fullSize;
    drawerBlock.fullDrawerSize = fullDrawerSize;
    drawerBlock.drawerItems.push(newDrawer);
    console.log('Обновлённый блок с ящиками!');
    console.log(drawerBlock);
    cabinet.getCabinetParams().components.drawers.drawerBlocks[existingBlockIndex] = drawerBlock;

    // Определяем направление открытия для этой секции
    const openingDirection: PositionCutout = section.includes('left')
      ? 'left-side'
      : section.includes('right')
        ? 'right-side'
        : 'right-side'; // по умолчанию для центра

    // Обновляем блок на основе новых данных
    cabinet.drawerManager.addBlock(drawerBlock, cabinet.getCabinetSize(), openingDirection);

    // Обновляем средник
    cabinet.updateMullion();
  }

  public deleteDrawer(block: THREE.Object3D): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const { width, height, depth } = cabinet.getCabinetSize();

    const productType: CabinetSubType = cabinet.getCabinetType();
    const hasMullion: boolean = cabinet.hasMullion();

    const blockId = block.userData['id'];
    const totalBlockDrawers = block.userData['drawersCount'];

    if (totalBlockDrawers <= 1) {
      alert('В блоке всего один ящик!');
      return;
    }

    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;
    const existingBlockIndex = drawerBlocks.findIndex((b) => b.id == blockId);
    console.log(blockId);
    console.log(totalBlockDrawers);
    console.log(drawerBlocks);
    console.log(existingBlockIndex);
    if (existingBlockIndex == -1) {
      alert(`Нет блока с id: ${blockId}`);
      return;
    }

    const drawerBlock = drawerBlocks[existingBlockIndex];

    // ОПРЕДЕЛЯЕМ СЕКЦИЮ ПЕРЕД УДАЛЕНИЕМ
    const section: 'left' | 'right' | 'center' = this.sceneManagerService
      .getCabinet()
      .sectionManager
      .getSectionByCenter(block);

    this.sceneManagerService.getCabinet().dimensionLines.removeSidePanelHeightLineById(blockId);
    this.sceneManagerService
      .getCabinet()
      .dimensionLines
      .removeDrawerDimensionLines(block.userData['drawerData']);

    // 1. Удаляем последний ящик из данных
    drawerBlock.drawerItems.pop();

    // 2. Пересчитываем размеры блока
    const countFP = cabinet.getCabinetParams().subType === CabinetSubType.Single ? 1 : 2;

    // ПОЛУЧАЕМ ПАРАМЕТРЫ СЕКЦИИ ДЛЯ РАСЧЕТА ШИРИНЫ
    const sectionParams = this.sceneManagerService
      .getCabinet()
      .sectionManager
      .calculateSectionParams(
        section,
        hasMullion,
        cabinet.getCabinetSize().width,
        hasMullion ? cabinet.getMullion().position.x : 0,
      );

    if (!sectionParams) {
      alert(`Недостаточно места в секции "${section}" для блока с ящиками`);
      return;
    }

    const { availableWidth } = sectionParams;

    const { fullSize, fullDrawerSize } = calculateDrawerElements(
      productType,
      hasMullion,
      drawerBlock.drawerItems.length,
      availableWidth,
      height,
      depth,
      countFP,
    );

    // 3. Обновляем поля блока
    drawerBlock.id = blockId;
    drawerBlock.fullSize = fullSize;
    drawerBlock.fullDrawerSize = fullDrawerSize;

    // 4. Удаляем старый 3D-блок со сцены
    // this.deleteBlock(block);

    this.sceneManagerService.getCabinet().drawerManager.removeBlockFromSceneOnly(block);

    // Сбрасываем выбранный блок
    this.selectedDrawerBlock = null;

    // Определяем направление открытия для этой секции
    const openingDirection: PositionCutout = section.includes('left')
      ? 'left-side'
      : section.includes('right')
        ? 'right-side'
        : 'right-side'; // по умолчанию для центра

    // 5. Перерисовываем блок на сцене
    cabinet.drawerManager.addBlock(drawerBlock, cabinet.getCabinetParams().dimensions.general, openingDirection);

    // 6. Обновляем средник
    cabinet.updateMullion();
  }
  public moveDrawerBlockCentre(drawerBlock: THREE.Object3D): void {}

  public moveDrawerBlock(direction: 'left' | 'right'): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const drawerManager = cabinet.drawerManager;
    const drawerBlocks = cabinet.getCabinetParams().components.drawers.drawerBlocks;

    if (!this.selectedDrawerBlock) {
      alert('Блок не выбран');
      return;
    }
    console.log('drawerBlocks');
    console.log(drawerBlocks);

    const selectedId = this.selectedDrawerBlock.userData['id'];
    if (selectedId === undefined) {
      alert('Выбранный блок не имеет идентификатора');
      return;
    }

    const selectedBlock = drawerBlocks.find((b) => b.id == selectedId);
    if (!selectedBlock) {
      alert('Выбранный блок не найден');
      return;
    }

    // Убедимся, что у блока есть позиция
    if (!selectedBlock.position) {
      selectedBlock.position = { x: 0, y: 0, z: 0 };
    }

    // Текущая позиция блока (x)
    const currentX = this.selectedDrawerBlock.position.x;

    const cabinetWidth = cabinet.getCabinetSize().width;
    const moveStep =
      cabinetWidth / (cabinetWidth / 2 < selectedBlock.fullSize.shelf.size.width ? 4 : 2);

    // Вычисляем новую позицию
    let newX =
      direction === 'left'
        ? currentX - moveStep + WALL_THICKNESS / 4
        : currentX + moveStep - WALL_THICKNESS / 4;

    // Ограничиваем смещение, чтобы блоки не уходили за границы
    const maxShift = cabinetWidth / 2;
    if (newX < -maxShift) newX = -maxShift;
    if (newX > maxShift) newX = maxShift;

    // Обновляем данные блока
    selectedBlock.position.x = newX;

    // Проверка, уже ли смещался в эту сторону
    if (direction == 'left' && currentX < 0) {
      alert('Блок уже смещён влево');
      return;
    } else if (direction == 'right' && currentX > 0) {
      alert('Блок уже смещён вправо');
      return;
    }

    const cabinetSize = this.sceneManagerService.getCabinet().getCabinetParams().dimensions.general;

    const productType: CabinetSubType = cabinet.getCabinetType();
    const hasMullion: boolean = cabinet.hasMullion();

    const totalBlock = selectedBlock.drawerItems.length;
    const { width, height, depth } = cabinetSize;
    const newBlockSize: Size = {
      width: cabinetSize.width / 2 + WALL_THICKNESS / 2,
      height: cabinetSize.height,
      depth: cabinetSize.depth,
    };
    const {
      size: newDrawerSize,
      fullSize,
      fullDrawerSize,
    } = calculateDrawerElements(
      productType,
      hasMullion,
      totalBlock,
      newBlockSize.width,
      height,
      depth,
      1,
    );
    console.log(fullSize);
    console.log(fullDrawerSize);
    // Обновляем данные выделенного блока
    selectedBlock.position = {
      ...selectedBlock.position,
      x: newX,
    };

    selectedBlock.fullSize = fullSize;
    selectedBlock.fullDrawerSize = fullDrawerSize;

    // Удаляем блок из сцены и массива
    this.deleteBlock(this.selectedDrawerBlock);
    const index = drawerBlocks.findIndex((b) => b.id == selectedBlock.id);
    if (index !== -1) {
      // drawerBlocks.splice(index, 1); // удаляем из массива
      drawerBlocks[index] = selectedBlock;
    }
    console.log(selectedBlock);
    // Добавляем обновлённый блок заново
    const positionLoops: PositionCutout = direction == 'left' ? 'left-side' : 'right-side';
    cabinet.getCabinetParams().components.facades.facadeItems[0].positionLoops = positionLoops;
    // cabinet.updateDoorPositionLoops(positionLoops);
    cabinet.drawerManager.addBlock(selectedBlock, newBlockSize, positionLoops);
    cabinet.getCabinetParams().components.drawers.drawerBlocks.push(selectedBlock);
    // Обновляем выбранный блок в интерфейсе
    this.selectedDrawerBlock = cabinet.drawerManager.getBlockById(selectedBlock.id);
    this.selectedDrawerBlock.position.x = newX;
    // Обновление перегородок
    cabinet.updateMullion();
  }

  // Фасады
  public addMirror(facade: THREE.Object3D): void {
    const cabinet = this.sceneManagerService.getCabinet();
    const cabinetParams = cabinet.getCabinetParams();
    let facadeIndex: number;
    if (cabinet.getCabinetType() == CabinetSubType.Single) {
      facadeIndex = 0;
    } else {
      facadeIndex = facade.name.includes('left') ? 0 : 1;
    }

    const facadeParams = cabinetParams.components.facades.facadeItems[facadeIndex];
    console.log(facadeParams);
    const cabinetType = cabinet.getCabinetType();
    this.sceneManagerService
      .getCabinet()
      .facadeManager
      .addMirrorToFacade(facadeParams, cabinetType, facade);

    // cabinet.updateCabinetParams(cabinetParams);
  }

  // Зеркала
  public deleteMirror(mirror: THREE.Object3D): void {
    const mirrorId = mirror.userData?.['id'];
    if (!mirrorId) return;

    const cabinet = this.sceneManagerService.getCabinet();
    const facadeManager = cabinet.facadeManager;

    facadeManager.deleteMirrorById(mirrorId);
  }

  // Функционал секций

  onSubsectionSelected(subsection: Subsection): void {
    const scene = this.sceneManagerService.getScene();
    const cabinet = this.sceneManagerService.getCabinet();

    if (scene && cabinet) {
      this.sectionInteractionService.highlightSubsection(subsection, scene, cabinet);
    }
  }

  /**
   * Обрабатывает добавление полки в секцию
   */
  onAddShelfToSection(event: {
    section: 'left' | 'right' | 'center';
    subsectionId?: string;
  }): void {
    console.log(`Adding shelf to ${event.section} section`);
    this.sectionInteractionService.addShelfToSection();
    this.clearSelection();
  }

  /**
   * Обрабатывает добавление блока ящиков в секцию
   */
  onAddDrawerBlockToSection(event: {
    section: 'left' | 'right' | 'center';
    subsectionId?: string;
  }): void {
    console.log(`Adding drawer block to ${event.section} section`);
    this.sectionInteractionService.addDrawerBlockToSection(event.section);
    this.clearSelection();
  }

  /**
   * Закрывает контроллер секций
   */
  onCloseSectionController(): void {
    this.sectionInteractionService.clearSectionSelection();
  }
}
