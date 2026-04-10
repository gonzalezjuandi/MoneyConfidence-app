import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { environment } from '../../environments/environment';
import { WizardStateService } from '../services/wizard-state.service';

/** V2: no mostrar la pantalla tipo lock con push de Banco Sabadell (`/notificacion`). */
export const v2SkipNotificationScreenGuard: CanActivateFn = (): boolean | UrlTree => {
  if (!environment.entryFromLogin) {
    return true;
  }
  return inject(Router).parseUrl('/acceso');
};

/** V2: no mostrar splash/loading/modal «Revisa tus próximos pagos» (`/bienvenida`). */
export const v2SkipBienvenidaGuard: CanActivateFn = (): boolean | UrlTree => {
  if (!environment.skipPostLoginSpendingModal) {
    return true;
  }
  const router = inject(Router);
  const wizardState = inject(WizardStateService);
  wizardState.reset();
  wizardState.setEntryScreen('posicion-global');
  wizardState.setPosicionGlobalCardView('total');
  return router.parseUrl('/app/posicion-global');
};
