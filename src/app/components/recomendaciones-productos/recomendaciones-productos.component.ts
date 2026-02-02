import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WizardStateService, RecommendedProduct } from '../../services/wizard-state.service';
import { Observable } from 'rxjs';
import { WizardState } from '../../services/wizard-state.service';

@Component({
  selector: 'app-recomendaciones-productos',
  templateUrl: './recomendaciones-productos.component.html',
  styleUrls: ['./recomendaciones-productos.component.scss']
})
export class RecomendacionesProductosComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  
  state$: Observable<WizardState>;
  productos: RecommendedProduct[] = [];

  constructor(private wizardState: WizardStateService) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    // Inicializar productos recomendados si no existen
    const currentState = this.wizardState.getCurrentState();
    if (!currentState.productosRecomendados || currentState.productosRecomendados.length === 0) {
      this.initializeRecommendedProducts();
    } else {
      this.productos = currentState.productosRecomendados;
    }

    this.state$.subscribe(state => {
      if (state.productosRecomendados) {
        this.productos = state.productosRecomendados;
      }
    });
  }

  private initializeRecommendedProducts(): void {
    const productos: RecommendedProduct[] = [
      {
        id: '1',
        nombre: 'Tarjeta BS Card Premium',
        tipoInteres: 'TIN 18,90%',
        condiciones: 'Sin comisión de emisión. Cashback del 2%',
        tipo: 'tarjeta'
      },
      {
        id: '2',
        nombre: 'Préstamo Personal Sabadell',
        tipoInteres: 'TIN desde 5,95%',
        condiciones: 'Hasta 50.000€. Sin comisión de apertura',
        tipo: 'prestamo'
      },
      {
        id: '3',
        nombre: 'Línea de Crédito',
        tipoInteres: 'TIN desde 7,50%',
        condiciones: 'Dispones cuando lo necesites. Solo pagas por lo que uses',
        tipo: 'credito'
      },
      {
        id: '4',
        nombre: 'Tarjeta BS Card Classic',
        tipoInteres: 'TIN 19,90%',
        condiciones: 'Sin comisión de mantenimiento. Seguro de compras incluido',
        tipo: 'tarjeta'
      }
    ];

    this.wizardState.updateRecommendedProducts(productos);
    this.productos = productos;
  }

  onSimular(producto: RecommendedProduct): void {
    // Aquí se abriría el simulador con datos pre-rellenados
    console.log('Simular producto:', producto);
    // En producción, esto abriría un modal o navegaría a otra pantalla
    alert(`Simulador para ${producto.nombre} - Funcionalidad en desarrollo`);
  }

  onSaberMas(producto: RecommendedProduct): void {
    // Aquí se navegaría a la landing del producto
    console.log('Saber más sobre:', producto);
    // En producción, esto navegaría a la página del producto
    alert(`Información de ${producto.nombre} - Funcionalidad en desarrollo`);
  }

  onContinuar(): void {
    this.next.emit();
  }

  onVolver(): void {
    this.previous.emit();
  }

  getProductIcon(tipo: string): string {
    switch (tipo) {
      case 'tarjeta':
        return '💳';
      case 'prestamo':
        return '📄';
      case 'credito':
        return '💰';
      default:
        return '📋';
    }
  }
}
