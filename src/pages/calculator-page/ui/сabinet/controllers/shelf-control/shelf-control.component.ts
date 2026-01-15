import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';
import { ShelfType } from '../../model/Shelf';
import { CabinetSubType, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { ProductType } from 'src/entities/Product/model/types/product.model';


@Component({
  selector: 'app-shelf-control',
  standalone: true,
  imports: [NgIf],
  templateUrl: './shelf-control.component.html',
  styleUrl: './shelf-control.component.scss',
})
export class ShelfControlComponent {
  private _shelf: THREE.Object3D | null = null;
  private _rodSideSelectionVisible: boolean = false;
  private _hasRod: boolean = false;

  public leftRodAdded: boolean = false;
  public rightRodAdded: boolean = false;
  public fullRodAdded: boolean = false;

  @Input() cabinetSize!: Size;
  @Input() mullionObj: THREE.Object3D | null;
  @Input() mullionHeight: number | null = null;
  @Input() cabinetType: CabinetSubType;
  @Input() hasMullion!: boolean;

  @Input() set shelf(value: THREE.Object3D | null) {
    this._shelf = value;

    if (value) {
      const userData = value.userData;
      const name = value.name;

      // Получаем секцию полки из userData
      const shelfSection = userData['section'] || this.determineShelfSectionFromPosition(value);

      // Обновляем состояние штанг
      this.updateRodStates(value);

      // Сбросим флаг выбора стороны
      this._rodSideSelectionVisible = false;

      if (this.isTopCabinet) {
        userData['type'] = 'topCabinet';
      } else if (!userData['type']) {
        userData['type'] = 'cutout';
      }

      this.shelfType = userData['type'];
    } else {
      // Сбросить состояния при отсутствии полки
      this._hasRod = false;
      this.leftRodAdded = false;
      this.rightRodAdded = false;
      this.fullRodAdded = false;
      this._rodSideSelectionVisible = false;
    }
  }

  get shelf(): THREE.Object3D | null {
    return this._shelf;
  }

  get rodSideSelectionVisible(): boolean {
    return this._rodSideSelectionVisible;
  }

  @Output() deleteShelf = new EventEmitter<THREE.Object3D>();
  @Output() addRodShelf = new EventEmitter<{
    shelf: THREE.Object3D;
    side: 'left' | 'right' | 'full';
  }>();
  @Output() shelfTypeChange = new EventEmitter<{ shelf: THREE.Object3D; type: ShelfType }>();
  @Output() hasRodChange = new EventEmitter<boolean>();

  shelfType: ShelfType = 'cutout';

  get isTopCabinet(): boolean {
    return this.shelf?.name == 'topCabinet';
  }

  get hasRod(): boolean {
    return this._hasRod || this.leftRodAdded || this.rightRodAdded || this.fullRodAdded;
  }

  /**
   * Проверяет, является ли средник во всю высоту
   */
  get isFullHeightMullion(): boolean {
    if (!this.hasMullion || !this.mullionHeight || !this.cabinetSize) {
      return false;
    }
    // Считаем средник во всю высоту, если его высота составляет не менее 90% высоты шкафа
    const minHeight = this.cabinetSize.height * 0.9;
    return this.mullionHeight >= minHeight;
  }

  /**
   * Проверяет, является ли глубина шкафа 580мм
   */
  get isDepth580(): boolean {
    console.log(this.cabinetSize?.depth);
    console.log(this.rodSideSelectionVisible);
    return this.cabinetSize?.depth === 580;
  }

  /**
   * Определяет, разрешено ли добавлять штанги отдельно слева/справа
   */
  get allowSeparateRods(): boolean {
    // Для topCabinet
    if (this.isTopCabinet) {
      // Если глубина 580мм, двустворчатый шкаф и нет средника - НЕ разрешаем отдельные штанги
      if (this.isDepth580 && this.cabinetType === 'double' && !this.hasMullion) {
        return false;
      }
      // В остальных случаях разрешаем
      return true;
    }

    // Для обычных полок
    // Если глубина 580мм и нет средника - НЕ разрешаем отдельные штанги
    if (this.isDepth580 && !this.hasMullion) {
      return false;
    }

    return true;
  }

  get isAddRodButtonDisabled(): boolean {
    // Для topCabinet в двустворчатом шкафу
    if (this.isTopCabinet && this.cabinetType === 'double') {
      // Блокировать только если добавлены обе штанги
      return this.leftRodAdded && this.rightRodAdded;
    }

    // Для одностворчатого шкафа или обычных полок - старая логика
    return this.hasRod;
  }

  /**
   * Определяет секцию полки на основе ее позиции X
   */
  private determineShelfSectionFromPosition(shelf: THREE.Object3D): 'left' | 'right' | 'center' {
    if (!this.hasMullion || !this.mullionObj || !shelf) {
      return 'center';
    }

    const mullionPositionX = this.mullionObj.position.x;
    const shelfPositionX = shelf.position.x;

    // Допуск для определения секции (например, 5мм)
    const tolerance = 5;

    if (Math.abs(shelfPositionX - mullionPositionX) < tolerance) {
      return 'center';
    } else if (shelfPositionX < mullionPositionX) {
      return 'left';
    } else {
      return 'right';
    }
  }

  /**
   * Получает секцию полки (из userData или вычисляет)
   */
  public getShelfSection(): 'left' | 'right' | 'center' {
    if (!this._shelf) return 'center';

    const section = this._shelf.userData['section'];
    if (section) {
      return section;
    }

    return this.determineShelfSectionFromPosition(this._shelf);
  }

  /**
   * Получает тип штанги, добавленной на полку
   */
  private getShelfRodType(): string | null {
    if (!this._shelf) return null;

    // Ищем штангу среди дочерних элементов
    const rodChild = this._shelf.children.find((child) => child.name.startsWith('rod_'));

    if (rodChild) {
      // Проверяем userData или имя для определения типа
      return rodChild.userData['rodType'] || 'solidRod'; // default
    }

    return null;
  }

  /**
   * Проверяет, является ли добавленная штанга выдвижной
   */
  private isExtendableRod(): boolean {
    const rodType = this.getShelfRodType();
    return rodType === 'extendableRod';
  }

  /**
   * Проверяет, является ли добавленная штанга solid
   */
  private isSolidRod(): boolean {
    const rodType = this.getShelfRodType();
    return rodType === 'solidRod';
  }

  /**
   * Обновляет состояния всех штанг
   */
  private updateRodStates(shelf: THREE.Object3D): void {
    const name = shelf.name;

    this.leftRodAdded = shelf.children.some(
      (c) =>
        c.name.includes(`rod_left_${name}`) ||
        (c.name.includes(`rod_${name}`) && c.userData['side'] === 'left'),
    );

    this.rightRodAdded = shelf.children.some(
      (c) =>
        c.name.includes(`rod_right_${name}`) ||
        (c.name.includes(`rod_${name}`) && c.userData['side'] === 'right'),
    );

    this.fullRodAdded = shelf.children.some(
      (c) =>
        (c.name.includes(`rod_full_${name}`) || c.name.includes(`rod_${name}`)) &&
        (!c.userData['side'] || c.userData['side'] === 'full'),
    );

    this._hasRod = this.leftRodAdded || this.rightRodAdded || this.fullRodAdded;
    shelf.userData['hasRod'] = this._hasRod;
  }

  onDeleteShelf() {
    this.deleteShelf.emit(this.shelf);
  }

  toggleShelfType() {
    if (!this.shelf) return;

    if (this.isTopCabinet) {
      this.shelfType = 'topCabinet';
      this.shelf.userData['type'] = 'topCabinet';
      this.shelfTypeChange.emit({ shelf: this.shelf, type: this.shelfType });
      return;
    }

    this.shelfType = this.shelfType == 'cutout' ? 'recessed' : 'cutout';
    this.shelf.userData['type'] = this.shelfType;
    this.shelfTypeChange.emit({ shelf: this.shelf, type: this.shelfType });
  }

  /**
   * Основной метод для добавления штанги с учетом всех условий
   */
  onAddRodShelf(event: MouseEvent) {
    if (!this.shelf) return;

    // Для topCabinet
    if (this.isTopCabinet) {
      // Проверяем специальные условия для глубины 580мм
      if (this.isDepth580 && this.cabinetType === 'double' && !this.hasMullion) {
        // Глубина 580мм, двустворчатый шкаф, нет средника - только полная штанга
        if (!this.hasRod) {
          this.addRodShelf.emit({
            shelf: this.shelf,
            side: 'full',
          });
          this.updateRodState('full');
        }
      } else {
        // Обычная логика для topCabinet
        const canAddBothSides = this.canAddRodsOnBothSides();

        if (canAddBothSides) {
          // Можно добавлять слева и справа
          if (!this.leftRodAdded && !this.rightRodAdded) {
            this._rodSideSelectionVisible = true;
          } else if (!this.leftRodAdded || !this.rightRodAdded) {
            this._rodSideSelectionVisible = true;
          }
        } else {
          // Нельзя добавлять отдельно слева/справа - добавляем полную штангу
          if (!this.hasRod) {
            this.addRodShelf.emit({
              shelf: this.shelf,
              side: 'full',
            });
            this.updateRodState('full');
          }
        }
      }
      return;
    }

    // Для обычных полок
    const shelfSection = this.getShelfSection();

    // Логика в зависимости от типа шкафа и наличия средника
    if (this.cabinetType === 'single') {
      // Одностворчатый шкаф - всегда полная штанга
      if (!this.hasRod) {
        this.addRodShelf.emit({
          shelf: this.shelf,
          side: 'full',
        });
        this.updateRodState('full');
        this.updateRodStates(this.shelf);
      }
      return;
    }

    // Двустворчатый шкаф
    if (this.cabinetType === 'double') {
      // Проверяем специальные условия для глубины 580мм
      if (this.isDepth580 && !this.hasMullion) {
        // Глубина 580мм, нет средника - только полная штанга
        if (!this.hasRod) {
          this.addRodShelf.emit({
            shelf: this.shelf,
            side: 'full',
          });
          this.updateRodState('full');
        }
        return;
      }

      // Проверяем, можем ли мы добавлять штанги слева и справа
      const canAddBothSides = this.canAddRodsOnBothSides();

      if (canAddBothSides) {
        // Можно добавлять слева и справа
        // Показываем выбор стороны, если нет штанг
        if (!this.leftRodAdded && !this.rightRodAdded) {
          this._rodSideSelectionVisible = true;
        } else if (!this.leftRodAdded || !this.rightRodAdded) {
          // Если есть только одна штанга, показываем выбор для добавления второй
          this._rodSideSelectionVisible = true;
        }
      } else {
        // Нельзя добавлять отдельно слева/справа - добавляем полную штангу
        if (!this.hasRod) {
          this.addRodShelf.emit({
            shelf: this.shelf,
            side: 'full',
          });
          this.updateRodState('full');
        }
      }
    }
  }

  /**
   * Проверяет, можно ли добавлять штанги слева и справа отдельно
   */
  private canAddRodsOnBothSides(): boolean {
    if (!this.shelf) return false;

    // Для topCabinet
    if (this.isTopCabinet) {
      // Специальное условие: если глубина 580мм, двустворчатый шкаф и нет средника - нельзя добавлять отдельно
      if (this.isDepth580 && this.cabinetType === CabinetSubType.Double && !this.hasMullion) {
        return false;
      }

      if (!this.isDepth580 && this.cabinetType === CabinetSubType.Double) {
        return true;
      }

      // В topCabinet можно добавлять слева и справа если:
      // 1. Шкаф двустворчатый ИЛИ
      // 2. Средник во всю высоту
      return this.cabinetType === 'double' || this.isFullHeightMullion;
    }

    // Для обычных полок
    const shelfSection = this.getShelfSection();
    const hasMullion = this.hasMullion;

    // --- ЛОГИКА ДЛЯ ГЛУБИНЫ 430 мм ---
    if (!this.isDepth580) {
      // Глубина 430 мм
      // Для глубины 430 мм:
      // 1. Только для двустворчатого шкафа
      if (this.cabinetType !== CabinetSubType.Double) {
        return false;
      }

      // 2. Только для центральной полки
      if (shelfSection !== 'center') {
        return false;
      }

      return true;
    }
    if (!this.isDepth580 && this.cabinetType === 'double') {
      console.log('can add both sides - double cabinet without depth 580');
      return true;
    }

    // Проверяем условия для выдвижной штанги
    if (this.isExtendableRod()) {
      // Выдвижную штангу можно добавлять слева и справа в двустворчатом шкафу
      return this.cabinetType === 'double' && shelfSection === 'center';
    }

    // Проверяем условия для solid штанги
    if (this.isSolidRod() && this.isDepth580) {
      // Solid штангу при глубине 580мм можно добавлять слева и справа только если есть средник
      return hasMullion;
    }

    // Проверяем условия для solid штанги со средником во всю высоту
    if (this.isFullHeightMullion) {
      // Если средник во всю высоту, можно добавлять solid штангу и слева, и справа
      return true;
    }

    // По умолчанию: только для центральной полки в двустворчатом шкафу
    return shelfSection === 'center' && this.cabinetType === 'double';
  }

  /**
   * Выбор стороны для штанги (используется при rodSideSelectionVisible = true)
   */
  selectRodSide(side: 'left' | 'right') {
    if (!this.shelf) return;

    // Проверяем, не добавлена ли уже штанга с этой стороны
    const rodExists = side === 'left' ? this.leftRodAdded : this.rightRodAdded;
    if (rodExists) return;

    this.addRodShelf.emit({ shelf: this.shelf, side });
    this.updateRodState(side);
    this._rodSideSelectionVisible = false;
  }

  /**
   * Добавление полной штанги (для случая, когда нужно добавить сразу полную штангу)
   */
  addFullRod() {
    if (!this.shelf || this.hasRod) return;

    this.addRodShelf.emit({
      shelf: this.shelf,
      side: 'full',
    });
    this.updateRodState('full');

    if (this.shelf) {
      this.updateRodStates(this.shelf);
    }
  }

  /**
   * Обновляет состояние штанг после добавления
   */
  private updateRodState(side: 'left' | 'right' | 'full') {
    switch (side) {
      case 'left':
        this.leftRodAdded = true;
        break;
      case 'right':
        this.rightRodAdded = true;
        break;
      case 'full':
        this.fullRodAdded = true;
        break;
    }

    this._hasRod = true;
    if (this.shelf) {
      this.shelf.userData['hasRod'] = true;
    }

    // Добавьте изменение состояния в userData полки для типа штанги
    if (this.shelf) {
      const userData = this.shelf.userData;
      userData['rodSide'] = side;
      userData['hasRod'] = true;
      console.log(userData);
    }

    this.hasRodChange.emit(true);
  }

  /**
   * Отменяет выбор стороны штанги
   */
  cancelRodSelection() {
    this._rodSideSelectionVisible = false;
  }
}
