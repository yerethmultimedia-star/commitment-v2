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

---

## 1. Architecture Review

_Validate against `system-prompt.md` (Architecture Reviews)_

- ✅ **Aggregate Ownership:** [Confirm aggregate versioning and state fact rules.]
- ✅ **Shared Kernel Purity:** [Confirm no domain coupling occurs.]
- ✅ **Security Check:** [PII protection, secure storage, rate-limiting, and credentials validation.]

---

## 2. Product Review

_Validate against `system-prompt.md` (Product Reviews)_

- ✅ **User Value:** [How did this slice deliver immediate value to the user?]
- ✅ **Demonstrability:** [Explain how this can be shown in under 2 minutes.]
- ✅ **UX Friction:** [How did this reduce friction or motivate the user?]
- ✅ **Recommendability:** [How does this make the product easier to recommend?]

---

## 3. UX Review

_Validate against `system-prompt.md` (UX Reviews)_

- ✅ **Theme Adaptability:** [Verify layout compiles and renders beautifully across Sunrise, Midnight, Forest.]
- ✅ **Design Token Exclusivity:** [Verify that all spacing, typography, radii, elevations, and semantic colors are mapped to design tokens.]
- ✅ **Dynamic Assets & Motion:** [Verify animations, icons, and illustrations resolve dynamically via tokens.]
- ✅ **Widget Registry Plugins:** [Confirm dashboard widgets are registered as modular plugins in the WidgetRegistry.]

---

## 4. Localization Review

_Validate against `system-prompt.md` (Localization Reviews)_

- ✅ **i18n & Localization SDK:** [Verify translations, dates, and number formats utilize the `@commitment/localization` SDK.]
- ✅ **i18n Prop compliance:** [Confirm Design System components accept keys (i18nKey) instead of pre-computed translation strings.]

---

## 5. Performance Review

_Validate against `system-prompt.md` (Performance Reviews)_

- ✅ **Render and Bundle Budget:** [Confirm no extra global context, lists are virtualized, bundle impact is low, lazy loading is preserved, and render behaviors are optimized.]

---

## 6. Platform Review

_Validate against `system-prompt.md` (Platform Reviews)_

- ✅ **Offline Readiness:** [Verify offline functionality, conflict sync design, and rollback optimistic updates.]
- ✅ **State Management Purity:** [Confirm React Query is used for server caching, Zustand for global UI state, and local component state for UI transients.]

---

## 7. Quality Review

_Validate against `system-prompt.md` (Quality Reviews)_

- ✅ **Technical Debt Log:** [Describe any hacks, mocks, in-memory repository adapters, or temporal elements added.]

| Deuda                  | Estado                | Sprint de Eliminación | Owner  |
| :--------------------- | :-------------------- | :-------------------- | :----- |
| [Ej. InMemory Adapter] | [Temporal / Aceptada] | [Ej. VS-031]          | [Name] |

- ✅ **API Contract & Evolution:** [Confirm backwards compatible DTO changes, REST verbiage correctness, bounded context alignment, and mapping decouple.]
- ✅ **Feature Independence:** [Confirm feature module can be removed cleanly, relies only on public contracts, and encapsulates its own translation and hook logic.]

---

## Slice Value Evaluation

| Métrica               | Resultado                        |
| :-------------------- | :------------------------------- |
| Valor para el usuario | [⭐ al ⭐⭐⭐⭐⭐]               |
| Valor técnico         | [⭐ al ⭐⭐⭐⭐⭐]               |
| Impacto visual        | [Bajo / Medio / Alto / Muy alto] |
| Reutilización         | [Baja / Media / Alta]            |
| Riesgo                | [Bajo / Medio / Alto]            |
| Deuda técnica añadida | [Ninguna / Listada]              |

---

## Verification Results

- Total Tests: [Number]
- Linting: Passed
- Build: Passed
```
