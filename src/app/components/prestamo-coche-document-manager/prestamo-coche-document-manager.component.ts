import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var lucide: any;

export interface DocumentData {
  id: string;
  title: string;
  type: 'solicitud' | 'ine' | 'descanso' | 'contrato';
  content: string;
  read: boolean;
}

@Component({
  selector: 'app-prestamo-coche-document-manager',
  templateUrl: './prestamo-coche-document-manager.component.html',
  styleUrls: ['./prestamo-coche-document-manager.component.scss']
})
export class PrestamoCocheDocumentManagerComponent implements OnInit, AfterViewInit {
  @Input() loanData?: any;
  @Output() complete = new EventEmitter<void>();
  @Output() exit = new EventEmitter<void>();

  currentDocumentIndex = 0;
  documents: DocumentData[] = [];
  scrollPosition = 0;
  hasScrolledToBottom = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initializeDocuments();
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
    this.setupScrollListener();
  }

  initializeDocuments(): void {
    const loanAmount = this.loanData?.amount || 45000;
    const termMonths = this.loanData?.termMonths || 96;
    const monthlyPayment = this.loanData?.monthlyPayment || 550.52;
    const tin = this.loanData?.tin || 4.00;
    const tae = this.loanData?.tae || 4.83;

    this.documents = [
      {
        id: 'solicitud',
        title: 'Solicitud de préstamo',
        type: 'solicitud',
        content: this.getSolicitudContent(loanAmount, termMonths, monthlyPayment, tin, tae),
        read: false
      },
      {
        id: 'ine',
        title: 'Información Precontractual',
        type: 'ine',
        content: this.getINEContent(loanAmount, termMonths, monthlyPayment, tin, tae),
        read: false
      },
      {
        id: 'descanso',
        title: 'Resumen de tu préstamo',
        type: 'descanso',
        content: this.getDescansoContent(loanAmount, termMonths, monthlyPayment, tin, tae),
        read: false
      },
      {
        id: 'contrato',
        title: 'Contrato del préstamo',
        type: 'contrato',
        content: this.getContratoContent(loanAmount, termMonths, monthlyPayment, tin, tae),
        read: false
      }
    ];
  }

  setupScrollListener(): void {
    setTimeout(() => {
      const documentContent = document.querySelector('.document-content');
      if (documentContent) {
        documentContent.addEventListener('scroll', () => {
          this.checkScrollPosition(documentContent);
        });
        // Verificar posición inicial
        this.checkScrollPosition(documentContent);
      }
    }, 100);
  }

  checkScrollPosition(element: Element): void {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Considerar que ha llegado al final si está al 95% o más, o si el contenido es menor que el contenedor
    const scrollPercentage = scrollHeight <= clientHeight 
      ? 1 
      : (scrollTop + clientHeight) / scrollHeight;
    
    this.hasScrolledToBottom = scrollPercentage >= 0.95;
  }

  get currentDocument(): DocumentData | undefined {
    return this.documents[this.currentDocumentIndex];
  }

  get currentDocumentContent(): SafeHtml {
    if (!this.currentDocument) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(this.currentDocument.content);
  }

  get progress(): number {
    const readCount = this.documents.filter(doc => doc.read).length;
    return (readCount / this.documents.length) * 100;
  }

  get canContinue(): boolean {
    if (!this.currentDocument) return false;
    return this.hasScrolledToBottom || this.currentDocument.type === 'descanso';
  }

  onMarkAsRead(): void {
    if (!this.canContinue) return;
    
    this.documents[this.currentDocumentIndex].read = true;
    
    if (this.currentDocumentIndex < this.documents.length - 1) {
      this.currentDocumentIndex++;
      this.hasScrolledToBottom = false;
      // Scroll al inicio del nuevo documento
      setTimeout(() => {
        const documentContent = document.querySelector('.document-content');
        if (documentContent) {
          documentContent.scrollTop = 0;
        }
        // Reconfigurar el listener de scroll para el nuevo documento
        this.setupScrollListener();
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 100);
    } else {
      // Todos los documentos leídos - emitir evento para navegar a firma
      this.complete.emit();
    }
  }

  onExit(): void {
    this.exit.emit();
  }

  onDownload(): void {
    if (!this.currentDocument) return;
    console.log('Descargando documento:', this.currentDocument.title);
    // En producción, aquí se descargaría el PDF real
    alert(`Descargando ${this.currentDocument.title}...`);
  }

  getSolicitudContent(amount: number, termMonths: number, monthlyPayment: number, tin: number, tae: number): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">SOLICITUD DE PRÉSTAMO</h1>
      
      <div class="document-section">
        <p class="section-text">
          <strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
        <p class="section-text">
          <strong>Solicitante:</strong> María García Palao
        </p>
        <p class="section-text">
          <strong>DNI/NIE:</strong> 12345678A
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">DATOS DEL PRÉSTAMO SOLICITADO</h3>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">Importe solicitado:</span>
            <span class="data-value">${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
          </div>
          <div class="data-item">
            <span class="data-label">Plazo de amortización:</span>
            <span class="data-value">${termMonths} meses (${Math.round(termMonths / 12)} años)</span>
          </div>
          <div class="data-item">
            <span class="data-label">Cuota mensual estimada:</span>
            <span class="data-value">${monthlyPayment.toFixed(2).replace('.', ',')} €</span>
          </div>
          <div class="data-item">
            <span class="data-label">TIN (Tipo de Interés Nominal):</span>
            <span class="data-value">${tin.toFixed(2)} % anual</span>
          </div>
          <div class="data-item">
            <span class="data-label">TAE (Tasa Anual Equivalente):</span>
            <span class="data-value">${tae.toFixed(2)} %</span>
          </div>
        </div>
      </div>

      <div class="document-section">
        <h3 class="section-title">FINALIDAD DEL PRÉSTAMO</h3>
        <p class="section-text">
          El préstamo solicitado tiene como finalidad la adquisición de un vehículo.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">DECLARACIÓN DEL SOLICITANTE</h3>
        <p class="section-text">
          Declaro que la información facilitada en esta solicitud es veraz y completa. 
          Autorizo a Banco Sabadell, S.A. a verificar los datos proporcionados y a consultar 
          los ficheros de solvencia patrimonial y crédito para la evaluación de la solicitud.
        </p>
        <p class="section-text">
          Asimismo, acepto las condiciones generales y particulares del préstamo que me 
          serán facilitadas con carácter previo a la formalización del contrato.
        </p>
      </div>
    `;
  }

  getINEContent(amount: number, termMonths: number, monthlyPayment: number, tin: number, tae: number): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">INFORMACIÓN PREVIA</h1>
      <h2 class="document-subtitle">Préstamo Preconcedido</h2>
      
      <div class="document-section">
        <h3 class="section-title">INFORMACIÓN CLASIFICACIÓN PRODUCTO</h3>
        <p class="section-text">
          En aplicación de la Orden ECC/2316/2015, se facilita información sobre el indicador 
          de riesgo, liquidez y alertas de complejidad del producto.
        </p>
        <p class="section-text">
          <strong>Producto:</strong> Préstamo Preconcedido
        </p>
        <p class="section-text">
          <strong>Indicador de riesgo:</strong> Clasificación del producto financiero en alguna de las 6 categorías previstas.
        </p>
        <div class="risk-indicator-box">
          <div class="risk-number">2 / 6</div>
          <p class="risk-description">
            Este número es indicativo del riesgo del producto, siendo 1/6 indicativo de menor 
            riesgo y 6/6 de mayor riesgo.
          </p>
        </div>
      </div>

      <div class="document-section">
        <h3 class="section-title">INFORMACIÓN PRECONTRACTUAL</h3>
        <p class="section-text">
          En cumplimiento de la Circular 5/2012 del Banco de España, se facilita esta información 
          para que el solicitante pueda tomar una decisión informada sobre la suscripción del 
          producto o servicio financiero.
        </p>
        <p class="section-text-bold">
          Las informaciones resaltadas en negrita son especialmente relevantes para Ud.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CONDICIONES FINANCIERAS</h3>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">Importe del préstamo:</span>
            <span class="data-value">${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
          </div>
          <div class="data-item">
            <span class="data-label">Plazo:</span>
            <span class="data-value">${termMonths} meses</span>
          </div>
          <div class="data-item">
            <span class="data-label">Cuota mensual:</span>
            <span class="data-value">${monthlyPayment.toFixed(2).replace('.', ',')} €</span>
          </div>
          <div class="data-item">
            <span class="data-label">TIN:</span>
            <span class="data-value">${tin.toFixed(2)} % anual</span>
          </div>
          <div class="data-item">
            <span class="data-label">TAE:</span>
            <span class="data-value">${tae.toFixed(2)} %</span>
          </div>
        </div>
      </div>

      <div class="document-section">
        <h3 class="section-title">IDENTIDAD Y DETALLES DE CONTACTO</h3>
        <p class="section-text">
          <strong>Banco Sabadell, S.A.</strong><br>
          NIF: A-08000143<br>
          Dirección: C/Alcalá nº 48, 28014 Madrid<br>
          Web: www.bancsabadell.com<br>
          Email: info&#64;bancsabadell.com
        </p>
      </div>
    `;
  }

  getDescansoContent(amount: number, termMonths: number, monthlyPayment: number, tin: number, tae: number): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">RESUMEN DE TU PRÉSTAMO</h1>
      
      <div class="descanso-content">
        <div class="descanso-card">
          <h3 class="descanso-card-title">Préstamo Preconcedido</h3>
          <div class="descanso-data">
            <div class="descanso-item">
              <span class="descanso-label">Importe</span>
              <span class="descanso-value">${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">Plazo</span>
              <span class="descanso-value">${Math.round(termMonths / 12)} años (${termMonths} meses)</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">Cuota mensual</span>
              <span class="descanso-value highlight">${monthlyPayment.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">TIN</span>
              <span class="descanso-value">${tin.toFixed(2)} %</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">TAE</span>
              <span class="descanso-value">${tae.toFixed(2)} %</span>
            </div>
          </div>
        </div>

        <div class="descanso-info">
          <p class="descanso-text">
            Antes de continuar con la firma del contrato, revisa detenidamente la información 
            de tu préstamo. Asegúrate de que todos los datos son correctos y que comprendes 
            las condiciones del préstamo.
          </p>
          <p class="descanso-text">
            Una vez que procedas con la firma digital, el préstamo quedará formalizado y 
            comenzará el proceso de desembolso.
          </p>
        </div>
      </div>
    `;
  }

  getContratoContent(amount: number, termMonths: number, monthlyPayment: number, tin: number, tae: number): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">CONTRATO DE PRÉSTAMO</h1>
      
      <div class="document-section">
        <h3 class="section-title">CLÁUSULA PRIMERA. OBJETO Y DEFINICIONES</h3>
        <p class="section-text">
          El presente contrato tiene por objeto la concesión de un préstamo personal por parte 
          de Banco Sabadell, S.A. (en adelante, "el Banco") a favor de María García Palao 
          (en adelante, "el Prestatario").
        </p>
        <p class="section-text">
          <strong>Importe del préstamo:</strong> ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>
        <p class="section-text">
          <strong>Plazo de amortización:</strong> ${termMonths} meses
        </p>
        <p class="section-text">
          <strong>Finalidad:</strong> Adquisición de vehículo
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CLÁUSULA SEGUNDA. CONDICIONES FINANCIERAS</h3>
        <p class="section-text">
          <strong>Tipo de interés nominal (TIN):</strong> ${tin.toFixed(2)} % anual
        </p>
        <p class="section-text">
          <strong>Tasa anual equivalente (TAE):</strong> ${tae.toFixed(2)} %
        </p>
        <p class="section-text">
          <strong>Cuota mensual:</strong> ${monthlyPayment.toFixed(2).replace('.', ',')} €
        </p>
        <p class="section-text">
          El tipo de interés será fijo durante toda la vida del préstamo.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CLÁUSULA TERCERA. AMORTIZACIÓN</h3>
        <p class="section-text">
          El préstamo se amortizará mediante el pago de ${termMonths} cuotas mensuales 
          consecutivas e iguales de ${monthlyPayment.toFixed(2).replace('.', ',')} € cada una, 
          siendo la primera cuota exigible el día 30 del mes siguiente a la fecha de 
          formalización del contrato.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CLÁUSULA CUARTA. COMISIONES</h3>
        <p class="section-text">
          <strong>Comisión de apertura:</strong> 220,00 €, que se cargará en el momento de 
          la formalización del contrato.
        </p>
        <p class="section-text">
          <strong>Comisión por cancelación anticipada:</strong> El 1,00% del importe reembolsado 
          si falta más de un año para el vencimiento del contrato, o el 0,50% en caso contrario.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CLÁUSULA QUINTA. OBLIGACIONES DEL PRESTATARIO</h3>
        <p class="section-text">
          El Prestatario se obliga a:
        </p>
        <ul class="section-list">
          <li>Pagar puntualmente las cuotas en las fechas establecidas</li>
          <li>Comunicar cualquier cambio en sus datos personales o situación económica</li>
          <li>No destinar el préstamo a fines distintos de los declarados</li>
        </ul>
      </div>

      <div class="document-section">
        <h3 class="section-title">CLÁUSULA SEXTA. ACEPTACIÓN</h3>
        <p class="section-text">
          Al firmar digitalmente este contrato, el Prestatario declara haber leído, 
          comprendido y aceptado todas las cláusulas del presente contrato.
        </p>
      </div>
    `;
  }
}
