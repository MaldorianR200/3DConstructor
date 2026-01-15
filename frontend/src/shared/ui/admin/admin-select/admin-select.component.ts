import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-select',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './admin-select.component.html',
  styleUrl: './admin-select.component.scss',
})
export class AdminSelectComponent implements OnInit {
  @Input() required: string = '';
  @Input() label: string = '';
  @Input() items: string[] = [];
  @Input() control!: AbstractControl<any, any>;
  formControl!: FormControl;

  isOpen: boolean = false;

  onSelectionChange(item: string): void {
    this.formControl.setValue(item);
    this.isOpen = false;
  }

  changeOpen() {
    this.isOpen = !this.isOpen;
  }

  ngOnInit(): void {
    this.formControl = this.control as FormControl;
    if (!this.formControl) console.error(`Неверно указан formcontrol для ${this.label}`);

    if (this.required) {
      this.formControl.setValidators(Validators.required);
    }
  }
}
