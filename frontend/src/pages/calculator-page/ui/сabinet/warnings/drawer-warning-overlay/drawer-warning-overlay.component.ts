// drawer-warning-overlay.component.ts
import { NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

export interface DrawerWarningAction {
  type: 'removeDrawers' | 'restoreMullion' | 'restoreWidth';
  section?: string;
  problemType?: string;
}

@Component({
  selector: 'app-drawer-warning-overlay',
  standalone: true,
  imports: [NgIf],
  templateUrl: './drawer-warning-overlay.component.html',
  styleUrl: './drawer-warning-overlay.component.scss',
})
export class DrawerWarningOverlayComponent implements AfterViewInit, OnDestroy {
  @Output() actionSelected = new EventEmitter<DrawerWarningAction>();

  isVisible = false;
  title = '';
  message = '';
  section = '';
  problemType = '';
  isSingleCabinet = false;
  hasMullion = false;
  minWidth = 0;
  isAddingNew = false;

  private modalElement: HTMLElement | null = null;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.modalElement = this.elementRef.nativeElement.querySelector('.drawer-warning-modal');
    if (this.modalElement) {
      this.makeDraggable();
    }
  }

  ngOnDestroy(): void {
    // Очистка событий
    this.removeEventListeners();
  }

  show(data: {
    section: string;
    problemType: string;
    isSingleCabinet: boolean;
    hasMullion?: boolean;
    minWidth?: number;
    requiredDepth?: number;
    isAddingNew?: boolean;
  }): void {
    this.section = data.section;
    this.problemType = data.problemType;
    this.isSingleCabinet = data.isSingleCabinet;
    this.hasMullion = data.hasMullion || false;
    this.minWidth = data.minWidth || 0;
    this.isAddingNew = data.isAddingNew || false;

    this.title = this.isAddingNew
      ? '⚠️ Невозможно добавить ящики'
      : '⚠️ Проблема с размещением ящиков';
    this.message = this.getWarningMessage();
    this.isVisible = true;

    setTimeout(() => {
      this.initializePosition();
    });
  }

  hide(): void {
    this.isVisible = false;
  }

  private getWarningMessage(): string {
    const baseMessages: { [key: string]: string } = {
      width_350: 'Блок с ящиками нельзя установить при ширине шкафа 350 мм',
      width_700_mullion: 'Блок с ящиками нельзя установить при ширине шкафа 700 мм со средником',
      width_375_depth_580: 'Блок с ящиками нельзя установить при ширине 375 мм и глубине 580 мм',
      width_375_depth:
        'Блок с ящиками можно устанавливать при ширине 375 мм только с глубиной боковой 430 мм',
      section_too_narrow: 'Секция слишком узкая для установки блока с ящиками',
      general: 'Недопустимые параметры для блока с ящиками',
    };

    const baseMessage = baseMessages[this.problemType] || baseMessages['general'];

    if (this.isAddingNew) {
      // Сообщение только для добавления - без кнопок
      let message = `${baseMessage}.`;

      // Добавляем информацию о минимальных требованиях
      if (this.minWidth > 0) {
        message += ` Минимальная ширина для ящиков: ${this.minWidth}мм.`;
      }

      if (this.problemType.includes('depth')) {
        message += ` Требуемая глубина: 430мм.`;
      }

      return message;
    } else {
      // Сообщение для обновления существующих ящиков - с кнопками
      if (this.isSingleCabinet) {
        let message = `${baseMessage}. Минимальная ширина для ящиков: ${this.minWidth}мм.`;

        if (this.problemType.includes('depth') && this.minWidth) {
          message += ` Требуемая глубина: 430мм.`;
        }

        return message;
      } else {
        return `${baseMessage}. Что вы хотите сделать?`;
      }
    }
  }

  private initializePosition(): void {
    if (!this.modalElement) return;

    // Устанавливаем начальную позицию как у WarningBoard
    this.modalElement.style.position = 'absolute';
    this.modalElement.style.top = '200px';
    this.modalElement.style.left = '50px';
  }

  private makeDraggable(): void {
    if (!this.modalElement) return;

    const header = this.modalElement.querySelector('.drawer-warning-header') as HTMLElement;
    if (!header) return;

    // Добавляем курсор перемещения в заголовок
    header.style.cursor = 'move';
    header.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  private onMouseDown(e: MouseEvent): void {
    if (!this.modalElement) return;

    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.classList.contains('drawer-warning-icon') ||
      target.closest('.drawer-warning-icon')
    ) {
      return;
    }

    // Предотвращаем перетаскивание при клике на кнопки или иконки
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.drawer-warning-icon')
    ) {
      return;
    }

    e.preventDefault();
    this.isDragging = true;
    this.offsetX = e.clientX - this.modalElement.offsetLeft;
    this.offsetY = e.clientY - this.modalElement.offsetTop;

    // Добавляем глобальные обработчики
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Добавляем класс для визуальной обратной связи
    this.modalElement.classList.add('dragging');
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.modalElement) return;

    this.modalElement.style.left = `${e.clientX - this.offsetX}px`;
    this.modalElement.style.top = `${e.clientY - this.offsetY}px`;
  }

  private onMouseUp(): void {
    this.isDragging = false;

    // Удаляем глобальные обработчики
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));

    // Убираем класс dragging
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  removeDrawers(): void {
    this.actionSelected.emit({
      type: 'removeDrawers',
      section: this.section,
    });
    this.hide();
  }

  restoreMullion(): void {
    this.actionSelected.emit({
      type: 'restoreMullion',
    });
    this.hide();
  }

  restoreWidth(): void {
    this.actionSelected.emit({
      type: 'restoreWidth',
      section: this.section,
      problemType: this.problemType,
    });
    this.hide();
  }

  close(): void {
    this.hide();
    // Можно также эмитнуть событие отмены, если нужно
    this.actionSelected.emit({
      type: 'restoreMullion', // или добавить новый тип 'cancel'
    });
  }
}
