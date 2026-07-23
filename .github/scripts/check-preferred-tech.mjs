#!/usr/bin/env node
// AR-002 / D-002.1 — Capa 2 (CI): reglas objetivas y reproducibles, sin interpretar "si la
// arquitectura cambió". Solo detecta eliminación o cambio de versión mayor de una dependencia
// listada como Tecnología Preferida por ADR-024, y exige que el mismo diff incluya una ADR.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const GOVERNED_DEPENDENCIES = {
  'apps/backend/package.json': ['@nestjs/core', 'bullmq'],
  'apps/mobile/package.json': ['expo', 'react-native'],
};

const ADR_PATH_PATTERN = /^docs\/03-architecture\/adr_.*\.md$/;

function sh(cmd, cwd, { quiet = false } = {}) {
  const stdio = quiet ? ['ignore', 'pipe', 'ignore'] : ['ignore', 'pipe', 'inherit'];
  return execSync(cmd, { encoding: 'utf8', cwd, stdio }).trim();
}

function majorVersion(range) {
  const match = /(\d+)/.exec(range ?? '');
  return match ? match[1] : null;
}

function readJsonAt(ref, file, cwd) {
  try {
    return JSON.parse(sh(`git show ${ref}:${file}`, cwd, { quiet: true }));
  } catch {
    return null;
  }
}

function depsOf(pkg) {
  return { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
}

export function findViolations(baseRef, headRef = 'HEAD', cwd = undefined) {
  const violations = [];

  for (const [file, governed] of Object.entries(GOVERNED_DEPENDENCIES)) {
    const before = depsOf(readJsonAt(baseRef, file, cwd));
    const after = depsOf(readJsonAt(headRef, file, cwd));

    for (const dep of governed) {
      const beforeVersion = before[dep];
      const afterVersion = after[dep];

      if (beforeVersion && !afterVersion) {
        violations.push(`${file}: "${dep}" fue eliminado (Tecnología Preferida, ver ADR-024).`);
        continue;
      }

      if (beforeVersion && afterVersion) {
        const beforeMajor = majorVersion(beforeVersion);
        const afterMajor = majorVersion(afterVersion);
        if (beforeMajor && afterMajor && beforeMajor !== afterMajor) {
          violations.push(
            `${file}: "${dep}" cambia de versión mayor (${beforeVersion} -> ${afterVersion}), Tecnología Preferida por ADR-024.`,
          );
        }
      }
    }
  }

  return violations;
}

export function changedFiles(baseRef, headRef = 'HEAD', cwd = undefined) {
  return sh(`git diff --name-only ${baseRef}...${headRef}`, cwd)
    .split('\n')
    .filter(Boolean);
}

export function hasBackingAdrChange(baseRef, headRef = 'HEAD', cwd = undefined) {
  return changedFiles(baseRef, headRef, cwd).some((f) => ADR_PATH_PATTERN.test(f));
}

function main() {
  const baseRef =
    process.env.PREFERRED_TECH_BASE_REF ?? `origin/${process.env.GITHUB_BASE_REF ?? 'main'}`;
  const headRef = process.env.PREFERRED_TECH_HEAD_REF ?? 'HEAD';

  const violations = findViolations(baseRef, headRef);

  if (violations.length === 0) {
    console.log(
      'OK: ninguna Tecnología Preferida (ADR-024) fue eliminada ni cambió de versión mayor.',
    );
    process.exit(0);
  }

  if (hasBackingAdrChange(baseRef, headRef)) {
    console.log(
      'Cambio de Tecnología Preferida detectado, respaldado por una ADR en este mismo PR (D-002.1 cumplido):',
    );
    violations.forEach((v) => console.log(`  - ${v}`));
    process.exit(0);
  }

  console.error(
    'FALLO: cambio de Tecnología Preferida (ADR-024) sin una ADR que lo respalde (D-002.1, ADR-011):',
  );
  violations.forEach((v) => console.error(`  - ${v}`));
  console.error('\nAgrega o actualiza una ADR en docs/03-architecture/ que justifique este cambio.');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
