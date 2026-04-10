/**
 * Experiencia V1 (por defecto): notificación → acceso → bienvenida (modal gastos) → app.
 * Para V2 en local: `ng serve --configuration=v2`
 */
export const environment = {
  production: false,
  experience: 'v1' as 'v1' | 'v2',
  /** Ruta inicial: /acceso en V2; /notificacion en V1 */
  entryFromLogin: false,
  /** Tras login, ir a /app/posicion-global sin /bienvenida ni modal de próximos pagos */
  skipPostLoginSpendingModal: false
};
