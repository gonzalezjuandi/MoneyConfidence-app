/**
 * Desarrollo local por defecto = misma lógica que V1 (push + notificación + modal).
 * V2 en local: `npm run start:v2`
 */
export const environment = {
  production: false,
  experience: 'v1' as const,
  /** Ruta inicial: /acceso en V2; /notificacion en V1 */
  entryFromLogin: false,
  /** Tras login, ir a /app/posicion-global sin /bienvenida ni modal de próximos pagos */
  skipPostLoginSpendingModal: false
};
