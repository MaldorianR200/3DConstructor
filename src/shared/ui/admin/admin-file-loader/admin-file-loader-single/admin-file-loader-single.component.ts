import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StackComponent } from 'src/shared/ui/app';

@Component({
  selector: 'app-admin-file-loader-single',
  standalone: true,
  imports: [NgIf, StackComponent],
  templateUrl: './admin-file-loader-single.component.html',
  styleUrls: ['../admin-file-loader.component.scss'],
})
export class AdminFileLoaderSingleComponent implements OnInit {
  @Input() control!: AbstractControl<any, any>;
  @Input() required: boolean = false;

  file$: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.processFile(file);
    }

    this.control.setValue(file);
    this.control.markAsTouched();
  }

  private processFile(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.file$.next(file);
    };
    fileReader.readAsDataURL(file);
  }

  removeFile() {
    const currentFile = this.file$.getValue();
    if (!currentFile) return;

    this.file$.next(null);

    this.control.setValue(this.file$.getValue());
  }

  ngOnInit(): void {
    if (this.required) {
      this.control.addValidators(Validators.required);
      this.control.updateValueAndValidity();
    }
  }
}
