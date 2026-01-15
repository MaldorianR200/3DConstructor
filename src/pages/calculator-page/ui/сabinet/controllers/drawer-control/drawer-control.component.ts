import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'app-drawer-control',
  standalone: true,
  imports: [NgIf],
  templateUrl: './drawer-control.component.html',
  styleUrl: './drawer-control.component.scss',
})
export class DrawerControlComponent {
  @Input() drawerBlock: THREE.Object3D | null = null;
  @Input() hasMullion!: boolean;
  @Output() deleteBlock = new EventEmitter<THREE.Object3D>();
  @Output() addDrawer = new EventEmitter<THREE.Object3D>();
  @Output() deleteDrawer = new EventEmitter<THREE.Object3D>();
  onDeleteBlock() {
    this.deleteBlock.emit(this.drawerBlock);
  }

  onAddDrawer() {
    this.addDrawer.emit(this.drawerBlock);
  }

  onDeleteDrawer() {
    this.deleteDrawer.emit(this.drawerBlock);
  }
}
