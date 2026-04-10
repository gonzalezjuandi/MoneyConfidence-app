/**
 * Vercel define VERCEL_GIT_COMMIT_REF con el nombre de la rama.
 * Así un solo proyecto puede servir V1 o V2 según la rama del deploy.
 */
const { execSync } = require('child_process');

const ref = process.env.VERCEL_GIT_COMMIT_REF || '';
const useV2 = ref === 'V2' || ref === 'MoneyConfidence-v2';

const cmd = useV2 ? 'npm run build:v2' : 'npm run build:v1';

// eslint-disable-next-line no-console
console.log(`[vercel-build] VERCEL_GIT_COMMIT_REF=${ref || '(vacío → V1 local)'} → ${cmd}`);

execSync(cmd, { stdio: 'inherit', env: process.env });
