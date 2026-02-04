import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { PRESTAMO_FAQS, SEGURO_FAQS } from '../../constants/prestamo-coche-faq';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-onboarding',
  templateUrl: './prestamo-coche-onboarding.component.html',
  styleUrls: ['./prestamo-coche-onboarding.component.scss']
})
export class PrestamoCocheOnboardingComponent implements AfterViewInit {
  @Output() startSimulation = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  showFaqModal = false;
  faqActiveTab: 'prestamo' | 'seguro' = 'prestamo';
  expandedPrestamoId: number | null = null;
  expandedSeguroId: number | null = null;
  prestamoFaqs = PRESTAMO_FAQS;
  seguroFaqs = SEGURO_FAQS;

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

  onOpenFaq(): void {
    this.showFaqModal = true;
    this.faqActiveTab = 'prestamo';
    this.expandedPrestamoId = null;
    this.expandedSeguroId = null;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 150);
    }
  }

  onCloseFaq(): void {
    this.showFaqModal = false;
    this.expandedPrestamoId = null;
    this.expandedSeguroId = null;
  }

  setFaqTab(tab: 'prestamo' | 'seguro'): void {
    this.faqActiveTab = tab;
  }

  togglePrestamoFaq(id: number): void {
    this.expandedPrestamoId = this.expandedPrestamoId === id ? null : id;
  }

  toggleSeguroFaq(id: number): void {
    this.expandedSeguroId = this.expandedSeguroId === id ? null : id;
  }

  onFaqHelp(): void {
    // Enlace a ayuda (por ejemplo, teléfono o chat)
    this.onCloseFaq();
  }
}
