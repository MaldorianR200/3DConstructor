import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StackComponent } from 'src/shared/ui/app';

interface IFileObject {
  file?: File;
  id?: string;
  name?: string; // добавили имя файла
  displayOrder?: number;
}

@Component({
  selector: 'app-admin-file-loader-multiple',
  standalone: true,
  imports: [NgFor, NgIf, StackComponent, CommonModule],
  templateUrl: './admin-file-loader-multiple.component.html',
  styleUrls: ['../admin-file-loader.component.scss'],
})
export class AdminFileLoaderMultipleComponent implements OnInit {
  @Input() control!: AbstractControl<IFileObject[] | null, any>;
  @Input() required: boolean = false;

  files$: BehaviorSubject<IFileObject[]> = new BehaviorSubject<IFileObject[]>([]);
  draggingIndex: number | null = null;

  onFileSelected(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;

    const input = event.target as HTMLInputElement;
    const files: FileList = input.files!;
    if (!files) return;

    const current = this.files$.value ?? [];

    for (let i = 0; i < files.length; i++) {
      const file: IFileObject = {
        file: files[i],
        name: files[i].name, // сохраняем имя
        displayOrder: current.length + i,
      };
      current.push(file);
    }

    this.files$.next(current);
    this.control.setValue(current);
    this.control.markAsTouched();
  }

  removeFile(index: number) {
    const current = this.files$.value;
    if (!current) return;

    const updated = current.filter((_, i) => i !== index);
    this.files$.next(updated);
    this.control.setValue(updated);
  }

  onDragStart(event: DragEvent, index: number) {
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, index: number) {
    event.preventDefault();
    const current = this.files$.value;
    if (!current) return;

    const draggedIndex = parseInt(event.dataTransfer!.getData('text/plain'), 10);
    if (draggedIndex === index) return;

    const dragged = current[draggedIndex];
    const updated = current.filter((_, i) => i !== draggedIndex);
    updated.splice(index, 0, dragged);

    this.files$.next(updated);
    this.control.setValue(updated);
  }

  ngOnInit(): void {
    if (this.required) {
      this.control.addValidators(Validators.required);
      this.control.updateValueAndValidity();
    }

    // При редактировании уже существующих файлов (из БД)
    if (this.control.value) {
      const current = this.control.value.map((item) => ({
        ...item,
        name: item.name || item.file?.name || 'Файл',
      }));
      this.files$.next(current);
    }
  }
}
