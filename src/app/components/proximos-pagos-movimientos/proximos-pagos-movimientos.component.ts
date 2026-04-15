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
  HabitualPaymentCategory,
  HabitualPaymentItem,
  DEFAULT_HABITUAL_PAYMENTS
} from '../../services/wizard-state.service';

declare var lucide: any;

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

  readonly habitualCategoryTabs: { key: HabitualPaymentCategory; label: string }[] = [
    { key: 'suscripciones', label: 'Suscripciones' },
    { key: 'recibos', label: 'Recibos' },
    { key: 'cancelados', label: 'Cancelados' }
  ];

  selectedHabitualCategory: HabitualPaymentCategory = 'suscripciones';

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
    if (s.proximosPagosHabitualesTab) {
      this.selectedHabitualCategory = s.proximosPagosHabitualesTab;
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
    return this.habitualItems.filter(i => i.status === 'activa').length;
  }

  get filteredHabitualItems(): HabitualPaymentItem[] {
    return this.habitualItems.filter(i => i.category === this.selectedHabitualCategory);
  }

  ngOnInit(): void {
    this.wizardStateSub = this.wizardState.state$.subscribe(state => {
      const nextView = state.proximosPagosView ?? 'home';
      if (nextView === 'habituales' && state.proximosPagosHabitualesTab) {
        this.selectedHabitualCategory = state.proximosPagosHabitualesTab;
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

  selectHabitualCategory(key: HabitualPaymentCategory): void {
    this.selectedHabitualCategory = key;
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  onHabitualRowClick(it: HabitualPaymentItem): void {
    if (it.linkedSubscriptionId) {
      this.wizardState.goToGestionarPagosSuscripcionDetalle(it.linkedSubscriptionId);
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
