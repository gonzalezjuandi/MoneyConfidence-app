import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-onboarding',
  templateUrl: './prestamo-coche-onboarding.component.html',
  styleUrls: ['./prestamo-coche-onboarding.component.scss']
})
export class PrestamoCocheOnboardingComponent implements AfterViewInit {
  @Output() startSimulation = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  onSimularCuota(): void {
    this.startSimulation.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onBack(): void {
    this.close.emit();
  }
}
