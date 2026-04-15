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
  DEFAULT_HABITUAL_PAYMENTS,
  combineUpcomingAndSubscriptions30d,
  sumHabitualRecibosMonthly,
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

  /** Suscripciones activas (demo) — wizard / Posición global */
  readonly recurringSubs: RecurringSubscriptionItem[] = DEFAULT_RECURRING_SUBSCRIPTIONS;

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
    return [...this.upcomingItems];
  }

  /** Vista previa: últimos 3 movimientos previstos (orden de la lista) */
  get previewUpcomingItems(): UpcomingPaymentItem[] {
    return this.filteredUpcomingItems.slice(0, 3);
  }

  get displayUpcomingTotal(): number {
    return this.filteredUpcomingItems.reduce((s, it) => s + it.amount, 0);
  }

  get displayUpcomingCount(): number {
    return this.filteredUpcomingItems.length;
  }

  get recurringSubsMonthlyTotal(): number {
    return this.recurringSubs.reduce((s, r) => s + r.priceMonthly, 0);
  }

  get displaySummaryTotal(): number {
    return this.displayUpcomingTotal + this.recurringSubsMonthlyTotal;
  }

  get displaySummaryCount(): number {
    return this.displayUpcomingCount + this.recurringSubs.length;
  }

  get displaySummaryCountLabel(): string {
    const c = this.displaySummaryCount;
    return c === 1 ? '1 en los próximos 30 días' : `${c} en los próximos 30 días`;
  }

  /** Tarjeta «Próximo gasto» */
  get insightProximo(): UpcomingPaymentItem | null {
    const list = this.filteredUpcomingItems;
    return list.length ? list[0] : null;
  }

  /** Tarjeta «Mayor gasto» */
  get insightMayor(): UpcomingPaymentItem | null {
    const list = this.filteredUpcomingItems;
    if (!list.length) {
      return null;
    }
    return list.reduce((a, b) => (b.amount > a.amount ? b : a));
  }

  /** Suma mensual de recibos habituales (misma fuente que la pestaña Recibos al gestionar pagos) */
  get gastoMensualRecibos(): number {
    return sumHabitualRecibosMonthly(DEFAULT_HABITUAL_PAYMENTS);
  }

  truncateInsightName(name: string, maxLen = 22): string {
    const t = name.trim();
    if (t.length <= maxLen) {
      return t;
    }
    return `${t.slice(0, maxLen - 1)}…`;
  }

  goToMovimientosLista(): void {
    this.wizardState.setProximosPagosView('movimientos');
  }

  /** Detalle full-screen del ítem (misma hoja que lista / preview) */
  openInsightProximoDetail(): void {
    const it = this.insightProximo;
    if (it) {
      this.openUpcomingDetail(it.id);
    }
  }

  openInsightMayorDetail(): void {
    const it = this.insightMayor;
    if (it) {
      this.openUpcomingDetail(it.id);
    }
  }

  goGestionarPagosHabituales(): void {
    this.wizardState.setProximosPagosView('habituales');
  }

  openGestionarPagosRecibos(): void {
    this.wizardState.goToGestionarPagosRecibos();
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

  onBack(): void {
    this.wizardState.setPosicionGlobalCardView('total');
    this.wizardState.setEntryScreen('posicion-global');
    void this.router.navigate(['/app', 'posicion-global']);
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
