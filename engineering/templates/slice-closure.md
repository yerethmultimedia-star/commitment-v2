# Slice Closure Template

Use this template to generate the `vs-XXX_completion_report.md` artifact when closing a slice.

```markdown
# VS-XXX Completion Report ([Capability Name])

## Goal

Brief summary of the business value and goal of the slice.

## Implementation Details

### Domain Evolution

- Summary of aggregate changes, invariants added, and rules enforced.
- Summary of domain tests verifying idempotency and terminal states.

### Application Layer (CQRS)

- Handlers, commands, and results created.
- How domain exceptions are mapped.

### API & Infrastructure

- Controller endpoints exposed.
- Framework adapters registered.
- Input validation implemented.

## Architecture Review

_Validate against `engineering/prompts/permanent/architecture-review.md`_

- ✅ **Aggregate Ownership:** [Explanation]
- ✅ **Lean Handlers:** [Explanation]
- ✅ **Event Integrity:** [Explanation]
- ✅ **Shared Kernel Purity:** [Explanation]

## Verification Results

- Total Tests: [Number]
- Linting: Passed
- Build: Passed
```
