import { Component, EventEmitter, Output, AfterViewInit, OnInit } from '@angular/core';
import { PrestamoCocheResumenData } from '../prestamo-coche-resumen/prestamo-coche-resumen.component';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-simulacion',
  templateUrl: './prestamo-coche-simulacion.component.html',
  styleUrls: ['./prestamo-coche-simulacion.component.scss']
})
export class PrestamoCocheSimulacionComponent implements OnInit, AfterViewInit {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<PrestamoCocheResumenData>();

  // Estado del formulario
  amount = 3000;
  minAmount = 3000;
  maxAmount = 40000;
  termMonths = 96;
  monthlyPayment = 250.00;
  hasInsurance = false;
  insuranceCost = 11.20;
  insuranceFirstReceipt = 12.50;

  // Estado del input
  amountInputValue = '3.000';
  isInputFocused = false;
  amountError: string | null = null;

  // TIN y TAE
  tin = 4.00;
  tae = 4.84;

  // Drawer de información del seguro
  showInsuranceDrawer = false;

  // Modal médico
  showMedicalModal = false;

  // Estado del checkbox del seguro (deshabilitado si rechazó condiciones médicas)
  isInsuranceDisabled = false;

  // Toast de notificación
  showToast = false;
  toastMessage = 'Tus datos serán enviados a la aseguradora si avanza con el proceso de contratación del seguro.';
  toastType: 'info' | 'alert' = 'info';

  ngOnInit(): void {
    this.updateMonthlyPayment();
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
    
    // Escuchar cambios en el slider de Galatea usando MutationObserver o eventos personalizados
    setTimeout(() => {
      this.setupSliderListener();
    }, 500);
  }

  setupSliderListener(): void {
    // Buscar el componente bs-slider
    const slider = document.querySelector('bs-slider.amount-slider-galatea');
    if (slider) {
      // Escuchar el evento valueChange del componente
      slider.addEventListener('valueChange', (event: Event) => {
        this.onAmountSliderChangeFromGalatea(event);
      });
      
      // También escuchar cambios en el atributo value
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            const newValue = parseInt((mutation.target as HTMLElement).getAttribute('value') || '0', 10);
            if (!isNaN(newValue) && newValue !== this.amount && newValue >= this.minAmount && newValue <= this.maxAmount) {
              this.amount = newValue;
              this.amountInputValue = newValue.toLocaleString('es-ES', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              });
              this.updateMonthlyPayment();
            }
          }
        });
      });
      
      observer.observe(slider, {
        attributes: true,
        attributeFilter: ['value']
      });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  onAmountInputChange(event: Event): void {
    // Manejar tanto eventos nativos como de bs-input
    const customEvent = event as CustomEvent;
    const target = event.target as any;
    let value: string;
    
    if (customEvent.detail) {
      value = customEvent.detail.value || customEvent.detail;
    } else if (target?.value !== undefined) {
      value = target.value;
    } else {
      value = (event.target as HTMLInputElement).value;
    }
    
    this.amountInputValue = value;
    const cleanValue = value.replace(/[^\d.]/g, '').replace(/\./g, '');
    
    if (cleanValue === '') {
      this.amountInputValue = '';
      this.amountError = null;
      return;
    }
    
    const numValue = parseInt(cleanValue, 10);
    
    if (isNaN(numValue)) {
      this.amountError = null;
      return;
    }
    
    if (numValue < this.minAmount || numValue > this.maxAmount) {
      this.amountError = `La cantidad debe estar entre ${this.minAmount.toLocaleString('es-ES')} € y ${this.maxAmount.toLocaleString('es-ES')} €`;
      this.amount = numValue;
    } else {
      this.amountError = null;
      this.amount = numValue;
      this.updateMonthlyPayment();
    }
    
    this.amountInputValue = numValue.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onAmountInputFocus(): void {
    this.isInputFocused = true;
  }

  onAmountInputBlur(): void {
    this.isInputFocused = false;
    if (this.amount < this.minAmount) {
      this.amount = this.minAmount;
      this.amountError = null;
    } else if (this.amount > this.maxAmount) {
      this.amount = this.maxAmount;
      this.amountError = null;
    }
    this.amountInputValue = this.amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    this.updateMonthlyPayment();
  }

  onAmountSliderChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.amount = value;
    this.amountInputValue = value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    this.updateMonthlyPayment();
  }

  onAmountSliderChangeFromGalatea(event: Event): void {
    const customEvent = event as CustomEvent;
    let newValue: number;
    
    // Intentar obtener el valor del evento de diferentes formas
    if (customEvent && customEvent.detail !== undefined) {
      if (typeof customEvent.detail === 'number') {
        newValue = customEvent.detail;
      } else if (typeof customEvent.detail === 'object' && customEvent.detail !== null) {
        if (customEvent.detail.value !== undefined) {
          newValue = typeof customEvent.detail.value === 'number' 
            ? customEvent.detail.value 
            : parseInt(String(customEvent.detail.value).replace(/[^\d]/g, ''), 10);
        } else {
          newValue = parseInt(String(customEvent.detail).replace(/[^\d]/g, ''), 10);
        }
      } else {
        newValue = parseInt(String(customEvent.detail).replace(/[^\d]/g, ''), 10);
      }
    } else {
      const target = event.target as any;
      if (target?.value !== undefined) {
        newValue = typeof target.value === 'number' 
          ? target.value 
          : parseInt(String(target.value).replace(/[^\d]/g, ''), 10);
      } else {
        // Intentar obtener del atributo value del elemento
        const sliderElement = event.target as HTMLElement;
        const valueAttr = sliderElement?.getAttribute('value');
        if (valueAttr) {
          newValue = parseInt(valueAttr.replace(/[^\d]/g, ''), 10);
        } else {
          newValue = this.amount;
        }
      }
    }
    
    // Validar y actualizar
    if (!isNaN(newValue) && newValue >= this.minAmount && newValue <= this.maxAmount && newValue !== this.amount) {
      this.amount = newValue;
      this.amountInputValue = newValue.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      this.amountError = null;
      this.updateMonthlyPayment();
    }
  }

  selectTerm(months: number): void {
    this.termMonths = months;
    this.updateMonthlyPayment();
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  onInsuranceToggle(event: Event): void {
    // Si el seguro está deshabilitado, no permitir cambios
    if (this.isInsuranceDisabled) {
      event.preventDefault();
      return;
    }

    const checkbox = event.target as HTMLInputElement;
    this.hasInsurance = checkbox.checked;
    
    // Actualizar la cuota mensual inmediatamente
    this.updateMonthlyPayment();
    
    // Mostrar toast cuando se activa el seguro
    if (this.hasInsurance) {
      this.showToastNotification(
        'Tus datos serán enviados a la aseguradora si avanza con el proceso de contratación del seguro.',
        'info'
      );
    } else {
      this.closeToast();
    }
  }

  closeToast(): void {
    this.showToast = false;
  }

  updateMonthlyPayment(): void {
    // Calcular la cuota mensual usando la fórmula de amortización con interés compuesto
    // Cuota = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // Donde:
    // P = Principal (amount)
    // r = Tasa de interés mensual (TIN / 12 / 100)
    // n = Número de meses (termMonths)
    
    const principal = this.amount;
    const monthlyRate = this.tin / 12 / 100; // Tasa mensual
    const numMonths = this.termMonths;
    
    if (monthlyRate === 0 || numMonths === 0) {
      // Si no hay interés o no hay plazo, dividir el principal entre los meses
      this.monthlyPayment = principal / numMonths;
    } else {
      // Fórmula de amortización
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numMonths);
      const denominator = Math.pow(1 + monthlyRate, numMonths) - 1;
      const basePayment = principal * (numerator / denominator);
      this.monthlyPayment = basePayment;
    }
    
    // Agregar el seguro si está activo
    const insurance = this.hasInsurance ? this.insuranceCost : 0;
    this.monthlyPayment = this.monthlyPayment + insurance;
    
    // Redondear a 2 decimales
    this.monthlyPayment = Math.round(this.monthlyPayment * 100) / 100;
  }

  get formattedAmount(): string {
    return this.amount.toLocaleString('es-ES');
  }

  get formattedAmountWithDecimals(): string {
    return this.amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get formattedMonthlyPayment(): string {
    return this.monthlyPayment.toFixed(2).replace('.', ',');
  }

  clearAmountInput(): void {
    this.amountInputValue = '';
    this.amount = this.minAmount;
    this.updateMonthlyPayment();
    setTimeout(() => {
      const input = document.querySelector('.amount-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  get minFormatted(): string {
    return this.minAmount.toLocaleString('es-ES');
  }

  get maxFormatted(): string {
    return this.maxAmount.toLocaleString('es-ES');
  }

  onNext(): void {
    // Si tiene seguro activado, mostrar modal médico primero
    if (this.hasInsurance) {
      this.showMedicalModal = true;
      document.body.style.overflow = 'hidden';
      if (typeof lucide !== 'undefined') {
        setTimeout(() => {
          lucide.createIcons();
        }, 100);
      }
    } else {
      // Si no tiene seguro, continuar directamente con los datos
      const resumenData: PrestamoCocheResumenData = {
        amount: this.amount,
        termMonths: this.termMonths,
        monthlyPayment: this.monthlyPayment,
        tin: this.tin,
        tae: this.tae,
        openingCommission: 220.00,
        totalInterest: this.calculateTotalInterest(),
        totalToRepay: this.calculateTotalToRepay(),
        firstPaymentDate: this.getFirstPaymentDate(),
        hasInsurance: false,
        accountNumber: 'Cuenta Online Sabadell •••2930',
        accountHolder: 'María García Palao',
        loanPurpose: 'Vehículo'
      };
      this.next.emit(resumenData);
    }
  }

  onConfirmNoMedicalCondition(): void {
    // Usuario confirma que no padece condición médica
    this.closeMedicalModal();
    
    // Preparar datos para el resumen
    const resumenData: PrestamoCocheResumenData = {
      amount: this.amount,
      termMonths: this.termMonths,
      monthlyPayment: this.monthlyPayment,
      tin: this.tin,
      tae: this.tae,
      openingCommission: 220.00, // Valor por defecto
      totalInterest: this.calculateTotalInterest(),
      totalToRepay: this.calculateTotalToRepay(),
      firstPaymentDate: this.getFirstPaymentDate(),
      hasInsurance: this.hasInsurance,
      insuranceAnnualPremium: this.hasInsurance ? (this.insuranceCost * 12) : undefined,
      insuranceFirstReceipt: this.hasInsurance ? this.insuranceFirstReceipt : undefined,
      insuranceMonthlyReceipt: this.hasInsurance ? this.insuranceCost : undefined,
      accountNumber: 'Cuenta Online Sabadell •••2930',
      accountHolder: 'María García Palao',
      loanPurpose: 'Vehículo'
    };
    
    // Emitir evento con los datos
    (this.next as any).emit(resumenData);
  }

  private calculateTotalInterest(): number {
    const totalPaid = this.monthlyPayment * this.termMonths;
    return totalPaid - this.amount;
  }

  private calculateTotalToRepay(): number {
    const totalInterest = this.calculateTotalInterest();
    const openingCommission = 220.00;
    return this.amount + totalInterest + openingCommission;
  }

  private getFirstPaymentDate(): string {
    const today = new Date();
    const firstPayment = new Date(today);
    firstPayment.setMonth(today.getMonth() + 1);
    firstPayment.setDate(30);
    return firstPayment.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  onHasMedicalCondition(): void {
    // Usuario indica que padece condición médica
    this.closeMedicalModal();
    // Deshabilitar el seguro
    this.hasInsurance = false;
    this.isInsuranceDisabled = true;
    this.updateMonthlyPayment();
    // Mostrar toast de alerta
    this.showToastNotification(
      'No es posible contratar el seguro por restricciones y políticas de la aseguradora.',
      'alert'
    );
  }

  closeMedicalModal(): void {
    this.showMedicalModal = false;
    document.body.style.overflow = '';
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  showToastNotification(message: string, type: 'info' | 'alert' = 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 0);
    }
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  openInsuranceDrawer(): void {
    this.showInsuranceDrawer = true;
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  closeInsuranceDrawer(): void {
    this.showInsuranceDrawer = false;
    document.body.style.overflow = '';
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }
}
