import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { BASE_URL_STATIC } from 'global';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IImage } from 'src/entities/Image';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-admin-images-loader-single',
  standalone: true,
  imports: [StackComponent, CommonModule],
  templateUrl: './admin-images-loader-single.component.html',
  styleUrl: '../admin-images-loader.component.scss',
})
export class AdminImagesLoaderSingleComponent implements OnInit, OnDestroy {
  @Input() control!: AbstractControl<any, any>;
  @Input() required: boolean = false;

  image$: BehaviorSubject<IImage | null> = new BehaviorSubject<IImage | null>(null);
  imagePath: string | null = null;
  private controlSubscription!: Subscription;

  onFileSelected(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target as HTMLInputElement;
    const file: File = input.files![0];

    this.image$.next({ file: file, displayOrder: 0 });
    this.setValueToControl();
    this.control.markAsTouched();
  }

  private setValueToControl() {
    if (!this.image$.value) return;
    this.control.setValue(this.image$.value);
  }

  private updateImagesPaths() {
    const value = this.image$.value;
    if (!value) {
      this.imagePath = null;
      return;
    }

    if (value.file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imagePath = fileReader.result as string;
      };
      fileReader.readAsDataURL(value.file);
    } else if (value.path) {
      this.imagePath = `${BASE_URL_STATIC}${value.path}`;
    }
  }

  removeFile() {
    this.image$.next(null);
    this.setValueToControl();
  }

  ngOnInit(): void {
    this.image$.subscribe(() => {
      this.updateImagesPaths();
    });

    if (this.required) {
      this.control.addValidators(Validators.required);
      this.control.updateValueAndValidity();
    }

    this.image$.next(this.control.value);
    this.setValueToControl();

    this.controlSubscription = this.control.valueChanges.subscribe((value) => {
      if (!value) {
        this.image$.next(null);
        this.imagePath = null;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }
}
