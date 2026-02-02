import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FinancialProfile {
  ingresos: number;
  gastos: number;
  productos: Product[];
  otrosBancos: boolean;
}

export interface Product {
  id: string;
  nombre: string;
  tipo: string;
  numero?: string;
}

export interface RecommendedProduct {
  id: string;
  nombre: string;
  tipoInteres: string;
  condiciones: string;
  tipo: 'tarjeta' | 'prestamo' | 'credito';
}

export interface WizardState {
  currentStep: number;
  capacidadMaxima: number;
  capacidadMensual: number;
  plazoAnos: number;
  perfilFinanciero?: FinancialProfile;
  productosRecomendados?: RecommendedProduct[];
  metaObjetivo?: number;
  hasUpdatedPotential?: boolean;
  financialScore?: number; // 0-100
  showPrestamoModal?: boolean; // Flag para mostrar modal de préstamo
  loanCompleted?: boolean; // Flag para indicar que el préstamo fue completado
  loanAmount?: number; // Monto del préstamo completado
}

@Injectable({
  providedIn: 'root'
})
export class WizardStateService {
  private initialState: WizardState = {
    currentStep: 1, // Posición Global
    capacidadMaxima: 18000,
    capacidadMensual: 350,
    plazoAnos: 5,
    perfilFinanciero: {
      ingresos: 0,
      gastos: 0,
      productos: [],
      otrosBancos: false
    }
  };

  private stateSubject = new BehaviorSubject<WizardState>(this.initialState);
  public state$: Observable<WizardState> = this.stateSubject.asObservable();

  constructor() {
    // Inicializar con datos simulados
    this.updateProfile({
      ingresos: 3500,
      gastos: 2000,
      productos: [
        { id: '1', nombre: 'Cuenta Sabadell', tipo: 'cuenta', numero: '4422' },
        { id: '2', nombre: 'Tarjeta BS Card', tipo: 'tarjeta', numero: '7830' }
      ],
      otrosBancos: false
    });
  }

  getCurrentState(): WizardState {
    return this.stateSubject.value;
  }

  setCurrentStep(step: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      currentStep: step
    });
  }

  nextStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep < 9) { // Total de 9 pasos
      this.setCurrentStep(currentState.currentStep + 1);
    }
  }

  previousStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep > 1) {
      this.setCurrentStep(currentState.currentStep - 1);
    }
  }

  updateProfile(profile: Partial<FinancialProfile>): void {
    const currentState = this.getCurrentState();
    const updatedProfile = {
      ...currentState.perfilFinanciero,
      ...profile
    } as FinancialProfile;

    // Recalcular capacidad basada en el perfil
    const capacidad = this.calculateCapacity(updatedProfile);

    this.stateSubject.next({
      ...currentState,
      perfilFinanciero: updatedProfile,
      capacidadMaxima: capacidad.maxima,
      capacidadMensual: capacidad.mensual
    });
  }

  updateRecommendedProducts(products: RecommendedProduct[]): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      productosRecomendados: products
    });
  }

  setMetaObjetivo(meta: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      metaObjetivo: meta
    });
  }

  markPotentialUpdated(): void {
    const currentState = this.getCurrentState();
    // Calcular scoring basado en el perfil
    const score = this.calculateFinancialScore(currentState.perfilFinanciero);
    this.stateSubject.next({
      ...currentState,
      hasUpdatedPotential: true,
      financialScore: score
    });
  }

  setShowPrestamoModal(show: boolean): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      showPrestamoModal: show
    });
  }

  private calculateFinancialScore(profile?: FinancialProfile): number {
    if (!profile || profile.ingresos === 0) return 50; // Score por defecto
    
    const disponible = profile.ingresos - profile.gastos;
    const ratioDisponible = disponible / profile.ingresos;
    
    // Score basado en:
    // - Ratio de disponibilidad (0-60 puntos)
    // - Estabilidad (tiene productos = más estable) (0-40 puntos)
    let score = Math.min(60, ratioDisponible * 100);
    
    if (profile.productos && profile.productos.length > 0) {
      score += Math.min(40, profile.productos.length * 10);
    }
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private calculateCapacity(profile: FinancialProfile): { maxima: number; mensual: number } {
    // Simulación de cálculo de capacidad
    const disponible = profile.ingresos - profile.gastos;
    const ratio = 0.3; // 30% del disponible
    const mensual = Math.max(0, disponible * ratio);
    const maxima = mensual * 60; // 5 años = 60 meses

    return {
      maxima: Math.round(maxima),
      mensual: Math.round(mensual)
    };
  }

  markLoanCompleted(amount: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      loanCompleted: true,
      loanAmount: amount
    });
  }

  clearLoanCompleted(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      loanCompleted: false,
      loanAmount: undefined
    });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
