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
  DEFAULT_HABITUAL_PAYMENTS,
  upcomingItemDebitAccountKey
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
    if (this.selectedHabitualFilter === 'todos') {
      return this.todosMergedRows.length;
    }
    if (this.selectedHabitualFilter === 'recibos') {
      return this.recibosMergedRows.length;
    }
    return this.filteredHabitualItems.filter(i => i.status === 'activa').length;
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
   * Chip «Recibos»: cargos previstos (como en Próximos pagos) y al final el recibo domiciliado
   * que no está en esa previsión (Endesa), con la fecha de renovación más tardía en demo.
   */
  get recibosMergedRows(): RecibosHabitualMergedRow[] {
    const upcomingSorted = [...this.upcomingItems].sort(
      (a, b) => this.upcomingChargeTimestamp(a) - this.upcomingChargeTimestamp(b)
    );
    const rows: RecibosHabitualMergedRow[] = [];
    for (const u of upcomingSorted) {
      rows.push({ tipo: 'proximo', upcoming: u });
    }
    const endesaRecibo = this.endesaHabitualRecibo;
    if (endesaRecibo) {
      rows.push({ tipo: 'habitual', habitual: endesaRecibo });
    }
    return rows;
  }

  /**
   * Chip «Todos»: suscripciones primero, cargos previstos ordenados por fecha, Endesa al final
   * (no figura en Próximos pagos como línea propia — recibo habitual aparte).
   */
  get todosMergedRows(): RecibosHabitualMergedRow[] {
    const habitual = this.habitualItems.filter(
      h => h.category !== 'cancelados' && h.status !== 'cancelada'
    );
    const subscriptions = habitual.filter(h => h.category === 'suscripciones');
    const endesaRecibo = this.endesaHabitualRecibo;
    const upcomingSorted = [...this.upcomingItems].sort(
      (a, b) => this.upcomingChargeTimestamp(a) - this.upcomingChargeTimestamp(b)
    );
    const rows: RecibosHabitualMergedRow[] = [];
    for (const h of subscriptions) {
      rows.push({ tipo: 'habitual', habitual: h });
    }
    for (const u of upcomingSorted) {
      rows.push({ tipo: 'proximo', upcoming: u });
    }
    if (endesaRecibo) {
      rows.push({ tipo: 'habitual', habitual: endesaRecibo });
    }
    return rows;
  }

  private get endesaHabitualRecibo(): HabitualPaymentItem | null {
    const h = this.habitualItems.find(i => i.id === 'h3' && i.category === 'recibos');
    return h && h.status === 'activa' ? h : null;
  }

  /** Ordenar por fecha de `scheduleDetail` / `schedule` (demo ES). */
  private upcomingChargeTimestamp(u: UpcomingPaymentItem): number {
    const text = (u.scheduleDetail ?? u.schedule ?? '').toLowerCase();
    const m = text.match(
      /(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})/
    );
    if (m) {
      const months: Record<string, number> = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11
      };
      const mi = months[m[2]];
      if (mi != null) {
        return Date.UTC(parseInt(m[3], 10), mi, parseInt(m[1], 10));
      }
    }
    return 0;
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
    filterKey: 'all' | 'principal' | 'familiar'
  ): UpcomingPaymentItem[] {
    if (filterKey === 'all') {
      return [...items];
    }
    return items.filter(it => upcomingItemDebitAccountKey(it) === filterKey);
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
