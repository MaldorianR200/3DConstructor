import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import * as THREE from 'three';
@Component({
  selector: 'app-mirror-controller',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mirror-control.component.html',
  styleUrl: './mirror-control.component.scss',
})
export class MirrorControllerComponent {
  @Input() mirror: THREE.Object3D | null = null;
  @Output() deleteMirror = new EventEmitter<THREE.Object3D>();

  onDeleteMirror() {
    this.deleteMirror.emit(this.mirror);
  }
}
