import { Component, EventEmitter, OnInit, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';
import { Subscription } from 'rxjs';

declare var lucide: any;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  showSuccessToast = false;
  loanAmount: number = 45000;
  private stateSubscription?: Subscription;
  private toastTimeout: any;

  constructor(private wizardState: WizardStateService) {}

  ngOnInit(): void {
    // Suscribirse al estado para detectar cuando el préstamo fue completado
    this.stateSubscription = this.wizardState.state$.subscribe(state => {
      if (state.loanCompleted && state.loanAmount) {
        this.loanAmount = state.loanAmount;
        // Mostrar toast después de un pequeño delay para asegurar que el componente está renderizado
        setTimeout(() => {
          this.showSuccessToastNotification();
          // Limpiar el flag después de mostrar el toast
          this.wizardState.clearLoanCompleted();
        }, 500);
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  showSuccessToastNotification(): void {
    this.showSuccessToast = true;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 0);
    }
    // Cerrar automáticamente después de 5 segundos
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast(): void {
    this.showSuccessToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  onComenzar(): void {
    this.next.emit();
  }

  onVolver(): void {
    this.previous.emit();
  }
}
