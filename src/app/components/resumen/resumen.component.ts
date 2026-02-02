import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';
import { Observable } from 'rxjs';
import { WizardState } from '../../services/wizard-state.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class ResumenComponent implements OnInit {
  @Output() previous = new EventEmitter<void>();
  
  state$: Observable<WizardState>;
  capacidadMaxima = 22000;
  capacidadMensual = 350;
  plazoAnos = 5;
  productosRecomendados: any[] = [];
  metaObjetivo?: number;

  constructor(private wizardState: WizardStateService) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    this.state$.subscribe(state => {
      this.capacidadMaxima = state.capacidadMaxima;
      this.capacidadMensual = state.capacidadMensual;
      this.plazoAnos = state.plazoAnos;
      this.productosRecomendados = state.productosRecomendados || [];
      this.metaObjetivo = state.metaObjetivo;
    });
  }

  onVolver(): void {
    this.previous.emit();
  }

  onGuardarPotencial(): void {
    console.log('Guardar potencial financiero');
    alert('Tu potencial financiero ha sido guardado. Recibirás actualizaciones periódicas.');
  }

  onVolverASimular(): void {
    // Marcar que el usuario ha completado el flujo antes de volver
    this.wizardState.markPotentialUpdated();
    // Volver a préstamos (paso 3)
    this.wizardState.setCurrentStep(3);
  }

  onSolicitarPrestamo(): void {
    console.log('Solicitar préstamo');
    alert('Redirigiendo al formulario de solicitud de préstamo...');
  }

  onHablarConGestor(): void {
    console.log('Hablar con gestor');
    alert('Redirigiendo al chat con tu gestor...');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
