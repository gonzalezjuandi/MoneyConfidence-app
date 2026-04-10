/** Desarrollo V2 — mismo comportamiento que `environment.v2.prod.ts` (sin push ni modal). */
export const environment = {
  production: false,
  experience: 'v2' as const,
  entryFromLogin: true,
  skipPostLoginSpendingModal: true
};
