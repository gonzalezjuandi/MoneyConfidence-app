import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import {
  WizardStateService,
  WizardState
} from '../../services/wizard-state.service';
import { slugToWizardPatch, wizardStateToSlug } from '../../app-routing.constants';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit, OnDestroy {
  state$: Observable<WizardState>;
  currentStep = 1;
  totalSteps = 9;

  private readonly destroy$ = new Subject<void>();
  /** Evita bucle URL ↔ estado al aplicar el segmento desde el navegador */
  private pauseUrlSync = false;

  constructor(
    private wizardState: WizardStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.state$ = this.wizardState.state$;
  }

  ngOnInit(): void {
    const initialSlug = this.route.snapshot.paramMap.get('pantalla');
    if (initialSlug) {
      const patch = slugToWizardPatch(initialSlug);
      if (!patch) {
        this.router.navigate(['/app', 'posicion-global'], { replaceUrl: true });
      } else {
        const expected = wizardStateToSlug(this.wizardState.getCurrentState());
        if (initialSlug !== expected) {
          this.pauseUrlSync = true;
          this.wizardState.setCurrentStep(patch.step);
          if (patch.entryScreen) {
            this.wizardState.setEntryScreen(patch.entryScreen);
          }
          queueMicrotask(() => {
            this.pauseUrlSync = false;
          });
        }
      }
    }

    this.route.paramMap
      .pipe(
        map(pm => pm.get('pantalla')),
        filter((slug): slug is string => !!slug),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(slug => {
        const expected = wizardStateToSlug(this.wizardState.getCurrentState());
        if (slug === expected) {
          return;
        }
        const patch = slugToWizardPatch(slug);
        if (!patch) {
          this.router.navigate(['/app', 'posicion-global'], { replaceUrl: true });
          return;
        }
        this.pauseUrlSync = true;
        this.wizardState.setCurrentStep(patch.step);
        if (patch.entryScreen) {
          this.wizardState.setEntryScreen(patch.entryScreen);
        }
        queueMicrotask(() => {
          this.pauseUrlSync = false;
        });
      });

    this.state$
      .pipe(
        map(s => wizardStateToSlug(s)),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(slug => {
        if (this.pauseUrlSync) {
          return;
        }
        const urlSlug = this.route.snapshot.paramMap.get('pantalla');
        if (urlSlug !== slug) {
          this.router.navigate(['/app', slug]);
        }
      });

    this.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.currentStep = state.currentStep;
      if (state.currentStep === 4 && state.hasUpdatedPotential) {
        setTimeout(() => {
          this.wizardState.setCurrentStep(6);
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep(): void {
    this.wizardState.nextStep();
  }

  previousStep(): void {
    this.wizardState.previousStep();
  }

  goToStep(step: number): void {
    this.wizardState.setCurrentStep(step);
  }

}
