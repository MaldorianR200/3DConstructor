import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-rod-control',
  standalone: true,
  imports: [NgIf],
  templateUrl: './rod-control.component.html',
  styleUrl: './rod-control.component.scss',
})
export class RodControlComponent {
  @Input() rod: THREE.Object3D | null = null;
  @Output() deleteRod = new EventEmitter<THREE.Object3D>();

  onDelete() {
    this.deleteRod.emit(this.rod); // Сообщаем родительскому компоненту, чтобы удалить средник
  }
}
