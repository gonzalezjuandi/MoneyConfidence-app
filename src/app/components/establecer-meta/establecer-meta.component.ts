import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';
import { Observable } from 'rxjs';
import { WizardState } from '../../services/wizard-state.service';

@Component({
  selector: 'app-establecer-meta',
  templateUrl: './establecer-meta.component.html',
  styleUrls: ['./establecer-meta.component.scss']
})
export class EstablecerMetaComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  
  state$: Observable<WizardState>;
  capacidadMaxima = 22000;
  metaSugerida = 25000;
  metaEstablecida = false;
  recibirRecordatorio = false;

  constructor(private wizardState: WizardStateService) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    this.state$.subscribe(state => {
      this.capacidadMaxima = state.capacidadMaxima;
      // Sugerir una meta ligeramente superior a la capacidad actual
      this.metaSugerida = Math.round(this.capacidadMaxima * 1.15);
    });
  }

  onEstablecerObjetivo(): void {
    this.metaEstablecida = true;
    this.wizardState.setMetaObjetivo(this.metaSugerida);
  }

  onGuardar(): void {
    // Aquí se guardaría la meta y se activaría el seguimiento
    console.log('Guardar meta:', this.metaSugerida);
    console.log('Recibir recordatorio:', this.recibirRecordatorio);
    this.next.emit();
  }

  onContinuar(): void {
    this.next.emit();
  }

  onVolver(): void {
    this.previous.emit();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  get necesitaMeta(): boolean {
    // Si la capacidad es menor que un umbral, sugerir meta
    return this.capacidadMaxima < 30000;
  }
}
