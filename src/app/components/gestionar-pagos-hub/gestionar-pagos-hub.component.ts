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
import { wizardStateToSlug } from '../../app-routing.constants';
import {
  WizardStateService,
  UpcomingPaymentItem,
  DEFAULT_UPCOMING_PAYMENTS_ITEMS
} from '../../services/wizard-state.service';

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
  /** Líneas demo del histórico (fecha corta + importe) */
  historicoCargos?: { fecha: string; amount: number }[];
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

/** Detalle recibo (domiciliación); ids alineados con `HabitualPaymentItem.id` demo */
export interface ReceiptDetail {
  id: string;
  merchant: string;
  displayName: string;
  logoInitial: string;
  logoColor: string;
  logoAsset?: string;
  priceMonthly: number;
  status: SubStatus;
  concepto: string;
  cuentaIban: string;
  titularCuenta: string;
  productoCuenta: string;
  referencia: string;
  proximaCobro: string;
  footerHint?: string;
  /** Tras bloquear pagos (demo): fecha mostrada en detalle */
  fechaBloqueo?: string;
  /** Valores previos al bloqueo para poder reactivar en demo */
  proximaCobroAntesBloqueo?: string;
  footerHintAntesBloqueo?: string;
  partnerHost?: string;
  historicoCargos?: { fecha: string; amount: number }[];
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
    | 'suscripciones'
    | 'recibos'
    | 'detalle'
    | 'detalleRecibo'
    | 'modalRedirigir'
    | 'partnerWeb'
    | 'confirmarCancelacion'
    | 'bloquear1'
    | 'bloquear2'
    | 'bloquear3' = 'suscripciones';

  subTab: 'activas' | 'canceladas' = 'activas';

  selected: SubscriptionDetail | null = null;

  selectedRecibo: ReceiptDetail | null = null;

  /** Flujo bloquear iniciado desde detalle recibo (no modifica lista de suscripciones) */
  bloquearReciboOrigen = false;

  /** Plegado «Mostrar más / menos» en tarjeta detalle recibo */
  reciboDetalleAmpliado = true;

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
      lineSub: 'Mensual, se renueva 24 abril',
      status: 'activa',
      concepto: 'Netflix',
      tarjetaMasked: 'Crédito ••••1234',
      fechaInicio: '20/02/2026',
      fechaContratacion: '20/02/2026',
      proximaCobro: '24/04/2026',
      renewalTag: 'Se renueva 24 Abril',
      footerHint:
        'El plan se renueva cada 30 días. Te avisaremos antes por si quieres cancelarlo.',
      partnerHost: 'netflix.es',
      historicoCargos: [
        { fecha: '18 Abr', amount: 17.99 },
        { fecha: '27 Mar', amount: 17.99 },
        { fecha: '14 Feb', amount: 17.99 }
      ]
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

  /** Domiciliaciones / recibos (demo: mismos movimientos «Domiciliación» que Próximos pagos) */
  reciboItems: UpcomingPaymentItem[] = [];

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

  readonly recibosDetalleCatalog: ReceiptDetail[] = [
    {
      id: 'h3',
      merchant: 'Endesa',
      displayName: 'Endesa',
      logoInitial: 'E',
      logoColor: '#5b8fc7',
      logoAsset: 'assets/gph-logo-endesa.png',
      priceMonthly: 45.0,
      status: 'activa',
      concepto: 'Préstamos Adeudo Cuota N. 123456789',
      cuentaIban: 'ES11 0081 0101 0000 0000 1234',
      titularCuenta: 'LAURA NAVARRO ORTIZ',
      productoCuenta: 'CUENTA SABADELL',
      referencia: 'AV3UXMKO6LW3U7Y51',
      proximaCobro: '28/04/2026',
      footerHint:
        'El adeudo se ejecuta según el calendario acordado con el acreedor. Si cambias la cuenta, aplicará en el próximo cobro.',
      partnerHost: 'endesa.es',
      historicoCargos: [
        { fecha: '18 Abr', amount: 7.99 },
        { fecha: '27 Mar', amount: 17.99 },
        { fecha: '14 Feb', amount: 27.99 }
      ]
    },
    {
      id: 'up-1',
      merchant: 'Asisa Asistencia',
      displayName: 'Asisa Asistencia',
      logoInitial: 'A',
      logoColor: '#0a2744',
      priceMonthly: 100,
      status: 'activa',
      concepto: 'Asisa Asistencia',
      cuentaIban: 'ES11 0081 0101 0000 0000 1234',
      titularCuenta: 'LAURA NAVARRO ORTIZ',
      productoCuenta: 'CUENTA SABADELL',
      referencia: 'AV3UXMKO6LW3U7Y51',
      proximaCobro: '22/04/2026',
      footerHint:
        'Este cargo está previsto según el calendario de domiciliación. Puedes revisar o modificar la cuenta desde el detalle.',
      partnerHost: 'asisa.es',
      historicoCargos: [
        { fecha: '15 Mar', amount: 100 },
        { fecha: '15 Feb', amount: 100 },
        { fecha: '15 Ene', amount: 100 }
      ]
    },
    {
      id: 'up-2',
      merchant: 'Préstamos Adeudo',
      displayName: 'Préstamos Adeudo',
      logoInitial: 'P',
      logoColor: '#0095ff',
      priceMonthly: 250,
      status: 'activa',
      concepto: 'Préstamos Adeudo Cuota N. 123456789',
      cuentaIban: 'ES11 0081 0101 0000 0000 1234',
      titularCuenta: 'LAURA NAVARRO ORTIZ',
      productoCuenta: 'CUENTA SABADELL',
      referencia: 'P7K2M9NQ4XW1R8T3V',
      proximaCobro: '24/04/2026',
      footerHint: 'La cuota se adeuda automáticamente en la cuenta indicada.',
      partnerHost: 'bancsabadell.com',
      historicoCargos: [
        { fecha: '17 Mar', amount: 250 },
        { fecha: '17 Feb', amount: 250 }
      ]
    },
    {
      id: 'up-3',
      merchant: 'Aguas Barcelona',
      displayName: 'Aguas Barcelona',
      logoInitial: 'B',
      logoColor: '#003b73',
      priceMonthly: 60,
      status: 'activa',
      concepto: 'Aguas Barcelona — suministro',
      cuentaIban: 'ES11 0081 0101 0000 0000 1234',
      titularCuenta: 'LAURA NAVARRO ORTIZ',
      productoCuenta: 'CUENTA SABADELL',
      referencia: 'W5Y8Z2K1M4N7Q9R0T',
      proximaCobro: '29/04/2026',
      footerHint: 'Importe orientativo según consumo y tarifa vigente.',
      partnerHost: 'aiguesdebarcelona.cat',
      historicoCargos: [
        { fecha: '20 Mar', amount: 58.5 },
        { fecha: '20 Feb', amount: 62.1 }
      ]
    },
    {
      id: 'up-4',
      merchant: 'Fibra y línea móvil',
      displayName: 'Fibra y línea móvil',
      logoInitial: 'T',
      logoColor: '#1e3a5f',
      priceMonthly: 40,
      status: 'activa',
      concepto: 'Fibra y línea móvil',
      cuentaIban: 'ES11 0081 0101 0000 0000 5678',
      titularCuenta: 'LAURA NAVARRO ORTIZ',
      productoCuenta: 'CUENTA SABADELL',
      referencia: 'F3B6C9D2E5G8H1J4K',
      proximaCobro: '12/05/2026',
      footerHint: 'Servicio de telecomunicaciones con cargo recurrente a cuenta.',
      partnerHost: 'telecom.demo',
      historicoCargos: [
        { fecha: '30 Mar', amount: 40 },
        { fecha: '28 Feb', amount: 40 }
      ]
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = this.wizardState.getCurrentState();
    if (state.gestionarPagosDirectoRecibos) {
      this.refreshReciboItems();
      this.view = 'recibos';
      this.wizardState.clearGestionarPagosDirectoSuscripciones();
      this.cdr.markForCheck();
      setTimeout(() => this.initLucide(), 100);
      return;
    }
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
      return;
    }

    const openReciboId = state.gestionarPagosAbrirReciboId;
    if (openReciboId) {
      this.wizardState.clearGestionarPagosAbrirReciboId();
      const rec = this.recibosDetalleCatalog.find(r => r.id === openReciboId);
      if (rec) {
        this.selectedRecibo = { ...rec };
        this.view = 'detalleRecibo';
        this.reciboDetalleAmpliado = true;
      } else {
        this.view = 'suscripciones';
      }
      this.refreshReciboItems();
      this.cdr.markForCheck();
      setTimeout(() => this.initLucide(), 100);
      return;
    }

    /* Paso 10 sin flags (p. ej. ruta /gestionar-pagos): lista de suscripciones; ya no hay menú intermedio */
    this.view = 'suscripciones';
    this.subTab = 'activas';
    this.refreshReciboItems();
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 100);
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

  /** p. ej. 20/04/2026 → «20 Abril» */
  formatProximaCobroCorta(proxima: string): string {
    const m = proxima.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) {
      return proxima;
    }
    const d = parseInt(m[1], 10);
    const monthIdx = parseInt(m[2], 10) - 1;
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    const mo = months[monthIdx] ?? '';
    return `${d} ${mo}`;
  }

  /** Texto demo coherente con la referencia */
  get faltanDiasCobroLabel(): string {
    return 'Faltan 7 días';
  }

  /** Barra de avance hacia el próximo cobro (demo) */
  get cobroProgressPercent(): number {
    return 22;
  }

  get gastoAnualPrevistoSelected(): number {
    if (!this.selected || this.selected.status === 'pagos-bloqueados') {
      return 0;
    }
    return Math.round(this.selected.priceMonthly * 12 * 100) / 100;
  }

  get historicoMovimientos(): { fecha: string; amount: number }[] {
    if (!this.selected) {
      return [];
    }
    if (this.selected.historicoCargos?.length) {
      return this.selected.historicoCargos;
    }
    return [
      { fecha: '29 Abr', amount: this.selected.priceMonthly },
      { fecha: '27 Mar', amount: this.selected.priceMonthly },
      { fecha: '14 Feb', amount: this.selected.priceMonthly }
    ];
  }

  get gastoAnualPrevistoRecibo(): number {
    if (!this.selectedRecibo || this.selectedRecibo.status === 'pagos-bloqueados') {
      return 0;
    }
    return Math.round(this.selectedRecibo.priceMonthly * 12 * 100) / 100;
  }

  get historicoMovimientosRecibo(): { fecha: string; amount: number }[] {
    if (!this.selectedRecibo) {
      return [];
    }
    if (this.selectedRecibo.historicoCargos?.length) {
      return this.selectedRecibo.historicoCargos;
    }
    return [
      { fecha: '29 Abr', amount: this.selectedRecibo.priceMonthly },
      { fecha: '27 Mar', amount: this.selectedRecibo.priceMonthly },
      { fecha: '14 Feb', amount: this.selectedRecibo.priceMonthly }
    ];
  }

  /** Barra demo alineada con referencia (~70 %) */
  get cobroProgressPercentRecibo(): number {
    return 70;
  }

  /** Texto «Siguiente cobro» en detalle recibo (bloqueado = sin cobros futuros). */
  get reciboSiguienteCobroDisplay(): string {
    if (!this.selectedRecibo || this.selectedRecibo.status === 'pagos-bloqueados') {
      return 'Sin cobros programados';
    }
    return this.formatProximaCobroCorta(this.selectedRecibo.proximaCobro);
  }

  toggleReciboDetalleAmpliado(): void {
    this.reciboDetalleAmpliado = !this.reciboDetalleAmpliado;
    this.initLucide();
  }

  openModificarCuentaRecibo(): void {
    /* Demo: sin navegación; misma intención que «Gestionar suscripción» en recibos */
  }

  /** Demo: reactivar cobros tras bloqueo (restaura fechas e hints guardados). */
  activarPagosRecibo(): void {
    if (!this.selectedRecibo || this.selectedRecibo.status !== 'pagos-bloqueados') {
      return;
    }
    const id = this.selectedRecibo.id;
    const patch = (r: ReceiptDetail): ReceiptDetail => ({
      ...r,
      status: 'activa',
      fechaBloqueo: undefined,
      proximaCobro: r.proximaCobroAntesBloqueo ?? r.proximaCobro,
      footerHint: r.footerHintAntesBloqueo ?? r.footerHint,
      proximaCobroAntesBloqueo: undefined,
      footerHintAntesBloqueo: undefined
    });
    const idx = this.recibosDetalleCatalog.findIndex(rec => rec.id === id);
    if (idx >= 0) {
      this.recibosDetalleCatalog[idx] = patch(this.recibosDetalleCatalog[idx]);
    }
    if (this.selectedRecibo?.id === id) {
      this.selectedRecibo = patch(this.selectedRecibo);
    }
    this.initLucide();
  }

  private applyReciboBloqueado(reciboId: string): void {
    const fecha = new Date().toLocaleDateString('es-ES');
    const patch = (r: ReceiptDetail): ReceiptDetail => ({
      ...r,
      status: 'pagos-bloqueados',
      fechaBloqueo: fecha,
      proximaCobroAntesBloqueo:
        r.status !== 'pagos-bloqueados'
          ? (r.proximaCobroAntesBloqueo ?? (r.proximaCobro !== '—' ? r.proximaCobro : undefined))
          : r.proximaCobroAntesBloqueo,
      footerHintAntesBloqueo:
        r.status !== 'pagos-bloqueados'
          ? (r.footerHintAntesBloqueo ?? r.footerHint)
          : r.footerHintAntesBloqueo,
      proximaCobro: '—',
      footerHint: undefined
    });
    const idx = this.recibosDetalleCatalog.findIndex(rec => rec.id === reciboId);
    if (idx >= 0) {
      this.recibosDetalleCatalog[idx] = patch(this.recibosDetalleCatalog[idx]);
    }
    if (this.selectedRecibo?.id === reciboId) {
      this.selectedRecibo = patch(this.selectedRecibo);
    }
  }

  private reciboToSubscriptionProxy(r: ReceiptDetail): SubscriptionDetail {
    return {
      id: r.id,
      merchant: r.merchant,
      displayName: r.displayName,
      logoInitial: r.logoInitial,
      logoColor: r.logoColor,
      logoAsset: r.logoAsset,
      priceMonthly: r.priceMonthly,
      lineSub: '',
      status: r.status === 'pagos-bloqueados' ? 'pagos-bloqueados' : 'activa',
      concepto: r.concepto,
      tarjetaMasked: 'Domiciliación',
      fechaInicio: '',
      fechaContratacion: '',
      proximaCobro: r.proximaCobro,
      partnerHost: r.partnerHost ?? 'endesa.es',
      historicoCargos: r.historicoCargos
    };
  }

  startBloquearDesdeRecibo(): void {
    if (!this.selectedRecibo) {
      return;
    }
    this.selected = this.reciboToSubscriptionProxy(this.selectedRecibo);
    this.bloquearReciboOrigen = true;
    this.importeInfoOpen = false;
    this.view = 'bloquear1';
    this.initLucide();
  }

  openHistoricoInfo(): void {
    this.openImporteInfo();
  }

  /** Referencia visual: «Crédito ****1234» */
  tarjetaDisplay(s: SubscriptionDetail): string {
    return s.tarjetaMasked.replace(/•/g, '*');
  }

  get gastoMensualTotal(): number {
    return this.subscriptions.reduce((a, s) => a + s.priceMonthly, 0);
  }

  get recibosMensualTotal(): number {
    return this.reciboItems.reduce((a, i) => a + i.amount, 0);
  }

  get recibosMensualAmountMain(): string {
    const full = this.formatMoney(this.recibosMensualTotal);
    const i = full.lastIndexOf(',');
    return i === -1 ? full : full.slice(0, i);
  }

  get recibosMensualAmountRest(): string {
    const full = this.formatMoney(this.recibosMensualTotal);
    const i = full.lastIndexOf(',');
    return i === -1 ? ' €' : `${full.slice(i)} €`;
  }

  /** Misma lista que Próximos pagos (previsión 30 días), repartida en Recibos del hub */
  private refreshReciboItems(): void {
    const items =
      this.wizardState.getCurrentState().upcomingPaymentsItems ?? DEFAULT_UPCOMING_PAYMENTS_ITEMS;
    this.reciboItems = [...items];
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

  /** Sale del hub (lista Suscripciones / Recibos) hacia Próximos pagos con contexto de origen. */
  private exitHubToProximosPagos(): void {
    this.importeInfoOpen = false;
    this.selected = null;
    this.selectedRecibo = null;
    const ret = this.wizardState.consumeGestionarPagosReturn();
    this.wizardState.clearGestionarPagosDirectoSuscripciones();
    this.wizardState.setEntryScreen('proximos-pagos');
    this.wizardState.setCurrentStep(1);
    if (ret?.proximosPagosView) {
      this.wizardState.setProximosPagosView(
        ret.proximosPagosView,
        ret.habitualesTab !== undefined ? ret.habitualesTab : null
      );
    }
    this.subTab = 'activas';
    /** Coherente con `WizardComponent`: `proximos-pagos` en URL fuerza vista `home` y machaca `habituales`. */
    const slug = wizardStateToSlug(this.wizardState.getCurrentState());
    void this.router.navigate(['/app', slug]);
  }

  onBack(): void {
    if (this.view === 'recibos') {
      this.exitHubToProximosPagos();
      return;
    }
    if (this.view === 'suscripciones') {
      this.exitHubToProximosPagos();
      return;
    }
    /** Detalle suscripción / recibo: volver a Próximos pagos (habituales), no a la lista antigua del hub. */
    if (this.view === 'detalleRecibo') {
      this.exitHubToProximosPagos();
      return;
    }
    if (this.view === 'detalle') {
      this.exitHubToProximosPagos();
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
      if (this.bloquearReciboOrigen) {
        this.view = 'detalleRecibo';
        this.selected = null;
        this.bloquearReciboOrigen = false;
        this.initLucide();
        return;
      }
      this.view = 'detalle';
      this.initLucide();
      return;
    }
    if (this.view === 'bloquear3') {
      if (this.bloquearReciboOrigen) {
        this.view = 'detalleRecibo';
        this.selected = null;
        this.bloquearReciboOrigen = false;
        this.initLucide();
        return;
      }
      this.view = 'detalle';
      this.initLucide();
    }
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
    if (this.bloquearReciboOrigen) {
      this.view = 'detalleRecibo';
      this.selected = null;
      this.bloquearReciboOrigen = false;
      this.importeInfoOpen = false;
      this.initLucide();
      return;
    }
    this.view = 'detalle';
    this.initLucide();
  }

  onContinuarFirmar(): void {
    if (!this.selected) {
      return;
    }
    if (this.bloquearReciboOrigen) {
      this.view = 'bloquear3';
      this.initLucide();
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
    if (this.bloquearReciboOrigen) {
      this.bloquearReciboOrigen = false;
      this.selected = null;
      if (this.selectedRecibo) {
        this.applyReciboBloqueado(this.selectedRecibo.id);
      }
      this.view = 'detalleRecibo';
      this.initLucide();
      return;
    }
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
