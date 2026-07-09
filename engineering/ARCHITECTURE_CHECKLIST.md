# Architecture Review Checklist

Version: 1.7.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-08

---

## 1. Architecture Reviews

- [ ] **Aggregate Identity:** Client assigns UUIDs before dispatching commands. No database-generated sequential IDs for aggregate identity.
- [ ] **State via Events:** No aggregate setter methods. All mutations trigger an event that drives state update.
- [ ] **Lean Handlers:** Command Handlers orchestrate; they never contain business rules.
- [ ] **Kernel Purity:** Slices do not share domain logic or dependencies. Sibling slice imports are forbidden.
- [ ] **Idempotent Handlers:** Duplicate commands (same ID) are handled idempotently without throwing error or modifying state.
- [ ] **Monorepo Directory Layout:** Verification that no directory movements, packaging changes, or workspace convention modifications were introduced (Rule #93).
- [ ] **Security Review:**
  - [ ] **PII Isolation:** Personally Identifiable Information (PII) is isolated and encrypted.
  - [ ] **Authorization Verification:** Action dispatchers and endpoint controllers enforce roles and authorizations.
  - [ ] **Secret Management:** Secrets are resolved from environment variables, not hardcoded.
  - [ ] **Credential Safety:** Local tokens and credentials are saved strictly to Secure Storage.
  - [ ] **Input Sanitization:** Input values are verified using Zod schemas at controller bounds.
  - [ ] **Correlation Telemetry:** Trace/correlation IDs are propagated in all logs and context headers.

---

## 2. Product Reviews

- [ ] **Immediate Value:** The user experiences clear, actionable value from the slice without requiring external elements.
- [ ] **Rapid Demonstration:** The feature can be demonstrated end-to-end in less than 2 minutes.
- [ ] **User Drive:** The slice reduces UX friction or increases motivation to continue using the application.
- [ ] **Recommendability:** The feature makes the product easier to recommend to others.

---

## 3. UX Reviews

- [ ] **Component Reusability:** Component design avoids code duplication by extending existing components from `@commitment/design-system`.
- [ ] **Role-Based Tokens Exclusivity:** All colors map strictly to interface roles (`background`, `surfaceRaised`, `contentSecondary`, `accent`) rather than ad-hoc palette configurations.
- [ ] **Motion Tokens Alignment:** Animations and transitions utilize curves and timings defined strictly by Motion design tokens (e.g. `fast`, `spring`, `cardEntrance`) that vary dynamically per theme.
- [ ] **Icon & Illustration Tokens:** Visual icons and empty state illustrations are resolved dynamically via Icon/Illustration tokens (e.g. `theme.icons.success`, `theme.illustrations.emptyCommitments`) rather than hardcoded component imports.
- [ ] **Widget Plugin System:** Dashboard widgets are developed as plugins registered in `WidgetRegistry` to support future modularity and re-ordering.
- [ ] **Cross-Platform Readiness:** Visual components are structured cleanly to allow future reuse across React Native Web and Mobile platforms where possible.
- [ ] **Experience Theme Compatibility:** Layouts compile and display correctly in all three experience themes (Sunrise, Midnight, Forest).
- [ ] **Theme Switching Speed:** Theme transition takes between 150–250 ms, hardware accelerated.
- [ ] **Appearance Separation:** Appearance details (High Contrast, Reduced Motion, Dynamic Type) are separated from the core theme.

---

## 4. Localization Reviews

- [ ] **Strict i18n Compliance:** Zero hardcoded strings in user-facing views or presentation models.
- [ ] **Theme i18n Integration:** Theme names (`theme.sunrise.name`), descriptions, and previews use translation keys without hardcoded fallback strings.
- [ ] **i18nKey Component Props:** Components receive localization keys (e.g. `i18nKey="common.save"`) rather than raw translated strings computed by the caller.
- [ ] **Localization SDK Integration:** All string translations, date formatting, and numerical localized formats utilize `@commitment/localization` SDK functions (`t`, `formatDate`, etc.) instead of direct imports of local libraries.
- [ ] **Localizations File Sync:** New keys are updated in both English and Spanish translation lists.
- [ ] **Core Language:** All schemas, code variables, database tables, and log events are in English.

---

## 5. Performance Reviews

- [ ] **Bundle Size Budget:** Bundles are verified for mobile size restrictions.
- [ ] **Global Reactivity Budget:** Context providers are kept minimal to avoid render cascades.
- [ ] **Lazy Loading:** Diff loading is used for separate routes/tabs.
- [ ] **Virtualization:** Large scroll lists utilize virtualized flatlists.
- [ ] **Render Optimization:** Lambdas or objects are not declared inline inside JSX properties.

---

## 6. Platform Reviews

- [ ] **Offline Functionality:** The feature operates correctly when offline.
- [ ] **Sync Conflict Resolution:** Data merge conflicts are resolved deterministically.
- [ ] **Optimistic State:** Local state updates instantly, with rollback handling if backend sync fails.
- [ ] **Cache Updates:** React Query caches are updated correctly upon sync completion.
- [ ] **State Management Purity:** React Query handles server cache; Zustand handles global UI configurations; component state handles transients.

---

## 7. Quality Reviews

- [ ] **Technical Debt Registration:** All mocks, in-memory repository adapters, bypasses, or temporary hacks are registered in the closure log indicating state, owner, and targeted sprint for deletion.
- [ ] **API Contract Stability:** API changes are backwards compatible with optional fields by default. API versions align with `@commitment/api-contracts` and are mapped properly (no direct DTO use in UI).
- [ ] **API Evolution Design:** Endpoints align with bounded context scopes, use RESTful verbs, avoid duplicate endpoints, and support non-versioned evolution.
- [ ] **Feature Independence:** Feature sliced modules are fully decoupled, communicate strictly through public contracts/APIs, and can be removed without breaking sibling modules.

---

## 📜 Change History

- **v1.7.0 (2026-07-08):** Added check for monorepo directory structure and package boundaries freeze (Rule #93).
- **v1.6.0 (2026-07-08):** Restructured checklist into the 7 standardized reviews (Architecture, Product, UX, Localization, Performance, Platform, Quality) and added API Evolution, State Management, Security, and Offline checks.
- **v1.5.0 (2026-07-08):** Integrated checks for Technical Debt, Performance Budgets, API Contract stability, Design Consistency, and Feature Independence (Rules #99 to #103).
- **v1.4.0 (2026-07-08):** Revised Design System rules to enforce role-based semantic tokens, motion/icon/illustration tokens, and widget plugins. Bumped checklist version.
