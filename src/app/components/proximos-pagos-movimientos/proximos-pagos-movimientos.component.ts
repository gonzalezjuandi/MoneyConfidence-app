import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  WizardStateService,
  UpcomingPaymentItem,
  DEFAULT_UPCOMING_PAYMENTS_ITEMS,
  DEFAULT_RECURRING_SUBSCRIPTIONS,
  RecurringSubscriptionItem,
  ProximosPagosView,
  ProximosPagosHabitualesFilter,
  GestionarPagosReturnContext,
  HabitualPaymentItem,
  DEFAULT_HABITUAL_PAYMENTS
} from '../../services/wizard-state.service';

declare var lucide: any;

/** Fila en chip Recibos: habitual (Endesa) + movimientos de Próximos pagos */
type RecibosHabitualMergedRow =
  | { tipo: 'habitual'; habitual: HabitualPaymentItem }
  | { tipo: 'proximo'; upcoming: UpcomingPaymentItem };

@Component({
  selector: 'app-proximos-pagos-movimientos',
  templateUrl: './proximos-pagos-movimientos.component.html',
  styleUrls: ['./proximos-pagos-movimientos.component.scss']
})
export class ProximosPagosMovimientosComponent implements OnInit, AfterViewInit, OnDestroy {
  private wizardStateSub?: Subscription;

  /** Subvista actual (movimientos vs pagos habituales) — mismo componente, distinta plantilla */
  proximosPagosView: ProximosPagosView = 'movimientos';

  readonly habitualItems: HabitualPaymentItem[] = [...DEFAULT_HABITUAL_PAYMENTS];

  readonly habitualCategoryTabs: { key: ProximosPagosHabitualesFilter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'suscripciones', label: 'Suscripciones' },
    { key: 'recibos', label: 'Recibos' }
  ];

  /** Por defecto: todos los pagos activos (sin filtro de chip) */
  selectedHabitualFilter: ProximosPagosHabitualesFilter = 'todos';

  readonly recurringSubs: RecurringSubscriptionItem[] = DEFAULT_RECURRING_SUBSCRIPTIONS;

  readonly accountChips: { key: 'all' | 'principal' | 'familiar'; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'principal', label: 'Cuenta Sabadell *4422' },
    { key: 'familiar', label: 'Cuenta familiar *4425' }
  ];

  selectedAccountKey: 'all' | 'principal' | 'familiar' = 'all';

  upcomingItems: UpcomingPaymentItem[] = [...DEFAULT_UPCOMING_PAYMENTS_ITEMS];

  infoDrawer: null | 'importes' = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService
  ) {
    const s = this.wizardState.getCurrentState();
    this.proximosPagosView = s.proximosPagosView ?? 'home';
    if (s.proximosPagosHabitualesTab != null) {
      this.selectedHabitualFilter = s.proximosPagosHabitualesTab;
      this.wizardState.clearProximosPagosHabitualesTab();
    }
    if (s.upcomingPaymentsItems?.length) {
      this.upcomingItems = [...s.upcomingPaymentsItems];
    }
  }

  get isHabitualesView(): boolean {
    return this.proximosPagosView === 'habituales';
  }

  get activeHabitualPaymentsCount(): number {
    return this.habitualItems.filter(
      i => i.status === 'activa' && i.category !== 'cancelados'
    ).length;
  }

  get filteredHabitualItems(): HabitualPaymentItem[] {
    const base = this.habitualItems.filter(
      i => i.category !== 'cancelados' && i.status !== 'cancelada'
    );
    if (this.selectedHabitualFilter === 'todos') {
      return base;
    }
    return base.filter(i => i.category === this.selectedHabitualFilter);
  }

  isSubscriptionListSimplified(it: HabitualPaymentItem): boolean {
    return it.category === 'suscripciones' && it.status === 'activa';
  }

  /**
   * Chip «Recibos»: recibos habituales + cargos de la previsión (misma fuente que Próximos pagos).
   */
  get recibosMergedRows(): RecibosHabitualMergedRow[] {
    const rows: RecibosHabitualMergedRow[] = [];
    for (const h of this.habitualItems) {
      if (h.category === 'recibos' && h.status === 'activa') {
        rows.push({ tipo: 'habitual', habitual: h });
      }
    }
    for (const u of this.upcomingItems) {
      rows.push({ tipo: 'proximo', upcoming: u });
    }
    return rows;
  }

  /**
   * Chip «Todos»: todos los pagos habituales activos + mismos cargos que en Recibos (sin duplicar lógica de movimiento).
   */
  get todosMergedRows(): RecibosHabitualMergedRow[] {
    const rows: RecibosHabitualMergedRow[] = [];
    for (const h of this.habitualItems) {
      if (h.category !== 'cancelados' && h.status !== 'cancelada') {
        rows.push({ tipo: 'habitual', habitual: h });
      }
    }
    for (const u of this.upcomingItems) {
      rows.push({ tipo: 'proximo', upcoming: u });
    }
    return rows;
  }

  get habitualesMergedListRows(): RecibosHabitualMergedRow[] {
    if (this.selectedHabitualFilter === 'todos') {
      return this.todosMergedRows;
    }
    if (this.selectedHabitualFilter === 'recibos') {
      return this.recibosMergedRows;
    }
    return [];
  }

  onMergedHabitualRowClick(row: RecibosHabitualMergedRow): void {
    if (row.tipo === 'proximo') {
      this.wizardState.goToGestionarPagosReciboDetallePorUpcoming(
        row.upcoming.id,
        this.habitualesReturnContext()
      );
      return;
    }
    this.onHabitualRowClick(row.habitual);
  }

  private habitualesReturnContext(): GestionarPagosReturnContext {
    return {
      proximosPagosView: 'habituales',
      habitualesTab: this.selectedHabitualFilter
    };
  }

  isMergedHabitualRowClickable(row: RecibosHabitualMergedRow): boolean {
    if (row.tipo === 'proximo') {
      return true;
    }
    if (row.habitual.linkedSubscriptionId) {
      return true;
    }
    return row.habitual.category === 'recibos' && row.habitual.status === 'activa';
  }

  ngOnInit(): void {
    this.wizardStateSub = this.wizardState.state$.subscribe(state => {
      const nextView = state.proximosPagosView ?? 'home';
      if (nextView === 'habituales' && state.proximosPagosHabitualesTab != null) {
        this.selectedHabitualFilter = state.proximosPagosHabitualesTab;
        this.wizardState.clearProximosPagosHabitualesTab();
      }
      if (nextView !== this.proximosPagosView) {
        this.proximosPagosView = nextView;
        setTimeout(() => this.initLucide(), 80);
      }
      if (state.upcomingPaymentsItems?.length) {
        this.upcomingItems = [...state.upcomingPaymentsItems];
      }
      this.cdr.markForCheck();
    });
  }

  get filteredUpcomingItems(): UpcomingPaymentItem[] {
    return this.filterUpcomingByAccount(this.upcomingItems, this.selectedAccountKey);
  }

  openUpcomingDetail(id: string): void {
    this.wizardState.setSelectedUpcomingPaymentId(id);
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

  selectHabitualFilter(key: ProximosPagosHabitualesFilter): void {
    this.selectedHabitualFilter = key;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  onHabitualRowClick(it: HabitualPaymentItem): void {
    const ret = this.habitualesReturnContext();
    if (it.linkedSubscriptionId) {
      this.wizardState.goToGestionarPagosSuscripcionDetalle(it.linkedSubscriptionId, ret);
      return;
    }
    if (it.category === 'recibos' && it.status === 'activa') {
      this.wizardState.goToGestionarPagosReciboDetalle(it.id, ret);
    }
  }

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

  formatMoney(n: number): string {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onBack(): void {
    this.wizardState.setProximosPagosView('home');
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
