import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  Validators,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export interface AdminInputProps {
  id: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  textarea?: boolean;
  multiple?: boolean;
  options?: Array<string | number | boolean | { value: any; label: string }>;
  labelText?: string;
  optionsBool?: boolean;
}

@Component({
  selector: 'app-admin-input',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule, CommonModule],
  templateUrl: './admin-input.component.html',
  styleUrls: ['./admin-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminInputComponent),
      multi: true,
    },
  ],
})
export class AdminInputComponent implements OnInit, ControlValueAccessor {
  @Input() props!: AdminInputProps;
  @Input() control?: AbstractControl;
  @Input() options?: Array<string | number | boolean | { value: any; label: string }>;
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';

  formControl!: FormControl;
  isFocused: boolean = false;
  isPswd: boolean = false;
  isOpen: boolean = false; // Для управления открытием/закрытием выпадающего списка
  value: any;

  onChange = (v: any) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.isPswd = this.props.type === 'password';

    if (!this.control) {
      console.warn(`Не передан formControl для ${this.props.placeholder}, создаю новый.`);
      // @ts-ignore
      this.formControl = new FormControl(this.props.multiple ? [] : null, this.getValidators());
    } else {
      this.formControl = this.control as FormControl;
      // @ts-ignore
      this.formControl.setValidators(this.getValidators());

      // Нормализация значения
      if (this.props.multiple) {
        if (!Array.isArray(this.formControl.value)) {
          this.formControl.setValue(
            this.formControl.value != null ? [this.formControl.value] : [],
            { emitEvent: false },
          );
        }
      } else {
        if (Array.isArray(this.formControl.value)) {
          this.formControl.setValue(
            this.formControl.value.length ? this.formControl.value[0] : null,
            { emitEvent: false },
          );
        }
      }
    }

    // Обработка изменений
    this.formControl.valueChanges.subscribe((val) => {
      let normalizedValue = val;

      if (this.props.type === 'number' && val !== null && val !== undefined && val !== '') {
        const parsed = parseFloat(val);
        normalizedValue = isNaN(parsed) ? null : parsed;
      }

      if (this.props.multiple) {
        this.value = Array.isArray(normalizedValue)
          ? normalizedValue
          : normalizedValue != null
            ? [normalizedValue]
            : [];
      } else {
        this.value = Array.isArray(normalizedValue)
          ? normalizedValue.length
            ? normalizedValue[0]
            : null
          : normalizedValue;
      }

      this.onChange(this.value);
    });
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (this.formControl) {
      if (this.props.multiple) {
        this.formControl.setValue(Array.isArray(obj) ? obj : obj != null ? [obj] : [], {
          emitEvent: false,
        });
      } else {
        this.formControl.setValue(obj, { emitEvent: false });
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  get formattedOptions(): Array<{ value: any; label: any }> {
    if (this.props.optionsBool) {
      return [
        { label: 'Да', value: true },
        { label: 'Нет', value: false },
      ];
    }
    if (!this.options) return [];
    return this.options.map((option) => {
      if (typeof option === 'object' && option !== null && 'value' in option && 'label' in option) {
        return { value: option.value, label: option.label };
      }
      return { value: option, label: option };
    });
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  changeShowPswd(): void {
    this.props.type = this.props.type === 'password' ? 'text' : 'password';
  }

  toggleDropdown(): void {
    if (this.props.multiple) {
      this.isOpen = !this.isOpen;
    }
  }

  toggleOption(value: any): void {
    let currentValues = Array.isArray(this.formControl.value) ? [...this.formControl.value] : [];
    if (currentValues.includes(value)) {
      currentValues = currentValues.filter((v) => v !== value);
    } else {
      currentValues.push(value);
    }
    this.formControl.setValue(currentValues, { emitEvent: true });
    this.onChange(currentValues);
  }

  isOptionSelected(value: any): boolean {
    return Array.isArray(this.formControl.value) && this.formControl.value.includes(value);
  }

  getValidators(): Validators[] {
    const validators: Validators[] = [];
    if (this.props.required) validators.push(Validators.required);
    if (this.props.minLength) validators.push(Validators.minLength(this.props.minLength));
    if (this.props.maxLength) validators.push(Validators.maxLength(this.props.maxLength));
    if (this.props.type === 'email')
      validators.push(Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'));
    return validators;
  }

  // Метод для проверки наличия значения
  protected hasValue(): boolean {
    if (this.formControl.value === null || this.formControl.value === undefined) return false;
    if (Array.isArray(this.formControl.value) && this.formControl.value.length === 0) return false;
    if (typeof this.formControl.value === 'string' && this.formControl.value.trim() === '')
      return false;
    return true;
  }
}
