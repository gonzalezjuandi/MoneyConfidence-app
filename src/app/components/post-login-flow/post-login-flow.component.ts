import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../services/wizard-state.service';

declare var lucide: any;

@Component({
  selector: 'app-post-login-flow',
  templateUrl: './post-login-flow.component.html',
  styleUrls: ['./post-login-flow.component.scss']
})
export class PostLoginFlowComponent implements OnInit, OnDestroy, AfterViewInit {
  phase: 'splash' | 'loading' | 'modal' = 'splash';

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private wizardState: WizardStateService
  ) {}

  ngOnInit(): void {
    this.timers.push(
      setTimeout(() => {
        this.phase = 'loading';
        this.cdr.markForCheck();
      }, 1000)
    );
    this.timers.push(
      setTimeout(() => {
        this.phase = 'modal';
        this.cdr.markForCheck();
        setTimeout(() => this.refreshIcons(), 80);
      }, 3600)
    );
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }

  onReview(): void {
    this.wizardState.reset();
    this.wizardState.setEntryScreen('proximos-pagos');
    this.wizardState.setPosicionGlobalCardView('total');
    this.router.navigate(['/app', 'proximos-pagos']);
  }

  onSkip(): void {
    this.wizardState.reset();
    this.wizardState.setEntryScreen('posicion-global');
    this.wizardState.setPosicionGlobalCardView('total');
    this.router.navigate(['/app', 'posicion-global']);
  }

  private refreshIcons(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        try {
          lucide.createIcons();
        } catch {
          /* noop */
        }
      }, 50);
    }
  }
}
