# Dos experiencias, dos despliegues, dos URLs

| | **V1** | **V2** |
|---|--------|--------|
| **Qué incluye** | Pantalla tipo **push** (`/notificacion`) → **login** → **bienvenida** con modal «Revisa tus próximos pagos» → app | **Solo login** → inicio (`/app/posicion-global`). Sin push, sin pantalla de notificación, sin modal de gastos |
| **Build producción** | `npm run build:v1` | `npm run build:v2` |
| **Local** | `npm run start:v1` (o `npm start`) | `npm run start:v2` |
| **Entorno Angular** | `environment.prod.ts` | `environment.v2.prod.ts` (vía `angular.json` → `v2-production`) |

## Vercel: un solo proyecto y previews por rama

El comando por defecto **`npm run build`** ejecuta `scripts/vercel-build.cjs`, que usa **`VERCEL_GIT_COMMIT_REF`** (nombre de la rama que Vercel está construyendo):

| Rama | Bundle |
|------|--------|
| `V2` o `MoneyConfidence-v2` | **V2** |
| `main`, `MoneyConfidence-v1`, otras | **V1** |

- En **Project → Settings → Build**, deja **Build Command** vacío o `npm run build` (no fuerces solo `build:v1` si quieres previews V2).
- **Output directory:** `dist/money-confidence`.
- Cada **preview** en la pestaña Deployments tiene su URL: abre la de la rama `V2` o `MoneyConfidence-v2` para probar V2.

Tras subir este cambio, haz **Redeploy** de los previews V2 o un push nuevo para que el build use el script nuevo.

## Vercel: dos proyectos fijos (alternativa)

Dos dominios de producción distintos:

1. Proyecto V1: **Build Command** `npm run build:v1`, rama p. ej. `main`.
2. Proyecto V2: **Build Command** `npm run build:v2`, rama p. ej. `V2`.

## Resumen técnico

- Los flags están en `src/environments/`; los guards solo aplican en bundle V2.
- La variante la fija el **configuration** de Angular (`production` vs `v2-production`).
