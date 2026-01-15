import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalResponseComponent } from 'src/features/ModalResponse/ui/modal-response/modal-response.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalResponseComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
