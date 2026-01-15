import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'app-mullion-control',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mullion-control.component.html',
  styleUrl: './mullion-control.component.scss',
})
export class MullionControlComponent {
  @Input() mullion: THREE.Object3D | null = null;
  @Output() deleteMullion = new EventEmitter<THREE.Object3D>();
  @Output() moveMullionUp = new EventEmitter<THREE.Object3D>();
  @Output() moveMullionDown = new EventEmitter<THREE.Object3D>();

  onMoveUp() {
    this.moveMullionUp.emit(this.mullion); // Сообщаем родительскому компоненту, чтобы переместить средник вверх
  }

  onMoveDown() {
    this.moveMullionDown.emit(this.mullion); // Сообщаем родительскому компоненту, чтобы переместить средник вниз
  }

  onDelete() {
    this.deleteMullion.emit(this.mullion); // Сообщаем родительскому компоненту, чтобы удалить средник
  }
}
