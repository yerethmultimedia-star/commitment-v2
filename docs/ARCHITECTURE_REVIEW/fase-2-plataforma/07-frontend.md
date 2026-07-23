# Frontend

## Current State

`apps/mobile` (Expo Router + React Native + Tamagui) is organized as: `src/app/**` (file-based routes), `src/features/**` (11 domain-area feature folders: goals, tasks, habits, commitments, coach, dashboard, insights, appearance, calendar, profile, notes), `src/core/**` (auth, api, query, demo, i18n, storage, notifications, reminders, store, facades, components).

**State management** is cleanly split by kind: server state via `@tanstack/react-query`, backed by a centralized `queryKeys` factory (`core/query/query-keys.ts`) covering commitments/tasks/habits/goals/profile; local/UI state via `zustand` (`core/store/use-ui-store.ts`, plus feature-scoped stores: `use-task-store.ts`, `use-dashboard-store.ts`, `use-appearance-store.ts`, `use-task-list-filter.store.ts`). No mixing observed — features consistently reach for the right tool.

**Data-fetching** goes through one shared `ky` instance (`core/api/api-client.ts`): platform-aware base URL (Android emulator `10.0.2.2:4000` vs. iOS/web `localhost:4000`, prod placeholder `https://api.commitment.app`), consistent retry policy, and a `beforeRequest` hook injecting `x-request-id`, `x-identity-id` (from `useAuthStore`), and `Accept-Language` on every request. Every feature has its own `*.api.ts` module (`commitments.api.ts`, `tasks.api.ts`, `goals.api.ts`, `habits.api.ts`, `notes.api.ts`, `profile.api.ts`, `history.api.ts`) built on top of this shared client — no feature reinvents the HTTP layer.

**Auth**, confirmed by reading `core/auth/auth.store.ts` directly: `login()` does `set({ identityId: uuidv7(), sessionStatus: 'Authenticated' })` — a **locally-generated random UUID with no server round-trip at all**. This is the mobile-side mirror of Iteration 6's backend finding (zero auth infrastructure exists): the client doesn't fake-call a real endpoint and skip verification, there is no login endpoint to call in the first place. `sessionStatus: 'Authenticated'` is a label for "a UUID exists in SecureStore," not evidence of any actual authentication event.

**Demo Mode** is a real, single-point, well-documented architectural convention — not scattered ad hoc branching. Every method in every `*.api.ts` file follows the identical shape: `if (isDemoModeActive()) return demoXRepository.method(...); return apiClient.<verb>(...)`. `commitments.api.ts`'s own header comment states the rule explicitly: _"Demo Mode is a data-source switch checked here, at the API boundary — the one place allowed to know it exists. Hooks and components call the same `commitmentsApi.*` methods either way and never branch on demo mode themselves."_ Verified this holds: no `isDemoModeActive()` call found outside `*.api.ts` files in a spot-check of hooks/components. All demo repositories live centrally in `core/demo/` (`demo-commitments.repository.ts`, `demo-goals.repository.ts`, `demo-habits.repository.ts`, `demo-tasks.repository.ts`, `demo-notes.repository.ts`, `demo-data.ts`), not scattered per-feature.

**TECH_DEBT.md Item 40 verified fixed, contrary to the item's own "open" framing carried into this iteration's brief**: `useCreateCommitment.ts` and `QuickCaptureDialog.tsx` (the two real call sites of `commitmentsApi.create`) both now generate and send `id`/`identityId`, with an explicit code comment citing Item 40 and confirming "the previous version of this hook never sent them, so real-mode creation would 400." The fix already happened; only the paper trail is stale.

**Navigation**: Expo Router file-based groups — `(auth)`, `(settings)`, `(tabs)` — read coherently and match the app's actual information architecture (auth flow separate from settings separate from the main tab bar). `commitments/create.tsx` is wired (confirmed already in `docs/PROJECT_AUDIT.md` §5).

**Feature module structure** is mostly consistent: `goals/`, `habits/`, `tasks/`, `commitments/` all have `models/`, `screens/`, `components/`, `hooks/`, `api/`. Minor, low-cost drift: `commitments/` additionally has `mappers/`, `tasks/` additionally has `store/`, `goals`/`habits`/`tasks` have `utils/` that `commitments` lacks. `coach/` is much thinner (mostly `utils/`), consistent with Iteration on AI Platform (13) likely finding it borrows heavily from `dashboard`'s recommendation engine rather than owning its own feature-shaped code.

## Strengths

- **Single, well-designed HTTP client boundary.** One `ky` instance, one place headers/retries/base-URL logic live. No feature reinvents auth-header injection or retry policy — this is exactly the kind of centralization that keeps a growing app maintainable. (`core/api/api-client.ts`)
- **Demo Mode is genuinely architected, not just present.** A real, explicit, consistently-applied convention with a stated rule ("the API boundary is the one place allowed to know it exists") that was verified to actually hold across the codebase, not just claimed in a comment. This matters because Demo Mode touches every single feature — an inconsistent version of this pattern would have been expensive technical debt at this scale.
- **Clean state-management split.** react-query for server state with a centralized query-key factory, zustand for local/UI state, no observed mixing. This is a textbook-correct division that a lot of React Native apps get wrong.
- **Feature folder conventions are consistent enough to onboard against.** A new contributor reading `goals/` then `habits/` would correctly predict `tasks/`'s shape.

## Weaknesses

- **Demo Mode's branching is repeated per-method, not abstracted.** Every single method in `commitments.api.ts` (9 methods) repeats the identical 1-line `if (isDemoModeActive()) return demoX.method(...)` shape. This is consistent (a real strength, above) but also pure duplication that a small higher-order helper (e.g. `withDemoFallback(demoFn, realFn)`) would remove entirely, at effectively zero risk — the convention is already proven safe, only the boilerplate remains. Low severity, high mechanical repetition (7 API files × several methods each).
- **`generateId()` for client-side UUIDs is duplicated inline** rather than centralized (found in `useCreateCommitment.ts`; the identical pattern is referenced as mirroring `useCreateHabit()`, implying at least 2 duplicate copies, likely more across other create-flows). Trivial to fix, but is exactly the kind of copy-pasted utility that silently diverges over time (e.g., one copy gets a crypto-polyfill fix, others don't).
- **Minor feature-structure drift** (`mappers/`, `store/`, `utils/` present in some features, absent in others) — not a real problem today, but has no documented convention saying which folders a feature module "should" have, so it will keep drifting as more features are added.

## Risks

- **Auth is not a partial implementation — it doesn't exist to be extended.** `useAuthStore.login()` is architecturally a placeholder disguised as a real state machine (`SessionStatus: 'Loading' | 'Anonymous' | 'Authenticated'` reads like real auth states, but `'Authenticated'` is reached by generating a local random ID). This compounds Iteration 6's backend finding: the mobile app has no real login _screen logic_ to eventually wire up server verification into — `login()` would need to become an actual async call with error handling, not have a flag flipped, whenever real auth is built. This is a bigger lift than "add a JWT" on either side alone.
- **Hand-written `packages/api-contracts` types have no verification step.** Item 40 (the missing `id`/`identityId` fields) was a real production-breaking bug that TypeScript's own type system didn't catch, because the hand-written contract type didn't reflect the backend's actual required fields at the time. Nothing currently prevents this class of bug from recurring the next time a backend DTO changes shape without the mobile-side type being updated in lockstep (no contract test, no generated types, no schema-sharing mechanism).
- **The `x-identity-id` header being client-set and unverified (confirmed in both Iteration 6 and here) means Demo Mode and "real mode" are, from a security standpoint, equally trustworthy today** — worth naming plainly so nobody mistakes turning off Demo Mode for a meaningful security boundary.

## Technical Debt

- Demo Mode per-method branching duplication (see Weaknesses) — mechanical, low-risk, worth a small refactor whenever this area is touched next, not urgent on its own.
- Duplicated `generateId()` helper — same category, trivial consolidation.
- `shared/ui/feedback/ErrorState.tsx` (mobile-local) coexists with `packages/design-system/src/components/{EmptyState,FeedbackState}.tsx` (design-system) — confirms `TECH_DEBT.md` Item 13 is still live as of this pass; flagging the frontend-architecture angle requested: this recurs because there's no lint rule or shared-component discovery convention stopping a feature from hand-rolling a state component instead of reaching for the design-system one — it's a missing guardrail, not an isolated mistake.
- No documented "what folders does a feature module have" convention — contributes to the minor structural drift noted above.

## Recommendations

1. **Do not touch auth architecture yet** — it's correctly out of scope until Iteration 15 (Seguridad) and a real backend `AuthModule` exists (Iteration 6). Recommendation here is scoped to frontend-only, low-risk items:
2. Collapse the repeated Demo Mode branch into a single helper function, used by all `*.api.ts` modules — removes duplication without changing behavior (the convention itself is already correct).
3. Centralize `generateId()` in one shared utility (e.g. `core/` or `shared/`) instead of duplicating the crypto-fallback logic per hook.
4. Establish (even informally, in a short doc or README) which subfolders are "standard" for a feature module, so `mappers/`/`store/`/`utils/` placement stops being decided ad hoc per feature.
5. Longer-term (flag for Fase 4/Documentación, not urgent now): consider a lightweight contract-verification step (even a shared Zod schema used by both sides, or a contract test) for `packages/api-contracts`, given Item 40 already proved hand-written types can silently drift from what the backend actually requires.

## Priority

**Medium.** Nothing here is broken today — Demo Mode works, state management is clean, the HTTP client is sound, and Item 40 is already fixed. The weaknesses found are cheap, mechanical duplication (not architectural flaws), and the one real risk (auth doesn't exist) is already tracked as High priority from Iteration 6 — this iteration doesn't add urgency to it, just confirms it's consistent across the stack, not just a backend gap.
