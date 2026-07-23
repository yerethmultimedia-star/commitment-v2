#!/usr/bin/env node
// AR-009 / D-009.1 — Capa 3: compara la política versionada (.github/governance-policy.json,
// fuente de verdad declarativa) contra la configuración real de GitHub, y falla únicamente ante una
// desviación objetiva. No autocorrige nada — su única responsabilidad es detectar deriva.
//
// Requiere un token con permiso de administración sobre el repositorio (branch protection es un
// scope de administración, ausente de GITHUB_TOKEN en cualquier configuración de `permissions:` —
// verificado contra la documentación de GitHub Actions antes de diseñar este script). Pensado para
// ejecutarse localmente o desde un workflow_dispatch manual con `gh auth login` de un administrador,
// no como gate automático de cada PR.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const CODEOWNERS_LOCATIONS = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'];

function sh(cmd, cwd) {
  return execSync(cmd, { encoding: 'utf8', cwd }).trim();
}

function loadPolicy(policyPath) {
  return JSON.parse(readFileSync(policyPath, 'utf8'));
}

function repoSlug(cwd) {
  const url = sh('git remote get-url origin', cwd);
  const match = /github\.com[:/](.+?)(\.git)?$/.exec(url);
  if (!match) throw new Error(`No se pudo derivar owner/repo de "${url}"`);
  return match[1];
}

function fetchBranchProtection(slug, branch, cwd) {
  const raw = sh(`gh api repos/${slug}/branches/${branch}/protection`, cwd);
  return JSON.parse(raw);
}

function codeownersExists(cwd) {
  return CODEOWNERS_LOCATIONS.some((path) => existsSync(join(cwd, path)));
}

export function compare(policy, protection, cwd = REPO_ROOT) {
  const violations = [];

  if (policy.codeownersRequired && !codeownersExists(cwd)) {
    violations.push(
      `La política exige CODEOWNERS, pero no existe en ninguna ubicación reconocida (${CODEOWNERS_LOCATIONS.join(', ')}).`,
    );
  }

  const expected = policy.requiredStatusChecks;
  const actual = protection?.required_status_checks;

  if (!actual) {
    violations.push(
      `La política exige required_status_checks en "${policy.branch}", pero la rama no tiene branch protection o no los define.`,
    );
    return violations;
  }

  if (expected.strict !== actual.strict) {
    violations.push(
      `required_status_checks.strict esperado=${expected.strict}, real=${actual.strict}.`,
    );
  }

  const expectedContexts = new Set(expected.contexts);
  const actualContexts = new Set(actual.contexts ?? []);

  for (const ctx of expectedContexts) {
    if (!actualContexts.has(ctx)) {
      violations.push(`Falta el check requerido "${ctx}" en la configuración real de GitHub.`);
    }
  }
  for (const ctx of actualContexts) {
    if (!expectedContexts.has(ctx)) {
      violations.push(
        `GitHub exige "${ctx}", pero no está declarado en la política versionada (governance-policy.json).`,
      );
    }
  }

  return violations;
}

function main() {
  const policyPath = process.env.GOVERNANCE_POLICY_PATH ?? join(REPO_ROOT, '.github', 'governance-policy.json');
  const policy = loadPolicy(policyPath);
  const slug = repoSlug(REPO_ROOT);
  const protection = fetchBranchProtection(slug, policy.branch, REPO_ROOT);

  const violations = compare(policy, protection, REPO_ROOT);

  if (violations.length === 0) {
    console.log(
      `OK: la configuración real de "${slug}"@${policy.branch} coincide con governance-policy.json.`,
    );
    process.exit(0);
  }

  console.error(`FALLO: deriva detectada entre governance-policy.json y "${slug}"@${policy.branch}:`);
  violations.forEach((v) => console.error(`  - ${v}`));
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
