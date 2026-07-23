# CI/CD

## Current State

A single CI configuration exists: `.github/workflows/ci.yml` (69 lines, read in full — no other CI provider config found: no `.circleci/`, `.gitlab-ci.yml`, or `azure-pipelines.yml`). It defines two jobs, both triggered on `push`/`pull_request` to `main` only (lines 3-7) — no other branches trigger CI.

**`backend-ci`** (lines 10-41): checkout → pinned pnpm 10.34.4 → Node 22 with pnpm-store caching → `pnpm install --frozen-lockfile` → `pnpm run build` (root, invokes Turbo's `build` task across the whole dependency graph per `turbo.json`'s `dependsOn: ["^build"]`) → `pnpm --filter backend run lint` → `pnpm --filter backend run build` (a second, direct `nest build` invocation, bypassing Turbo — see Weaknesses) → `pnpm --filter backend run test` (Jest unit tests only).

**`mobile-ci`** (lines 43-68): identical setup, then only `pnpm --filter mobile exec tsc --noEmit` — no lint step, no test step (consistent with Iteration 10's finding that `apps/mobile/package.json` has no `test` script at all).

**Confirms and extends Iteration 10's (Testing) finding exactly:** neither job ever invokes `packages/domain`'s own `test` script (the best-tested layer in the entire review, per Iteration 10) nor `apps/backend`'s `test:e2e` script. Both remain structurally disconnected from CI, verified again directly here.

**No CD step exists anywhere in this file** — confirms Iteration 16's (Infraestructura) finding that no deployment path exists, from the CI-config side as well as the deployment-artifact side.

## Strengths

- Dependency installation is reproducible (`--frozen-lockfile`) and tool versions are pinned (pnpm 10.34.4, Node 22) — no "works on my machine" version drift risk in CI itself.
- The backend job's sequence (install → build → lint → test) is a sound, standard shape for the parts it covers.
- Mobile at least typechecks in CI, catching a real class of error before merge.

## Weaknesses

- **Mobile has a real `lint` script (`"lint": "expo lint"`, `apps/mobile/package.json`) that CI never runs.** Only `tsc --noEmit` is invoked — lint coverage is asymmetric between backend (linted) and mobile (not linted), with no stated reason.
- **No cross-run caching of any kind.** `turbo.json` defines cacheable outputs (`dist/**`, `build/**`, `.next/**`) but `ci.yml` has no `actions/cache` step for `.turbo` or Turbo remote-cache configuration (no `TURBO_TOKEN`/`TURBO_TEAM` env vars referenced anywhere). Every CI run rebuilds the entire dependency graph from a cold cache — for a monorepo with 8 packages and 2 apps, this is a real, growing developer-feedback-speed cost with no offsetting benefit.
- **Redundant backend build.** The root `pnpm run build` step already builds `apps/backend` via Turbo's dependency graph (`dependsOn: ["^build"]`). The subsequent `pnpm --filter backend run build` step calls `nest build` directly, bypassing Turbo entirely — it isn't wrong, but it's a duplicate build of the same target through two different mechanisms in the same job, likely leftover from before Turbo was fully wired in rather than a deliberate choice.
- **Packages other than `backend`/`mobile` are never linted or tested individually in CI** — `design-system`, `theme-engine`, `platform`, `shared`, `localization`, `api-contracts` are built (transitively, via the root Turbo build) but no job runs `pnpm --filter <package> run lint` or `test` for any of them. (`packages/domain`'s test gap is already covered above and in Iteration 10.)

## Risks

- **Merge-gating is unverifiable from the repository alone.** GitHub branch-protection rules (whether a failing `backend-ci`/`mobile-ci` check actually blocks a merge to `main`) are stored in GitHub's own settings, not in this repo's files — no `CODEOWNERS` file exists either (checked, absent) as a secondary signal. This report states plainly: **it cannot be determined from the filesystem whether CI failure is actually enforced or merely advisory.** This matters more than it might seem — Iteration 10's entire "reliability of signal" finding assumes a green check means something; if merges aren't actually gated on it, the gap is worse than described there.
- The lack of caching compounds over time, not just as a DX annoyance — as more packages/aggregates are added (this review found 7 real aggregates already, likely more to come), full-cold-cache CI runs will keep growing linearly with no mitigation currently in place.

## Technical Debt

- Add `pnpm --filter domain run test` and `pnpm --filter backend run test:e2e` as CI steps (directly closes Iteration 10's central finding — the tests already exist and pass).
- Add `pnpm --filter mobile run lint` to `mobile-ci`.
- Add Turbo cache persistence (`actions/cache` keyed on lockfile hash, at minimum, or a Turbo remote cache if budget allows) to `ci.yml`.
- Remove or justify the duplicate `pnpm --filter backend run build` step now that the root Turbo build already covers it.

## Recommendations

1. Wire the two disconnected-but-real test suites (domain, e2e) into CI first — this is the same one-line-per-suite fix already identified in Iteration 10, just confirmed again from the pipeline-config side.
2. Add the missing mobile lint step — cheap, closes an asymmetry with no clear justification.
3. Add basic cross-run caching — a meaningful CI-speed improvement for a monorepo of this size, independent of any other finding.
4. Confirm (outside the repo, in GitHub's branch protection settings) whether these checks are actually required for merge — if they aren't, that's a bigger gap than anything else in this report, and worth fixing regardless of what Fase 4's remaining iterations find.

## Priority

**Medium.** Nothing here is broken — the pipeline does what it does correctly, for the scope it covers. But it's narrower than the codebase's own test investment justifies (echoing Iteration 10), and the caching/duplication findings are cheap, unambiguous improvements with no tradeoff. The one item that could change this Priority to High is the unverifiable branch-protection question — if CI turns out not to actually gate merges, every other finding in this whole review's Testing/CI story becomes moot, and that would warrant escalation.
