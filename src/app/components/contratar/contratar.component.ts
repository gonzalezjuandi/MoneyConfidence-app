import { Component, EventEmitter, Output, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { WizardStateService } from '../../services/wizard-state.service';

declare var lucide: any;

@Component({
  selector: 'app-contratar',
  templateUrl: './contratar.component.html',
  styleUrls: ['./contratar.component.scss']
})
export class ContratarComponent implements AfterViewInit, OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  showInfoModal = false;
  hasSeenModal = false; // Para controlar si ya vio la modal la primera vez

  constructor(private wizardState: WizardStateService) {}

  // Datos del préstamo (parametrizables)
  prestamoData = {
    titulo: 'Tu préstamo, sin esperas y sin papeleo',
    descripcion: 'Tienes un préstamo preconcedido listo cuando lo necesites. Sin complicaciones, sin esperas y con el respaldo de Banco Sabadell.',
    importeMin: 3000,
    importeMax: 60000,
    caracteristicas: [
      {
        icono: 'file-check',
        texto: 'Accede al dinero al instante, sin papeleos ni gestiones adicionales.'
      },
      {
        icono: 'sliders-horizontal',
        texto: 'Elige el importe y el plazo que mejor se adapte a ti.'
      },
      {
        icono: 'gauge-check',
        texto: 'Si tienes un préstamo preconcedido, significa que ya tienes la aprobación lista.'
      }
    ],
    beneficios: [
      'Sin comisiones de apertura ni de estudio.',
      'Plazos de devolución de hasta 8 años.',
      'Cuotas fijas y sin sorpresas.'
    ],
    proceso: [
      'Entra en tu app o banca online',
      'Consulta tu préstamo preconcedido y ajusta el importe o plazo.',
      'Confírmalo y recibe el dinero al instante en tu cuenta.'
    ],
    infoLegal: 'Te informamos que podemos tratar los datos personales de los que dispongamos, así como aquellos que nos hayas incorporado en el proceso, para contactarte en caso de que, por cualquier razón, se abandone el proceso con la finalidad de conocer las razones e intentar recuperarlo. Puedes ejercitar tus derechos en protección de datos conforme a la información que ya te ha sido proporcionada.'
  };

  ngOnInit(): void {
    // Verificar si viene del entry point de Posición Global
    const state = this.wizardState.getCurrentState();
    const modalSeen = localStorage.getItem('prestamo-modal-seen');
    
    // Si viene del entry point y no ha visto el modal, mostrarlo automáticamente
    if (state.showPrestamoModal && !modalSeen) {
      setTimeout(() => {
        this.showInfoModal = true;
        if (typeof lucide !== 'undefined') {
          setTimeout(() => {
            lucide.createIcons();
          }, 100);
        }
        document.body.style.overflow = 'hidden';
      }, 300); // Pequeño delay para que la transición sea suave
    }
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  onVerDetalles(): void {
    this.showInfoModal = true;
    this.hasSeenModal = true;
    localStorage.setItem('prestamo-modal-seen', 'true');
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
    // Prevenir scroll del body cuando la modal está abierta
    document.body.style.overflow = 'hidden';
  }

  onCerrarModal(): void {
    this.showInfoModal = false;
    document.body.style.overflow = '';
  }

  onIrASimulador(): void {
    this.onCerrarModal();
    // Marcar que viene del modal para que Préstamos abra el simulador
    sessionStorage.setItem('from-prestamo-modal', 'true');
    // Navegar a Préstamos
    this.wizardState.setCurrentStep(3);
  }

  onVerFAQ(): void {
    // TODO: Implementar navegación a FAQ o abrir modal de FAQ
    console.log('Ver preguntas frecuentes');
    // Por ahora, podríamos abrir otra modal o navegar a una sección de FAQ
    alert('Preguntas frecuentes - En desarrollo');
  }

  onIrAPrestamos(): void {
    // Abrir proceso de préstamo preconcedido con seguro (onboarding → simulación → resumen → documentos → firma)
    sessionStorage.setItem('from-prestamo-modal', 'true');
    this.next.emit();
  }

  onVolver(): void {
    this.previous.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Cerrar modal si se hace clic fuera del contenido
    if (this.showInfoModal) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay')) {
        this.onCerrarModal();
      }
    }
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
