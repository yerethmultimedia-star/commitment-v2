# Theme Review Template

## Theme Verification (Rule #96)

- [ ] **Cross-Theme Rendering:** Confirm that all modified or new UI components render correctly and beautifully under all three experience themes:
  - [ ] ☀️ **Amanecer (Sunrise)**
  - [ ] 🌙 **Medianoche (Midnight)**
  - [ ] 🌿 **Bosque (Forest)**
- [ ] **Semantic Color Roles:** Verify that all color attributes refer to role-based tokens (e.g. `background`, `surfaceRaised`, `contentPrimary`, `interactive`, `success`) rather than ad-hoc palette configurations.
- [ ] **Dynamic Motion Tokens:** Verify that animations and transitions utilize curves and timings configured dynamically per theme (e.g. Midnight uses slower, elegant transitions; Sunrise uses faster, dynamic ones).
- [ ] **Dynamic Icon & Illustration Tokens:** Confirm that icons and empty/loading states illustrations resolve dynamically via tokens (e.g. `theme.icons.success`, `theme.illustrations.emptyCommitments`).
- [ ] **Widget Plugin Integration:** Confirm that dashboard widgets register as plugins in `WidgetRegistry`.
- [ ] **Design Tokens Compliance:** Verify that zero hardcoded colors (hex, RGB) or custom elevations/radii/spacings are used in components. All styles must map back to design system tokens.
- [ ] **Reusable ThemePreviewCard:** Confirm that any theme thumbnail preview in the view is implemented by invoking the reusable `ThemePreviewCard` component.
- [ ] **Theme Adaptability (Assets & States):** Verify that charts, illustrations, graphs, and system states (Empty, Loading, Error) automatically adapt their assets and colors to the active theme.
- [ ] **Smooth Transition Animation:** Verify that switching themes triggers a smooth, hardware-accelerated visual transition taking between 150–250 ms.
- [ ] **Appearance Domain Context:** Verify that the `Appearance` settings (Theme, Language, Accessibility, Motion, Typography, Preferences) are treated as a core Domain object and loaded/saved via the abstract `AppearanceRepository` port.
- [ ] **Shared Engine Package:** Verify that the component utilizes `ThemeEngine` imported from `@commitment/theme-engine` (shared workspace package) and is completely decoupled from concrete theme manifestations.
- [ ] **ThemeManifest Versioning:** Verify that manifests include and check `version` metadata to support future migrations.

## Theme Localization (i18n)

- [ ] **Localized Metadata:** Theme display names and descriptions are mapped to localization keys (e.g. `theme.sunrise.name`, `theme.sunrise.description`) with no hardcoded fallbacks.
- [ ] **Localized Selector & Previews:** All preview cards, mini-dashboards, buttons, and graphics in the Theme Selector use localized text keys.
- [ ] **i18nKey Property Compliance:** Verify that the Design System component receives localization keys as property parameters (e.g. `i18nKey="..."`) instead of raw translated strings computed by the caller.
