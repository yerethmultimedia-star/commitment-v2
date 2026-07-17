# Commitment v2 — Project Status

Version: 1.33.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-16

---

## Current Phase

**Design System Adoption (2026-07-15)**, resumed at Goals. The **Stabilization & Product Audit**
gate that previously blocked this is now partially cleared, not fully closed — status verified
against code on 2026-07-15, not restated from memory:

- The audit's sole **Critical** finding (P1/TD-8, invisible submit buttons on Commitment/Habit
  forms) is **fixed and verified**.
- A separate, narrower mini-phase — TD-015 keyboard accessibility (no interactive element was
  Tab-reachable on web) plus 2 same-day follow-up regressions (nested `<button>`, missing UA reset,
  invisible focus ring) — is **fixed and verified** (216/216 design-system tests, live keyboard-only
  Playwright pass). See `TECH_DEBT.md` Item 15.
- P3/TD-9 (Badge/Chip primitive) is also fixed (2 of 3 call sites; third is now dead code, not
  deleted).
- **4 High findings remain open, tracked but not blocking per explicit 2026-07-15 direction:** P2
  (duplicated screen titles), P4 (Tasks screen interaction pattern), P5 (Goals sub-tab text
  truncation), A1/TD-10 (Goal aggregate has no backend module). Medium/Low findings from the audit
  are untouched. See `engineering/governance/architecture_product_audit_2026Q3.md` v1.1.0 and
  `TECH_DEBT.md` v1.14.0 for full evidence per item.

Underlying phase: Vertical Slice Phase (Product Capabilities), Design System Adoption sub-track.

## Current Sprint

**VS-031 — Product Experience Foundation: `Completed`, not `Closed`.** What shipped as VS-031 grew
far past its original Block A (Dashboard Layout Engine, Recommendation Engine): it now also
includes a full Habit vertical, Goal/Milestone aggregate + Goal Workspace, an Insights engine,
`CommitmentPriority` threaded through the full stack, a 4-theme Theme Engine redesign, a Coach
recommendation UI, a repo-wide accessibility/design-token pass, and a canonical demo dataset. Full
evidence and a 7-category review: `engineering/governance/vs031_completion_report.md` (v2.2.0).
Committed as `1a3f598`/`7853f22`/`7cdf6cf`. **Not `Closed`:** whether the post-Block-A work should
retroactively be scoped as one sprint or split into new sprint numbers per ADR-016 Rule 2 is still
an open product decision, now joined by the stabilization audit's own findings as additional
context for that decision.

- **VS-032 — Design System Adoption: `Closed` (2026-07-16).** All 9 screens complete: Stabilization
  ✅, Today ✅, Coach ✅, Calendar ✅, Goals ✅, Habits ✅, Tasks ✅ (functional-audit round found and
  fixed 2 blockers), Insights ✅ (product-audit standard), Profile ✅ (found and fixed a demo/real
  seam violation), Appearance ✅ (closed 2026-07-16 — found and fixed a screen-reader accessibility
  gap in the theme picker; found, logged, not fixed a High-Contrast setting with no real effect, see
  `TECH_DEBT.md` Item 28). **Product Polish is now the active milestone** — see below. Not yet
  reconciled against the open VS-032-scoping question below (whether this and VS-031's post-Block-A
  work should retroactively be split into separate sprint numbers) — this note records what's
  actually happened, not a resolution of that question.
- Sprints **VS-025** (Dashboard Experience Foundation), **VS-026** (Theme Engine Foundation),
  **VS-027** (Experience Themes), and **VS-028** (Widget Registry) are self-labeled complete per
  their respective commits. **VS-029** (Motion System) has no commit evidence and remains
  Planned. **VS-030** (Accessibility & Polish) is self-labeled complete, but its fitness against
  the roadmap's accessibility criteria has not been independently verified — see
  `engineering/governance/roadmap_reconciliation_2026Q3.md` §2.
- Previous Sprint **VS-024** (Activity Record History) has been successfully closed.
- Full reconciliation of this status against git history: `engineering/governance/roadmap_reconciliation_2026Q3.md`.

---

## Estado general del proyecto

### Reauditadas el 2026-07-14 (evidencia: `engineering/governance/vs031_completion_report.md` v2.0.0 — tests, tsc, recorrido Playwright de 12 pantallas)

| Área                 | Progreso | Madurez       | Observaciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------------- | :------: | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme Engine         | **90%**  | 🟢 Producción | 4 temas rediseñados, invariantes semánticas verificadas, auditoría WCAG hecha. Falta perf/bundle.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Dashboard Experience | **85%**  | 🟢 Producción | Engine + Recommendation + Hero card + Coach widget + FloatingTabBar verificados funcionando.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Dashboard Widgets    | **80%**  | 🟢 Producción | Widget Registry con ~10 widgets activos, verificado vía Playwright. Sin medición de perf.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Habits               | **97%**  | 🟢 Producción | Design System Adoption + UX redesign + Goal linkage opcional, todo cerrado (2026-07-15). Item 18 resuelto.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Tasks                | **95%**  | 🟢 Producción | Fase 2 VS-032 cerrada (2026-07-16) tras auditoría funcional completa — ver detalle abajo. Item 23 (Medium, pre-existente, no bloqueante) queda abierto.                                                                                                                                                                                                                                                                                                                                                                       |
| Goals                | **90%**  | 🟢 Producción | Design System Adoption completo (2026-07-15) — ver checkpoint. Falta backend module (A1/TD-10, High, tracked).                                                                                                                                                                                                                                                                                                                                                                                                                |
| Insights             | **94%**  | 🟢 Producción | VS-032 cerrada (2026-07-16) — auditoría de producto completa. "Hábitos de Hoy" reemplazado por métricas reales de consistencia (Item RI-5). 1 hallazgo de UX diferido a Product Polish (Item 26). **UI Freeze declarado** junto con Today/Coach/Calendar/Goals/Habits/Tasks.                                                                                                                                                                                                                                                  |
| Profile              | **88%**  | 🟢 Producción | VS-032 cerrada (2026-07-16). Encontrado y corregido: la pantalla mostraba la identidad demo siempre, incluso con Demo Mode apagado (Item RI-6) — ahora pasa por el mismo seam demo/real que el resto de la app. Migrado a componentes DS (Button/Switch). Falta backend real de Identity/Profile (Item 27, Medium, paralelo a TD-10). Sumada al UI Freeze.                                                                                                                                                                    |
| Appearance           | **90%**  | 🟢 Producción | VS-032 cerrada (2026-07-16) — último ítem del sprint. 4 temas + persistencia (SecureStore) + Preview (crossfade) + Reducir Movimiento verificados vía Playwright, clicks reales. Migrado a AppScreen/DS (Body/Switch/SectionHeader/LoadingState). Encontrado y corregido: el picker de temas no exponía el tema seleccionado a lectores de pantalla (`aria-selected` nunca se emitía — RI-7). Encontrado, no corregido: "Alto contraste" no tiene ningún efecto visual real (Item 28, Medium, diferido). Sumada al UI Freeze. |
| Coach                | **60%**  | 🟡 Beta       | UI shell + reglas de recomendación reales verificadas; sin IA real (fuera de alcance).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Accesibilidad        | **80%**  | 🟡 Beta       | Pase de tokens/labels en ~20 archivos este sprint; no auditado contra checklist WCAG formal.                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### No reauditadas desde 2026-07-08 (pendientes)

| Área                 | Progreso | Madurez          | Observaciones                                                        |
| :------------------- | :------: | :--------------- | :------------------------------------------------------------------- |
| Dominio              | **100%** | 🟢 Producción    | Estable                                                              |
| Backend              | **97%**  | 🟢 Producción    | Pendiente persistencia definitiva y optimizaciones                   |
| Arquitectura         | **100%** | 🟢 Producción    | Congelada                                                            |
| Mobile Platform      | **92%**  | 🟢 Producción    | Base consolidada                                                     |
| Internacionalización | **100%** | 🟢 Producción    | Transversal                                                          |
| Design System        | **35%**  | 🟡 Beta          | En expansión — probablemente subestimado tras Phase 8, no reauditado |
| UX/UI                | **65%**  | 🟡 Beta          | En evolución                                                         |
| Offline              |  **5%**  | ⚪ Planificado   | Arquitectura preparada                                               |
| Cloud Sync           | **10%**  | ⚪ Planificado   | Preparado para sincronización                                        |
| Analytics            | **15%**  | 🔵 Investigación | Sin desarrollo funcional                                             |
| AI Coach             |  **0%**  | 🔵 Investigación | Pendiente                                                            |

_Nota (2026-07-14): la tabla se dividió en dos bloques para no dejar números contradictorios en el
mismo documento (ver feedback de usuario del 2026-07-14). El primer bloque tiene evidencia directa
de esta sesión; el segundo sigue siendo el mismo estimado no verificado desde 2026-07-08 y necesita
su propia auditoría dedicada — no se inventan números para áreas que no se verificaron._

---

## Progreso global

**Progreso total estimado:** **≈88%**

_Nota: No significa que el usuario vea el 87% de funcionalidades, sino que **la plataforma necesaria para soportarlas** ya existe._

---

## Slice Value Evaluation (Expected for VS-025)

| Métrica               | Resultado         |
| :-------------------- | :---------------- |
| Valor para usuario    | ⭐⭐⭐⭐⭐        |
| Valor técnico         | ⭐⭐⭐ shadow     |
| Impacto visual        | Alto              |
| Reutilización         | Muy alta          |
| Riesgo                | Bajo              |
| Deuda técnica añadida | Ninguna / Listada |

---

## Próximos slices

- ✅ **VS-025 — Dashboard Experience Foundation** (Completed, self-labeled)
- ✅ **VS-026 — Theme Engine Foundation** (Completed, self-labeled)
- ✅ **VS-027 — Experience Themes** (Completed, self-labeled)
- ✅ **VS-028 — Widget Registry** (Completed, self-labeled)
- ⚪ **VS-029 — Motion System** (Planned; no commit evidence found)
- ✅ **VS-030 — Accessibility & Polish** (Completed, self-labeled; accessibility criteria not independently verified)
- ✅ **VS-031 — Product Experience Foundation** (Completed, verified — see `vs031_completion_report.md` v2.2.0; committed as `1a3f598`/`7853f22`; not `Closed` — retroactive sprint-scoping decision still open)

1. ✅ **VS-032 — Design System Adoption** (`Closed`, 2026-07-16; supersedes the stale
   "VS-032 — Calendar" single-screen framing — Calendar was completed as one screen within it, not
   the whole sprint). Three blocks per 2026-07-15 direction — full detail in `ENGINEERING_BOARD.md`:
   - _Foundation_ (done, no longer re-audited per screen): Theme Engine ✅, Accessibility ✅,
     Keyboard Navigation ✅, Design System Foundation ✅.
   - _Design System Adoption_ (all 9 screens ✅): Today, Coach, Calendar, Goals, Habits, Tasks
     (Fase 2, 2026-07-15 — Goal linkage optional + score-based Priority-of-the-day, see
     `TECH_DEBT.md` Item 22), Insights (2026-07-16), Profile (2026-07-16), **Appearance**
     (2026-07-16 — closing checkpoint, see `TECH_DEBT.md` RI-7/Item 28).
2. **Milestone: Product Polish** (active as of 2026-07-16 per the user's VS-032 closing evaluation
   — deliberately _not_ named `VS-033`, since it measures something categorically different from
   every VS-032 checkpoint; `VS-033` stays reserved for Reminder Settings below). Three explicit
   freezes in effect until this milestone is scoped: **domain** (no new aggregates/entities, bugs
   only), **Design System** (no new components unless Critical, refinement only), **navigation**
   (no screens move, no flows change, polish only). Does **not** measure bugs-closed or
   components-migrated (VS-032's retired metrics) — measures whether the product _feels
   exceptional_: time-to-complete-frequent-tasks, visual consistency, premium perception,
   microinteractions, animation quality, copy, onboarding, delight, fine-grained accessibility,
   perceived performance. Guiding question: not "¿qué pantalla sigue?" but "¿qué haría que
   Commitment pareciera una aplicación de Apple, Notion o Linear?" Scope carried over from deferred
   VS-032 findings: Insights stat-card affordance (`TECH_DEBT.md` Item 26), Profile empty-state
   copy for the no-backend case (Item 27's note), Appearance's High-Contrast setting (Item 28).
   Lifts the UI Freeze on all 9 adopted screens once started — see `ENGINEERING_BOARD.md` v1.25.0.
   Full pillar definitions (Motion/Visual Language/Interaction Language/Content/Delight) and the
   working `Principios` list: `PRODUCT_POLISH_GUIDE.md` (new, v1.0.0).
3. **VS-033 — Reminder Settings**
4. **VS-034 — Recurrence Management**
5. **VS-035 — Offline First & Sync**
6. **VS-036 — Search / Filters** (reprogrammed from VS-031 per ADR-015)
7. **Candidate, not yet numbered — Historical/Analytics Engine.** Flagged 2026-07-16 during the
   Insights audit: almost everything Insights shows is computed live off _current_ state
   (`currentStreakDays`, `completedAt`, etc.) — there's no persisted daily/event history, which is
   exactly why "últimos 7 días"/"peor día de la semana" for Habits couldn't be built honestly this
   round (see `TECH_DEBT.md` RI-5). A real daily-snapshot or event-sourced history table would
   unlock weekly adherence, best/worst day, monthly trends, heatmaps, and materially better Coach/AI
   insights later — not a VS-032 concern, explicitly deferred to VS-033 or a future architectural
   cycle, not started.

---

## Principles & Rules

- DDD (Domain-Driven Design)
- CQRS (Command Query Responsibility Segregation)
- Event Sourcing Foundations
- Offline First
- Internationalization by Design
- **Architecture Review Framework** (system-prompt.md)
  - Architecture Reviews
  - Product Reviews
  - UX Reviews
  - Localization Reviews
  - Performance Reviews
  - Platform Reviews
  - Quality Reviews
- **Monorepo structure freeze** (Rule #93)

---

## 📜 Change History

- **v1.33.0 (2026-07-16):** `TECH_DEBT.md` Item 30 (Tamagui animations producing no visible CSS
  transition) resolved same day it was opened, via a short targeted investigation per user
  direction. Root cause: the installed Tamagui version's activating prop is `transition`, not
  `animation` (a version-specific rename this codebase's existing convention never caught up to),
  compounded by a closure-binding gotcha in how `createAnimations()`'s driver gets extended with
  custom presets. Both fixed. **Motion infrastructure is now fully working, verified end-to-end**
  via real Playwright presses on real components showing genuine interpolation, not just a code
  read. Full RCA: `TECH_DEBT.md` v1.32.0 (RI-12), `ENGINEERING_BOARD.md` v1.31.0.
- **v1.32.0 (2026-07-16):** Product Polish's first infrastructure work — Motion centralized in the
  Theme Engine (`ThemeMotion` real values across all 4 themes) and `packages/design-system`'s
  Tamagui animation config, per user direction to build infrastructure before resuming screen
  audits. Found and fixed a real dead-code bug (`useInteractionAnimation`'s `animation` field was
  computed but never applied on any of its 5 consumers). Discovered, logged, not resolved: Tamagui's
  `animation` prop produces no visible CSS transition anywhere in the app's web build even when
  fully wired — a deeper pre-existing gap (`TECH_DEBT.md` Item 30). Full detail: `TECH_DEBT.md`
  v1.31.0 (RI-11), `ENGINEERING_BOARD.md` v1.30.0, `PRODUCT_POLISH_GUIDE.md` v1.4.0.
- **v1.31.0 (2026-07-16):** VS-032 closing evaluation delivered by the user (Principal Architect
  role) — Arquitectura A, Calidad del proceso A+, UX A-. Full detail and Product Readiness table:
  `ENGINEERING_BOARD.md` v1.25.0 "VS-032 — Final Evaluation". Redefined the next milestone
  accordingly: **Milestone: Product Polish**, not `VS-033` — three explicit freezes (domain,
  Design System, navigation) and a measurement axis that's no longer bugs-closed/components-
  migrated but whether the product _feels exceptional_ (premium perception, microinteractions,
  animation, copy, onboarding, delight, perceived performance). Roadmap entry above updated to
  match.
- **v1.30.0 (2026-07-16):** VS-032 — Appearance closed; **VS-032 formally declared `Closed`**
  (all 9 screens done). Scoped tightly per explicit user direction — no new capabilities, only
  verification + bug fixes: 4 themes, persistence, accessibility, contrast, Preview, Demo Mode,
  Theme Engine consistency.

  ```text
  VS-032 — Appearance

  Estado: ✅ Completed (2026-07-16) — last screen of VS-032

  Verificación funcional: los 4 temas (Claro/Amanecer/Medianoche/Bosque)
  seleccionan correctamente, persisten a través de navegación in-app Y de un
  reload completo (SecureStore), y son independientes de Demo Mode (ajuste de
  dispositivo, no de datos — correcto arquitectónicamente, no pasa por el seam
  demo/real). Preview con crossfade (ViewShot + Reanimated) funciona sin
  errores. Reducir Movimiento se verificó en código: salta por completo la
  captura/crossfade en vez de solo acortar su duración.

  Auditoría de accesibilidad: encontrado y corregido un bug real — el picker
  de temas (ThemePreviewCard.tsx) fijaba accessibilityState={selected} como
  prop cruda de React Native en vez de pasar por
  toPlatformAccessibilityProps (el helper que usa el resto de la app),
  y react-native-web nunca traduce accessibilityState a aria-* por su cuenta.
  Confirmado vía inspección de DOM en Playwright: aria-selected nunca se
  emitía para ninguna de las 4 tarjetas, antes o después de seleccionar.
  Corregido; reverificado que aria-selected ahora refleja correctamente cuál
  tema está activo. Orden de Tab por teclado confirmado intacto (RI-7).

  Auditoría de contraste: verificados independientemente (fórmula WCAG de
  luminancia relativa) los pares contentPrimary/contentSecondary contra
  background/surface de los 4 temas — todos pasan AA texto normal (4.5:1),
  con el caso más ajustado en Bosque (contentSecondary/background, 4.48:1,
  esencialmente en el umbral). Los pares contentOnAccent/contentOnSemantic ya
  estaban documentados y verificados en el propio código fuente del
  theme-engine.

  Encontrado, NO corregido (decisión de alcance, no bug bloqueante): "Alto
  contraste" no tiene ningún efecto visual real en ningún lugar de la app —
  ThemeResolver.resolve() recibe el flag pero nunca ajusta colores (comentario
  propio: "podríamos... aquí" — nunca implementado), y ningún consumidor
  posterior lee isHighContrast. Confirmado por código Y empíricamente
  (Playwright: estilos computados idénticos byte-a-byte antes/después del
  toggle). No es una violación de WCAG AA (los 4 temas ya pasan AA sin este
  ajuste) ni una regresión — es una promesa de UI que nunca se implementó.
  Registrado como TECH_DEBT.md Item 28, con dos resoluciones honestas
  propuestas (implementar de verdad, o quitar el control) para decidir en
  Product Polish.

  Migración a Design System: AppearanceSettingsScreen migrada de ScrollView
  crudo + Text/Switch de Tamagui a AppScreen + Body/SectionHeader/Switch/
  LoadingState de @commitment/design-system (mismo patrón ya usado en las
  8 pantallas previas). LanguageSettingsScreen ya estaba correctamente
  adoptada — solo se le agregó el mismo LoadingState que faltaba (ambas
  pantallas hacían "if (!settings) return null" sin estado de carga).

  Verificación: tsc limpio (mobile), Playwright con clicks reales (no force,
  no page.goto() intermedio salvo para probar el reload completo a propósito).
  ```

  Maturity: Appearance 90% (new row). **VS-032 formally `Closed`.** New
  **Product Polish Sprint** opened as the active milestone (not yet numbered
  — see roadmap below), lifting the UI Freeze once it actually starts. Full
  detail: `TECH_DEBT.md` v1.29.0 (RI-7, Item 28), `ENGINEERING_BOARD.md`
  v1.24.0.

- **v1.29.0 (2026-07-16):** VS-032 — Profile closed. Functional audit found the identity/plan card
  showed the hardcoded demo user ("Jordan Rivera") **even with Demo Mode off** — the only screen in
  the app not routing through the demo/real API-layer seam every other feature uses. Fixed with a
  new `features/profile/api/profile.api.ts` + `useProfile()` hook: Demo Mode on shows the full demo
  identity as before; off shows an honest minimal profile (no fabricated name/email/plan, avatar
  initials from the real identityId) — there's no real Identity/Profile backend to fetch from yet
  (new `TECH_DEBT.md` Item 27, parallel to Goal's TD-10/A1). Also migrated raw Tamagui
  `Text`/`Button`/`Switch` to `@commitment/design-system` equivalents. Verified via Playwright in
  both Demo Mode states and Midnight theme. Full detail: `TECH_DEBT.md` v1.28.0 (RI-6, Item 27).
  Profile added to the UI Freeze list. **Appearance is the last VS-032 Design System Adoption item
  before Product Polish.**
- **v1.28.0 (2026-07-16):** Registered a roadmap candidate (not yet numbered): a Historical/Analytics
  Engine (persisted daily snapshots or event history), flagged by the user as the likely next real
  architectural pillar after VS-032 — almost everything Insights shows today is computed off current
  state, which is exactly why an honest weekly/best-worst-day habit metric couldn't be built this
  round. Explicitly not started, candidate for VS-033 or a later cycle. VS-032 roadmap note updated:
  Insights ✅, Profile next.
- **v1.27.0 (2026-07-16):** Insights' 2 UX findings resolved by explicit user decision. Finding 1
  (stat-card affordance) deferred to Product Polish — 3 valid options logged, none picked yet
  (`TECH_DEBT.md` Item 26). Finding 2 ("Hábitos de Hoy" duplicating Today) fixed now, because it
  "afecta la identidad del producto": replaced with **Racha promedio** + **Con racha activa** across
  all enabled habits — real consistency-over-time metrics, not a today-snapshot, and honestly
  computable from the existing domain model (no fabricated per-day history). Insights maturity
  92%→94%. **Declared a UI Freeze** on Today/Coach/Calendar/Goals/Habits/Tasks/Insights — the 7
  audited screens change only for bugs/accessibility/performance/explicit Product Polish decisions
  from here on, so Profile/Appearance work doesn't drift their style and require re-propagating it
  later. Full detail: `TECH_DEBT.md` v1.27.0 RI-5, `ENGINEERING_BOARD.md` v1.22.0.
- **v1.26.0 (2026-07-16):** VS-032 — Insights closed as a **product audit**, not a component-swap
  pass, per explicit user direction (using the Tasks incident as the template from the start, not
  after a false start this time):

  ```text
  VS-032 — Insights

  Estado: ✅ Completed (2026-07-16, product audit standard)

  Auditoría funcional: métricas cambian con datos reales (verificado completando
  una tarea in-app: "Tareas completadas" 7→8), productividad/deltas correctos
  (15 tests unitarios dedicados), sin tarjetas duplicadas o sin propósito.

  Auditoría de dominio: ninguna estadística asume que todo pertenece a un Goal —
  las 4 stat cards y Habit Consistency/Streak Highlight operan sobre TODAS las
  Tasks/Habits (independientes, ligadas a Goal, ligadas a Commitment), no filtran
  por goalId. Solo Goal Progress es (correctamente) goal-scoped por diseño.

  Auditoría de Design System: StatCard local duplicado eliminado (el StatCard de
  @commitment/design-system ya estaba construido para este caso exacto, nunca se
  usó); LoadingState/ErrorState/EmptyState migrados desde shared/ui/feedback
  (cierra más de TECH_DEBT Item 13); encontrado y corregido un bug de arquitectura
  más profundo: AppScreen no tenía background propio, causando un hueco claro bajo
  el contenido en pantallas cortas con cualquier tema no-default — corregido en el
  primitivo compartido, no por pantalla (afecta a las 12 pantallas que usan
  AppScreen, no solo Insights).

  Auditoría de accesibilidad: agregados accessibilityLabel a los círculos de racha
  semanal y las barras del gráfico de enfoque (antes ilegibles para lector de
  pantalla). Encontrado (no corregido, alcance mayor): los headers de navegación
  nativos ignoran el tema Experience activo (Midnight/Forest/Sunrise), siguen el
  esquema claro/oscuro del sistema — confirmado sistémico (afecta también Goal
  Workspace), registrado como Item 24.

  Auditoría de UX: 2 hallazgos reales, presentados para decisión de producto (no
  corregidos unilateralmente) — (1) solo 1 de 4 stat cards es interactiva sin
  ninguna señal visual que las distinga; (2) "Hábitos de Hoy" en Insights duplica
  el widget ya existente en Today, sin encajar en el enfoque semanal del resto
  de la pantalla.

  Verificación: tsc limpio (mobile + design-system), 225/225 tests design-system
  (2 snapshots actualizados, diff confirmado mínimo), 78/93 tests mobile (15
  fallos pre-existentes documentados, sin relación). Playwright con clicks reales
  y navegación in-app, ambos temas (Sunrise/Midnight) verificados visualmente.
  ```

  Full detail: `TECH_DEBT.md` v1.26.0 (Items 24/25, RI-3/RI-4).

- **v1.25.0 (2026-07-16):** Correction to v1.24.0. That entry marked Tasks `✅` on the strength of
  domain/CQRS/persistence verification — it had never undergone a real functional audit (actual
  clicks on the actual controls), and the user correctly refused to accept it as closed on that
  basis. The audit found two blockers, both fixed same-day, both re-verified:

  ```text
  VS-032 — Tasks

  Estado: ✅ Completed (2026-07-16, after functional audit + fixes)

  Bloqueantes encontrados durante la auditoría funcional:
  • FAB principal ("Nueva tarea") visualmente presente pero no clickeable — bug de
    stacking context en web (el FloatingTabBar ganaba el hit-test sobre el FAB).
  • demoTasksRepository mutaba el array en el sitio — refetch() no disparaba
    re-render sin un cambio de estado no relacionado (cambiar de pestaña).

  Causa raíz 1: zIndex del FAB atrapado dentro de stacking contexts propios del
  ScrollView, nunca compite al nivel del tab bar (sibling posterior sin z-index).
  Solución 1: FAB movido a <Portal>, re-envuelto en <Theme name={themeId}> (Portal
  vive fuera del Theme de AppearanceProvider — Item 20).

  Causa raíz 2: mutación in-place (unshift/asignación directa de propiedades) —
  list() devolvía siempre la misma referencia; React Query/useMemo comparan por
  referencia, nunca detectaban el cambio.
  Solución 2: demoTasks pasó de const a let + replaceDemoTasks(); cada método
  mutante ahora construye un array nuevo (mismo patrón que demoHabitsRepository
  ya usaba correctamente).

  Verificación: 12 tests Jest nuevos (referencia nueva en cada mutación) + Playwright
  con clicks reales (no force, no page.goto() intermedio) confirmando: FAB clickeable,
  creación/edición/completado reflejados de inmediato sin cambiar de pestaña, y una
  tarea real recién creada ganando el Hero de Today por score.

  Regla nueva: ENGINEERING_BOARD.md v1.19.0 — ninguna capacidad puede reportar
  "Ready for Production: Sí" solo con typecheck + tests + Playwright; se requiere
  auditoría funcional del flujo principal antes de cerrar el checkpoint.
  ```

  Maturity adjusted 92%→95% (verified, not just implemented). Full detail:
  `TECH_DEBT.md` "Resolved Issues — Lessons Learned" (v1.24.0), `ENGINEERING_BOARD.md` v1.19.0.

- **v1.24.0 (2026-07-15):** VS-032 Fase 2 closed — Tasks marked ✅ (92%, new row). The design doc's
  premise correction stands (no parallel "Priority Task" entity existed), but the user's Fase-2
  feedback expanded scope beyond the original v1.0.0 proposal: mutual-exclusivity invariant between
  Task.goalId/commitmentId, score-based Priority-of-the-day (not a fixed origin hierarchy), consistent
  Hero Card structure, a single unified "Relacionado con" selector in `TaskForm` (also closing a
  found-live edit-mode gap), and a real demo-verified case of a non-Commitment task winning the Hero.
  See `TECH_DEBT.md` Item 22 (resolution detail) and Item 23 (new Medium finding, deferred).
- **v1.23.0 (2026-07-15):** Habits Item 18 fully closed (Goal linkage now genuinely optional
  end-to-end), maturity 92%→97%. Phase 2 (Tasks) is now a design-proposal step — Task/Goal
  optionality plus consolidating Today's "Priority Task" into one Task concept — pending user
  approval before implementation starts. See `ENGINEERING_BOARD.md` v1.17.0.
- **v1.22.0 (2026-07-15):** P1/Critical global scroll regression — root-caused (missing
  `GestureHandlerRootView`, exposed by Postpone's new `BottomSheet`) and fixed at the app root.
  See `ENGINEERING_BOARD.md` v1.16.0 and `TECH_DEBT.md` Item 21.
- **v1.21.0 (2026-07-15):** Postpone rebuilt around a new Design System primitive
  (`DurationWheelPicker`, iOS Timer-style) — first new Design System component added since
  Stabilization closed, explicitly authorized by the user for this piece. See
  `ENGINEERING_BOARD.md` v1.15.0 and `TECH_DEBT.md` v1.20.0.
- **v1.20.0 (2026-07-15):** Habits UX redesign iteration 2 — radical list simplification per user
  review of iteration 1, secondary actions (Postpone/Archive/Goal) moved to the habit detail. See
  `ENGINEERING_BOARD.md` v1.14.0 and `TECH_DEBT.md` v1.19.0.
- **v1.19.0 (2026-07-15):** Habits UX redesign layered on top of the capability pass below —
  Apple Health/Fitness/Timers-inspired visual/motion quality pass, requested before starting Tasks.
  Maturity held at 92% (redesign is quality, not new coverage; Item 18 still the only real gap).
  See `ENGINEERING_BOARD.md` v1.13.0 and `TECH_DEBT.md` v1.18.0.
- **v1.18.0 (2026-07-15):** Habits marked ✅, maturity raised 80%→92% (remaining gap: Item 18,
  Habit↔Goal linkage has no UI path — High, tracked, not blocking). First capability-level pass
  (whole lifecycle + integration surface, not just the primary screen) — 3 real bugs found and
  fixed live. Tasks is next. See `ENGINEERING_BOARD.md` v1.12.0 and `TECH_DEBT.md` v1.16.0.
- **v1.17.0 (2026-07-15):** Goals marked ✅ in VS-032's Design System Adoption block, Goals maturity
  raised 75%→90% (remaining gap: A1/TD-10, Goal aggregate has no backend module — tracked, not
  blocking). Habits is next. See `ENGINEERING_BOARD.md` v1.10.0 for governance evidence pointers.
- **v1.16.0 (2026-07-15):** Restructured the VS-032 roadmap entry into the three blocks (Foundation
  / Design System Adoption / Product Polish) specified by explicit user direction, matching
  `ENGINEERING_BOARD.md` v1.8.0's new "Working Agreement for Design System Adoption" — platform
  stabilization is now treated as done and isn't re-audited per screen; only regressions, data loss,
  cross-feature architectural violations, WCAG AA failures, or Critical debt pause the adoption work
  going forward.
- **v1.15.0 (2026-07-15):** Closed the TD-015 keyboard-accessibility mini-phase (verified fixed —
  see `TECH_DEBT.md` Item 15) and, per explicit user direction, resumed Design System Adoption at
  Goals rather than treating it as still gated by the full Stabilization & Product Audit. Verified
  against code (not restated from memory) that the audit's Critical finding (P1/TD-8) and one High
  finding (P3/TD-9) are also already fixed, undocumented until now; 4 High findings remain open,
  tracked as debt, explicitly not blocking. See `architecture_product_audit_2026Q3.md` v1.1.0 and
  `TECH_DEBT.md` v1.14.0. Replaced the stale single-screen "VS-032 — Calendar" roadmap entry with
  what actually happened: VS-032 in progress as a screen-by-screen Design System Adoption sprint.
- **v1.14.0 (2026-07-15):** Entered a Stabilization & Product Audit phase per explicit direction —
  paused new feature work and new high-level docs (Product Capability Map, Bounded Context Map,
  Dependency Roadmap) until the audit's findings are resolved or triaged. See
  `architecture_product_audit_2026Q3.md`. Corrected the stale "none of this is committed" note now
  that VS-031 is committed (`1a3f598`/`7853f22`/`7cdf6cf`).
- **v1.13.0 (2026-07-14):** VS-031's working tree committed (`1a3f598`, `7853f22`) — supersedes
  v1.12.0's "uncommitted" note. Discovered `ARCHITECTURE.md`, `TECH_DEBT.md`, `RISK_REGISTER.md`
  already existed and were never read before this point — produced a discrepancy report (see
  `TECH_DEBT.md` Item 3, `RISK_REGISTER.md` Risk 1/3) rather than silently reconciling. Most
  notable finding: 26 Feature files violate the documented i18n Rule 2 (no direct `t()` calls in
  Features) — this contradicts the "Internationalization by Design" principle listed below and is
  now tracked as technical debt, not fixed.
- **v1.12.0 (2026-07-14):** VS-031 moved from `Active` to `Completed` (verified per
  `engineering/governance/vs031_completion_report.md` v2.0.0 — 399 tests passing, 12-screen
  Playwright walkthrough, 0 crashes) — not `Closed`; 218 files of working-tree changes remain
  uncommitted. Flagged (not fixed): `walkthrough.md` is severely stale (describes mobile as
  Flutter, only covers Sprint 0/1), predates this update, and needs a dedicated pass.
- **v1.11.0 (2026-07-12):** Reconciled against actual commit history (see
  `engineering/governance/roadmap_reconciliation_2026Q3.md`). Active Sprint moved from VS-025 to
  VS-031 (Product Experience Foundation, reassigned from Search/Filters per ADR-015). Marked
  VS-025–VS-028 and VS-030 Completed (self-labeled), left VS-029 Planned, updated Próximos slices,
  and flagged the progress/maturity table as unaudited since 2026-07-08.
- **v1.10.0 (2026-07-08):** Aligned next slices with VS-026 (Theme Engine Foundation) and VS-027 (Experience Themes), updated observations, and locked monorepo structure.
- **v1.9.0 (2026-07-08):** Restructured reviews into the 7 standardized categories, synchronized the 15-area general status table, global progress, value evaluation, and reordered dashboard roadmap priorities.
- **v1.8.0 (2026-07-08):** Integrated Rules #99-103 (Technical Debt, Performance, API Contract, Design Consistency, Feature Independence Reviews), updated roadmap sprint lists VS-025 to VS-030, and aligned status progress table.
- **v1.7.0 (2026-07-08):** Comprehensive progress maturity metric table added, risk analysis, remaining work distribution updated, and value evaluation template hooks registered.
- **v1.6.0 (2026-07-08):** Set VS-025 to Active Sprint with Tracks A-E, replaced progress metrics with combined Progress & Maturity State table, and added Rule #97 and #98.
- **v1.5.0 (2026-07-08):** Marked VS-024 (Activity History) complete. Updated overall progress percentages, added Theme System track, and set active sprint to VS-025 Dashboard v2.
- **v1.4.0 (2026-07-07):** Marked VS-006 as complete (Cancel capability delivered). Lifecycle Management capabilities fully implemented.
- **v1.3.0 (2026-07-07):** Marked VS-005 as complete (Complete capability delivered). Advancing to VS-006 (Cancel).
- **v1.2.0 (2026-07-05):** Marked VS-003 and VS-004 as complete (Pause and Resume capabilities delivered). Advancing to VS-005.
- **v1.1.0 (2026-07-04):** Updated to reflect transition to the Vertical Slice Phase and VS-001 sprint.
- **v1.0.0 (2026-07-04):** Integrated as the official project status baseline at the root level.
