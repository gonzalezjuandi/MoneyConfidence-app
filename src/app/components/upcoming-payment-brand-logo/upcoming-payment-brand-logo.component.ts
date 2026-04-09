import { Component, Input } from '@angular/core';
import { UpcomingPaymentLogoVariant } from '../../services/wizard-state.service';

@Component({
  selector: 'app-upcoming-payment-brand-logo',
  templateUrl: './upcoming-payment-brand-logo.component.html',
  styleUrls: ['./upcoming-payment-brand-logo.component.scss']
})
export class UpcomingPaymentBrandLogoComponent {
  /** Marca de la referencia (logos vectoriales) */
  @Input() variant: UpcomingPaymentLogoVariant | null = null;
  /** sm = píldora inicio; md = listas; lg = detalle / hero */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
