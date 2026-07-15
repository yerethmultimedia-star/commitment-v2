# Risk Register

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-14

---

## Logged Risks & Mitigations

- **Risk 1: Documentation Drift**
  - _Mitigation:_ Strict adherence to the "Documentation First" principle. Updates to code and structure must be accompanied by immediate documentation syncs.
  - _Materialized instance (2026-07-14):_ `docs/ARCHITECTURE_OVERVIEW.md`'s "Key Decisions" table
    doesn't mention the Habit, Goal, Insights, Calendar, or Coach engines, all of which are now
    committed and running. The same document also lists SQLite-backed local persistence and an
    "Offline-First" resilience strategy as an active (🟢) decision — verified against the actual
    codebase (2026-07-14): zero references to SQLite anywhere in `apps/mobile`, not in
    `package.json`. This may be aspirational architecture documented as if already built, or
    something that was descoped without the doc being updated — not resolved here, flagged per
    this register's own mitigation policy (discrepancy report, not a silent edit).
  - _Materialized instance (2026-07-14):_ `walkthrough.md` still describes the mobile client as
    Flutter and only covers Sprint 0/1 — predates the current Expo/React Native codebase entirely.
- **Risk 2: Vendor Lock-in**
  - _Mitigation:_ Follow "Open Source First" principles, ensuring external framework dependencies are isolated behind Ports and Adapters (Anticorruption Layers).
- **Risk 3: Repository lives inside an iCloud Drive-synced folder**
  - _Description:_ The repo is at `~/Desktop/Commitment-v2`, and this Mac has iCloud Drive
    Desktop & Documents sync enabled (`defaults read com.apple.finder FXICloudDriveDesktop` → `1`).
    iCloud's sync daemon races with local file writes and resolves conflicts by creating
    `"filename 2.ext"` duplicates instead of merging — confirmed to have silently corrupted 3
    files this session (including `packages/domain/src/index.ts`, the domain package's entire
    export surface), one of them **twice**, in the span of a few minutes, while work was actively
    in progress. This is not a one-time fluke; it can recur on any future session.
  - _Impact:_ High — a corrupted `index.ts` or similar entry-point file can silently ship broken or
    be committed without detection if pre-commit verification doesn't happen to exercise the
    affected import path (this is exactly what happened: earlier `jest` runs the same session
    passed despite the file being missing on disk).
  - _Mitigation:_ Recommended: disable iCloud Drive sync for Desktop & Documents, or move the repo
    outside `~/Desktop`. Until resolved, any commit prep should include a repo-wide sweep for
    stray `" 2."`-suffixed files as a standard pre-commit check.

---

## 📜 Change History

- **v1.1.0 (2026-07-14):** Registered Risk 3 (iCloud Desktop sync corrupting files, discovered
  this session), and logged two materialized instances of Risk 1 (Documentation Drift): a stale
  `ARCHITECTURE_OVERVIEW.md` missing several shipped engines plus a possibly-false SQLite/
  Offline-First claim, and a Flutter-era `walkthrough.md`. Migrated from duplicate risk tracking
  that had been created in `ENGINEERING_BOARD.md` before this canonical register was discovered to
  already exist.
- **v1.0.0 (2026-07-04):** Integrated as the official risk register at the root level.
