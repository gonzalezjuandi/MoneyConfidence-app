import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-confirmacion',
  templateUrl: './prestamo-coche-confirmacion.component.html',
  styleUrls: ['./prestamo-coche-confirmacion.component.scss']
})
export class PrestamoCocheConfirmacionComponent implements OnInit, AfterViewInit {
  @Input() loanData?: any;
  @Output() next = new EventEmitter<void>();

  showDetails = true;

  get data(): any {
    const defaultData = {
      amount: 0,
      termMonths: 0,
      monthlyPayment: 0,
      tin: 4,
      tae: 4.84,
      hasInsurance: false,
      totalToRepay: 0
    };
    const data = this.loanData || defaultData;
    if (!data.totalToRepay && data.monthlyPayment && data.termMonths) {
      data.totalToRepay = data.monthlyPayment * data.termMonths + (data.openingCommission ?? 220);
    }
    return data;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  onVerIngreso(): void {
    // Navegar a la cuenta o mostrar detalles del ingreso
    this.next.emit();
  }

  onIrAPosicionGlobal(): void {
    // Navegar a posición global
    this.next.emit();
  }

  get formattedAmount(): string {
    return this.data.amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get formattedMonthlyPayment(): string {
    return this.data.monthlyPayment.toFixed(2).replace('.', ',');
  }

  get termYears(): number {
    return Math.round(this.data.termMonths / 12);
  }

  get formattedTotalToRepay(): string {
    return this.data.totalToRepay.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get formattedInsuranceCost(): string {
    if (!this.data.hasInsurance) return '0,00';
    const cost = this.data.insuranceMonthlyReceipt ?? this.data.insuranceMonthlyCost ?? this.data.insuranceCost;
    if (cost == null) return '0,00';
    return Number(cost).toFixed(2).replace('.', ',');
  }
}
