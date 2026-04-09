import { Component } from '@angular/core';
import { WizardStateService } from './services/wizard-state.service';

export type PostLoginChoice = 'review' | 'skip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  title = 'Tu Potencial Financiero';

  appPhase: 'notification' | 'login' | 'postLogin' | 'main' = 'notification';

  constructor(private wizardState: WizardStateService) {}

  onOpenFromNotification(): void {
    this.appPhase = 'login';
  }

  onLoggedIn(): void {
    this.appPhase = 'postLogin';
  }

  onPostLoginComplete(choice: PostLoginChoice): void {
    this.wizardState.reset();
    this.wizardState.setEntryScreen(choice === 'review' ? 'proximos-pagos' : 'posicion-global');
    this.wizardState.setPosicionGlobalCardView('total');
    this.appPhase = 'main';
  }
}
