# Dos experiencias, dos despliegues, dos URLs

| | **V1** | **V2** |
|---|--------|--------|
| **Qué incluye** | Pantalla tipo **push** (`/notificacion`) → **login** → **bienvenida** con modal «Revisa tus próximos pagos» → app | **Solo login** → inicio (`/app/posicion-global`). Sin push, sin pantalla de notificación, sin modal de gastos |
| **Build producción** | `npm run build:v1` | `npm run build:v2` |
| **Local** | `npm run start:v1` (o `npm start`) | `npm run start:v2` |
| **Entorno Angular** | `environment.prod.ts` | `environment.v2.prod.ts` (vía `angular.json` → `v2-production`) |

## Vercel: dos proyectos, dos enlaces

Cada proyecto en Vercel debe tener **su propio** comando de build:

1. **Proyecto URL V1** (p. ej. `moneyconfidence-v1.vercel.app`)
   - Rama sugerida: `main` o `MoneyConfidence-v1`
   - **Build Command:** `npm run build:v1`
   - **Output directory:** `dist/money-confidence`
   - Install: `npm ci`

2. **Proyecto URL V2** (p. ej. `moneyconfidence-v2.vercel.app`)
   - Rama sugerida: `V2` o `MoneyConfidence-v2`
   - **Build Command:** `npm run build:v2`
   - **Output directory:** `dist/money-confidence`
   - Install: `npm ci`

El archivo `vercel.json` del repo (rewrites SPA) vale para **ambos** proyectos.

**Importante:** si el build no usa `build:v2`, el bundle seguirá siendo V1 aunque la rama se llame `V2`.

## Resumen técnico

- Los flags están en `src/environments/`; los guards (`v2-experience.guards.ts`) solo redirigen cuando el bundle es V2.
- Misma base de código; la variante la elige **solo** el `configuration` del build.
