# Performance

## Current State

No performance testing, benchmarking, or bundle-size monitoring infrastructure exists anywhere in the repo — no load-testing tool (k6/Artillery/autocannon), no bundle-size budget/CI check, no `source-map-explorer`/`webpack-bundle-analyzer`-equivalent tooling configured for the Expo/Metro build. Performance today is unmeasured, not measured-and-acceptable or measured-and-poor — an honest absence, in the same shape as this review's Offline/Sync/AI findings, not a disguised one.

**Backend query/response performance is not meaningfully assessable today**, and this is stated plainly rather than scored as a weakness: every repository is an in-memory data structure (confirmed repeatedly across Iterations 5/6), so read/write latency is trivially fast by construction. This tells us nothing about how the system will perform once real persistence exists — that's a question for whenever Iteration 5's still-open persistence decision is resolved, not one this repo's current state can answer.

**Frontend rendering has one concrete, real finding.** `packages/design-system/src/scroll/VirtualizedScreen.tsx` wraps `@shopify/flash-list` (a real dependency, confirmed in `apps/mobile/package.json`) as the correct, available primitive for rendering long lists efficiently. **It has zero usages anywhere in `apps/mobile/src`** (confirmed by grep). Meanwhile, at least two screens render real, potentially-unbounded domain-entity lists inside a plain `ScrollView` with `.map()` instead: `ObjectivesTab.tsx:78` (`filtered.map(...)`, a Goals list) and `GoalTasksFlatTab.tsx:64` (`filteredTasks.map(...)`, a Tasks list). This is the same shape as several already-logged findings in this review (`command_duration_ms`'s unregistered interceptor, the unused Supabase stack): the correct tool was built, and nothing uses it.

**Build-time performance:** Tamagui's static optimizing compiler has a real, observed cost — during this session's own work getting the app running, first-compile times for two screens were measured directly at 86.7s (`login`) and 106.1s (`onboarding`), with most other screens under 2s. This is a one-time-per-cache-invalidation cost (subsequent incremental builds are fast), not a runtime performance issue, but it's a real, citable developer-experience data point, not a theoretical concern.

## Strengths

- `VirtualizedScreen` exists as a real, correctly-built shared primitive — the _capability_ for performant long-list rendering is present in the design system, even though nothing uses it yet.
- Expo Router's default lazy route loading (`lazy=true`, confirmed in the bundle request URL observed during this session) means the mobile bundle doesn't eagerly load every screen upfront.
- Backend response times are fast today, honestly, because the current architecture is simple — this isn't a false positive, it's just not yet informative about production-scale behavior.

## Weaknesses

- Zero performance-measurement infrastructure of any kind — no baseline exists to know if a future change regresses anything.
- Two real, growable domain lists (Goals, Tasks) render unvirtualized, with no ceiling — fine at today's demo data volumes, a real risk the moment either list grows into the hundreds for a single user.
- No bundle-size budget or monitoring — the mobile web bundle observed this session was ~19.7MB unminified/dev-mode (not representative of a production build, but no production build has ever actually been measured either, per Iteration 16's finding that no `eas.json`/production build config exists).

## Risks

- The unvirtualized-list pattern is currently invisible because demo/seed data is small — this is exactly the kind of gap that surfaces suddenly and specifically for the most-engaged real users (the ones with the most Goals/Tasks), not gradually or on average.
- Without any bundle-size or perf-regression check in CI (Iteration 17 already found CI has no caching and a narrow test scope — this compounds that finding rather than introducing a new category of gap), a future change could silently regress load time or list performance with nothing catching it before a user does.

## Technical Debt

- Adopt `VirtualizedScreen` in `ObjectivesTab.tsx` and `GoalTasksFlatTab.tsx` (and audit the other 14 `ScrollView`-using files for the same pattern, though only these two were confirmed mapping over likely-growable domain-entity arrays this pass — `TaskForm`/`CreateCommitmentScreen`/etc.'s `.map()` calls are more likely rendering fixed-size form fields, not open-ended lists; not exhaustively verified).
- No bundle-size or performance budget exists in CI — add one once Iteration 16's deployment path exists to build against.

## Recommendations

1. Wire the two identified screens to `VirtualizedScreen` — the primitive already exists and works; this is adoption, not construction.
2. Defer backend performance work entirely until the persistence-strategy decision (Iteration 5) is made — building performance tooling against in-memory data would test the wrong thing.
3. Add a bundle-size check to CI once a real production build path exists (Iteration 16/17) — premature before then, since there's nothing representative to measure yet.

## Priority

**Low-Medium.** Nothing here causes pain today — data volumes are small, backend is fast by construction. But the unvirtualized-list finding is cheap to fix (the correct tool already exists) and fits this review's recurring "hardening pendiente" pattern: not missing, not undesigned, just not yet adopted where it should be.
