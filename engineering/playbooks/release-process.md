# Playbook: Release Process

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Goal

Standardize release gating, package tagging, documentation updates, and deployment checks for Commitment releases.

## 🔄 Release Lifecycle Steps

### 1. Verification Gate

Before triggering any release:

- Verify that `main` or the release branch builds cleanly:
  ```bash
  npx pnpm run build
  npx pnpm run lint
  npx pnpm test
  ```
- Ensure Supabase migration scripts are checked and validated.
- Confirm Flutter localizations generate cleanly.

### 2. Version Updates

- Update version fields inside workspace `package.json` configurations (utilizing semantic versioning).
- Update the versioning history block on key root files:
  - `PROJECT_STATUS.md`
  - `HANDBOOK.md`
  - `README.md`

### 3. Git Tagging & Publishing

- Commit all changes with a release commit: `chore(release): publish vX.Y.Z`.
- Tag the commit: `git tag -a vX.Y.Z -m "Release version X.Y.Z"`.
- Push tags to remote: `git push origin vX.Y.Z`.

### 4. Deploy Actions

- Trigger deployment pipelines in GitHub Actions.
- Verify status checks in Grafana/Prometheus dashboard once live on staging.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the Release Process playbook.
