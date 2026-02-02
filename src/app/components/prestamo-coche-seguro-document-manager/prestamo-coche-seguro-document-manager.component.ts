import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit } from '@angular/core';

declare var lucide: any;

export interface SeguroDocumentData {
  id: string;
  title: string;
  type: 'documentacion' | 'descanso' | 'salud' | 'solicitud';
  content: string;
  read: boolean;
}

@Component({
  selector: 'app-prestamo-coche-seguro-document-manager',
  templateUrl: './prestamo-coche-seguro-document-manager.component.html',
  styleUrls: ['./prestamo-coche-seguro-document-manager.component.scss']
})
export class PrestamoCocheSeguroDocumentManagerComponent implements OnInit, AfterViewInit {
  @Input() loanData?: any;
  @Output() complete = new EventEmitter<void>();
  @Output() exit = new EventEmitter<void>();

  currentDocumentIndex = 0;
  documents: SeguroDocumentData[] = [];
  scrollPosition = 0;
  hasScrolledToBottom = false;

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
    const insuranceCost = this.loanData?.insuranceMonthlyReceipt || 11.20;

    this.documents = [
      {
        id: 'documentacion-seguro',
        title: 'Documentación del seguro',
        type: 'documentacion',
        content: this.getDocumentacionSeguroContent(),
        read: false
      },
      {
        id: 'descanso-seguro',
        title: 'Resumen del seguro',
        type: 'descanso',
        content: this.getDescansoSeguroContent(loanAmount, termMonths, monthlyPayment, insuranceCost),
        read: false
      },
      {
        id: 'salud-encriptado',
        title: 'Documentación encriptada de la pregunta de salud',
        type: 'salud',
        content: this.getSaludEncriptadoContent(),
        read: false
      },
      {
        id: 'solicitud-seguro',
        title: 'Documentación de la solicitud del seguro',
        type: 'solicitud',
        content: this.getSolicitudSeguroContent(),
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
        this.checkScrollPosition(documentContent);
      }
    }, 100);
  }

  checkScrollPosition(element: Element): void {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    const scrollPercentage = scrollHeight <= clientHeight 
      ? 1 
      : (scrollTop + clientHeight) / scrollHeight;
    
    this.hasScrolledToBottom = scrollPercentage >= 0.95;
  }

  get currentDocument(): SeguroDocumentData {
    return this.documents[this.currentDocumentIndex];
  }

  get canContinue(): boolean {
    return this.hasScrolledToBottom || this.currentDocument.type === 'descanso';
  }

  onMarkAsRead(): void {
    if (!this.canContinue) return;
    
    this.documents[this.currentDocumentIndex].read = true;
    
    if (this.currentDocumentIndex < this.documents.length - 1) {
      this.currentDocumentIndex++;
      this.hasScrolledToBottom = false;
      setTimeout(() => {
        const documentContent = document.querySelector('.document-content');
        if (documentContent) {
          documentContent.scrollTop = 0;
        }
        this.setupScrollListener();
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 100);
    } else {
      this.complete.emit();
    }
  }

  onExit(): void {
    this.exit.emit();
  }

  onDownload(): void {
    console.log('Descargando documento:', this.currentDocument.title);
    alert(`Descargando ${this.currentDocument.title}...`);
  }

  getDocumentacionSeguroContent(): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">DOCUMENTACIÓN DEL SEGURO</h1>
      
      <div class="document-section">
        <h3 class="section-title">ÍNDICE DE DOCUMENTOS</h3>
        <ul class="section-list">
          <li>Portada</li>
          <li>Carátula</li>
          <li>NIM (Nota Informativa del Mediador)</li>
          <li>Carátula</li>
          <li>Documento simulación</li>
          <li>Carátula</li>
          <li>Nota de venta Combinada</li>
          <li>Carátula</li>
          <li>Nota informativa de la Asegurado (NIA)</li>
        </ul>
      </div>

      <div class="document-section">
        <h3 class="section-title">PORTADA</h3>
        <p class="section-text">
          <strong>Seguro Protección Vida Capital Constante</strong><br>
          Zurich Vida, Compañía de Seguros y Reaseguros, S.A.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">NIM - NOTA INFORMATIVA DEL MEDIADOR</h3>
        <p class="section-text">
          El presente seguro ha sido comercializado por Banco Sabadell, S.A., que actúa como 
          mediador de seguros vinculado a Zurich Vida, Compañía de Seguros y Reaseguros, S.A.
        </p>
        <p class="section-text">
          Banco Sabadell, S.A. está inscrito en el Registro de Mediadores de Seguros con el 
          número DGSFP J-0001.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">DOCUMENTO SIMULACIÓN</h3>
        <p class="section-text">
          La presente simulación tiene carácter meramente informativo y no constituye una 
          oferta vinculante. Las condiciones definitivas del seguro serán las establecidas 
          en la póliza que se formalice.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">NOTA DE VENTA COMBINADA</h3>
        <p class="section-text">
          Este seguro se comercializa de forma combinada con el préstamo, pero su contratación 
          es independiente y no es requisito para la concesión del préstamo.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">NIA - NOTA INFORMATIVA DEL ASEGURADO</h3>
        <p class="section-text">
          Esta nota informativa tiene por objeto facilitar al asegurado información relevante 
          sobre el seguro que va a contratar, sus características, coberturas, exclusiones y 
          condiciones generales.
        </p>
        <p class="section-text">
          Es importante que lea detenidamente toda la documentación antes de proceder con la 
          contratación del seguro.
        </p>
      </div>
    `;
  }

  getDescansoSeguroContent(amount: number, termMonths: number, monthlyPayment: number, insuranceCost: number): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">RESUMEN DEL SEGURO</h1>
      
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
          </div>
        </div>

        <div class="descanso-card">
          <h3 class="descanso-card-title">Seguro Protección Vida</h3>
          <div class="descanso-data">
            <div class="descanso-item">
              <span class="descanso-label">Prima mensual</span>
              <span class="descanso-value highlight">${insuranceCost.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">Capital asegurado</span>
              <span class="descanso-value">100% del importe del préstamo</span>
            </div>
            <div class="descanso-item">
              <span class="descanso-label">Coberturas</span>
              <span class="descanso-value">Fallecimiento e Incapacidad Absoluta</span>
            </div>
          </div>
        </div>

        <div class="descanso-info">
          <p class="descanso-text">
            Antes de continuar con la firma del seguro, revisa detenidamente la información 
            del préstamo y del seguro. Asegúrate de que todos los datos son correctos y que 
            comprendes las condiciones del seguro.
          </p>
          <p class="descanso-text">
            Una vez que procedas con la firma digital, el seguro quedará formalizado y 
            comenzará su vigencia junto con el préstamo.
          </p>
        </div>
      </div>
    `;
  }

  getSaludEncriptadoContent(): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">DOCUMENTACIÓN ENCRIPTADA</h1>
      <h2 class="document-subtitle">Pregunta de Salud</h2>
      
      <div class="document-section">
        <h3 class="section-title">INFORMACIÓN ENCRIPTADA</h3>
        <p class="section-text">
          La siguiente documentación contiene información médica encriptada relacionada con 
          las preguntas de salud que ha respondido durante el proceso de contratación del seguro.
        </p>
        <p class="section-text">
          Esta información está protegida y encriptada de acuerdo con la normativa de protección 
          de datos personales y solo será accesible para los fines relacionados con la evaluación 
          y gestión del seguro.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CONFIRMACIÓN MÉDICA</h3>
        <p class="section-text">
          Usted ha confirmado que no padece ni ha padecido ninguna de las condiciones médicas 
          especificadas en el cuestionario de salud.
        </p>
        <p class="section-text">
          Esta información ha sido registrada de forma encriptada y será utilizada únicamente 
          para la evaluación del riesgo del seguro.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">PROTECCIÓN DE DATOS</h3>
        <p class="section-text">
          Los datos de salud están protegidos por la Ley Orgánica de Protección de Datos y 
          solo serán tratados por personal autorizado y para los fines establecidos en la 
          póliza del seguro.
        </p>
      </div>
    `;
  }

  getSolicitudSeguroContent(): string {
    return `
      <div class="document-header">
        <div class="document-logo">
          <span class="logo-s">S</span>
          <span class="logo-text">Sabadell</span>
        </div>
      </div>
      
      <h1 class="document-main-title">SOLICITUD DE SEGURO</h1>
      
      <div class="document-section">
        <h3 class="section-title">ÍNDICE DE DOCUMENTOS</h3>
        <ul class="section-list">
          <li>Portada</li>
          <li>Carátula</li>
          <li>Solicitud de seguro</li>
          <li>Carátula</li>
          <li>CCGG (Condiciones Generales)</li>
          <li>Carátula</li>
          <li>CCEE (Condiciones Especiales)</li>
        </ul>
      </div>

      <div class="document-section">
        <h3 class="section-title">SOLICITUD DE SEGURO</h3>
        <p class="section-text">
          <strong>Solicitante:</strong> María García Palao<br>
          <strong>DNI/NIE:</strong> 12345678A<br>
          <strong>Producto:</strong> Seguro Protección Vida Capital Constante<br>
          <strong>Compañía:</strong> Zurich Vida, Compañía de Seguros y Reaseguros, S.A.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CONDICIONES GENERALES (CCGG)</h3>
        <p class="section-text">
          Las condiciones generales establecen los términos y condiciones aplicables al seguro 
          de protección de vida, incluyendo las coberturas, exclusiones, obligaciones del 
          asegurado y de la compañía, así como el procedimiento de reclamación.
        </p>
        <p class="section-text">
          Es importante que lea detenidamente estas condiciones antes de proceder con la firma.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">CONDICIONES ESPECIALES (CCEE)</h3>
        <p class="section-text">
          Las condiciones especiales establecen las particularidades específicas de su póliza, 
          incluyendo el capital asegurado, la prima, el plazo de cobertura y cualquier 
          modificación o complemento a las condiciones generales.
        </p>
      </div>

      <div class="document-section">
        <h3 class="section-title">ACEPTACIÓN</h3>
        <p class="section-text">
          Al firmar digitalmente esta solicitud, usted declara haber leído, comprendido y 
          aceptado todas las condiciones generales y especiales del seguro.
        </p>
      </div>
    `;
  }
}
