import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { BASE_URL_STATIC } from 'global';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IImage } from 'src/entities/Image';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-admin-images-loader-multiple',
  standalone: true,
  imports: [StackComponent, CommonModule],
  templateUrl: './admin-images-loader-multiple.component.html',
  styleUrl: '../admin-images-loader.component.scss',
})
export class AdminImagesLoaderMultipleComponent implements OnInit, OnDestroy {
  @Input() control!: AbstractControl<any, any>;
  @Input() multiple: boolean = true;
  @Input() required: boolean = false;

  images$: BehaviorSubject<IImage[]> = new BehaviorSubject<IImage[]>([]);
  imagesPaths: string[] = [];
  draggingIndex: number | null = null;
  private controlSubscription!: Subscription;

  onFileSelected(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;

    const input = event.target as HTMLInputElement;
    const files: FileList = input.files!;

    const currentImages = this.images$.value ?? [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      currentImages.push({ file: file, displayOrder: currentImages.length });
    }

    if (this.multiple) {
      this.images$.next(currentImages);
    } else {
      this.images$.next([{ file: files[0], displayOrder: 0 }]);
    }
    this.setValueToControl();
    this.control.markAsTouched();
  }

  private setValueToControl() {
    const value = this.images$.value;
    let newFiles: IImage[] = [];

    if (!value) return;

    if (this.multiple) {
      newFiles = value.map((image, i) => ({
        ...image,
        displayOrder: i,
      }));
    } else {
      newFiles = [this.images$.value[0]];
    }

    this.images$.next(newFiles);
    this.control.setValue(this.images$.value);
  }

  private updateImagesPaths() {
    if (!this.images$.value) return;
    this.imagesPaths = [];

    const imagePromises = this.images$.value.map((image) => {
      return new Promise<string>((resolve, reject) => {
        if (image.file) {
          // TODO
          // image.file.size / 1024
          const fileReader = new FileReader();
          fileReader.onload = () => {
            resolve(fileReader.result as string);
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(image.file);
        } else if (image.path) {
          resolve(`${BASE_URL_STATIC}${image.path}`);
        } else {
          reject('Neither file nor path is available.');
        }
      });
    });

    Promise.all(imagePromises)
      .then((results) => {
        this.imagesPaths = results;
      })
      .catch((error) => {
        console.error('Error reading files:', error);
      });
  }

  removeFile(index: number) {
    const currentFiles = this.images$.value;
    if (!currentFiles) return;

    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    this.images$.next(updatedFiles);

    this.setValueToControl();
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

    const currentFiles = this.images$.value;
    if (!currentFiles) return;

    const draggedIndex = parseInt(event.dataTransfer!.getData('text/plain'), 0);

    if (draggedIndex !== index) {
      const draggedImage = currentFiles[draggedIndex];
      const draggedSrc = this.imagesPaths[draggedIndex];

      const updatedFiles = currentFiles.filter((_, i) => i !== draggedIndex);
      updatedFiles.splice(index, 0, draggedImage);

      this.images$.next(updatedFiles);

      this.imagesPaths.splice(draggedIndex, 1);
      this.imagesPaths.splice(index, 0, draggedSrc);
    }

    this.setValueToControl();
  }

  ngOnInit(): void {
    this.images$.subscribe(() => {
      this.updateImagesPaths();
    });

    if (this.required) {
      this.control.addValidators(Validators.required);
      this.control.updateValueAndValidity();
    }

    this.images$.next(this.control.value);
    this.setValueToControl();

    this.controlSubscription = this.control.valueChanges.subscribe((value) => {
      if (!value) {
        this.images$.next([]);
        this.imagesPaths = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }
}
