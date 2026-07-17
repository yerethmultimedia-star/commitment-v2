# Design System — Public API Surface

**Design System v1** (conceptual, not an npm version — this marks the point where a change stops
being "a refactor" and starts being "a migration"). Frozen 2026-07-15 at the end of the Foundation
phase. Only the contract — no implementation detail, no props documentation (see
`docs/components/*.md` for that). Purpose: make a breaking change immediately visible by diffing
this file.

## Tone / State

```ts
Badge: (i18nKey | label) & { tone?, variant?, size?, shape?, iconStart?, iconEnd?, accessibilityLabelI18nKey?, accessibilityHintI18nKey?, testID? }
StatusIndicator: (i18nKey | label) & { tone?, size?, icon?, showDot?, orientation?, truncate?, accessibilityLabelI18nKey?, testID? }
```

## Metrics

```ts
MetricCard: (i18nKey | label) & { value, tone?, icon?, onPress?, testID? }
StatCard: (i18nKey | label) & { value, deltaLabel?, deltaTone?, visual?, onPress?, testID? }
ProgressMetric: (i18nKey | label | neither) & { progress, variant?, size?, tone?, showPercentage?, testID? }
```

## Containers

```ts
Card: { variant?, selectable?, selected?, clickable?, disabled?, loading?, focusable?, onPress?, accessibilityLabelI18nKey?, accessibilityLabelI18nParams?, testID?, ...YStackProps }
  ⚠️ YStackProps inheritance flagged for removal — TECH_DEBT.md Item 12 (TD-012). Do not treat the
  full YStackProps surface as stable; only the explicit props above are covered by this contract.
```

## Layout (sections)

```ts
SectionPrimitive: { title?, subtitle?, action?, size?, showDivider?, spacing?, children?, testID?, accessibilityLabelI18nKey? }
SectionHeader: { title?, subtitle?, action?, size?, testID?, accessibilityLabelI18nKey? }
FormSection: { title?, subtitle?, action?, spacing?, children?, testID?, accessibilityLabelI18nKey? }
SettingsSection: { title?, subtitle?, action?, spacing?, children?, testID?, accessibilityLabelI18nKey? }
```

## Feedback

```ts
FeedbackState: { icon?, illustration?, title?, description?, primaryAction?, secondaryAction?, tone?, spacing?, fullscreen?, testID?, accessibilityLabelI18nKey? }
LoadingState: { icon?, title?, description?, spacing?, fullscreen?, testID?, accessibilityLabelI18nKey? }
EmptyState: { icon?, illustration?, title?, description?, primaryAction?, secondaryAction?, spacing?, fullscreen?, testID?, accessibilityLabelI18nKey? }
ErrorState: { icon?, illustration?, title?, description?, primaryAction?, secondaryAction?, spacing?, fullscreen?, testID?, accessibilityLabelI18nKey? }
```

## Form controls

```ts
Button: { i18nKey, variant?, tone?, size?, loading?, disabled?, iconStart?, iconEnd?, fullWidth?, destructive?, loadingTextI18nKey?, confirmHaptic?, preventDoublePress?, testID?, analyticsId?, onPress? }
Input: (see Input.tsx — labelI18nKey/placeholderI18nKey/accessibilityLabelI18nKey family)
TextArea, Switch, IconButton: (see docs/components/ if/when documented — not yet written, pre-date this Foundation phase)
```

## Typography

```ts
TextBase, Headline, Title, Body, Caption, Label: { i18nKey | children } & TypographyRole/Tone/standard text props
```

## Modal / Portal / Layout primitives (pre-date this Foundation phase, contract stable but undocumented under docs/components/)

```ts
(ModalPrimitive, BottomSheet, ConfirmationDialog, ActionSheet, Dialog);
(Portal, PortalProvider, usePortalContext);
(Stack, Inline, Surface, Container, Section, SafeArea);
```

---

## How to use this file

- **Adding a prop to an existing component:** update this file in the same change.
- **Adding a new component:** only after it has a second real consumer justifying its existence
  (per the Contribution Policy in `docs/components/README.md`) — add it here once built.
- **Removing/renaming a prop:** this is a breaking change to "Design System v1" — treat it as a
  migration (find every call site first), not a quick refactor.
- **This file does not replace `docs/components/*.md`** — those explain _why_/_when_; this file
  only tracks _what exists_, for fast breaking-change detection.
