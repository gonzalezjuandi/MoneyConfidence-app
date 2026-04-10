/**
 * Producción V1 — Experiencia completa:
 * pantalla push/notificación → login → bienvenida (modal «próximos pagos») → app.
 * Build: `npm run build:v1`
 */
export const environment = {
  production: true,
  experience: 'v1' as const,
  entryFromLogin: false,
  skipPostLoginSpendingModal: false
};
