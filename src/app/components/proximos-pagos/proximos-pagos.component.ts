import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  WizardStateService,
  UpcomingPaymentItem,
  DEFAULT_UPCOMING_PAYMENTS_ITEMS,
  DEFAULT_RECURRING_SUBSCRIPTIONS,
  combineUpcomingAndSubscriptions30d,
  RecurringSubscriptionItem
} from '../../services/wizard-state.service';

declare var lucide: any;

const PP_INITIAL_30D = combineUpcomingAndSubscriptions30d(
  DEFAULT_UPCOMING_PAYMENTS_ITEMS,
  DEFAULT_RECURRING_SUBSCRIPTIONS
);

@Component({
  selector: 'app-proximos-pagos',
  templateUrl: './proximos-pagos.component.html',
  styleUrls: ['./proximos-pagos.component.scss']
})
export class ProximosPagosComponent implements OnInit, AfterViewInit, OnDestroy {
  private wizardStateSub?: Subscription;

  showFraccionarFlow = false;

  /** Pestaña principal: próximos cargos vs suscripciones */
  mainTab: 'proximos' | 'suscripciones' = 'proximos';

  /** Suscripciones activas (demo) — wizard / Posición global */
  readonly recurringSubs: RecurringSubscriptionItem[] = DEFAULT_RECURRING_SUBSCRIPTIONS;

  /** Alineado con chips de cuenta en Posición global / Cuentas */
  readonly accountChips: {
    key: 'all' | 'principal' | 'familiar';
    label: string;
  }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'principal', label: 'Cuenta Sabadell *4422' },
    { key: 'familiar', label: 'Cuenta familiar *4425' }
  ];

  selectedAccountKey: 'all' | 'principal' | 'familiar' = 'all';

  upcomingTotal = PP_INITIAL_30D.total;
  upcomingCount = PP_INITIAL_30D.count;

  upcomingItems: UpcomingPaymentItem[] = [...DEFAULT_UPCOMING_PAYMENTS_ITEMS];

  /** Drawer informativo importes/fechas */
  infoDrawer: null | 'importes' = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService,
    private router: Router
  ) {
    const s = this.wizardState.getCurrentState();
    if (s.upcomingPaymentsTotal != null) {
      this.upcomingTotal = s.upcomingPaymentsTotal;
    }
    if (s.upcomingPaymentsCount != null) {
      this.upcomingCount = s.upcomingPaymentsCount;
    }
    if (s.upcomingPaymentsItems?.length) {
      this.upcomingItems = [...s.upcomingPaymentsItems];
      const combined = combineUpcomingAndSubscriptions30d(
        this.upcomingItems,
        this.recurringSubs
      );
      this.upcomingTotal = combined.total;
      this.upcomingCount = combined.count;
    }
  }

  ngOnInit(): void {
    this.wizardStateSub = this.wizardState.state$.subscribe(state => {
      if (state.upcomingPaymentsTotal != null) {
        this.upcomingTotal = state.upcomingPaymentsTotal;
      }
      if (state.upcomingPaymentsCount != null) {
        this.upcomingCount = state.upcomingPaymentsCount;
      }
      if (state.upcomingPaymentsItems?.length) {
        this.upcomingItems = [...state.upcomingPaymentsItems];
        const combined = combineUpcomingAndSubscriptions30d(
          this.upcomingItems,
          this.recurringSubs
        );
        this.upcomingTotal = combined.total;
        this.upcomingCount = combined.count;
      }
      this.cdr.markForCheck();
    });
  }

  openUpcomingDetail(id: string): void {
    this.wizardState.setSelectedUpcomingPaymentId(id);
  }

  get filteredUpcomingItems(): UpcomingPaymentItem[] {
    return this.filterUpcomingByAccount(this.upcomingItems, this.selectedAccountKey);
  }

  /** Suma de cargos próximos según chip (solo lista «Próximos pagos»). */
  get displayUpcomingTotal(): number {
    return this.filteredUpcomingItems.reduce((s, it) => s + it.amount, 0);
  }

  get displayUpcomingCount(): number {
    return this.filteredUpcomingItems.length;
  }

  /** Importe mensual combinado de suscripciones activas (pestaña Suscripciones). */
  get recurringSubsMonthlyTotal(): number {
    return this.recurringSubs.reduce((s, r) => s + r.priceMonthly, 0);
  }

  /**
   * Bloque «Total estimado próximos 30 días»: cargos previstos (filtrados por chip)
   * más importes de suscripciones activas.
   */
  get displaySummaryTotal(): number {
    return this.displayUpcomingTotal + this.recurringSubsMonthlyTotal;
  }

  get displaySummaryCount(): number {
    return this.displayUpcomingCount + this.recurringSubs.length;
  }

  get displaySummaryCountLabel(): string {
    const c = this.displaySummaryCount;
    return c === 1 ? '1 pago' : `${c} pagos`;
  }

  openInfoDrawer(): void {
    this.infoDrawer = 'importes';
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  closeInfoDrawer(): void {
    this.infoDrawer = null;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  selectAccountFilter(key: 'all' | 'principal' | 'familiar'): void {
    this.selectedAccountKey = key;
    this.cdr.markForCheck();
  }

  /**
   * Misma regla que `upcomingItemsForSelectedAccount` en Posición global / Cuentas:
   * un cargo pertenece a la cuenta si `accounts` la incluye (compartidos cuentan en ambas).
   */
  private filterUpcomingByAccount(
    items: UpcomingPaymentItem[],
    key: 'all' | 'principal' | 'familiar'
  ): UpcomingPaymentItem[] {
    if (key === 'all') {
      return [...items];
    }
    return items.filter(it => {
      const a = it.accounts;
      if (!a?.length) {
        return key === 'principal';
      }
      return a.includes(key);
    });
  }

  ngAfterViewInit(): void {
    this.initLucide();
  }

  ngOnDestroy(): void {
    this.wizardStateSub?.unsubscribe();
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

  /** Vuelve al inicio (Posición global / dashboard) */
  onBack(): void {
    this.wizardState.setPosicionGlobalCardView('total');
    this.wizardState.setEntryScreen('posicion-global');
    void this.router.navigate(['/app', 'posicion-global']);
  }

  selectMainTab(tab: 'proximos' | 'suscripciones'): void {
    this.mainTab = tab;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  /** Abre el hub en el detalle de la suscripción (mismos datos que en Gestionar pagos) */
  onRecurringSubClick(subscriptionId: string): void {
    this.wizardState.goToGestionarPagosSuscripcionDetalle(subscriptionId);
  }

  openFraccionarFlow(): void {
    this.showFraccionarFlow = true;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 100);
  }

  onFraccionarClosed(): void {
    this.showFraccionarFlow = false;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 100);
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
      }, 150);
    }
  }
}
