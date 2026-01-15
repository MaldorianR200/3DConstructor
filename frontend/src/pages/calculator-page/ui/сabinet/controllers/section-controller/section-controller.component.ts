import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subsection } from '../../model/Subsection';

@Component({
  selector: 'app-section-controller',
  standalone: true,
  templateUrl: './section-controller.component.html',
  styleUrls: ['./section-controller.component.scss'],
  imports: [NgIf, NgFor],
})
export class SectionControllerComponent {
  @Input() selectedSection: 'left' | 'right' | 'center' | null = null;
  @Input() hideUI: boolean = false;
  @Input() availableSubsections: Subsection[] = [];

  @Output() addShelf = new EventEmitter<{
    section: 'left' | 'right' | 'center';
    subsectionId?: string;
  }>();

  @Output() addDrawerBlock = new EventEmitter<{
    section: 'left' | 'right' | 'center';
    subsectionId?: string;
  }>();

  @Output() closeController = new EventEmitter<void>();
  @Output() subsectionSelected = new EventEmitter<Subsection>();

  selectedSubsection: Subsection | null = null;

  ngOnChanges() {
    console.log('SectionController - ngOnChanges:', {
      selectedSection: this.selectedSection,
      hideUI: this.hideUI,
    });
  }

  ngOnInit() {
    console.log('SectionController - ngOnInit');
  }

  getSectionName(section: 'left' | 'right' | 'center'): string {
    const sectionNames = {
      left: 'Левая',
      right: 'Правая',
      center: 'Центральная',
    };
    return sectionNames[section];
  }

  /**
   * Добавляет полку в секцию
   */
  addShelfToSection(section: 'left' | 'right' | 'center'): void {
    console.log('Adding shelf to section:', section);
    this.addShelf.emit({ section });
  }

  /**
   * Добавляет блок ящиков в секцию
   */
  addBlockDrawer(section: 'left' | 'right' | 'center'): void {
    console.log('Adding drawer block to section:', section);
    this.addDrawerBlock.emit({ section });
  }

  /**
   * Закрывает контроллер
   */
  clearSelection(): void {
    this.closeController.emit();
  }
}
