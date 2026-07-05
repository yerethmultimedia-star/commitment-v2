# Investigation Prompt – tsconfig 2.json

```text
### Guidance on `apps/backend/tsconfig 2.json`

Do not modify this file.

First determine whether it is part of the product or simply a duplicate or temporary artifact.

---

## Primary Objective
The objective of this iteration is to deliver **VS‑003 (Pause Commitment)**.  The investigation regarding `tsconfig 2.json` is only a **support activity**.  Do **not** allow this investigation to become the focus of the iteration.  Once the Definition of Done for the investigation is reached, immediately resume implementation of VS‑003 until the capability is complete.

---

## Investigation
**Timebox this investigation to a maximum of 10 minutes.**

1. Search the repository for every reference to `tsconfig 2.json`.  Check:
   - `package.json` scripts
   - tsconfig `extends` fields
   - Jest configuration
   - Turbo configuration
   - VS Code workspace settings
   - GitHub Actions / CI pipelines
   - Any other build tooling

2. Produce a short report containing:
   - Is the file used? (Yes / No)
   - Which tool references it?
   - Why does it exist?
   - Is it part of the official build?

3. Decision

### If the file is NOT used
- Do not modify it.
- Do not delete it during VS‑003.
- Register it as a future Maintenance / Cleanup candidate.
- **Stop the investigation**.
- Immediately continue implementing VS‑003.

### If the file IS used
Provide:
- Which tool consumes it.
- Why it exists.
- Why the current configuration is insufficient.
- Concrete evidence (compiler error, failing build, failing test, etc.).
- The smallest possible change required.

**Wait for approval before making any modification.**
```

---

## Engineering Reminder

The Engineering Foundation Freeze is **ACTIVE**. Configuration, governance, repository structure, build pipeline, tooling, and monorepo structure are frozen.

A configuration change is allowed **only if**:

1. It blocks implementation of the current Product Capability.
2. The issue is demonstrated with objective technical evidence.
3. The proposed change is the smallest possible solution.
4. The change receives explicit approval before implementation.

Infrastructure work must never interrupt delivery of the current Product Capability.

Priority order:

1. Correctness
2. Domain Integrity
3. Readability
4. Product Value
5. Performance
6. Infrastructure

---

## Definition of Done

The investigation is complete **only when ONE** of the following is true:

- The file is confirmed **unused** and has been registered as a cleanup candidate.
- The file is **required**, supported by objective evidence, and a change proposal has been submitted for approval.

Immediately after reaching one of these outcomes, **return to the implementation of VS‑003 (Pause Commitment)**.

```

```
