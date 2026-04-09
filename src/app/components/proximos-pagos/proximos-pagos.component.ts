import {
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  WizardStateService,
  UpcomingPaymentItem,
  DEFAULT_UPCOMING_PAYMENTS_ITEMS
} from '../../services/wizard-state.service';

declare var lucide: any;

@Component({
  selector: 'app-proximos-pagos',
  templateUrl: './proximos-pagos.component.html',
  styleUrls: ['./proximos-pagos.component.scss']
})
export class ProximosPagosComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() openGestionarPagos = new EventEmitter<void>();

  private wizardStateSub?: Subscription;

  showFraccionarFlow = false;

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

  upcomingTotal = 450;
  upcomingCount = 4;

  upcomingItems: UpcomingPaymentItem[] = [...DEFAULT_UPCOMING_PAYMENTS_ITEMS];

  /** Drawer: importes/fechas (sección lista) | intro (título de página) */
  infoDrawer: null | 'importes' | 'intro' = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private wizardState: WizardStateService
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

  /** Total estimado según chip seleccionado (suma de importes de la lista filtrada). */
  get displayUpcomingTotal(): number {
    return this.filteredUpcomingItems.reduce((s, it) => s + it.amount, 0);
  }

  get displayUpcomingCount(): number {
    return this.filteredUpcomingItems.length;
  }

  get displayUpcomingCountLabel(): string {
    const c = this.displayUpcomingCount;
    return c === 1 ? '1 pago' : `${c} pagos`;
  }

  openInfoDrawer(): void {
    this.infoDrawer = 'importes';
    this.cdr.markForCheck();
    setTimeout(() => this.initLucide(), 80);
  }

  openPageInfoDrawer(): void {
    this.infoDrawer = 'intro';
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
      return key === 'principal' ? a.includes('principal') : a.includes('familiar');
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

  onBack(): void {
    this.wizardState.setEntryScreen('posicion-global');
  }

  onGestionarSuscripciones(): void {
    this.wizardState.goToGestionarPagosSuscripciones();
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
