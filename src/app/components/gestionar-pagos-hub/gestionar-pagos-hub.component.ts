import {
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../services/wizard-state.service';

declare var lucide: any;

export type SubStatus = 'activa' | 'proximo-cobro' | 'cancelada' | 'pagos-bloqueados';

export interface SubscriptionDetail {
  id: string;
  merchant: string;
  displayName: string;
  logoInitial: string;
  logoColor: string;
  /** Ruta bajo `assets/` (p. ej. `assets/gph-logo-netflix.png`). Si falta, se usa inicial + color. */
  logoAsset?: string;
  priceMonthly: number;
  lineSub: string;
  status: SubStatus;
  concepto: string;
  tarjetaMasked: string;
  fechaInicio: string;
  fechaContratacion: string;
  proximaCobro: string;
  renewalTag?: string;
  footerHint?: string;
  fechaBloqueo?: string;
  /** Dominio del partner para redirección (ej. netflix.es) */
  partnerHost: string;
}

export interface CancelledSub {
  id: string;
  merchant: string;
  lineSub: string;
  price: number;
  logoInitial: string;
  logoColor: string;
  logoAsset?: string;
}

@Component({
  selector: 'app-gestionar-pagos-hub',
  templateUrl: './gestionar-pagos-hub.component.html',
  styleUrls: ['./gestionar-pagos-hub.component.scss']
})
export class GestionarPagosHubComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Icono firma segura (candado) — `src/assets/gph-firma-candado.png` */
  readonly firmaCandadoAsset = 'assets/gph-firma-candado.png';

  @Output() close = new EventEmitter<void>();

  view:
    | 'secciones'
    | 'suscripciones'
    | 'detalle'
    | 'modalRedirigir'
    | 'partnerWeb'
    | 'confirmarCancelacion'
    | 'bloquear1'
    | 'bloquear2'
    | 'bloquear3' = 'secciones';

  subTab: 'activas' | 'canceladas' = 'activas';

  selected: SubscriptionDetail | null = null;

  /** Sheet informativo «Importes y fechas estimadas» (mismo contenido que en Próximos pagos). */
  importeInfoOpen = false;

  subscriptions: SubscriptionDetail[] = [
    {
      id: 'sub-1',
      merchant: 'Netflix',
      displayName: 'Netflix España',
      logoInitial: 'N',
      logoColor: '#E50914',
      logoAsset: 'assets/gph-logo-netflix.png',
      priceMonthly: 17.99,
      lineSub: 'Mensual, se renueva 20 abril',
      status: 'activa',
      concepto: 'Netflix',
      tarjetaMasked: 'Crédito ••••1234',
      fechaInicio: '20/02/2026',
      fechaContratacion: '20/02/2026',
      proximaCobro: '20/04/2026',
      renewalTag: 'Se renueva 20 Abril',
      footerHint:
        'El plan se renueva cada 30 días. Te avisaremos antes por si quieres cancelarlo.',
      partnerHost: 'netflix.es'
    },
    {
      id: 'sub-2',
      merchant: 'Google Play',
      displayName: 'Google Play',
      logoInitial: 'G',
      logoColor: '#4285F4',
      logoAsset: 'assets/gph-logo-googleplay.png',
      priceMonthly: 4.99,
      lineSub: 'Anual, se renueva 1 May',
      status: 'activa',
      concepto: 'Google Play',
      tarjetaMasked: 'Crédito ••••1234',
      fechaInicio: '01/05/2025',
      fechaContratacion: '01/05/2025',
      proximaCobro: '01/05/2026',
      renewalTag: 'Se renueva 1 Mayo',
      footerHint:
        'El plan se renueva cada 12 meses. Te avisaremos antes por si quieres cancelarlo.',
      partnerHost: 'play.google.com'
    },
    {
      id: 'sub-3',
      merchant: 'HBO Max',
      displayName: 'HBO Max',
      logoInitial: 'H',
      logoColor: '#8B5CF6',
      logoAsset: 'assets/gph-logo-hbo.png',
      priceMonthly: 8.99,
      lineSub: 'Mensual, se renueva 1 May',
      status: 'activa',
      concepto: 'HBO Max',
      tarjetaMasked: 'Crédito ••••1234',
      fechaInicio: '01/03/2024',
      fechaContratacion: '28/02/2024',
      proximaCobro: '01/05/2026',
      renewalTag: 'Se renueva 1 Mayo',
      footerHint:
        'El plan se renueva cada 30 días. Te avisaremos antes por si quieres cancelarlo.',
      partnerHost: 'hbomax.com'
    }
  ];

  cancelled: CancelledSub[] = [
    {
      id: 'can-1',
      merchant: 'Movistar Plus+',
      lineSub: 'Mensual caducó 7 Feb',
      price: 12.5,
      logoInitial: 'M',
      logoColor: '#006dff'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = this.wizardState.getCurrentState();
    if (state.gestionarPagosDirectoSuscripciones) {
      const openDetalleId = state.gestionarPagosAbrirSuscripcionId;
      this.view = 'suscripciones';
      this.subTab = 'activas';
      this.wizardState.clearGestionarPagosDirectoSuscripciones();
      if (openDetalleId) {
        const sub = this.subscriptions.find(s => s.id === openDetalleId);
        if (sub) {
          this.selected = { ...sub };
          this.view = 'detalle';
        }
      }
      this.cdr.markForCheck();
      setTimeout(() => this.initLucide(), 100);
    }
  }

  ngAfterViewInit(): void {
    this.initLucide();
  }

  ngOnDestroy(): void {
    if (typeof lucide !== 'undefined' && lucide.destroyIcons) {
      lucide.destroyIcons();
    }
  }

  formatMoney(n: number): string {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get gastoMensualTotal(): number {
    return this.subscriptions.reduce((a, s) => a + s.priceMonthly, 0);
  }

  get suscripcionesActivasCount(): number {
    return this.subscriptions.length;
  }

  get gastoAnualProyeccion(): number {
    return this.gastoMensualTotal * 12;
  }

  /** Resumen mensual: parte entera grande + decimales (referencia captura) */
  get gastoMensualAmountMain(): string {
    const full = this.formatMoney(this.gastoMensualTotal);
    const i = full.lastIndexOf(',');
    return i === -1 ? full : full.slice(0, i);
  }

  get gastoMensualAmountRest(): string {
    const full = this.formatMoney(this.gastoMensualTotal);
    const i = full.lastIndexOf(',');
    return i === -1 ? ' €' : `${full.slice(i)} €`;
  }

  partnerLabel(host: string): string {
    const h = host.replace(/^www\./, '');
    const parts = h.split('.');
    if (!parts.length) {
      return h;
    }
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join('.');
  }

  onBack(): void {
    if (this.view === 'secciones') {
      this.close.emit();
      return;
    }
    if (this.view === 'suscripciones') {
      // Pagos recurrentes (paso 1, pestaña / ruta alineada)
      this.wizardState.setEntryScreen('proximos-pagos');
      this.wizardState.setCurrentStep(1);
      this.subTab = 'activas';
      void this.router.navigate(['/app', 'proximos-pagos']);
      return;
    }
    if (this.view === 'detalle') {
      this.importeInfoOpen = false;
      this.selected = null;
      // Misma salida que desde la lista Suscripciones: Pagos recurrentes (paso 1), no quedarse en el hub
      this.wizardState.clearGestionarPagosDirectoSuscripciones();
      this.wizardState.setEntryScreen('proximos-pagos');
      this.wizardState.setCurrentStep(1);
      this.subTab = 'activas';
      void this.router.navigate(['/app', 'proximos-pagos']);
      return;
    }
    if (this.view === 'modalRedirigir' || this.view === 'partnerWeb') {
      this.view = 'detalle';
      this.initLucide();
      return;
    }
    if (this.view === 'confirmarCancelacion') {
      this.view = 'detalle';
      this.initLucide();
      return;
    }
    if (this.view === 'bloquear2') {
      this.view = 'bloquear1';
      this.initLucide();
      return;
    }
    if (this.view === 'bloquear1') {
      this.view = 'detalle';
      this.initLucide();
      return;
    }
    if (this.view === 'bloquear3') {
      this.view = 'detalle';
      this.initLucide();
    }
  }

  openSuscripciones(): void {
    this.view = 'suscripciones';
    this.subTab = 'activas';
    this.initLucide();
  }

  openDetalle(sub: SubscriptionDetail): void {
    this.importeInfoOpen = false;
    this.selected = { ...sub };
    this.view = 'detalle';
    this.initLucide();
  }

  openImporteInfo(): void {
    this.importeInfoOpen = true;
    this.initLucide();
  }

  closeImporteInfo(): void {
    this.importeInfoOpen = false;
  }

  openGestionarPartner(): void {
    if (!this.selected || this.selected.status === 'pagos-bloqueados') {
      return;
    }
    this.importeInfoOpen = false;
    this.view = 'modalRedirigir';
    this.initLucide();
  }

  onModalRedirigirAhoraNo(): void {
    this.view = 'detalle';
    this.initLucide();
  }

  onSalirAppAbrirPartner(): void {
    this.view = 'partnerWeb';
    this.initLucide();
  }

  onVolverDesdePartnerWeb(): void {
    this.view = 'confirmarCancelacion';
    this.initLucide();
  }

  onCancelarSincronizacion(): void {
    this.view = 'detalle';
    this.initLucide();
  }

  confirmarCancelacionEnApp(): void {
    if (!this.selected) {
      return;
    }
    const sub = this.selected;
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    this.cancelled.unshift({
      id: sub.id,
      merchant: sub.merchant,
      lineSub: `Cancelada el ${fecha}`,
      price: sub.priceMonthly,
      logoInitial: sub.logoInitial,
      logoColor: sub.logoColor,
      logoAsset: sub.logoAsset
    });
    this.subscriptions = this.subscriptions.filter(s => s.id !== sub.id);
    this.selected = null;
    this.view = 'suscripciones';
    this.subTab = 'canceladas';
    this.initLucide();
  }

  startBloquear(): void {
    this.importeInfoOpen = false;
    this.view = 'bloquear1';
    this.initLucide();
  }

  onBloquearConfirm(): void {
    this.view = 'bloquear2';
    this.initLucide();
  }

  onFirmaCancel(): void {
    this.view = 'bloquear1';
    this.initLucide();
  }

  onFirmaBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onFirmaCancel();
    }
  }

  onMantenerPagos(): void {
    this.view = 'detalle';
    this.initLucide();
  }

  onContinuarFirmar(): void {
    if (!this.selected) {
      return;
    }
    const id = this.selected.id;
    const idx = this.subscriptions.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.subscriptions[idx] = {
        ...this.subscriptions[idx],
        status: 'pagos-bloqueados',
        fechaBloqueo: new Date().toLocaleDateString('es-ES'),
        proximaCobro: '—',
        renewalTag: undefined,
        footerHint: undefined
      };
      this.selected = { ...this.subscriptions[idx] };
    }
    this.view = 'bloquear3';
    this.initLucide();
  }

  onCerrarExito(): void {
    this.view = 'detalle';
    this.initLucide();
  }

  statusLabel(s: SubStatus): string {
    const m: Record<SubStatus, string> = {
      activa: 'Activa',
      'proximo-cobro': 'Próximo cobro',
      cancelada: 'Cancelada',
      'pagos-bloqueados': 'Pagos bloqueados'
    };
    return m[s];
  }

  statusClass(s: SubStatus): string {
    return 'tag-' + s;
  }

  private initLucide(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        try {
          lucide.createIcons();
          this.cdr.markForCheck();
        } catch {
          /* noop */
        }
      }, 120);
    }
  }
}
