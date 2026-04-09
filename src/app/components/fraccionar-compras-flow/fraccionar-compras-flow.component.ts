import {
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

declare var lucide: any;

export interface FraccionarMovement {
  id: string;
  name: string;
  sub: string;
  amount: number;
  logo: string;
  logoBg: string;
}

export interface FraccionarPlan {
  id: string;
  months: number;
  monthly: number;
  total: number;
}

@Component({
  selector: 'app-fraccionar-compras-flow',
  templateUrl: './fraccionar-compras-flow.component.html',
  styleUrls: ['./fraccionar-compras-flow.component.scss']
})
export class FraccionarComprasFlowComponent implements AfterViewInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();

  step: 'alert' | 'intro' | 'lista' | 'planes' | 'exito' = 'alert';

  searchQuery = '';

  selectedMovement: FraccionarMovement | null = null;

  movements: FraccionarMovement[] = [
    {
      id: 'm1',
      name: 'Endesa Energía, S.A.U.',
      sub: 'Madrid · 12 Abr 2026',
      amount: 100,
      logo: 'E',
      logoBg: '#f97316'
    },
    {
      id: 'm2',
      name: 'Mercadona',
      sub: 'Barcelona · 10 Abr 2026',
      amount: 45.2,
      logo: 'M',
      logoBg: '#22c55e'
    },
    {
      id: 'm3',
      name: 'Zara',
      sub: 'Online · 8 Abr 2026',
      amount: 79.99,
      logo: 'Z',
      logoBg: '#18181b'
    }
  ];

  plans: FraccionarPlan[] = [
    { id: 'p3', months: 3, monthly: 34.34, total: 103.02 },
    { id: 'p6', months: 6, monthly: 17.42, total: 104.52 },
    { id: 'p12', months: 12, monthly: 9.05, total: 108.6 },
    { id: 'p24', months: 24, monthly: 4.92, total: 118.08 }
  ];

  selectedPlan: FraccionarPlan | null = null;

  readonly nuevoSaldo = '1.529,00';

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.icons();
  }

  ngOnDestroy(): void {
    if (typeof lucide !== 'undefined' && lucide.destroyIcons) {
      lucide.destroyIcons();
    }
  }

  get filteredMovements(): FraccionarMovement[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.movements;
    }
    return this.movements.filter(
      m => m.name.toLowerCase().includes(q) || m.sub.toLowerCase().includes(q)
    );
  }

  formatMoney(n: number): string {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  fromAlertToIntro(): void {
    this.step = 'intro';
    this.icons();
  }

  fromAlertMasInfo(): void {
    this.step = 'intro';
    this.icons();
  }

  fromIntroToLista(): void {
    this.step = 'lista';
    this.icons();
  }

  backFromLista(): void {
    this.step = 'intro';
    this.icons();
  }

  pickMovement(m: FraccionarMovement): void {
    this.selectedMovement = m;
    this.selectedPlan = this.plans[0];
    this.step = 'planes';
    this.icons();
  }

  backFromPlanes(): void {
    this.step = 'lista';
    this.selectedMovement = null;
    this.selectedPlan = null;
    this.icons();
  }

  selectPlan(p: FraccionarPlan): void {
    this.selectedPlan = p;
    this.step = 'exito';
    this.icons();
  }

  closeExito(): void {
    this.onClose();
  }

  private icons(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        try {
          lucide.createIcons();
          this.cdr.markForCheck();
        } catch {
          /* noop */
        }
      }, 80);
    }
  }
}
