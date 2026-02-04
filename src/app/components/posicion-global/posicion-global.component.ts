import { Component, EventEmitter, Output, AfterViewInit, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';

declare var lucide: any;

@Component({
  selector: 'app-posicion-global',
  templateUrl: './posicion-global.component.html',
  styleUrls: ['./posicion-global.component.scss']
})
export class PosicionGlobalComponent implements AfterViewInit, OnDestroy, OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() goToPotencialFinanciero = new EventEmitter<void>();
  private iconsInitialized = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService
  ) {}

  ngAfterViewInit(): void {
    // Inicializar iconos de Lucide después de que la vista se renderice
    this.initializeIcons();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Limpiar iconos si es necesario
    if (typeof lucide !== 'undefined' && lucide.destroyIcons) {
      lucide.destroyIcons();
    }
  }

  private initializeIcons(): void {
    if (typeof lucide !== 'undefined' && !this.iconsInitialized) {
      // Esperar a que Angular termine de renderizar
      setTimeout(() => {
        try {
          // Limpiar iconos existentes si hay
          const existingIcons = document.querySelectorAll('[data-lucide] svg');
          existingIcons.forEach(svg => {
            if (svg.parentElement && svg.parentElement.tagName === 'I') {
              svg.remove();
            }
          });
          
          // Crear nuevos iconos
          lucide.createIcons();
          this.iconsInitialized = true;
          this.cdr.detectChanges();
        } catch (error) {
          console.warn('Error initializing Lucide icons:', error);
        }
      }, 200);
    }
  }

  onIrAContratar(): void {
    this.next.emit();
  }

  onIrAPotencialFinanciero(): void {
    // Navegación inteligente: si ya tiene scoring, ir al resultado (paso 6), sino al guide panel (paso 4)
    const state = this.wizardState.getCurrentState();
    if (state.hasUpdatedPotential) {
      this.wizardState.setCurrentStep(6); // Resultado directo
    } else {
      this.wizardState.setCurrentStep(4); // Guide panel
    }
  }

  onVolverInicio(): void {
    // Volver al inicio (paso 1)
    // En este caso ya estamos en el inicio, pero podría navegar a otra sección
  }

  onIrAPrestamoPreconcedido(): void {
    // Ir directamente al proceso de préstamo con seguro (onboarding → simulación → documentación → firma)
    this.wizardState.setCurrentStep(3);
    sessionStorage.setItem('from-prestamo-modal', 'true');
  }
}
