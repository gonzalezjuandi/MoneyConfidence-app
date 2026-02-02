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
      amount: 45000,
      termMonths: 96,
      monthlyPayment: 550.52,
      tin: 4.00,
      tae: 4.83,
      hasInsurance: true,
      insuranceMonthlyCost: 12.52
    };
    
    const data = this.loanData || defaultData;
    
    // Calcular total a devolver si no está presente
    if (!data.totalToRepay) {
      const totalPaid = data.monthlyPayment * data.termMonths;
      const openingCommission = 220.00;
      data.totalToRepay = totalPaid + openingCommission;
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
    if (!this.data.hasInsurance || !this.data.insuranceMonthlyCost) return '0,00';
    return this.data.insuranceMonthlyCost.toFixed(2).replace('.', ',');
  }
}
