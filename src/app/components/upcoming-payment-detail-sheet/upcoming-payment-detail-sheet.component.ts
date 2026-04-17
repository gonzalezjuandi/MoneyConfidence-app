import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  WizardStateService,
  UpcomingPaymentItem
} from '../../services/wizard-state.service';

declare var lucide: any;

@Component({
  selector: 'app-upcoming-payment-detail-sheet',
  templateUrl: './upcoming-payment-detail-sheet.component.html',
  styleUrls: ['./upcoming-payment-detail-sheet.component.scss']
})
export class UpcomingPaymentDetailSheetComponent
  implements AfterViewInit, OnDestroy
{
  item: UpcomingPaymentItem | null = null;

  /** Sheet «Importes y fechas estimadas» (referencia) */
  importeInfoOpen = false;

  /** Filas extra del bloque detalle plegables */
  detailExpanded = true;

  private sub?: Subscription;

  constructor(
    private wizardState: WizardStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.sub = this.wizardState.state$.subscribe(state => {
      const id = state.selectedUpcomingPaymentId;
      if (!id) {
        this.item = null;
        this.importeInfoOpen = false;
      } else {
        const next =
          state.upcomingPaymentsItems?.find(i => i.id === id) ??
          this.wizardState.getUpcomingPaymentById(id) ??
          null;
        if (next?.id !== this.item?.id) {
          this.detailExpanded = true;
        }
        this.item = next;
      }
      this.cdr.markForCheck();
      setTimeout(() => this.refreshIcons(), 60);
    });
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.importeInfoOpen = false;
    this.wizardState.setSelectedUpcomingPaymentId(null);
  }

  openImporteInfo(): void {
    this.importeInfoOpen = true;
    this.cdr.markForCheck();
    setTimeout(() => this.refreshIcons(), 80);
  }

  closeImporteInfo(): void {
    this.importeInfoOpen = false;
    this.cdr.markForCheck();
    setTimeout(() => this.refreshIcons(), 40);
  }

  toggleDetailExpanded(): void {
    this.detailExpanded = !this.detailExpanded;
    this.cdr.markForCheck();
    setTimeout(() => this.refreshIcons(), 40);
  }

  formatMoney(n: number): string {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get scheduleLongDisplay(): string {
    return this.item?.scheduleDetail ?? this.item?.schedule ?? '';
  }

  get conceptoDetalle(): string {
    if (!this.item) {
      return '';
    }
    if (this.item.movementConcept) {
      return this.item.movementConcept;
    }
    if (this.item.detail) {
      return `${this.item.name} ${this.item.detail}`;
    }
    return this.item.name;
  }

  /** «Cuenta ••••4422» a partir de «Cuenta *4422» */
  get cuentaEnmascarada(): string {
    if (!this.item?.accountMask) {
      return '';
    }
    return this.item.accountMask.replace(/\*(\d{4})/, '••••$1');
  }

  get ibanDisplay(): string {
    return this.item?.iban ?? '—';
  }

  get titularDisplay(): string {
    return this.item?.titularCuenta ?? '—';
  }

  get productoDisplay(): string {
    return this.item?.productoCuenta ?? '—';
  }

  get referenciaDisplay(): string {
    return this.item?.referenciaMovimiento ?? '—';
  }

  private refreshIcons(): void {
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons();
      } catch {
        /* noop */
      }
    }
  }
}
