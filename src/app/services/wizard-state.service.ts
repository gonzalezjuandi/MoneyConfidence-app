import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FinancialProfile {
  ingresos: number;
  gastos: number;
  productos: Product[];
  otrosBancos: boolean;
}

export interface Product {
  id: string;
  nombre: string;
  tipo: string;
  numero?: string;
}

export interface RecommendedProduct {
  id: string;
  nombre: string;
  tipoInteres: string;
  condiciones: string;
  tipo: 'tarjeta' | 'prestamo' | 'credito';
}

export type EntryScreen = 'proximos-pagos' | 'posicion-global';
export type PosicionGlobalCardView = 'total' | 'upcoming';
/** Subpantallas dentro de Próximos pagos (paso 1) */
export type ProximosPagosView = 'home' | 'movimientos' | 'habituales';

/** Pago habitual (gestionar suscripciones / recibos / cancelados) */
export type HabitualPaymentCategory = 'suscripciones' | 'recibos' | 'cancelados';

/** Filtro de chips en «Gestionar pagos habituales» (sin cancelados en UI) */
export type ProximosPagosHabitualesFilter = 'todos' | 'suscripciones' | 'recibos';

/** Al cerrar detalle suscripción/recibo (paso 10), restaurar subvista Próximos pagos */
export type GestionarPagosReturnContext = {
  proximosPagosView: ProximosPagosView;
  habitualesTab?: ProximosPagosHabitualesFilter | null;
};

export interface HabitualPaymentItem {
  id: string;
  merchant: string;
  lineSub: string;
  category: HabitualPaymentCategory;
  status: 'activa' | 'cancelada';
  amount?: number;
  logoInitial?: string;
  logoColor?: string;
  logoAsset?: string;
  /** Enlace al detalle del hub de Gestionar pagos (suscripciones) */
  linkedSubscriptionId?: string;
}

export const DEFAULT_HABITUAL_PAYMENTS: HabitualPaymentItem[] = [
  {
    id: 'h1',
    merchant: 'Netflix',
    lineSub: 'Mensual, se renueva 24 Abr',
    category: 'suscripciones',
    status: 'activa',
    amount: 17.99,
    logoAsset: 'assets/gph-logo-netflix.png',
    linkedSubscriptionId: 'sub-1'
  },
  {
    id: 'h2',
    merchant: 'HBO Max',
    lineSub: 'Mensual, se renueva 1 May',
    category: 'suscripciones',
    status: 'activa',
    amount: 8.99,
    logoAsset: 'assets/gph-logo-hbo.png',
    linkedSubscriptionId: 'sub-3'
  },
  {
    id: 'h3',
    merchant: 'Endesa',
    lineSub: 'Mensual, se renueva 20 May',
    category: 'recibos',
    status: 'activa',
    amount: 45.0,
    logoAsset: 'assets/gph-logo-endesa.png'
  },
];

/** Misma regla que la pestaña Recibos en «Gestionar pagos habituales» */
export function sumHabitualRecibosMonthly(items: HabitualPaymentItem[]): number {
  return items
    .filter(i => i.category === 'recibos' && i.status === 'activa' && i.amount != null)
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);
}

/** Logos de marca (referencia Próximos pagos) */
export type UpcomingPaymentLogoVariant = 'asisa' | 'prestamos' | 'aguas' | 'telecom';

/** Movimiento previsto (Próximos pagos + pestaña Próximos en Cuentas) */
export interface UpcomingPaymentItem {
  id: string;
  name: string;
  amount: number;
  label: string;
  schedule: string;
  /** Fallback si no hay logoVariant */
  logo: string;
  logoBg: string;
  /** Logo vectorial de la referencia */
  logoVariant?: UpcomingPaymentLogoVariant;
  /** Segunda línea informativa (p. ej. número de cuota) */
  detail?: string;
  /** Texto tipo "Cuenta *4422" */
  accountMask: string;
  /** En qué cuentas del carrusel aplica; si falta, solo principal */
  accounts?: ('principal' | 'familiar')[];
  /** Fecha/hora larga en detalle (p. ej. «Previsto 22 abril 2026, 16:00 h.») */
  scheduleDetail?: string;
  /** IBAN demo en detalle */
  iban?: string;
  titularCuenta?: string;
  productoCuenta?: string;
  referenciaMovimiento?: string;
  /** Concepto largo en bloque «Detalle del movimiento» */
  movementConcept?: string;
}

/**
 * Cuenta por la que se carga el movimiento (coherente con `accountMask` en UI).
 * No basta con `accounts`: a veces incluye ambas aunque el adeudo sea solo de una tarjeta/cuenta.
 */
export function upcomingItemDebitAccountKey(it: UpcomingPaymentItem): 'principal' | 'familiar' {
  const compact = (it.accountMask ?? '').replace(/\s/g, '');
  if (compact.includes('*4425') && !compact.includes('*4422')) {
    return 'familiar';
  }
  if (compact.includes('*4422')) {
    return 'principal';
  }
  if (compact.includes('*4425')) {
    return 'familiar';
  }
  const a = it.accounts;
  if (a?.length === 1) {
    return a[0];
  }
  return 'principal';
}

/** Suma y recuento coherentes con la lista (evita totales desincronizados al filtrar por cuenta) */
export function aggregateUpcomingPayments(items: UpcomingPaymentItem[]): {
  total: number;
  count: number;
} {
  const total = items.reduce((sum, it) => sum + it.amount, 0);
  return { total, count: items.length };
}

/** Suscripción recurrente demo (misma fuente: Próximos pagos, Posición global, Gestionar pagos) */
export interface RecurringSubscriptionItem {
  id: string;
  merchant: string;
  lineSub?: string;
  priceMonthly: number;
  logoInitial: string;
  logoColor: string;
  logoAsset?: string;
}

export function aggregateRecurringSubscriptionsMonthly(
  subs: RecurringSubscriptionItem[]
): { total: number; count: number } {
  const total = subs.reduce((sum, s) => sum + s.priceMonthly, 0);
  return { total, count: subs.length };
}

/** Total «30 días» transversal: cargos previstos + cuotas mensuales de suscripciones */
export function combineUpcomingAndSubscriptions30d(
  items: UpcomingPaymentItem[],
  subs: RecurringSubscriptionItem[]
): { total: number; count: number } {
  const u = aggregateUpcomingPayments(items);
  const s = aggregateRecurringSubscriptionsMonthly(subs);
  return { total: u.total + s.total, count: u.count + s.count };
}

/** Lista demo de suscripciones activas (importes alineados con el hub) */
export const DEFAULT_RECURRING_SUBSCRIPTIONS: RecurringSubscriptionItem[] = [
  {
    id: 'sub-1',
    merchant: 'Netflix',
    lineSub: 'Mensual, se renueva 24 Abr',
    priceMonthly: 17.99,
    logoInitial: 'N',
    logoColor: '#E50914',
    logoAsset: 'assets/gph-logo-netflix.png'
  },
  {
    id: 'sub-3',
    merchant: 'HBO Max',
    lineSub: 'Mensual, se renueva 1 May',
    priceMonthly: 8.99,
    logoInitial: 'H',
    logoColor: '#8B5CF6',
    logoAsset: 'assets/gph-logo-hbo.png'
  }
];

/** Lista demo: total 450 € / 4 pagos; *4422 → 3 cargos (410 €); *4425 → 1 cargo (40 €) */
export const DEFAULT_UPCOMING_PAYMENTS_ITEMS: UpcomingPaymentItem[] = [
  {
    id: '1',
    name: 'Asisa Asistencia',
    amount: 100,
    label: 'Domiciliación',
    schedule: 'Previsto miércoles 22 Abr',
    scheduleDetail: 'Previsto 22 abril 2026, 16:00 h.',
    logo: 'A',
    logoBg: '#0a2744',
    logoVariant: 'asisa',
    accountMask: 'Cuenta *4422',
    accounts: ['principal'],
    iban: 'ES11 0081 0101 0000 0000 1234',
    titularCuenta: 'LAURA NAVARRO ORTIZ',
    productoCuenta: 'CUENTA SABADELL',
    referenciaMovimiento: 'AV3UXMKO6LW3U7Y51',
    movementConcept: 'Asisa Asistencia'
  },
  {
    id: '2',
    name: 'Préstamos Adeudo',
    detail: 'Cuota N.123456789',
    amount: 250,
    label: 'Préstamos',
    schedule: 'Previsto viernes 24 Abr',
    scheduleDetail: 'Previsto 24 abril 2026, 09:00 h.',
    logo: 'P',
    logoBg: '#0095ff',
    logoVariant: 'prestamos',
    accountMask: 'Cuenta *4422',
    accounts: ['principal'],
    iban: 'ES11 0081 0101 0000 0000 1234',
    titularCuenta: 'LAURA NAVARRO ORTIZ',
    productoCuenta: 'CUENTA SABADELL',
    referenciaMovimiento: 'P7K2M9NQ4XW1R8T3V',
    movementConcept: 'Préstamos Adeudo Cuota N. 123456789'
  },
  {
    id: '3',
    name: 'Aguas Barcelona',
    amount: 60,
    label: 'Domiciliación',
    schedule: 'Previsto miércoles 29 Abr',
    scheduleDetail: 'Previsto 29 abril 2026, 08:00 h.',
    logo: 'B',
    logoBg: '#003b73',
    logoVariant: 'aguas',
    accountMask: 'Cuenta *4422',
    accounts: ['principal'],
    iban: 'ES11 0081 0101 0000 0000 1234',
    titularCuenta: 'LAURA NAVARRO ORTIZ',
    productoCuenta: 'CUENTA SABADELL',
    referenciaMovimiento: 'W5Y8Z2K1M4N7Q9R0T',
    movementConcept: 'Aguas Barcelona — suministro'
  },
  {
    id: '4',
    name: 'Fibra y línea móvil',
    amount: 40,
    label: 'Domiciliación',
    schedule: 'Previsto martes 12 May',
    scheduleDetail: 'Previsto 12 mayo 2026, 12:00 h.',
    logo: 'T',
    logoBg: '#1e3a5f',
    logoVariant: 'telecom',
    accountMask: 'Cuenta *4425',
    accounts: ['familiar'],
    iban: 'ES11 0081 0101 0000 0000 5678',
    titularCuenta: 'LAURA NAVARRO ORTIZ',
    productoCuenta: 'CUENTA SABADELL',
    referenciaMovimiento: 'F3B6C9D2E5G8H1J4K',
    movementConcept: 'Fibra y línea móvil'
  }
];

export interface WizardState {
  currentStep: number;
  capacidadMaxima: number;
  capacidadMensual: number;
  plazoAnos: number;
  perfilFinanciero?: FinancialProfile;
  productosRecomendados?: RecommendedProduct[];
  metaObjetivo?: number;
  hasUpdatedPotential?: boolean;
  financialScore?: number; // 0-100
  showPrestamoModal?: boolean; // Flag para mostrar modal de préstamo
  loanCompleted?: boolean; // Flag para indicar que el préstamo fue completado
  loanAmount?: number; // Monto del préstamo completado
  /** Tras el login: primera pantalla del wizard (paso 1) */
  entryScreen?: EntryScreen;
  /** Subvista cuando entryScreen es próximos-pagos */
  proximosPagosView?: ProximosPagosView;
  /** Filtro inicial al abrir «pagos habituales» (null = todos; se consume al mostrar) */
  proximosPagosHabitualesTab?: ProximosPagosHabitualesFilter | null;
  /** Toggle tarjeta principal en Posición global (saldo vs próximos pagos) */
  posicionGlobalCardView?: PosicionGlobalCardView;
  /** Total demo de próximos pagos (30 días), alineado con la captura */
  upcomingPaymentsTotal?: number;
  /** Número de pagos previstos en el periodo (lista Próximos pagos) */
  upcomingPaymentsCount?: number;
  /** Movimientos próximos 30 días (compartido Próximos pagos + Cuentas) */
  upcomingPaymentsItems?: UpcomingPaymentItem[];
  /** Suscripciones activas demo; incluidas en totales 30 días junto con upcoming */
  recurringSubscriptionItems?: RecurringSubscriptionItem[];
  /** Detalle de un movimiento (panel compartido) */
  selectedUpcomingPaymentId?: string | null;
  /** Abrir el hub de Gestionar pagos directamente en la lista de Suscripciones */
  gestionarPagosDirectoSuscripciones?: boolean;
  /** Abrir el hub directamente en la vista Recibos (domiciliaciones) */
  gestionarPagosDirectoRecibos?: boolean;
  /** Si viene informado con directo suscripciones, abrir el detalle de esa suscripción (id demo del hub) */
  gestionarPagosAbrirSuscripcionId?: string | null;
  /** Detalle de un recibo habitual (mismo id que `HabitualPaymentItem.id`, p. ej. `h3` Endesa) */
  gestionarPagosAbrirReciboId?: string | null;
  /** Origen para volver atrás desde el hub (detalle suscripción / recibo) */
  gestionarPagosReturn?: GestionarPagosReturnContext | null;
}

@Injectable({
  providedIn: 'root'
})
export class WizardStateService {
  private initialState: WizardState = (() => {
    const items = DEFAULT_UPCOMING_PAYMENTS_ITEMS;
    const subs = DEFAULT_RECURRING_SUBSCRIPTIONS;
    const combined = combineUpcomingAndSubscriptions30d(items, subs);
    return {
    currentStep: 1, // Posición Global
    capacidadMaxima: 18000,
    capacidadMensual: 350,
    plazoAnos: 5,
    entryScreen: 'posicion-global',
    proximosPagosView: 'home',
    proximosPagosHabitualesTab: null,
    posicionGlobalCardView: 'total',
    upcomingPaymentsTotal: combined.total,
    upcomingPaymentsCount: combined.count,
    upcomingPaymentsItems: items,
    recurringSubscriptionItems: subs,
    selectedUpcomingPaymentId: null,
    gestionarPagosDirectoSuscripciones: false,
    gestionarPagosDirectoRecibos: false,
    gestionarPagosAbrirSuscripcionId: null,
    gestionarPagosAbrirReciboId: null,
    gestionarPagosReturn: null,
    perfilFinanciero: {
      ingresos: 0,
      gastos: 0,
      productos: [],
      otrosBancos: false
    }
  };
  })();

  private stateSubject = new BehaviorSubject<WizardState>(this.initialState);
  public state$: Observable<WizardState> = this.stateSubject.asObservable();

  constructor() {
    // Inicializar con datos simulados
    this.updateProfile({
      ingresos: 3500,
      gastos: 2000,
      productos: [
        { id: '1', nombre: 'Cuenta Sabadell', tipo: 'cuenta', numero: '4422' },
        { id: '2', nombre: 'Tarjeta BS Card', tipo: 'tarjeta', numero: '7830' }
      ],
      otrosBancos: false
    });
  }

  getCurrentState(): WizardState {
    return this.stateSubject.value;
  }

  setCurrentStep(step: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: step
    });
  }

  nextStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep < 9) {
      this.setCurrentStep(currentState.currentStep + 1);
    }
  }

  previousStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep === 10) {
      this.setCurrentStep(1);
      return;
    }
    if (currentState.currentStep > 1) {
      this.setCurrentStep(currentState.currentStep - 1);
    }
  }

  setEntryScreen(screen: EntryScreen): void {
    const currentState = this.getCurrentState();
    const leavingProximos =
      currentState.entryScreen === 'proximos-pagos' && screen !== 'proximos-pagos';
    this.stateSubject.next({
      ...currentState,
      entryScreen: screen,
      ...(leavingProximos
        ? {
            proximosPagosView: 'home' as ProximosPagosView,
            proximosPagosHabitualesTab: null
          }
        : {})
    });
  }

  setProximosPagosView(
    view: ProximosPagosView,
    habitualesInitialTab?: ProximosPagosHabitualesFilter | null
  ): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      proximosPagosView: view,
      proximosPagosHabitualesTab:
        view === 'habituales'
          ? habitualesInitialTab !== undefined
            ? habitualesInitialTab
            : null
          : null
    });
  }

  /** Tras leer la pestaña inicial en el componente de pagos habituales */
  clearProximosPagosHabitualesTab(): void {
    const currentState = this.getCurrentState();
    if (currentState.proximosPagosHabitualesTab == null) {
      return;
    }
    this.stateSubject.next({
      ...currentState,
      proximosPagosHabitualesTab: null
    });
  }

  setPosicionGlobalCardView(view: PosicionGlobalCardView): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      posicionGlobalCardView: view
    });
  }

  togglePosicionGlobalCardView(): void {
    const currentState = this.getCurrentState();
    const next: PosicionGlobalCardView =
      currentState.posicionGlobalCardView === 'upcoming' ? 'total' : 'upcoming';
    this.setPosicionGlobalCardView(next);
  }

  setSelectedUpcomingPaymentId(id: string | null): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      selectedUpcomingPaymentId: id
    });
  }

  /** Paso 10 (Gestionar pagos) abriendo la vista Suscripciones */
  goToGestionarPagosSuscripciones(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: 10,
      gestionarPagosDirectoSuscripciones: true,
      gestionarPagosDirectoRecibos: false,
      gestionarPagosAbrirSuscripcionId: null,
      gestionarPagosAbrirReciboId: null,
      gestionarPagosReturn: null
    });
  }

  /** Recibos: misma pantalla que pagos habituales, pestaña Recibos (no el hub paso 10) */
  goToGestionarPagosRecibos(): void {
    this.setProximosPagosView('habituales', 'recibos');
  }

  /** Paso 10: Suscripciones y detalle de una suscripción concreta (mismo id que en el hub) */
  goToGestionarPagosSuscripcionDetalle(
    subscriptionId: string,
    returnTo?: GestionarPagosReturnContext | null
  ): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: 10,
      gestionarPagosDirectoSuscripciones: true,
      gestionarPagosDirectoRecibos: false,
      gestionarPagosAbrirSuscripcionId: subscriptionId,
      gestionarPagosAbrirReciboId: null,
      gestionarPagosReturn: returnTo ?? null
    });
  }

  /** Paso 10: detalle de un recibo habitual (demo hub); `h3`, etc. */
  goToGestionarPagosReciboDetalle(
    habitualPaymentId: string,
    returnTo?: GestionarPagosReturnContext | null
  ): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: 10,
      gestionarPagosDirectoSuscripciones: false,
      gestionarPagosDirectoRecibos: false,
      gestionarPagosAbrirSuscripcionId: null,
      gestionarPagosAbrirReciboId: habitualPaymentId,
      gestionarPagosReturn: returnTo ?? null
    });
  }

  /**
   * Paso 10: detalle recibo para un cargo previsto (id `up-{upcomingId}` en catálogo hub).
   */
  goToGestionarPagosReciboDetallePorUpcoming(
    upcomingPaymentId: string,
    returnTo?: GestionarPagosReturnContext | null
  ): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: 10,
      gestionarPagosDirectoSuscripciones: false,
      gestionarPagosDirectoRecibos: false,
      gestionarPagosAbrirSuscripcionId: null,
      gestionarPagosAbrirReciboId: `up-${upcomingPaymentId}`,
      gestionarPagosReturn: returnTo ?? null
    });
  }

  /** Paso 10: ya no hay menú intermedio; equivale a abrir Suscripciones */
  goToGestionarPagosMenu(): void {
    this.goToGestionarPagosSuscripciones();
  }

  clearGestionarPagosDirectoSuscripciones(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      gestionarPagosDirectoSuscripciones: false,
      gestionarPagosDirectoRecibos: false,
      gestionarPagosAbrirSuscripcionId: null,
      gestionarPagosAbrirReciboId: null
    });
  }

  /** Lee y limpia el contexto de retorno (una sola vez) */
  consumeGestionarPagosReturn(): GestionarPagosReturnContext | null {
    const currentState = this.getCurrentState();
    const ret = currentState.gestionarPagosReturn ?? null;
    if (!ret) {
      return null;
    }
    this.stateSubject.next({
      ...currentState,
      gestionarPagosReturn: null
    });
    return ret;
  }

  clearGestionarPagosAbrirReciboId(): void {
    const currentState = this.getCurrentState();
    if (currentState.gestionarPagosAbrirReciboId == null) {
      return;
    }
    this.stateSubject.next({
      ...currentState,
      gestionarPagosAbrirReciboId: null
    });
  }

  getUpcomingPaymentById(id: string): UpcomingPaymentItem | undefined {
    const items = this.getCurrentState().upcomingPaymentsItems ?? DEFAULT_UPCOMING_PAYMENTS_ITEMS;
    return items.find(i => i.id === id);
  }

  updateProfile(profile: Partial<FinancialProfile>): void {
    const currentState = this.getCurrentState();
    const updatedProfile = {
      ...currentState.perfilFinanciero,
      ...profile
    } as FinancialProfile;

    // Recalcular capacidad basada en el perfil
    const capacidad = this.calculateCapacity(updatedProfile);

    this.stateSubject.next({
      ...currentState,
      perfilFinanciero: updatedProfile,
      capacidadMaxima: capacidad.maxima,
      capacidadMensual: capacidad.mensual
    });
  }

  updateRecommendedProducts(products: RecommendedProduct[]): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      productosRecomendados: products
    });
  }

  setMetaObjetivo(meta: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      metaObjetivo: meta
    });
  }

  markPotentialUpdated(): void {
    const currentState = this.getCurrentState();
    // Calcular scoring basado en el perfil
    const score = this.calculateFinancialScore(currentState.perfilFinanciero);
    this.stateSubject.next({
      ...currentState,
      hasUpdatedPotential: true,
      financialScore: score
    });
  }

  setShowPrestamoModal(show: boolean): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      showPrestamoModal: show
    });
  }

  private calculateFinancialScore(profile?: FinancialProfile): number {
    if (!profile || profile.ingresos === 0) return 50; // Score por defecto
    
    const disponible = profile.ingresos - profile.gastos;
    const ratioDisponible = disponible / profile.ingresos;
    
    // Score basado en:
    // - Ratio de disponibilidad (0-60 puntos)
    // - Estabilidad (tiene productos = más estable) (0-40 puntos)
    let score = Math.min(60, ratioDisponible * 100);
    
    if (profile.productos && profile.productos.length > 0) {
      score += Math.min(40, profile.productos.length * 10);
    }
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private calculateCapacity(profile: FinancialProfile): { maxima: number; mensual: number } {
    // Simulación de cálculo de capacidad
    const disponible = profile.ingresos - profile.gastos;
    const ratio = 0.3; // 30% del disponible
    const mensual = Math.max(0, disponible * ratio);
    const maxima = mensual * 60; // 5 años = 60 meses

    return {
      maxima: Math.round(maxima),
      mensual: Math.round(mensual)
    };
  }

  markLoanCompleted(amount: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      loanCompleted: true,
      loanAmount: amount
    });
  }

  clearLoanCompleted(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      loanCompleted: false,
      loanAmount: undefined
    });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
