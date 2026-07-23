# AR-004 — `PRODUCT_BACKLOG.md` severamente desactualizado

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas)

- **Dependencias:** Ninguna. Owner=Claude (ejecución directa).
- **Evidencia todavía válida:** el hallazgo original es de `docs/PROJECT_AUDIT.md` (§6-8, anterior a la
  Architecture Review) y fue reconfirmado en It.19 — ninguno de los dos es reciente; necesitaba
  reverificación antes de asumir que seguía intacto, sobre todo tras 12 ARs cerradas que tocaron varios
  de los módulos que el propio hallazgo dice que faltan en el backlog (Habit, Coach, Insights,
  Notifications).
- **Impacto/Esfuerzo:** Alto/Medio, Riesgo Bajo — el menor riesgo entre las ARs de Impacto Alto/Esfuerzo
  Medio del Roadmap pendiente (AR-024/AR-030/AR-047 comparten el mismo tier de esfuerzo pero Riesgo
  Medio).

### Pregunta de framing que gobierna esta fase

> **¿`PRODUCT_BACKLOG.md` sigue exactamente tan desactualizado como describió la auditoría original, o
> el estado real del código ha cambiado lo suficiente (tras 12 ARs cerradas) para que el hallazgo
> necesite un alcance distinto?**

### 1. Reproducción / verificación directa

**Contenido real de `docs/01-product/PRODUCT_BACKLOG.md` hoy** (27 líneas, sin cambios detectables desde
la auditoría):

- Un único Epic real listado: `EPIC-001` (Commitment), con 6 capacidades. De ellas, **4 marcadas
  "Planned"** (Pause, Resume, Complete, Cancel) y 2 "Complete"/"✅ Done" (Register, Activate).
- **Goal, Task, Habit — no aparecen como epics en absoluto.**
- Sección "Future Epics (placeholder)" lista: Identity, Daily Execution, Reflection, Coach, Statistics,
  Notifications, Offline Sync, AI — como si nada de esto hubiera comenzado.

**Estado real verificado directamente en el código, hoy:**

| Capacidad                               | Estado real (verificado)                                                                                                                                                                  | Claim de `PRODUCT_BACKLOG.md`                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Commitment Pause/Resume/Complete/Cancel | `apps/backend/src/commitment/` — 4 métodos de aggregate reales + rutas backend, con ADR-023/ADR-014 y AR-028 (concurrencia optimista) construidos encima.                                 | "Planned" (falso, los 4 existen y funcionan)                                                                          |
| Goal                                    | Aggregate completo + módulo backend (`GoalModule` registrado en `app.module.ts`) + `GoalWorkspaceScreen.tsx` en mobile.                                                                   | No listado como epic                                                                                                  |
| Task                                    | Aggregate completo + `TaskModule` backend + pantallas mobile.                                                                                                                             | No listado como epic                                                                                                  |
| Habit                                   | Aggregate completo + `HabitModule` backend + streaks + pantallas mobile (extensamente tocado en AR-036).                                                                                  | No listado como epic                                                                                                  |
| Notifications                           | `NotificationsModule` real, backed por BullMQ (AR-054 cerrada sobre este mismo módulo).                                                                                                   | Solo como "Future Epic (placeholder)"                                                                                 |
| Coach                                   | Tab real en mobile + motor de recomendaciones basado en reglas (`RuleRecommendationProvider`/`CoachRecommendationProvider`, extensamente tocados en AR-036). Sin módulo backend dedicado. | Solo como "Future Epic (placeholder)"                                                                                 |
| AI                                      | No implementado — confirmado, cero código.                                                                                                                                                | "Future Epic (placeholder)" — **este sí es correcto**                                                                 |
| Statistics/Insights                     | Tab real en mobile + carpeta de dominio + motor de insights (`InsightsLayoutEngine`, tocado en AR-036). Sin módulo backend dedicado.                                                      | Solo como "Future Epic (placeholder)"                                                                                 |
| Identity                                | Aggregate de dominio existe; **confirmado hoy, `grep` en `app.module.ts`: cero `IdentityModule` registrado** — sigue sin módulo de backend (AR-030, todavía pendiente en el Roadmap).     | "Future Epic (placeholder)" — coincide parcialmente (el aggregate existe, pero el backlog no lo menciona en absoluto) |
| Authentication                          | `AuthenticationModule` real, registrado en `app.module.ts` (AR-043, cerrada). No es un epic del backlog original ni de la auditoría — capacidad nueva desde entonces.                     | No mencionado en absoluto (ninguna versión lo menciona)                                                               |

**Confirmado: cero cambios en `PRODUCT_BACKLOG.md` desde que la auditoría lo señaló.** El archivo no
fue tocado por ninguna de las 12 ARs cerradas hasta ahora — ninguna de ellas tenía en su alcance
actualizar documentación de producto, todas fueron remediaciones de arquitectura/gobernanza/gobierno de
repositorio o de coherencia conceptual (AR-036), no de estado de backlog.

### Respuesta a la pregunta de framing

> **El hallazgo sigue exactamente tan vigente como lo describió la auditoría original — no hay
> resolución parcial que reencuadrar, a diferencia de AR-002/AR-009/AR-036.** El backlog no solo no
> mejoró: la brecha entre lo que dice y lo que existe realmente **creció**, porque desde la auditoría se
> cerraron AR-043 (Authentication, un módulo backend nuevo que ni siquiera la auditoría original conocía)
> y se profundizó el trabajo sobre Habit/Coach/Insights (AR-036) — ninguno de los cuales aparece en el
> backlog. La única entrada que sigue siendo correcta es "AI" como epic futuro sin empezar.

**Consecuencia para el alcance de AR-004:** no hay reducción de alcance como en las últimas 3 ARs — el
alcance es exactamente el que ya delimitó la auditoría original (Recomendación de It.19: _"Rewrite
`PRODUCT_BACKLOG.md` to reflect actual shipped scope and status"_), más una actualización menor de
inventario para incluir Authentication, ausente incluso del hallazgo original porque no existía todavía
cuando se auditó.

---

## Estado

**Fase 1 cerrada.** El hallazgo se confirma completamente vigente y sin ninguna corrección desde la
auditoría — a diferencia de AR-002/AR-009/AR-036, no hay una parte ya resuelta que separar. La brecha
entre `PRODUCT_BACKLOG.md` y el estado real del código creció desde la auditoría (Authentication es un
módulo nuevo, no contemplado originalmente, también ausente del backlog). Estado: ⬜ → 🟦 En análisis.
Decisión: pendiente Fase 2A (Owner=Claude — ejecución directa; la fase de decisión aquí es sobre todo de
alcance/formato de la reescritura, no de juicio estratégico).
