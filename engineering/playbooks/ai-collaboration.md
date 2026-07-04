# Playbook: AI Collaboration & Handovers

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Goal

Ensure that any AI agent joining the repository can seamlessly catch up, maintain strict architectural discipline, and continue the project without losing context or guessing.

## 🤝 AI Collaboration Guidelines

### 1. Mandatory Context Bootstrapping

When initializing a new session:

- The AI must immediately read `engineering/system-prompt.md`.
- Read root-level status files: `PROJECT_STATUS.md`, `HANDBOOK.md`, `ENGINEERING_BOARD.md`.
- Do **not** rely on instructions or assumptions from prior conversations. The current state in the repository is the _only_ source of truth.

### 2. Planning Mode Workflow

- Before making changes to source files:
  1. Inspect the workspace structure.
  2. Create or update `implementation_plan.md` in the artifact folder.
  3. Wait for user or board review and approval.
  4. Create `task.md` in the artifact directory to track progress step-by-step.

### 3. Missing Documentation Policy

- If you find a task that lacks specifications, or code variables that don't match the dictionary:
  - **STOP.**
  - Flag the missing file or specification to the user.
  - Do not create arbitrary mocks or guess business logic invariants.

### 4. Code & Doc Sync

- Every time a class or logic boundaries are changed, matching tests and documentation files (like `walkthrough.md` and `PROJECT_STATUS.md`) must be updated in the same commit.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the AI Collaboration playbook.
