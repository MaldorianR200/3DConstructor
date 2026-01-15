import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppState } from 'src/app/providers/StoreProvider/app.store';
import { SeoActions, SeoSelectors } from 'src/entities/Seo';
import { StackComponent } from 'src/shared/ui/app';
import { AdminFormComponent, AdminButtonComponent, AdminInputComponent } from 'src/shared/ui/admin';

@Component({
  selector: 'app-seo-form',
  standalone: true,
  imports: [StackComponent, AdminFormComponent, AdminButtonComponent, AdminInputComponent],
  templateUrl: './seo-form.component.html',
  styleUrl: './seo-form.component.scss',
})
export class SeoFormComponent implements OnInit {
  seoForm: FormGroup;
  robotsText$: Observable<string | null> = new Observable<string | null>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
  ) {
    this.seoForm = this.fb.group({
      robots: new FormControl(),
    });
    this.store.dispatch(SeoActions.getRobots());
    this.robotsText$ = this.store.select(SeoSelectors.selectRobots);
  }

  submit() {
    this.store.dispatch(SeoActions.updateRobots(this.seoForm.value));
  }

  generateSiteMap() {
    this.store.dispatch(SeoActions.generateSiteMap());
  }

  ngOnInit(): void {
    this.robotsText$.subscribe((content) => {
      if (content) {
        this.seoForm.get('robots')?.setValue(content);
      }
    });
  }
}
