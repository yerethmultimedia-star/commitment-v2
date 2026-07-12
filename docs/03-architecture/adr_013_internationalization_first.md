# ADR-013: Internationalization First & Declarative UI Manifesto

## Status

Approved (Active)

## Context

Commitment is a premium product designed for international audiences. Hardcoded strings, ad-hoc string formatting, and direct localization library imports inside visual features lead to technical debt, translation gaps, and accessibility failures (e.g. screen readers not picking up localized descriptors).

We need an architectural standard that enforces a pure, declarative internationalization strategy, where feature components only supply keys, and the Design System handles resolution.

## Decision

We enforce the following seven mandatory internationalization rules across the entire codebase.

### Rule 1 — Mandatory Internationalization (Zero Hardcoded Text)

No user-facing text may be hardcoded directly inside any Feature component or screen. This encompasses:

- Titles and Subtitles
- Buttons and Touchables
- Input Placeholders and Form Labels
- Error Messages, System Alerts, and Dialog Dialogs
- Snackbars, Tooltips, and Loaders
- Empty States and Dashboard Widgets
- Tab Navigation item labels
- Accessibility labels and hints (VoiceOver/TalkBack)

All visible copy must resolve through the Localization SDK.

### Rule 2 — No Feature component may call `t()`

Features must not import or invoke `t()` directly. Instead, localization is resolved declaratively by the Design System components.

**Incorrect:**

```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <Title>{t('dashboard.hero.title')}</Title>;
```

**Correct:**

```tsx
import { Title } from '@commitment/design-system';
return <Title i18nKey="dashboard.hero.title" />;
```

### Rule 3 — Parallel Localizations Updates

Any change adding new translation keys must update English (`en/common.json` or `en/tasks.json` etc.) and Spanish (`es/common.json` or `es/tasks.json` etc.) localizations simultaneously. No key may be left in only one language.

### Rule 4 — Absolute Prohibition of Hardcoded Literals

Feature pull requests and code reviews must reject any visual components containing direct string children like `<Text>Save</Text>` or `<Button>Create</Button>`.

### Rule 5 — Accessible String Translation

All accessibility labels, hints, screen announcements, and focus descriptors must pass through translation keys rather than direct string literals.

```tsx
<IconButton accessibilityI18nKey="accessibility.backButton" iconToken="arrow-left" />
```

### Rule 6 — Declarative Widget Registries

All registered widgets in `WidgetRegistry` must provide `titleI18nKey`, `descriptionI18nKey`, and `emptyStateI18nKey` properties. Direct text properties are strictly prohibited.

### Rule 7 — Definition of Done

No task, slice, or pull request is considered complete until all localizations are fully updated, verified, and compiled.

## Consequences

- Prevents technical debt and translation gaps.
- Guarantees clean separation between localization and presentation layers.
- Simplifies testing and accessibility verification.
