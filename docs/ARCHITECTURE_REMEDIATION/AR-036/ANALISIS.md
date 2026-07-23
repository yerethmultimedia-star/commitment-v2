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

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 (principal):** _"El término 'streak' representa un concepto de producto que ya no coincide con el
framing definido por las ADR vigentes y, por tanto, debe eliminarse o redefinirse de forma consistente
en todas las capas donde aparezca, excepto donde forme parte explícita del modelo de dominio
preservado."_ Respaldada por la evidencia de Fase 1: ADR-006/ADR-010 siguen vigentes, la auditoría ya
identificó el conflicto, el uso es transversal (UI + 2 motores internos), y `Habit.currentStreakDays`
fue separado deliberadamente y queda fuera de alcance.

**Hipótesis alternativas descartadas:**

- **H2** — el problema es únicamente terminológico (copy/UI). Descartada: la presencia en motores de
  recomendación y layout demuestra que el concepto influye también en comportamiento, no solo en texto.
- **H3** — el problema es exclusivamente de dominio. Descartada: la evidencia muestra precisamente lo
  contrario — el dominio (`currentStreakDays`) fue excluido del alcance.
- **H4** — deben convivir dos significados de "streak," uno interno y otro de producto. No aceptada con
  la evidencia actual: aumentaría la carga cognitiva y mantendría una ambigüedad conceptual sin
  justificación explícita en las ADR.

**H1 sobrevive.** Lo que debe remediarse no es un conjunto de archivos, sino un concepto de producto que
dejó de estar alineado con la dirección arquitectónica vigente.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

**D-036.1:** _"El producto debe utilizar un modelo conceptual único y consistente para representar el
progreso del usuario, alineado con las ADR vigentes, evitando conceptos heredados que entren en
conflicto con dicho modelo."_

**No congela:** el reemplazo de "streak", el texto concreto, la terminología final, ni el diseño
visual — solo fija la propiedad: existe un único modelo conceptual coherente. Mismo patrón que
D-002.1/D-009.1/D-043.1/D-054.1/D-044.1-3.

**Explícitamente NO decidido en esta fase:** sustituir "streak" por un concepto centrado en compromiso,
por progreso, absorberlo dentro del sistema de objetivos e hitos, o mantener `currentStreakDays` como
implementación interna mientras desaparece del lenguaje del producto — las alternativas de framing
concreto quedan para Fase 4A.

**Criterio que gobernará Fase 4A (fijado de antemano):** la decisión no debe basarse en facilidad
técnica, sino en la coherencia con la narrativa de producto de Commitment. **Propiedad de éxito, distinta
de las AR anteriores:** no se mide por una API más robusta o un pipeline más seguro, sino por que el
usuario ya no perciba dos modelos mentales distintos para describir su progreso.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**Pregunta que gobierna esta fase (distinta en naturaleza a toda AR anterior — no elige tecnología,
elige un modelo mental de usuario):**

> **¿Qué concepto expresa mejor la filosofía de Commitment y puede sustituir a "streak" de forma
> consistente en UI, motores internos y narrativa?**

### Alternativas evaluadas

- **A — Mantener "streak".** Descartada, no por razones técnicas sino porque contradice H1 ya aceptada
  en Fase 2A: el concepto entra en conflicto con el framing de las ADR vigentes.
- **B — Sustituir por "progreso".** Neutro, pero describe un estado, no el comportamiento que Commitment
  pretende fomentar. Buen término analítico, débil como eje narrativo. Descartada como reemplazo único.
- **C — Sustituir por "consistencia".** Más cercano al propósito del producto — de "llevas X días
  seguidos" a "estás construyendo consistencia," compatible con consolidar hábitos sostenibles en vez de
  maximizar una racha. Descartada como solución completa: sigue siendo un sinónimo directo, un solo
  término reemplazando a otro, sin resolver por qué "streak" ocupaba un lugar central en primer término.
- **D — Integrar en el modelo de Commitment (elegida).** No busca un sinónimo de "streak" — busca que el
  concepto desaparezca como entidad independiente. El usuario ya tiene un marco conceptual (objetivos,
  hitos, hábitos, progreso, coach); la continuidad diaria pasa a ser una **propiedad emergente** de ese
  sistema, no un concepto con identidad propia. `currentStreakDays` puede seguir existiendo
  internamente (fuera de alcance, según Fase 1), pero deja de ocupar un lugar central en la experiencia.

### Diseño congelado

> **La continuidad diaria deja de presentarse como un objetivo independiente y pasa a representarse
> únicamente como una dimensión del progreso dentro del modelo conceptual de Commitment.**

No se congela un reemplazo léxico único — distintas expresiones ("consistencia", "progreso", "actividad
reciente", etc.) pueden aparecer según el contexto en la implementación, siempre que ninguna reintroduzca
el modelo mental de la racha como objetivo aislado.

**Separación de modelo mental vs. modelo de dominio, la decisión de diseño más importante de esta AR:**
el modelo mental del usuario (lo que ve, lo que se le comunica) queda gobernado por este diseño;
`Habit.currentStreakDays` sigue siendo un detalle de implementación del dominio, sin que su existencia
interna contradiga el diseño — mismo principio que ya usó H-GOV-01 en otras ARs (no perseguir una
propiedad más fuerte de lo que la evidencia exige: aquí, no hace falta eliminar el campo de dominio para
resolver el problema de producto).

### Criterio de validación para Fase 5

No basta con confirmar que la palabra "streak" desapareció. Dos preguntas gobiernan el cierre:

1. ¿El usuario recibe una única explicación coherente de cómo progresa en la aplicación?
2. ¿Ninguna pantalla, motor o componente vuelve a presentar la continuidad diaria como un objetivo
   aislado del resto del sistema?

Si ambas respuestas son afirmativas, D-036.1 queda materializada, aunque `Habit.currentStreakDays` siga
existiendo como detalle de implementación del dominio.

---

## Fase 4B — Implementación

**Estado: ✅ Implementada.**

Tratada por las 4 categorías que fijó Fase 4A, cada una con su propio criterio de sustitución (no una
sustitución mecánica de texto):

**1. Copy de interfaz** (`common.json`, `es`/`en`) — cada aparición reformulada preguntando si explica
progreso o incentiva mantener una racha. Renombradas y reescritas: `coach.tips.protectStreak` →
`steadyProgress` ("llevas X días de constancia," sin "mantenerla"); `coach.achievements.weekStreak` →
`consistencyMilestone`; `coach.risks.habitStreaksAtRisk` → `habitsNeedingAttention` (de "rachas en
riesgo" a "hábitos pendientes hoy"); `coach.momentum.building.description` ("tu racha está creciendo" →
"tu constancia está creciendo"); `habits.hero.streakLabel` → `consistencyLabel`; `habits.detail.
streakDays` → `consistencyDays`; `habits.empty.description` ("empezar una racha" → "empezar a construir
constancia"); `insights.overview.currentStreak` → `weekActivity` ("RACHA ACTUAL" → "ACTIVIDAD DE LA
SEMANA" — este header describía un row de actividad Lun-Dom, no un conteo de racha); `insights.
habitConsistency.averageStreak/activeStreaks` → `averageConsistency`/`activeHabits`; `insights.
streakHighlight` → `topConsistency` ("Mejor Racha" → "Mayor Constancia"); `dashboard.hero.streak` →
`weeklyMomentum`; `dashboard.widgets.currentStreak` → `dailyConsistency` ("¡Mantén la llama encendida!"
→ "¡Vas construyendo constancia!"); `dashboard.widgets.todayHabits.streak` → `consistencyBadge`;
`goals.workspace.stats.avgStreak` → `avgConsistency`. **Eliminada** `dashboard.summary.streak`
("Días Seguidos") — confirmado por grep que era código muerto, sin ningún consumidor en toda la app.

**2. Componentes de UI** — los que representaban una "racha" como entidad propia dejaron de existir con
ese nombre: `CurrentStreakWidget.tsx` → `DailyConsistencyWidget.tsx` (mismo cálculo interno, sin cambiar
lógica); `StreakHighlightInsight.tsx` → `TopConsistencyInsight.tsx` (mismos datos reales de dominio, sin
cambiar lógica). Iconos de flama (🔥, `Flame` de lucide) reemplazados por `TrendingUp` en los 5 sitios
donde aparecían (`HabitCard.tsx`, `HabitsHero.tsx`, `HabitDetailScreen.tsx`, los 2 componentes
renombrados) — color `$warning` (naranja, asociado a alerta/fuego) cambiado a `$success` donde
corresponde a una señal positiva. En `coach-descriptors.ts`, icono de `habit-streaks-at-risk` cambiado
de `AlertTriangle` (amenaza) a `Bell` (recordatorio neutral) — `heavy-day` conserva `AlertTriangle`
porque es un riesgo operativo genuino (exceso de tareas), no relacionado con gamificación. En
`default-widgets.ts`, la categoría del widget cambió de `'gamification'` — la única vez que esa
categoría se usó en todo el registro — a `'progress'`, junto a `weekly-progress-widget`/
`completion-rate-widget`.

**3. Motores internos** — **sin cambios de lógica**, tal como fijó Fase 4A: las condiciones
`streak.currentStreakDays > 0`/`>= 7` en `RuleRecommendationProvider.ts`/`CoachRecommendationProvider.ts`
permanecen intactas. Solo cambiaron los `targetId` que el motor produce (identificadores internos, no
texto visible): `'protect-streak'` → `'steady-progress'`, `'week-streak'` → `'consistency-milestone'`,
`'habit-streaks-at-risk'` → `'habits-needing-attention'`, `'current-streak-widget'` →
`'daily-consistency-widget'`, `'streak'` (hero) → `'weekly-momentum'` — necesario porque estos
identificadores son, en sí mismos, nombres de componentes de presentación o de elementos del dashboard
(categoría "no esperada" fijada en el criterio de validación), no lógica de dominio.

**4. Layout y navegación** — verificado que ningún título de sección ni tarjeta destacada sigue
organizando al dashboard alrededor de la continuidad diaria: el hero "weekly-momentum" ya comunicaba
tareas completadas esta semana (nunca tuvo framing de racha en su copy, solo en su identificador
interno); el widget `daily-consistency-widget` pasó de prioridad/categoría "gamification" a "progress",
mismo nivel que el resto de widgets de progreso, sin tratamiento visual especial que lo distinga como
un objetivo aparte.

**Hallazgo colateral, limpiado en el mismo paso por estar directamente relacionado:** se encontró
`HeroCardStrategy.ts`, un módulo explícitamente `@deprecated` ("Kept for backward compatibility...
Will be removed in VS-031 cleanup"), sin ningún import en el resto del código (confirmado por grep), que
contenía una `StreakStrategy` referenciando las claves i18n `dashboard.hero.streak.*` recién
renombradas. Eliminado — ya estaba marcado para su retiro y su presencia habría dejado una referencia
muerta a un concepto ya removido del modelo mental del usuario.

**Bug de portabilidad, no relacionado con AR-036, encontrado y NO corregido aquí:** al intentar validar
las suites de test se confirmó una condición ya documentada en el propio Roadmap (**AR-010**,
`apps/mobile` no tiene script de test, y `babel-preset-expo` no está resuelto para Jest en este
entorno) — verificado independientemente (`node_modules/babel-preset-expo` ausente en
`apps/mobile/node_modules` pese a existir en el store de pnpm). Se usó una configuración ad hoc de
`ts-jest` (no committeada, solo para verificación) para ejecutar los tests reales sin depender de esa
cadena rota. Fuera de alcance de esta AR — pertenece a AR-010.

## Fase 5 — Validación

**Estado: ✅ Validada.**

**Búsqueda estructural completa** (`grep -rin "streak" apps/mobile/src`), clasificada exactamente según
el criterio fijado en Fase 4A:

- **Esperadas (dominio):** `Habit.currentStreakDays`, `DashboardContext.streak.{currentStreakDays,
longestStreakDays,atRiskCount}`, `computeHabitStreak()`, y sus consumidores directos en
  `demo-habits.repository.ts`, `habits.api.ts`, `useDashboardContext.ts`, `useInsightsContext.ts` — el
  campo de dominio nunca estuvo en alcance, tal como fijó Fase 1.
- **No esperadas, verificado que ya no existen:** cero ocurrencias de "racha"/"streak" en copy de
  usuario (`common.json`, ambos locales); cero nombres de componentes de presentación
  (`CurrentStreakWidget`/`StreakHighlightInsight` renombrados, `HeroCardStrategy` deprecado eliminado);
  cero textos de recomendaciones con framing de racha; cero categoría "gamification" en el registro de
  widgets.
- **Residuales aceptables, documentados explícitamente:** 2 comentarios que citan los nombres antiguos
  de los componentes por razones históricas (`TopConsistencyInsight.tsx`/`HabitsHero.tsx`, "renamed
  from X") — no son el concepto reapareciendo, son la traza de por qué cambió.

**Validación funcional (comportamiento, no solo texto):**

- `tsc --noEmit` en `apps/mobile`: limpio, cero errores.
- Suite de tests real ejecutada con una configuración de verificación (`ts-jest`, ver nota de Fase 4B):
  `RecommendationEngine.test.ts` (42 tests, actualizados para los `targetId` renombrados) y
  `DashboardLayoutEngine.test.ts` — **42/42 passing**; `InsightsLayoutEngine.test.ts`/`focus-detail.
test.ts`/`daily-metrics.test.ts`/`sparkline-math.test.ts` — **41/41 passing**, sin regresión.
- Verificado con las 2 preguntas fijadas en Fase 4A:
  1. ¿El usuario recibe una única explicación coherente de cómo progresa? Sí — todo el copy de
     progreso/consistencia usa el mismo vocabulario ("constancia"/"consistencia"), sin una segunda
     narrativa de "racha" compitiendo en paralelo.
  2. ¿Ninguna pantalla, motor o componente vuelve a presentar la continuidad diaria como un objetivo
     aislado? Sí — el widget correspondiente ya no está categorizado como "gamification"; el hero
     semanal comunica tareas completadas, no una racha que proteger; los iconos de amenaza/fuego fueron
     reemplazados por iconos de progreso/recordatorio neutral.

**Criterio de cierre (fijado en Fase 2A), respondido:** las referencias restantes a
`currentStreakDays` pertenecen exclusivamente al dominio (`packages/domain`, plumbing de aplicación que
lo consume sin exponerlo como "racha") — ninguna al lenguaje de producto. D-036.1 queda materializada.

---

## Estado

**AR-036 CERRADA (2026-07-23).** El hallazgo se confirma vigente en Fase 1 y se reencuadra de una
inconsistencia de copy aislada a un modelo conceptual de producto ("streak") transversal a UI y 2
motores internos. D-036.1 aprobada e implementada: la continuidad diaria deja de presentarse como un
objetivo independiente y pasa a representarse como una dimensión emergente del progreso, tratada en las
4 categorías fijadas en Fase 4A (copy, componentes, motores — sin cambio de lógica —, layout), sin fijar
un reemplazo léxico único. `Habit.currentStreakDays` se mantiene íntegro como detalle de dominio, fuera
del alcance en las 5 fases. Búsqueda estructural completa confirma cero residuos en el modelo mental de
usuario; 83 tests reales (`tsc` limpio + 2 suites de engine + 4 suites de insights) sin regresión. Un
hallazgo colateral (`HeroCardStrategy.ts`, código muerto ya deprecado) se limpió por estar directamente
relacionado; un hallazgo no relacionado (AR-010, entorno de test de mobile roto) se documentó sin
intentar resolverlo aquí. Estado: 🟦 → ✅ Cerrada. Decisión: ✅ Decisión aprobada → ✔️ Validada.
