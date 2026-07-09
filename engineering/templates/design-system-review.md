# Design System Review Template

## Design System Verification (Rule #97)

- [ ] **Component Reusability:** Verify that no visual components are duplicated, and existing elements from `@commitment/design-system` are extended.
- [ ] **Role-Based Semantic Colors:** Confirm that all UI colors map to semantic roles (e.g. `background`, `surface`, `contentPrimary`, `interactive`, `success`) rather than ad-hoc palette configurations.
- [ ] **Motion Tokens Compliance:** Confirm that animations use the curves and duration values configured in the design system motion tokens (e.g. `fast`, `spring`, `cardEntrance`) that vary dynamically per theme.
- [ ] **Icon & Illustration Tokens:** Confirm that icons and empty/loading states illustrations resolve dynamically via tokens (e.g. `theme.icons.success`, `theme.illustrations.emptyCommitments`) rather than hardcoded component imports.
- [ ] **Widget Plugin System:** Confirm that dashboard widgets are registered as modular plugins in the `WidgetRegistry` to support future modularity and customizability.
- [ ] **Zero Hardcoded Spacing/Margins:** Verify that no hardcoded layout spaces or margins exist in the layout classes. All spacings must map to spacing tokens.
- [ ] **Cross-Platform Preparation:** Verify that the component's style bindings are platform-agnostic, enabling smooth reuse across React Native Web and Mobile targets where possible.
- [ ] **Cross-Theme Compatibility:** Verify that the layout compiles and renders correctly under all three experience themes:
  - [ ] ☀️ **Amanecer (Sunrise)**
  - [ ] 🌙 **Medianoche (Midnight)**
  - [ ] 🌿 **Bosque (Forest)**
