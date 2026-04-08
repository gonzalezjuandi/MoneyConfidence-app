import { Component, OnInit } from '@angular/core';
import { WizardStateService } from './services/wizard-state.service';

@Component({
  selector: 'app-root',
  template: `<app-wizard></app-wizard>`,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Money Confidence';

  constructor(private wizardState: WizardStateService) {}

  ngOnInit(): void {
    this.wizardState.reset();
  }
}
