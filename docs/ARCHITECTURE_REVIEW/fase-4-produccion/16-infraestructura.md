# Infraestructura

## Current State

Zero deployment artifacts exist anywhere in the repository. Exhaustive search confirms: no `Dockerfile` (root, `apps/backend/`, or `apps/mobile/`), no `.dockerignore`, no Kubernetes manifests, no Terraform/Pulumi/CDK, no PaaS config (`Procfile`, `render.yaml`, `fly.toml`, `vercel.json`, `app.yaml`), no `eas.json` for Expo production builds, and no `"deploy"` script in any `package.json` in the repo. This confirms and sharpens Iteration 15's (Seguridad) finding precisely — not just "no Dockerfile," but no deployment path of any kind, for either app.

`apps/backend` does produce a genuine, working build: `pnpm run build` (`nest build`) succeeds and populates `dist/` with real compiled output (verified by running it directly, not assumed from the script existing). This is a real, if minimal, positive — the backend is not broken as a deployable unit, it simply has nowhere configured to deploy to.

`NODE_ENV` is declared (Zod schema, `env.config.ts`) but only meaningfully consumed in two places: `apps/backend/src/app.module.ts:41` (toggles `pino-pretty` log formatting off in production) and `apps/mobile/src/core/api/api-client.ts:12` (`getBaseUrl()` returns `https://api.commitment.app` in production, a localhost variant otherwise). A third usage (`apps/mobile/src/app/(tabs)/profile.tsx:197`) just prints `NODE_ENV`'s raw value in a debug-looking UI label — not a functional use.

**The most significant finding this iteration:** the local Supabase stack (Postgres/Studio/PostgREST/Realtime/Storage, running via `docker-compose.yml`, unused by the backend per `docs/PROJECT_AUDIT.md` §4) is not vestigial or exploratory infrastructure — it is the direct, unfulfilled consequence of **ADR-004** (`docs/01-product/adr/adr_001_to_010.md`), an approved decision: _"Utilizar Supabase como la plataforma de infraestructura y backend"_ for authentication, real-time DB, and storage, explicitly justified against the rejected alternative of _"Construir una API a medida desde el día uno en Node.js/Go."_ **That explicitly-rejected alternative is exactly what was built.** `apps/backend` is a custom NestJS/Node.js API, Supabase is running but untouched, and — checked directly — **no ADR anywhere formally supersedes ADR-004**, despite **ADR-011** (`adr_011_tech_stack_flexibility.md`) requiring exactly that kind of formal ADR for any change away from a decided/preferred technology, with an explicit rejected-alternative clause: _"Permitir cambios libres sin justificación: Rechazada porque generaría fragmentación... y pérdida del consenso del equipo senior de arquitectura."_ The pivot away from Supabase happened without the governance process the project's own ADRs require for it.

## Strengths

- The backend build pipeline is real and verified working (`nest build` → runnable `dist/`), not just declared in scripts.
- `api-client.ts`'s hardcoded production URL (`https://api.commitment.app`) shows real, specific deployment intent exists conceptually, even though nothing serves it today.
- The minimal `NODE_ENV` branching that does exist (log formatting, API base URL) is correct and functional as far as it goes.

## Weaknesses

- Zero deployment artifacts of any kind (Dockerfile/IaC/PaaS config/CI deploy step) — confirmed exhaustively, not assumed.
- No `eas.json` — `apps/mobile` has no configured path to a real app-store or over-the-air production build either.
- Environment separation is nearly nonexistent beyond two narrow, hardcoded branches — there is no staging environment concept anywhere.

## Risks

- **Governance-process risk (new, not previously logged):** ADR-004's Supabase decision was abandoned in favor of its own explicitly-rejected alternative, without the superseding-ADR process ADR-011 itself mandates. This is a live **ADR ↔ Implementación** inconsistency — the same class of finding as Iteration 9's gamification-copy-vs-ADR-006/010 contradiction, but here the object is the whole backend platform choice, not a UI string.
- **Scalability risk (extends Iteration 5's finding):** since all state is in-memory and single-process (`InMemoryGoalRepository` etc., Iteration 5), horizontal scaling (running more than one backend instance) isn't just unconfigured — it would actively break correctness today, since each instance would hold its own inconsistent view of the world. This is a hard blocker behind any future deployment, not a configuration gap alone.
- **Disaster recovery is honestly not yet a meaningful question:** with zero real persistence, there is currently nothing to lose and nothing to back up. This is not being treated as a present risk — it becomes one the moment Iteration 5's still-open persistence-strategy decision is resolved, and backup/recovery design should be built in from that decision's start, not retrofitted after.

## Technical Debt

- No deployment artifacts exist for either app (Implementación pendiente).
- The Supabase-vs-custom-backend platform decision needs either a retroactive superseding ADR (documenting why the pivot happened) or an active plan to actually adopt Supabase per ADR-004 as originally decided (Diseño pendiente — this is a decision, not a build task).
- Environment separation (dev/staging/prod) doesn't exist as a concept beyond two hardcoded conditionals (Diseño pendiente).

## Recommendations

1. Resolve the ADR-004 contradiction deliberately: either write the superseding ADR that should already exist, or treat it as still-binding and schedule the Supabase migration it specifies. Leaving it unresolved is the governance-equivalent of the silent drift this whole review has been checking for elsewhere.
2. When real persistence is decided (Iteration 5), design deployment topology and backup/DR strategy as part of that same decision, not as an afterthought — the two are coupled (you can't back up a database you haven't chosen yet).
3. A minimal `Dockerfile` for `apps/backend` (the build already works) would be a cheap, high-leverage first deployment artifact, independent of which persistence direction gets chosen.

## Priority

**Medium for "build deployment infrastructure"** — there are no real users yet, so the absence itself isn't urgent, consistent with this review's treatment of Offline/Sync/AI as honest not-yet-built gaps rather than defects.

**High for "resolve the ADR-004/ADR-011 governance contradiction"** — this is not a missing-infrastructure problem, it's a live violation of the project's own documented change-control process, and it's cheap to resolve (a documentation/decision fix, not a build task) compared to what it would cost to discover accidentally later (e.g., after Supabase's local containers are removed from `docker-compose.yml` by someone who doesn't know an ADR is still nominally binding them to it).
