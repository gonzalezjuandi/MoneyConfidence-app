import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-firma',
  templateUrl: './prestamo-coche-firma.component.html',
  styleUrls: ['./prestamo-coche-firma.component.scss']
})
export class PrestamoCocheFirmaComponent implements OnInit, AfterViewInit {
  @Input() loanData?: any;
  @Output() complete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  // Clave de firma digital
  signatureKey = '861523';
  signatureKeyArray = this.signatureKey.split('');
  
  // Estado del input
  inputValue = '';
  inputMask = '••••••';
  isDragging = false;
  draggedDigit: string | null = null;
  draggedIndex: number | -1 = -1;

  // Estado de ayuda
  showHelp = false;

  ngOnInit(): void {
    // Mezclar la clave para mostrarla desordenada
    this.shuffleKey();
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  shuffleKey(): void {
    // Crear una copia mezclada de la clave para mostrar
    const shuffled = [...this.signatureKeyArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.signatureKeyArray = shuffled;
  }

  onDigitMouseDown(event: MouseEvent, digit: string, index: number): void {
    if (this.inputValue.length >= 6) return;
    
    this.isDragging = true;
    this.draggedDigit = digit;
    this.draggedIndex = index;
    event.preventDefault();
    
    // Agregar listeners globales
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onDigitTouchStart(event: TouchEvent, digit: string, index: number): void {
    if (this.inputValue.length >= 6) return;
    
    this.isDragging = true;
    this.draggedDigit = digit;
    this.draggedIndex = index;
    event.preventDefault();
    
    // Agregar listeners globales
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    // La lógica de arrastre se maneja en el drop
  };

  onTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging) return;
    event.preventDefault();
  };

  onMouseUp = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    
    const target = event.target as HTMLElement;
    const dropZone = document.querySelector('.signature-drop-zone');
    
    if (dropZone && dropZone.contains(target)) {
      this.handleDrop();
    }
    
    this.resetDrag();
  };

  onTouchEnd = (event: TouchEvent): void => {
    if (!this.isDragging) return;
    
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = document.querySelector('.signature-drop-zone');
    
    if (dropZone && target && dropZone.contains(target)) {
      this.handleDrop();
    }
    
    this.resetDrag();
  };

  handleDrop(): void {
    if (this.draggedDigit && this.inputValue.length < 6) {
      this.inputValue += this.draggedDigit;
      this.updateInputMask();
      
      // Remover el dígito usado de la clave
      if (this.draggedIndex !== -1) {
        this.signatureKeyArray.splice(this.draggedIndex, 1);
      }
      
      // Si se completó, verificar
      if (this.inputValue.length === 6) {
        this.verifySignature();
      }
    }
  }

  resetDrag(): void {
    this.isDragging = false;
    this.draggedDigit = null;
    this.draggedIndex = -1;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  onDigitClick(digit: string, index: number): void {
    if (this.inputValue.length >= 6) return;
    
    this.inputValue += digit;
    this.updateInputMask();
    
    // Remover el dígito usado
    this.signatureKeyArray.splice(index, 1);
    
    // Si se completó, verificar
    if (this.inputValue.length === 6) {
      this.verifySignature();
    }
  }

  onInputFocus(): void {
    // No permitir edición manual del input
    const input = document.querySelector('.signature-input') as HTMLInputElement;
    if (input) {
      input.blur();
    }
  }

  onInputClick(): void {
    // Mostrar mensaje de que debe usar la clave
    if (this.inputValue.length === 0) {
      // Opcional: mostrar un mensaje
    }
  }

  updateInputMask(): void {
    const filled = this.inputValue.length;
    const empty = 6 - filled;
    this.inputMask = '•'.repeat(filled) + '•'.repeat(empty);
  }

  verifySignature(): void {
    // Verificar que la clave introducida sea correcta
    if (this.inputValue === this.signatureKey) {
      // Firma correcta
      setTimeout(() => {
        this.complete.emit();
      }, 500);
    } else {
      // Firma incorrecta - resetear
      alert('La clave de firma no es correcta. Por favor, inténtalo de nuevo.');
      this.resetSignature();
    }
  }

  resetSignature(): void {
    this.inputValue = '';
    this.inputMask = '••••••';
    this.shuffleKey();
  }

  onSign(): void {
    // Si la clave está completa, verificar; si no, continuar directamente
    if (this.inputValue.length === 6) {
      this.verifySignature();
    } else {
      // Permitir continuar sin completar la clave (para desarrollo/demo)
      setTimeout(() => {
        this.complete.emit();
      }, 100);
    }
  }

  onBack(): void {
    this.back.emit();
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }
}
