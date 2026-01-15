import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminInputComponent } from '../admin-input/admin-input.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, AdminInputComponent],
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss'],
})
export class AdminFormComponent {
  @Input() form!: FormGroup;
  @Output() handleSubmit: EventEmitter<void> = new EventEmitter<void>();

  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((field) => {
      const control = this.form.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  onSubmitForm(): void {
    if (this.form.valid) {
      this.handleSubmit.emit(this.form.value);
    } else {
      this.markAllAsTouched();
    }
  }
}
