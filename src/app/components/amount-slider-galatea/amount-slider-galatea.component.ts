import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-amount-slider-galatea',
  templateUrl: './amount-slider-galatea.component.html',
  styleUrls: ['./amount-slider-galatea.component.scss']
})
export class AmountSliderGalateaComponent implements OnInit, AfterViewInit {
  @Input() label?: string;
  @Input() labelOptional = false;
  @Input() value = 9000;
  @Input() minValue = 3000;
  @Input() maxValue = 21000;
  @Input() step = 500;
  @Input() unit = '€';
  @Input() editable = true;
  @Input() showMinMax = true;
  @Input() thresholdLimit?: number;
  @Input() showInfo = false;
  @Input() ariaLabel = 'Ajustar importe del préstamo';
  @Input() notificationTitle?: string;
  @Input() notificationSubtitle?: string;
  @Input() linkLabel?: string;
  @Input() linkHref?: string;
  @Input() linkTarget?: string;
  @Input() mainTitle?: string;
  @Input() inputLabel?: string;
  @Input() bsAriaDescribedBy?: string;
  @Input() notificationCloseAriaLabel = 'Cerrar notificación';

  @Output() valueChange = new EventEmitter<number>();
  @Output() error = new EventEmitter<string>();

  isEditing = false;
  errorMessage: string | null = null;
  inputValue = '';
  isInputFocused = false;

  ngOnInit(): void {
    this.inputValue = this.value.toString();
  }

  ngAfterViewInit(): void {
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
    
    // Actualizar el progreso visual del slider
    this.updateSliderProgress();
  }
  
  private updateSliderProgress(): void {
    // Calcular el porcentaje de progreso para el fill visual
    const progress = ((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100;
    setTimeout(() => {
      const wrapper = document.querySelector('.custom-slider-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.setProperty('--progress', `${progress}%`);
      }
    }, 0);
  }

  onSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = parseInt(input.value, 10);
    if (!isNaN(newValue)) {
      this.validateAndUpdate(newValue);
    }
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    this.inputValue = value;
    
    // Limpiar: solo números
    const cleanValue = value.replace(/[^\d.]/g, '').replace(/\./g, '');
    
    if (cleanValue === '') {
      this.inputValue = '';
      return;
    }
    
    const numValue = parseInt(cleanValue, 10);
    
    if (!isNaN(numValue)) {
      this.validateAndUpdate(numValue);
    }
  }

  onInputFocus(): void {
    this.isInputFocused = true;
  }

  onInputBlur(): void {
    this.isInputFocused = false;
    // Ajustar al rango si hay error
    if (this.value < this.minValue) {
      this.value = this.minValue;
    } else if (this.value > this.maxValue) {
      this.value = this.maxValue;
    }
    this.errorMessage = null;
    this.inputValue = this.value.toString();
  }

  onEditValue(): void {
    if (this.editable) {
      this.isEditing = true;
      this.isInputFocused = true;
      setTimeout(() => {
        const input = document.getElementById('galatea-amount-input') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    }
  }

  private validateAndUpdate(newValue: number): void {
    if (newValue < this.minValue || newValue > this.maxValue) {
      this.errorMessage = `La cantidad debe estar entre ${this.minFormatted} ${this.unit} y ${this.maxFormatted} ${this.unit}`;
      this.error.emit(this.errorMessage);
    } else {
      this.errorMessage = null;
    }
    this.value = newValue;
    this.inputValue = newValue.toString();
    this.valueChange.emit(this.value);
    this.updateSliderProgress();
  }

  get formattedValue(): string {
    return this.value.toLocaleString('es-ES');
  }

  get minFormatted(): string {
    return this.minValue.toLocaleString('es-ES');
  }

  get maxFormatted(): string {
    return this.maxValue.toLocaleString('es-ES');
  }

  get displayValue(): string {
    return this.isInputFocused ? this.inputValue : this.formattedValue;
  }
}
