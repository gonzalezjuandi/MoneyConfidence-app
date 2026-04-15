import { EntryScreen, ProximosPagosView, WizardState } from './services/wizard-state.service';

/** Segmento de URL bajo `/app/...` coherente con el paso del wizard */
export function wizardStateToSlug(state: WizardState): string {
  if (state.currentStep === 1) {
    if (state.entryScreen === 'proximos-pagos') {
      if (state.proximosPagosView === 'movimientos') {
        return 'proximos-pagos-movimientos';
      }
      if (state.proximosPagosView === 'habituales') {
        return 'proximos-pagos-habituales';
      }
      return 'proximos-pagos';
    }
    return 'posicion-global';
  }
  const byStep: Record<number, string> = {
    2: 'contratar',
    3: 'prestamos',
    4: 'landing',
    5: 'perfil-financiero',
    6: 'capacidad-financiacion',
    7: 'recomendaciones',
    8: 'meta',
    9: 'resumen',
    10: 'gestionar-pagos'
  };
  return byStep[state.currentStep] ?? 'posicion-global';
}

export function slugToWizardPatch(
  slug: string
): {
  step: number;
  entryScreen?: EntryScreen;
  proximosPagosView?: ProximosPagosView;
} | null {
  const map: Record<
    string,
    { step: number; entryScreen?: EntryScreen; proximosPagosView?: ProximosPagosView }
  > = {
    'posicion-global': { step: 1, entryScreen: 'posicion-global' },
    'proximos-pagos': { step: 1, entryScreen: 'proximos-pagos', proximosPagosView: 'home' },
    'proximos-pagos-movimientos': {
      step: 1,
      entryScreen: 'proximos-pagos',
      proximosPagosView: 'movimientos'
    },
    'proximos-pagos-habituales': {
      step: 1,
      entryScreen: 'proximos-pagos',
      proximosPagosView: 'habituales'
    },
    contratar: { step: 2 },
    prestamos: { step: 3 },
    landing: { step: 4 },
    'perfil-financiero': { step: 5 },
    'capacidad-financiacion': { step: 6 },
    recomendaciones: { step: 7 },
    meta: { step: 8 },
    resumen: { step: 9 },
    'gestionar-pagos': { step: 10 }
  };
  return map[slug] ?? null;
}
