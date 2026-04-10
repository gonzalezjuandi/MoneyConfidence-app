/** Build V2 (desarrollo): login como entrada; sin modal de aviso de gastos; inicio directo. */
export const environment = {
  production: false,
  experience: 'v2' as const,
  entryFromLogin: true,
  skipPostLoginSpendingModal: true
};
