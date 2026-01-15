import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-facade-controller',
  standalone: true,
  imports: [NgIf],
  templateUrl: './facade-controller.component.html',
  styleUrl: './facade-controller.component.scss',
})
export class FacadeControllerComponent {
  @Input() facade: THREE.Object3D | null = null;
  @Output() addMirror = new EventEmitter<THREE.Object3D>();

  onAddMirror() {
    this.addMirror.emit(this.facade);
  }
  // onDeleteMirror() {
  //   this.deleteMirror.emit(this.facade);
  // }
}
