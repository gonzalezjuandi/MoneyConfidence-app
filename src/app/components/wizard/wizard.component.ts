import { Component, OnInit } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';
import { Observable } from 'rxjs';
import { WizardState } from '../../services/wizard-state.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit {
  state$: Observable<WizardState>;
  currentStep = 1;
  totalSteps = 9; // Posición Global, Contratar, Préstamos, + 6 del MVP

  constructor(private wizardState: WizardStateService) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    this.state$.subscribe(state => {
      this.currentStep = state.currentStep;
      
      // Navegación inteligente: si el usuario ya tiene scoring y accede al flujo (paso 4),
      // redirigir directamente al resultado (paso 6)
      if (state.currentStep === 4 && state.hasUpdatedPotential) {
        // Usar setTimeout para evitar cambios durante la detección
        setTimeout(() => {
          this.wizardState.setCurrentStep(6);
        }, 0);
      }
    });
  }

  nextStep(): void {
    this.wizardState.nextStep();
  }

  previousStep(): void {
    this.wizardState.previousStep();
  }

  goToStep(step: number): void {
    this.wizardState.setCurrentStep(step);
  }

  goToGestionarPagos(): void {
    this.wizardState.goToGestionarPagosMenu();
  }
}
