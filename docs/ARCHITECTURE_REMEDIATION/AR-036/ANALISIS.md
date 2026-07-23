# AR-036 — Copy de streaks/gamificación contradice ADR-006/ADR-010

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas)

- **Dependencias:** Ninguna declarada, ninguna encontrada. Owner=Ambos (decisión de producto) — Fase 1
  la ejecuta Claude, la decisión de framing/copy final requiere el juicio del usuario.
- **Evidencia todavía válida:** el hallazgo original es de la Architecture Review (It.9, 2026-07-19/20)
  — necesitaba reverificación antes de asumir que el copy no había cambiado desde entonces.
- **Impacto/Esfuerzo:** Alto/S, Riesgo Bajo — la mejor relación impacto/esfuerzo disponible entre las
  ARs Impacto Alto del Roadmap pendiente (única con Esfuerzo S; el resto de Impacto Alto son Medio/L/XL).

### Pregunta de framing que gobierna esta fase

> **¿Sigue existiendo hoy el copy de streak/gamificación que contradice ADR-006/ADR-010, y el alcance
> real coincide con lo que describió la auditoría original ("tres pantallas")?**

### 1. Reproducción / verificación directa

- **ADR-006** (`docs/01-product/adr/adr_001_to_010.md:78-83`) — _"Exclusión de Gamificación"_: prohíbe
  "cualquier tipo de gamificación adictiva o casino UI" explícitamente para proteger los pilares de
  Calma y Autonomía. **No reclasificada** por ADR-024 — la propia reclasificación (`adr_001_to_010.md:
15-16`) excluye expresamente ADR-005/006/007/010 de perder autoridad normativa. Sigue vigente hoy.
- **ADR-010** (`docs/01-product/adr/adr_001_to_010.md:118-123`) — _"Eliminación de Rachas"_: decide
  sustituir las rachas por un "Índice de Resiliencia y las Victorias de Regreso" porque el reinicio a
  cero de una racha genera "castigo psicológico y abandono definitivo (Efecto What-the-Hell)". También
  vigente.
- **Copy real, verificado directamente en los archivos de i18n, ambos locales (`es`/`en`):**
  - `apps/mobile/src/core/i18n/locales/es/common.json:797` — `dashboard.widgets.currentStreak.activeMsg`
    = _"¡Mantén la llama encendida!"_ (en: `"Keep the flame burning!"`).
  - `.../common.json:248-249` — `coach.tips.protectStreak.title` = _"Llevas una racha de {{count}}
    días"_.
  - `.../common.json:290-292` — `coach.risks.habitStreaksAtRisk` = _"{{count}} rachas de hábitos en
    riesgo"_ / _"Complétalas hoy para mantener la racha"_ — framing de pérdida explícito.
  - `.../common.json:659-660` — `insights.streakHighlight.title` = _"Mejor Racha"_.
  - Ninguna de estas claves cambió desde la auditoría — **el hallazgo sigue intacto, cero corrección
    desde entonces.**
- **Alcance real de consumo, verificado por grep (más amplio que "tres pantallas"):** `currentStreak`/
  `streakHighlight`/`protectStreak`/`habitStreaksAtRisk`/`averageStreak`/`activeStreaks` aparecen no
  solo en 3 pantallas sino en **al menos 15 archivos de `apps/mobile/src`**, incluyendo componentes de
  UI (`CurrentStreakWidget.tsx`, `StreakHighlightInsight.tsx`, `HabitCard.tsx`, `HabitsHero.tsx`), el
  motor de recomendaciones del dashboard (`RuleRecommendationProvider.ts`,
  `CoachRecommendationProvider.ts`), y el motor de layout (`DashboardLayoutEngine.ts`,
  `DashboardLayoutDescriptor.ts`) — no solo copy estático, también lógica que decide _cuándo mostrar_
  contenido enmarcado como streak.
- **Campo de dominio relacionado, verificado como cuestión separada (tal como la propia auditoría ya lo
  aisló):** `Habit.currentStreakDays` (`packages/domain/src/habit/aggregate/habit.ts`) es un campo de
  dominio real, consumido por backend (`habit-view.dto.ts`, `habit.projectors.ts`) y por los motores de
  mobile citados arriba — **no solo copy**. La auditoría original ya distinguió esto explícitamente:
  _"this is a copy-only change (i18n strings), not a data-model change — the underlying
  `Habit.currentStreakDays` field question... is separate and can be resolved independently."_ Grep
  confirma que ningún documento (`TECH_DEBT.md`, `PROJECT_STATUS.md`) registra una decisión tomada
  sobre ese campo desde entonces.

### Respuesta a la pregunta de framing

> **El hallazgo sigue existiendo hoy, sin cambios, y el alcance real es mayor de lo que describía la
> auditoría original.** No son 3 pantallas — son al menos 4 áreas funcionales (Dashboard, Insights,
> Coach, Habits) y 2 motores internos (recomendación, layout) los que consumen copy o lógica enmarcada
> como streak. La contradicción con ADR-006/ADR-010 es real, vigente, y más extendida de lo reportado.

**Consecuencia para el alcance de AR-036:** se mantiene la separación que ya hizo la auditoría original
— **esta AR trata el copy y el framing de la experiencia (qué se le comunica al usuario y bajo qué
lógica se le presenta)**, no el campo de dominio `currentStreakDays` en sí, que sigue siendo una
cuestión de modelo de datos independiente, no bloqueante y no absorbida aquí (mismo patrón que AR-023
separó D-023.1 de D-023.2, y AR-008 aisló AR-053/AR-054 sin expandir su propio alcance).

---

## Estado

**Fase 1 cerrada.** El hallazgo se confirma vigente y sin corregir: copy y lógica de streak/gamificación
en al menos 4 áreas funcionales y 2 motores internos, contradiciendo ADR-006 (exclusión de gamificación)
y ADR-010 (eliminación de rachas), ambas normativas hoy. El campo de dominio `Habit.currentStreakDays`
queda explícitamente fuera de alcance, como cuestión separada. Estado: ⬜ → 🟦 En análisis. Decisión:
pendiente Fase 2A (Owner=Ambos — la fase de hipótesis/decisión requiere el juicio del usuario sobre el
framing de producto a adoptar, no solo la corrección técnica de las cadenas de texto).
