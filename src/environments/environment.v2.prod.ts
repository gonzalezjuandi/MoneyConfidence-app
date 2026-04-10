/**
 * Producción V2 — Sin pantalla push, sin /notificacion, sin modal de bienvenida:
 * entrada en login → /app/posicion-global.
 * Build: `npm run build:v2` (segundo despliegue / otra URL en Vercel).
 */
export const environment = {
  production: true,
  experience: 'v2' as const,
  entryFromLogin: true,
  skipPostLoginSpendingModal: true
};
