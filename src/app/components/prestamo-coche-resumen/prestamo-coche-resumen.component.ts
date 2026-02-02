import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit, OnDestroy } from '@angular/core';

declare var lucide: any;

export interface PrestamoCocheResumenData {
  amount: number;
  termMonths: number;
  monthlyPayment: number;
  tin: number;
  tae: number;
  openingCommission: number;
  totalInterest: number;
  totalToRepay: number;
  firstPaymentDate: string;
  hasInsurance: boolean;
  insuranceAnnualPremium?: number;
  insuranceFirstReceipt?: number;
  insuranceMonthlyReceipt?: number;
  accountNumber?: string;
  accountHolder?: string;
  loanPurpose?: string;
}

@Component({
  selector: 'app-prestamo-coche-resumen',
  templateUrl: './prestamo-coche-resumen.component.html',
  styleUrls: ['./prestamo-coche-resumen.component.scss']
})
export class PrestamoCocheResumenComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() loanData?: PrestamoCocheResumenData;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  // Toast de éxito
  showSuccessToast = false;
  private toastTimeout: any;

  // Dropdown de cuentas
  showAccountDropdown = false;
  selectedInsuranceAccount = 'Cuenta Online Sabadell •••2930';
  availableAccounts = [
    'Cuenta Online Sabadell •••2930',
    'Cuenta Nómina Sabadell •••4852',
    'Cuenta Ahorro Sabadell •••7123'
  ];

  // Dropdown de beneficiarios
  showBeneficiaryDropdown = false;
  selectedBeneficiary = 'Herederos legales';
  availableBeneficiaries = [
    'Herederos legales',
    'María García Palao',
    'Laura García'
  ];

  // Visor de documentos
  showDocumentViewer = false;
  documentZoom = 100;

  // Pantalla de carga
  showLoadingScreen = false;


  // Datos por defecto
  defaultData: PrestamoCocheResumenData = {
    amount: 45000,
    termMonths: 96,
    monthlyPayment: 550.52,
    tin: 4.00,
    tae: 4.83,
    openingCommission: 220.00,
    totalInterest: 7850.00,
    totalToRepay: 53070.52,
    firstPaymentDate: '30/06/2025',
    hasInsurance: true,
    insuranceAnnualPremium: 145.52,
    insuranceFirstReceipt: 12.50,
    insuranceMonthlyReceipt: 11.20,
    accountNumber: 'Cuenta Online Sabadell •••2930',
    accountHolder: 'María García Palao',
    loanPurpose: 'Vehículo'
  };

  get data(): PrestamoCocheResumenData {
    return this.loanData || this.defaultData;
  }

  ngOnInit(): void {
    // Mostrar toast de éxito si tiene seguro
    if (this.data.hasInsurance) {
      setTimeout(() => {
        this.showSuccessToastNotification();
      }, 500);
    }
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropdowns.bind(this));
  }

  private closeDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.resumen-item-dropdown')) {
      this.showAccountDropdown = false;
      this.showBeneficiaryDropdown = false;
    }
  }

  onBack(): void {
    this.back.emit();
  }

  onModifyRequest(): void {
    // Volver a la simulación
    this.back.emit();
  }

  toggleAccountDropdown(): void {
    this.showAccountDropdown = !this.showAccountDropdown;
    this.showBeneficiaryDropdown = false;
  }

  selectAccount(account: string): void {
    this.selectedInsuranceAccount = account;
    this.showAccountDropdown = false;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  toggleBeneficiaryDropdown(): void {
    this.showBeneficiaryDropdown = !this.showBeneficiaryDropdown;
    this.showAccountDropdown = false;
  }

  selectBeneficiary(beneficiary: string): void {
    this.selectedBeneficiary = beneficiary;
    this.showBeneficiaryDropdown = false;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  openDocumentViewer(): void {
    this.showDocumentViewer = true;
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  closeDocumentViewer(): void {
    this.showDocumentViewer = false;
    document.body.style.overflow = '';
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  zoomIn(): void {
    if (this.documentZoom < 200) {
      this.documentZoom += 25;
    }
  }

  zoomOut(): void {
    if (this.documentZoom > 50) {
      this.documentZoom -= 25;
    }
  }

  downloadDocument(): void {
    // Simular descarga
    console.log('Descargando documentación precontractual del seguro...');
    // En producción, aquí se descargaría el PDF real
    alert('Descarga iniciada. En producción, se descargaría el PDF de la documentación precontractual.');
  }

  shareDocument(): void {
    // Simular compartir
    console.log('Compartiendo documentación...');
    if (navigator.share) {
      navigator.share({
        title: 'Documentación Precontractual - Seguro Protección Vida',
        text: 'Documentación precontractual del seguro de protección de vida',
        url: window.location.href
      }).catch(err => console.log('Error al compartir:', err));
    } else {
      alert('Función de compartir no disponible en este navegador.');
    }
  }

  onNext(): void {
    // Mostrar pantalla de carga
    this.showLoadingScreen = true;
    
    // Simular carga durante 4-6 segundos (aleatorio entre 4 y 6)
    const loadingTime = 4000 + Math.random() * 2000; // Entre 4000 y 6000 ms
    
    setTimeout(() => {
      // Después de la carga, conectar con el gestor documental
      this.showLoadingScreen = false;
      this.connectToDocumentManager();
    }, loadingTime);
  }

  connectToDocumentManager(): void {
    // Emitir evento para navegar al gestor documental (flujo propio)
    this.next.emit();
  }

  showSuccessToastNotification(): void {
    this.showSuccessToast = true;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 0);
    }
    // Cerrar automáticamente después de 5 segundos
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast(): void {
    this.showSuccessToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
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

  get formattedTotalInterest(): string {
    return this.data.totalInterest.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get formattedOpeningCommission(): string {
    return this.data.openingCommission.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get formattedTotalToRepay(): string {
    return this.data.totalToRepay.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get termYears(): number {
    return Math.round(this.data.termMonths / 12);
  }

  get formattedInsuranceAnnualPremium(): string {
    if (!this.data.insuranceAnnualPremium) return '0,00';
    return this.data.insuranceAnnualPremium.toFixed(2).replace('.', ',');
  }

  get formattedInsuranceFirstReceipt(): string {
    if (!this.data.insuranceFirstReceipt) return '0,00';
    return this.data.insuranceFirstReceipt.toFixed(2).replace('.', ',');
  }

  get formattedInsuranceMonthlyReceipt(): string {
    if (!this.data.insuranceMonthlyReceipt) return '0,00';
    return this.data.insuranceMonthlyReceipt.toFixed(2).replace('.', ',');
  }
}
