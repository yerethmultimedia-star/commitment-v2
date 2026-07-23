# Seguridad (Auth, Authorization, Secrets, Encryption)

## Current State

This iteration consolidates two already-confirmed findings (Iterations 6 and 7) and extends into secrets, encryption, injection, dependency vulnerabilities, and mobile-specific security, which had not been directly audited before now.

**Auth/Authorization (consolidated verdict).** Iteration 6 confirmed zero authentication exists anywhere in `apps/backend` (no `passport`/`jsonwebtoken`/`@nestjs/jwt`/`bcrypt`, no `AuthGuard`). Iteration 7 confirmed the mobile side mirrors this exactly — `useAuthStore.login()` mints a local UUID with no server round-trip. This iteration adds the deployment-reality check those two didn't make: there is no Dockerfile anywhere in the repo (`find . -iname "Dockerfile*"` returns nothing outside `node_modules`), no TLS/HTTPS configuration in `apps/backend/src` (`grep -rniE "https.createServer|httpsOptions|tls\.|ssl"` returns nothing), and `docker-compose.yml` only runs supporting infrastructure (Redis, OTel Collector, Prometheus, Grafana) — the backend itself isn't containerized or given any external-facing config anywhere in this repo. **This is a local-development-only system today, by omission rather than by an explicit "local-only" decision.** The absence of auth is real and would be a Critical, blocking finding the moment this backend is deployed anywhere reachable — but nothing in the repo currently deploys it anywhere.

**Secrets management.** `.gitignore` correctly excludes `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.test`, `.env.*.local`, `*.env`, `*.env.*`, with an explicit `!*.env.example` allow-rule (lines 58-66). `git ls-files | grep -iE "\.env"` returns only `.env.example` — no real secret file was ever committed. A grep for hardcoded API-key/secret/password/token literal patterns across `apps/` and `packages/` (excluding tests) returned zero hits. The one already-flagged issue stands as previously assessed: `env.config.ts`'s Zod schema defaults `SUPABASE_URL`/`SUPABASE_ANON_KEY` to placeholder strings instead of failing loud on missing config — a `.env` misconfiguration would silently produce a working-looking backend pointed at a fake Supabase project rather than crashing at boot.

**Encryption.** At rest: not applicable today — all persistence is in-memory (already established, Iteration 5), so there is no data at rest to encrypt; this is correctly not a separate gap, it's downstream of the persistence-strategy decision already tracked. In transit: confirmed no TLS anywhere in the backend config; everything is plain HTTP. Proportionate for local-only development, but worth naming explicitly as a "must add before any real deployment" item rather than leaving it implicit.

**Injection / input validation.** Spot-checked three controllers for Zod schema usage: `commitments.controller.ts` (10 schema/parse references), `tasks.controller.ts` (28), `goals.controller.ts` (16) — validation is applied consistently across all three, consistent with Iteration 4's finding. No SQL injection surface exists today (no real database). No `eval`/dynamic code execution found in application code.

**Dependency vulnerabilities.** Ran `pnpm audit` directly (not hypothetical): **5 vulnerabilities — 1 high, 3 moderate, 1 low.**

- **High + 1 moderate: `multer`** (Denial of Service via deeply-nested field names, and via incomplete handling of a related case), pulled in transitively via `apps/backend`'s `@nestjs/platform-express` dependency. Patched at `>=2.2.0`. Checked actual usage: `grep -rn "multer\|FileInterceptor\|@UploadedFile" apps/backend/src` returns **zero hits** — nothing in this codebase actually uses Multer for file uploads. The vulnerable code path exists in `node_modules` but is not reachable through any route this application defines. Real risk today: low despite the "high" severity label, because it's dead weight, not an exercised attack surface.
- **Moderate: `uuid`** (missing buffer bounds check in v3/v5/v6 namespace-based UUID generation), via `packages/domain`'s direct `uuid` dependency. Patched at `>=11.1.1`. This one _is_ directly used (ID generation across all aggregates) — worth an actual version bump, not just noting.
- **Low: `esbuild`** (arbitrary file read via its dev server), via `apps/mobile`'s `ts-jest` dev dependency. Dev-only, not shipped to any built app — low real risk.

**Mobile-specific security.** `apps/mobile/app.json` requests **zero explicit permissions** — no camera, location, contacts, or similar declared. Proportionate to what the app actually does. `expo-secure-store` is used for auth/session data (confirmed in Iteration 7) — the correct primitive for that data class on-device. No certificate pinning or jailbreak/root detection exists — expected and proportionate for a pre-production app with no real backend to protect yet; would become a real gap only once real auth/persistence exist.

**Authorization beyond auth — autonomous command execution.** Enumerated every Saga in the backend: `recurring-commitment.saga.ts`, `task-dependency-cascade.saga.ts`, `cancel-tasks-on-commitment-completed.saga.ts` (all in `apps/backend/src/{commitment,task}/application/sagas/`). Each one reacts to an event produced by an action the user already explicitly took (completing a recurring Commitment → register the next occurrence; a Task's dependency graph changing → cascade a status update; a Commitment completing → cancel its now-orphaned Tasks) — none of them originate a new decision on the user's behalf; they propagate the consequences of one the user already made. This is a legitimately bounded, appropriate use of automatic command execution, **not** the same category of risk as Iteration 13's finding. Iteration 13 was right that nothing _structurally_ prevents a future Saga from crossing that line — the Sagas that exist today just don't.

## Strengths

- Secrets hygiene is genuinely good: correct `.gitignore` coverage, no committed secrets, no hardcoded credentials found anywhere in application code.
- Input validation (Zod) is applied consistently across every controller sampled — no gaps found in this pass.
- Mobile requests no unnecessary permissions; uses the correct secure-storage primitive for the one sensitive value it holds.
- The three Sagas that exist are all legitimately bounded automations of user-already-initiated consequences, not autonomous new decisions — a genuinely reassuring answer to the question Iteration 13 raised.

## Weaknesses

- Zero authentication/authorization anywhere in the backend (consolidated from Iterations 6-7) — by construction, not partial.
- No TLS/HTTPS anywhere; everything is plain HTTP, with no deployment artifacts (`Dockerfile`, CI deploy step) suggesting this has been considered yet.
- `SUPABASE_URL`/`SUPABASE_ANON_KEY` silently default to placeholders rather than failing loud — a real misconfiguration would look like a working system.
- `uuid`'s buffer-bounds-check vulnerability is in an actively-used dependency (unlike Multer) and should be bumped past `11.1.1`.

## Risks

- **The single largest risk in this entire review remains unchanged by this iteration: if this backend is ever exposed beyond a single trusted local developer before auth is built, every `identityId` in the system is fully spoofable** — read any user's data, write as any user, by supplying an arbitrary header/body value. This iteration's contribution is confirming that risk is currently _latent_ (nothing in the repo deploys this backend anywhere reachable today) rather than _live_ — which changes urgency, not correctness of the underlying finding.
- Silent-default env config (`SUPABASE_URL`/`SUPABASE_ANON_KEY`) risks a deployment that "works" against the wrong (placeholder) backend without anyone noticing at boot time.

## Technical Debt

- Bump `uuid` to `>=11.1.1` (moderate, actively used).
- Remove or justify the `multer` transitive dependency if `@nestjs/platform-express`'s file-upload capability is genuinely unused (currently confirmed unused); if it's kept for future use, track the patch version.
- Change `SUPABASE_URL`/`SUPABASE_ANON_KEY` from silently-defaulted placeholders to fail-loud-if-missing, at minimum in any non-`development` `NODE_ENV`.

## Recommendations

1. Treat the Iteration 6/7 auth gap as this review's single highest-priority Technical Debt item overall — already registered as such, this iteration adds no new urgency but removes any ambiguity about exploitability today (none, because nothing is deployed) versus tomorrow (total, the moment it is).
2. Add TLS/HTTPS handling (even self-signed for local HTTPS testing) as part of whatever work eventually adds real deployment — don't let it be an afterthought bolted on after auth.
3. Bump `uuid`; decide on `multer`'s fate explicitly (remove the capability or patch the version) rather than leaving an unused, vulnerable transitive dependency in place by default.
4. Make Supabase env vars fail loud outside development.
5. No action needed on mobile permissions, SecureStore usage, or the three existing Sagas — all three are already at an appropriate baseline for this stage.

## Priority

**High.** Consistent with Iterations 6 and 7 — this iteration doesn't discover a new Critical, but it confirms the auth gap is the review's most consequential single finding, now fully triangulated from backend, frontend, and deployment-reality angles. The newly-found dependency vulnerabilities and env-defaulting issue are real but individually Medium/Low; they don't change the overall Priority for this topic.
