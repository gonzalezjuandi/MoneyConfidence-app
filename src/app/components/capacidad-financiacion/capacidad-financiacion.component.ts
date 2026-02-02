import { Component, EventEmitter, OnInit, Output, AfterViewInit } from '@angular/core';
import { WizardStateService, RecommendedProduct } from '../../services/wizard-state.service';
import { Observable } from 'rxjs';
import { WizardState } from '../../services/wizard-state.service';

declare var lucide: any;


@Component({
  selector: 'app-capacidad-financiacion',
  templateUrl: './capacidad-financiacion.component.html',
  styleUrls: ['./capacidad-financiacion.component.scss']
})
export class CapacidadFinanciacionComponent implements OnInit, AfterViewInit {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  
  state$: Observable<WizardState>;
  capacidadMaxima = 22000;
  capacidadMensual = 350;
  plazoAnos = 5;
  capacidadPorcentaje = 0;
  
  // Transparencia del cálculo
  ingresos = 3500;
  gastos = 2000;
  disponible = 1500;
  ratioFinanciacion = 0.3;
  cuotaMaxima = 450;
  
  // Productos recomendados
  productos: RecommendedProduct[] = [];
  productosFiltrados: RecommendedProduct[] = [];
  riesgoSeleccionado = 3; // 1-5, por defecto medio
  
  // Metas
  metaNombre = '';
  metaObjetivo = 0;
  metaEstablecida = false;
  mostrarFormularioMeta = false;
  
  // Transparencia expandida
  mostrarTransparencia = false;

  constructor(private wizardState: WizardStateService) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    this.state$.subscribe(state => {
      this.capacidadMaxima = state.capacidadMaxima;
      this.capacidadMensual = state.capacidadMensual || 350;
      this.plazoAnos = state.plazoAnos || 5;
      
      if (state.perfilFinanciero) {
        this.ingresos = state.perfilFinanciero.ingresos || 3500;
        this.gastos = state.perfilFinanciero.gastos || 2000;
        this.disponible = this.ingresos - this.gastos;
        this.cuotaMaxima = Math.round(this.disponible * this.ratioFinanciacion);
      } else {
        // Valores por defecto si no hay perfil
        this.ingresos = 3500;
        this.gastos = 2000;
        this.disponible = 1500;
        this.cuotaMaxima = Math.round(this.disponible * this.ratioFinanciacion);
      }
      
      if (state.metaObjetivo) {
        this.metaObjetivo = state.metaObjetivo;
        this.metaEstablecida = true;
      }
      
      // Calcular porcentaje para el termómetro (0-100%)
      const maxTeorico = 50000;
      this.capacidadPorcentaje = Math.min(100, (this.capacidadMaxima / maxTeorico) * 100);
      
      // Cargar productos recomendados
      if (state.productosRecomendados) {
        this.productos = state.productosRecomendados;
        this.filtrarProductosPorRiesgo();
      } else {
        this.initializeRecommendedProducts();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
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
    this.filtrarProductosPorRiesgo();
  }


  onRiesgoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.riesgoSeleccionado = parseInt(target.value, 10);
    this.filtrarProductosPorRiesgo();
  }

  private filtrarProductosPorRiesgo(): void {
    // Mapear riesgo 1-5 a tipos de productos
    // Riesgo 1-2: tarjetas y créditos conservadores
    // Riesgo 3: préstamos personales
    // Riesgo 4-5: productos más agresivos
    this.productosFiltrados = this.productos.filter(producto => {
      if (this.riesgoSeleccionado <= 2) {
        return producto.tipo === 'tarjeta' || producto.tipo === 'credito';
      } else if (this.riesgoSeleccionado === 3) {
        return producto.tipo === 'prestamo' || producto.tipo === 'tarjeta';
      } else {
        return producto.tipo === 'prestamo' || producto.tipo === 'credito';
      }
    });
  }

  onEstablecerMeta(): void {
    if (this.metaNombre.trim() && this.metaObjetivo > 0) {
      this.metaEstablecida = true;
      this.mostrarFormularioMeta = false;
      this.wizardState.setMetaObjetivo(this.metaObjetivo);
    }
  }

  onAbrirFormularioMeta(): void {
    this.mostrarFormularioMeta = true;
    this.metaObjetivo = Math.round(this.capacidadMaxima * 1.15);
  }

  toggleTransparencia(): void {
    this.mostrarTransparencia = !this.mostrarTransparencia;
    if (this.mostrarTransparencia && typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }

  onVolver(): void {
    this.previous.emit();
  }

  onContinuar(): void {
    // Marcar que el usuario ha completado el flujo de Tu Potencial Financiero
    this.wizardState.markPotentialUpdated();
    this.next.emit();
  }

  onSimular(producto: RecommendedProduct): void {
    console.log('Simular producto:', producto);
  }

  onSaberMas(producto: RecommendedProduct): void {
    console.log('Saber más sobre:', producto);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getTermometerZone(): 'low' | 'medium' | 'high' {
    if (this.capacidadPorcentaje < 40) return 'low';
    if (this.capacidadPorcentaje < 70) return 'medium';
    return 'high';
  }

  getRiesgoLabel(): string {
    const labels = ['Muy conservador', 'Conservador', 'Moderado', 'Dinámico', 'Agresivo'];
    return labels[this.riesgoSeleccionado - 1] || 'Moderado';
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
