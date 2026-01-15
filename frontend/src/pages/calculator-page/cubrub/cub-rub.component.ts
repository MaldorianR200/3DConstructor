import { isPlatformBrowser, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  Inject,
  NgZone,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Axis = 'x' | 'y' | 'z';
type Selected = { axis: Axis; layer: number; normal: THREE.Vector3 } | null;

@Component({
  selector: 'app-cub-rub',
  standalone: true,
  imports: [NgIf],
  templateUrl: './cub-rub.component.html',
  styleUrl: './cub-rub.component.scss',
})
export class CubRubComponent {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private rubik = new THREE.Group();
  private turnGroup = new THREE.Group();

  private cubies: THREE.Mesh[] = [];
  private isRotatingCube = false; // Флаг вращения самого куба

  // Свойства для инерции
  private cubeVelocity = new THREE.Vector2(0, 0);
  private damping = 0.95; // Коэффициент замедления (чем ближе к 1, тем дольше крутится)
  private readonly sensitivity = 0.007;

  // Добавим для очистки памяти при уничтожении компонента
  private readonly destroy$ = new Subject<void>();

  // Ресурсы
  private materialsMap = new Map<number, THREE.MeshPhongMaterial>();
  private commonGeo = new THREE.BoxGeometry(1, 1, 1);

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public selected: Selected = null;
  private isTurning = false;
  private lastPointer = new THREE.Vector2();
  private totalMovement = 0;

  private readonly step = 1.05;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @HostListener('window:resize')
  onResize() {
    const host = this.hostRef.nativeElement;
    this.camera.aspect = host.clientWidth / host.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(host.clientWidth, host.clientHeight);
  }

  // Метод для вызова из HTML кнопками
  turnSelected(dir: number) {
    if (this.selected && !this.isTurning) {
      this.turn(this.selected.axis, this.selected.layer, dir);
    }
  }

  deselect() {
    this.selected = null;
    this.clearHighlight();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Запускаем всё вне зоны Angular, чтобы движение мыши не вызывало перерисовку всего сайта
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.buildRubik();
      this.setupEventListeners();
      this.startLoop();
    });
  }

  ngOnDestroy() {
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.controls?.dispose();
    this.commonGeo.dispose();
    this.materialsMap.forEach((m) => m.dispose());
  }

  private initThree() {
    const host = this.hostRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    const isPortrait = host.clientHeight > host.clientWidth;
    this.camera = new THREE.PerspectiveCamera(
      isPortrait ? 55 : 45,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    );
    this.camera.position.set(8, 8, 10);

    this.camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 100);
    this.camera.position.set(8, 8, 10);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    this.scene.add(this.rubik);
    this.rubik.add(this.turnGroup);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // БЛОКИРУЕМ камеру
    this.controls.enableRotate = false; // Отключаем вращение камеры
    this.controls.enablePan = false; // Отключаем панорамирование
    this.controls.enableZoom = true; // Разрешаем зум
  }

  private buildRubik() {
    const C = {
      r: 0xd32f2f,
      o: 0xf57c00,
      w: 0xffffff,
      y: 0xfdd835,
      b: 0x1976d2,
      g: 0x388e3c,
      i: 0x111111,
    };

    // Создаем всего 7 материалов вместо 162 (27 кубов * 6 сторон)
    const getMat = (color: number) => {
      if (!this.materialsMap.has(color)) {
        this.materialsMap.set(
          color,
          new THREE.MeshPhongMaterial({
            color,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 30,
          }),
        );
      }
      return this.materialsMap.get(color)!;
    };

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mats = [
            getMat(x === 1 ? C.r : C.i),
            getMat(x === -1 ? C.o : C.i),
            getMat(y === 1 ? C.w : C.i),
            getMat(y === -1 ? C.y : C.i),
            getMat(z === 1 ? C.b : C.i),
            getMat(z === -1 ? C.g : C.i),
          ];
          const mesh = new THREE.Mesh(this.commonGeo, mats);
          mesh.position.set(x * this.step, y * this.step, z * this.step);
          mesh.userData['grid'] = new THREE.Vector3(x, y, z);
          this.rubik.add(mesh);
          this.cubies.push(mesh);
        }
      }
    }
  }

  private setupEventListeners() {
    // const el = window;
    // el.addEventListener('pointermove', (e) => this.onPointerMove(e as PointerEvent));
    // el.addEventListener('pointerup', (e) => this.onPointerUp(e as PointerEvent));
    // el.addEventListener('keydown', (e) => this.onKeyDown(e as KeyboardEvent));
    const canvas = this.renderer?.domElement;
    if (!canvas) return;

    // Слушаем pointerdown именно на канвасе
    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    // Остальные слушаем на window, чтобы не терять куб, если палец ушел за границы
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('resize', () => this.onResize());
  }

  onPointerDown(ev: PointerEvent) {
    this.isRotatingCube = true; // Начинаем вращение куба
    this.totalMovement = 0;
    this.lastPointer.set(ev.clientX, ev.clientY);

    // Сбрасываем скорость при нажатии
    this.cubeVelocity.set(0, 0);
  }

  onPointerMove(ev: PointerEvent) {
    if (this.isTurning) return; // Не вращаем куб, пока крутится слой

    if (this.isRotatingCube) {
      const deltaX = ev.clientX - this.lastPointer.x;
      const deltaY = ev.clientY - this.lastPointer.y;

      this.totalMovement += Math.abs(deltaX) + Math.abs(deltaY);

      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        this.cubeVelocity.set(deltaX * this.sensitivity, deltaY * this.sensitivity);
        this.applyRotation(this.cubeVelocity.x, this.cubeVelocity.y);
      }

      this.lastPointer.set(ev.clientX, ev.clientY);
    }
  }

  onPointerUp(ev: PointerEvent) {
    if (!this.isRotatingCube) return;
    this.isRotatingCube = false;

    // Если мышь почти не двигалась — это клик (выбор слоя)
    if (this.totalMovement < 10) {
      // this.pickCubie(ev);
      this.zone.run(() => this.pickCubie(ev)); // Возвращаемся в зону для обновления UI кнопок
    }
  }

  /**
   * Применяет вращение к группе rubik
   */
  private applyRotation(velX: number, velY: number) {
    const rotateY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), velX);
    const rotateX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), velY);

    this.rubik.quaternion.premultiply(rotateY);
    this.rubik.quaternion.premultiply(rotateX);
  }

  /**
   * Вызывается в цикле рендеринга для обработки инерции
   */
  private updateInertia() {
    // Если мы не тащим куб и скорость еще значительна
    if (!this.isRotatingCube && this.cubeVelocity.length() > 0.0001) {
      // Применяем текущую скорость
      this.applyRotation(this.cubeVelocity.x, this.cubeVelocity.y);

      // Замедляем скорость
      this.cubeVelocity.multiplyScalar(this.damping);
    }
  }

  private pickCubie(ev: PointerEvent) {
    if (this.isTurning) return;
    const rect = this.hostRef.nativeElement.getBoundingClientRect();

    this.mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.cubies);

    if (hits.length > 0) {
      const hit = hits[0];
      const mesh = hit.object as THREE.Mesh;

      // Получаем нормаль грани в локальных координатах меша (кубика).
      const worldNormal = hit.face!.normal.clone();

      // Переводим локальную нормаль меша в мировые координаты.
      worldNormal.transformDirection(mesh.matrixWorld);

      // Переводим мировую нормаль в локальную систему координат ГРУППЫ rubik.
      const rubikWorldQuat = new THREE.Quaternion();
      this.rubik.getWorldQuaternion(rubikWorldQuat);
      const localNormal = worldNormal.applyQuaternion(rubikWorldQuat.invert()).normalize();

      // Определяем главную ось (X, Y или Z)
      const absN = new THREE.Vector3(
        Math.abs(localNormal.x),
        Math.abs(localNormal.y),
        Math.abs(localNormal.z),
      );

      let axis: Axis = 'x';
      if (absN.y > absN.x && absN.y > absN.z) axis = 'y';
      else if (absN.z > absN.x && absN.z > absN.y) axis = 'z';

      const grid = mesh.userData['grid'] as THREE.Vector3;

      // normal.round() даст нам чистое направление (1, 0, 0) и т.д.
      this.selected = {
        axis,
        layer: grid[axis],
        normal: localNormal.round(),
      };

      this.highlightLayer();
    } else {
      this.selected = null;
      this.clearHighlight();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    if (ev.code === 'Space') {
      this.selected = null;
      this.clearHighlight();
      return;
    }
    if (!this.selected || this.isTurning) return;

    // Используем ev.code для определения физической клавиши
    // 'KeyR' — это клавиша, где в англ. раскладке 'R', а в рус. 'К'
    // 'KeyF' — это клавиша, где в англ. раскладке 'F', а в рус. 'А'
    if (ev.code === 'KeyR' || ev.code === 'KeyF') {
      const direction = ev.code === 'KeyR' ? 1 : -1;
      this.turn(this.selected.axis, this.selected.layer, direction);
    }
  }

  private turn(axis: Axis, layer: number, dir: number) {
    this.isTurning = true;
    const layerCubies = this.cubies.filter((c) => c.userData['grid'][axis] === layer);

    this.turnGroup.quaternion.identity();
    layerCubies.forEach((c) => this.turnGroup.attach(c));

    const targetQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0),
      (Math.PI / 2) * dir,
    );

    const start = performance.now();
    const animate = (now: number) => {
      let p = (now - start) / 200;
      if (p > 1) p = 1;
      this.turnGroup.quaternion.slerpQuaternions(new THREE.Quaternion(), targetQuat, p);
      if (p < 1) requestAnimationFrame(animate);
      else this.finalizeTurn(axis, dir, layerCubies);
    };
    requestAnimationFrame(animate);
  }

  private finalizeTurn(axis: Axis, dir: number, cubies: THREE.Mesh[]) {
    cubies.forEach((c) => {
      this.rubik.attach(c);
      const g = c.userData['grid'] as THREE.Vector3;

      // МАТЕМАТИКА ПОВОРОТА СЕТКИ КУБИКА
      const x = g.x,
        y = g.y,
        z = g.z;
      if (axis === 'x') {
        g.y = dir > 0 ? -z : z;
        g.z = dir > 0 ? y : -y;
      } else if (axis === 'y') {
        g.x = dir > 0 ? z : -z;
        g.z = dir > 0 ? -x : x;
      } else if (axis === 'z') {
        g.x = dir > 0 ? -y : y;
        g.y = dir > 0 ? x : -x;
      }

      c.position.set(g.x * this.step, g.y * this.step, g.z * this.step);
      this.snapMesh(c);
    });

    this.isTurning = false;
    if (this.selected) this.highlightLayer();
  }

  private snapMesh(mesh: THREE.Mesh) {
    const mat = new THREE.Matrix4().extractRotation(mesh.matrix);
    const x = new THREE.Vector3(),
      y = new THREE.Vector3(),
      z = new THREE.Vector3();
    mat.extractBasis(x, y, z);

    const snap = (v: THREE.Vector3) => {
      const abs = new THREE.Vector3(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
      if (abs.x > abs.y && abs.x > abs.z) v.set(v.x > 0 ? 1 : -1, 0, 0);
      else if (abs.y > abs.x && abs.y > abs.z) v.set(0, v.y > 0 ? 1 : -1, 0);
      else v.set(0, 0, v.z > 0 ? 1 : -1);
    };

    [x, y, z].forEach(snap);
    mat.makeBasis(x, y, z);
    mesh.quaternion.setFromRotationMatrix(mat);
  }

  private highlightLayer() {
    this.clearHighlight();
    if (!this.selected) return;

    const axis = this.selected.axis;
    const layer = this.selected.layer;

    for (const c of this.cubies) {
      if (c.userData['grid'][axis] === layer) {
        (c.material as THREE.MeshPhongMaterial[]).forEach((m) => m.emissive.setHex(0x222222));
      }
    }
  }

  private clearHighlight() {
    this.cubies.forEach((c) =>
      (c.material as any).forEach((m: any) => m.emissive.setHex(0x000000)),
    );
  }

  private startLoop() {
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        // Обновляем инерцию куба
        this.updateInertia();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
}
