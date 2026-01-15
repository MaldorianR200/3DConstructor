import * as THREE from 'three';

export class CabinetGridManagerService {
  private static highlightedObjects = new Map<THREE.Object3D, THREE.LineSegments[]>();

  static highlightObjectWithGrid(object: THREE.Object3D, color: number = 0x00ff00): void {
    this.removeGridHighlight(object); // Удалить старую подсветку

    if (object instanceof THREE.Mesh) {
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);

      let grids: THREE.LineSegments[];

      // Определяем, является ли объект фасадом
      const isFacade =
        object.name.toLowerCase().includes('facade') || object.userData['type'] == 'facade';

      if (isFacade) {
        grids = this.createEdgeGridForObject(size.x, size.y, size.z, color);
      } else {
        if (object.name == 'rodMesh_curve' || object.name == 'rodMesh') {
          grids = this.createGridsForObject(size.z, size.y, size.x, color);
        } else if (object.name == 'holder-left' || object.name == 'holder-right') {
          grids = this.createGridsForObject(size.z, size.x, size.y, color);
        } else {
          grids = this.createGridsForObject(size.x, size.y, size.z, color);
        }
      }

      grids.forEach((grid) => object.add(grid));
      this.highlightedObjects.set(object, grids);
    }
  }

  private static createGridsForObject(
    width: number,
    height: number,
    depth: number,
    color: number,
  ): THREE.LineSegments[] {
    const divisions = 10;
    const grids: THREE.LineSegments[] = [];

    // Создаем сетки для всех граней
    const createGrid = (w: number, h: number, position: THREE.Vector3, rotation: THREE.Euler) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const stepX = w / divisions;
      const stepY = h / divisions;

      for (let i = 0; i <= divisions; i++) {
        const x = -w / 2 + i * stepX;
        vertices.push(x, -h / 2, 0, x, h / 2, 0);
      }

      for (let i = 0; i <= divisions; i++) {
        const y = -h / 2 + i * stepY;
        vertices.push(-w / 2, y, 0, w / 2, y, 0);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new THREE.LineBasicMaterial({ color });
      const grid = new THREE.LineSegments(geometry, material);
      grid.position.copy(position);
      grid.rotation.copy(rotation);
      return grid;
    };

    grids.push(
      createGrid(
        width,
        depth,
        new THREE.Vector3(0, height / 2, 0),
        new THREE.Euler(-Math.PI / 2, 0, 0),
      ),
    );
    grids.push(
      createGrid(
        width,
        depth,
        new THREE.Vector3(0, -height / 2, 0),
        new THREE.Euler(Math.PI / 2, 0, 0),
      ),
    );
    grids.push(
      createGrid(width, height, new THREE.Vector3(0, 0, depth / 2), new THREE.Euler(0, 0, 0)),
    );
    grids.push(
      createGrid(
        width,
        height,
        new THREE.Vector3(0, 0, -depth / 2),
        new THREE.Euler(0, Math.PI, 0),
      ),
    );
    grids.push(
      createGrid(
        depth,
        height,
        new THREE.Vector3(-width / 2, 0, 0),
        new THREE.Euler(0, Math.PI / 2, 0),
      ),
    );
    grids.push(
      createGrid(
        depth,
        height,
        new THREE.Vector3(width / 2, 0, 0),
        new THREE.Euler(0, -Math.PI / 2, 0),
      ),
    );

    return grids;
  }

  private static createEdgeGridForObject(
    width: number,
    height: number,
    depth: number,
    color: number,
  ): THREE.LineSegments[] {
    const grids: THREE.LineSegments[] = [];

    const createOutline = (
      w: number,
      h: number,
      position: THREE.Vector3,
      rotation: THREE.Euler,
    ) => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];

      // Четыре линии по краям прямоугольника (грани)
      vertices.push(
        -w / 2,
        -h / 2,
        0,
        w / 2,
        -h / 2,
        0, // нижняя
        w / 2,
        -h / 2,
        0,
        w / 2,
        h / 2,
        0, // правая
        w / 2,
        h / 2,
        0,
        -w / 2,
        h / 2,
        0, // верхняя
        -w / 2,
        h / 2,
        0,
        -w / 2,
        -h / 2,
        0, // левая
      );

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new THREE.LineBasicMaterial({ color });
      const outline = new THREE.LineSegments(geometry, material);
      outline.position.copy(position);
      outline.rotation.copy(rotation);
      return outline;
    };

    // Выделим только переднюю грань объекта (например, дверь)
    grids.push(
      createOutline(
        width,
        height,
        new THREE.Vector3(0, 0, depth / 2 + 0.01), // немного сдвигаем вперёд, чтобы не мерцало
        new THREE.Euler(0, 0, 0),
      ),
    );

    return grids;
  }

  static removeGridHighlight(object: THREE.Object3D): void {
    if (!object) return;

    const grids = this.highlightedObjects.get(object);
    if (grids) {
      grids.forEach((grid) => {
        if (grid.parent) {
          grid.parent.remove(grid);
        }
      });
      this.highlightedObjects.delete(object);
    }
  }
}
