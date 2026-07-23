// AR-002 Fase 5 — prueba de extremo a extremo del flujo completo (D-002.1), no solo inspección de
// archivos: simula una desviación real de una Tecnología Preferida sobre un repo git temporal real,
// y confirma que el CI la detecta y que una ADR en el mismo diff la respalda.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findViolations, hasBackingAdrChange } from './check-preferred-tech.mjs';

function sh(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'pipe' });
}

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ar-002-e2e-'));
  sh('git init -q -b main', dir);
  sh('git config user.email test@example.com', dir);
  sh('git config user.name Test', dir);
  mkdirSync(join(dir, 'apps', 'backend'), { recursive: true });
  mkdirSync(join(dir, 'docs', '03-architecture'), { recursive: true });
  return dir;
}

function writeBackendPackageJson(dir, deps) {
  writeFileSync(
    join(dir, 'apps', 'backend', 'package.json'),
    JSON.stringify({ name: 'backend', dependencies: deps }, null, 2),
  );
}

function commit(dir, message) {
  sh('git add -A', dir);
  sh(`git commit -q -m "${message}"`, dir);
}

test('no violation when a governed dependency is untouched', () => {
  const dir = makeRepo();
  try {
    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0', bullmq: '^5.79.3' });
    commit(dir, 'base');
    const base = execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();

    writeFileSync(join(dir, 'apps', 'backend', 'README.md'), 'unrelated change');
    commit(dir, 'head');

    const violations = findViolations(base, 'HEAD', dir);
    assert.deepEqual(violations, []);
  } finally {
    rmSyncQuiet(dir);
  }
});

test('CI fails: bullmq removed with no backing ADR in the same diff', () => {
  const dir = makeRepo();
  try {
    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0', bullmq: '^5.79.3' });
    commit(dir, 'base');
    const base = execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();

    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0' });
    commit(dir, 'remove bullmq, no ADR');

    const violations = findViolations(base, 'HEAD', dir);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /bullmq.*eliminado/);
    assert.equal(hasBackingAdrChange(base, 'HEAD', dir), false);
  } finally {
    rmSyncQuiet(dir);
  }
});

test('CI passes: same removal, but the PR also adds a backing ADR', () => {
  const dir = makeRepo();
  try {
    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0', bullmq: '^5.79.3' });
    commit(dir, 'base');
    const base = execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();

    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0' });
    writeFileSync(
      join(dir, 'docs', '03-architecture', 'adr_099_replace_bullmq.md'),
      '# ADR-099: Replace BullMQ\n',
    );
    commit(dir, 'remove bullmq, with ADR-099');

    const violations = findViolations(base, 'HEAD', dir);
    assert.equal(violations.length, 1);
    assert.equal(hasBackingAdrChange(base, 'HEAD', dir), true);
  } finally {
    rmSyncQuiet(dir);
  }
});

test('CI fails: major version bump on a governed dependency with no ADR', () => {
  const dir = makeRepo();
  try {
    writeBackendPackageJson(dir, { '@nestjs/core': '^11.0.0', bullmq: '^5.79.3' });
    commit(dir, 'base');
    const base = execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();

    writeBackendPackageJson(dir, { '@nestjs/core': '^12.0.0', bullmq: '^5.79.3' });
    commit(dir, 'bump nestjs major, no ADR');

    const violations = findViolations(base, 'HEAD', dir);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /@nestjs\/core.*versión mayor/);
  } finally {
    rmSyncQuiet(dir);
  }
});

function rmSyncQuiet(dir) {
  rmSync(dir, { recursive: true, force: true });
}
