/** Build V2 producción (p. ej. segundo proyecto Vercel): `ng build --configuration=v2-production` */
export const environment = {
  production: true,
  experience: 'v2' as const,
  entryFromLogin: true,
  skipPostLoginSpendingModal: true
};
