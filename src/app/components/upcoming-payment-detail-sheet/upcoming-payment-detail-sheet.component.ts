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

  private sub?: Subscription;

  constructor(
    private wizardState: WizardStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.sub = this.wizardState.state$.subscribe(state => {
      const id = state.selectedUpcomingPaymentId;
      if (!id) {
        this.item = null;
      } else {
        this.item =
          state.upcomingPaymentsItems?.find(i => i.id === id) ??
          this.wizardState.getUpcomingPaymentById(id) ??
          null;
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
    this.wizardState.setSelectedUpcomingPaymentId(null);
  }

  formatMoney(n: number): string {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
