import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ModalResponseService } from '../../model/modal-response.service';
import { AdminModalComponent } from 'src/shared/ui/admin/admin-modal/admin-modal.component';

@Component({
  selector: 'app-modal-response',
  standalone: true,
  imports: [NgClass, NgIf, AdminModalComponent],
  templateUrl: './modal-response.component.html',
  styleUrl: './modal-response.component.scss',
})
export class ModalResponseComponent {
  constructor(public modalResponseService: ModalResponseService) {}

  changeVisibility() {
    this.modalResponseService.isOpen = !this.modalResponseService.isOpen;
  }
}
