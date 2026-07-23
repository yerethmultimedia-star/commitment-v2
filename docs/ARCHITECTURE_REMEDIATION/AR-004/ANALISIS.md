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

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

Esta AR tiene una naturaleza distinta de AR-002/AR-009/AR-036: no corrige una decisión errónea ni
realinea un concepto de producto — resuelve una **desalineación entre la arquitectura documentada y la
arquitectura realmente evolucionada**.

**H1 (principal):** _"La arquitectura debe reflejar explícitamente las capacidades reales del sistema.
Mantener componentes 'placeholder' cuando ya existen implementaciones funcionales genera una
representación arquitectónica incorrecta y aumenta la deuda de documentación y gobierno."_ Respaldada
por la evidencia de Fase 1: Authentication ya existe como módulo, Coach e Insights ya no son simples
ideas futuras, y la documentación sigue tratándolos como capacidades futuras.

**Hipótesis alternativas descartadas:**

- **H2** — el problema es únicamente documental. Descartada: la documentación es donde se manifiesta el
  problema, pero el efecto es arquitectónico — cualquier decisión futura parte de un mapa del sistema
  que ya no representa la realidad.
- **H3** — deben mantenerse los placeholders hasta cerrar todas las AR relacionadas. Descartada: eso
  convertiría la arquitectura en un registro histórico, cuando su función es describir el estado
  arquitectónico vigente — el historial ya está preservado mediante ADRs, commits y el Roadmap.
- **H4** — debe modelarse todo el estado futuro previsto, aunque todavía no exista. Descartada: la
  arquitectura debe describir capacidades existentes y decisiones aprobadas, no anticipar
  implementaciones aún no materializadas.

**H1 sobrevive.** El problema no es que falten módulos, sino que la representación arquitectónica ha
dejado de corresponder con el sistema real.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

**D-004.1:** _"La documentación arquitectónica debe representar únicamente capacidades existentes o
formalmente aprobadas, manteniendo correspondencia verificable con la implementación y evitando que
componentes implementados permanezcan descritos como placeholders o capacidades futuras."_

**No congela:** cómo actualizar los diagramas, qué documentos modificar, la organización exacta de
módulos, ni la nomenclatura — solo fija la propiedad: arquitectura documentada y arquitectura
implementada deben permanecer alineadas y ser verificablemente consistentes. Mismo patrón que
D-002.1/D-009.1/D-036.1/D-043.1/D-054.1/D-044.1-3.

**Aspecto a vigilar en Fase 4A, registrado de antemano:** Authentication ya existe; `IdentityModule` no.
Autenticación e identidad no deben fusionarse automáticamente durante el diseño — AR-030 sigue abierta y
podría introducir responsabilidades adicionales para identidad (perfil, identidad unificada,
proveedores, etc.). Fase 4A debe evaluar Authentication exclusivamente como una capacidad ya
implementada y tratar Identity como una decisión todavía pendiente, evitando que la resolución de AR-004
anticipe o condicione el resultado de AR-030.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**Objetivo del diseño:** determinar cómo mantener la correspondencia entre arquitectura documentada y
arquitectura implementada sin convertir la documentación en un reflejo automático del código — ese es
el equilibrio que gobierna esta fase.

### Alternativas evaluadas

- **A — Documentación completamente manual.** Máximo control editorial. Descartada: la propia evidencia
  de AR-004 demuestra que este modelo deriva con el tiempo — es exactamente el modelo que produjo el
  hallazgo original.
- **B — Generación automática desde el código.** Elimina la deriva, pero invierte la relación correcta:
  la arquitectura pasaría a ser un subproducto de la implementación, cuando sigue siendo una decisión
  deliberada, no un artefacto generado. Descartada.
- **C — Sincronización híbrida (elegida).** Tres responsabilidades separadas, ninguna sustituye a las
  otras: **implementación** (describe qué capacidades existen realmente), **documentación
  arquitectónica** (describe cómo esas capacidades forman parte de la arquitectura), **validación**
  (comprueba periódicamente que ambas siguen siendo consistentes).

### Diseño congelado

No se congela ningún documento concreto — se congela un mecanismo:

> **Toda capacidad implementada que forme parte de la arquitectura del sistema debe tener una
> representación explícita en la documentación arquitectónica, y toda representación arquitectónica de
> una capacidad implementada debe poder justificarse mediante evidencia verificable.**

Funciona en ambos sentidos — evita módulos fantasma documentados y módulos reales invisibles.

### Authentication e Identity

Se mantiene exactamente la separación registrada en Fase 2B: Authentication ya es una capacidad
implementada y debe aparecer en la arquitectura; Identity sigue siendo objeto de AR-030 y no debe
aparecer como capacidad implementada simplemente porque Authentication exista. Esto preserva la
independencia entre remediaciones.

### Alcance fijado para Fase 4B

- Actualizar diagramas y vistas arquitectónicas.
- Eliminar placeholders que ya no representan el estado real.
- Incorporar Authentication como capacidad existente.
- Promover Coach e Insights desde "Future Epic" a su representación real.
- Dejar explícitamente fuera cualquier elemento cuyo estado siga pendiente (como Identity).

**Ninguna decisión de arquitectura nueva se introduce en Fase 4B** — es materialización del diseño ya
congelado, no diseño adicional.

### Criterio de validación para Fase 5

1. ¿Toda capacidad arquitectónica implementada tiene representación documental?
2. ¿Toda capacidad documentada como implementada existe realmente en el repositorio?
3. ¿Ningún placeholder permanece describiendo una capacidad ya implementada?
4. ¿Ninguna capacidad pendiente (como Identity) aparece presentada como existente?

Si las 4 respuestas son afirmativas, D-004.1 queda materializada.

### Observación registrada (afinidad con AR-009, no promovida a regla)

AR-009 aseguraba que la **gobernanza** pudiera verificarse contra el estado real; AR-004 persigue que la
**arquitectura** pueda verificarse contra el estado real. Ambas comparten el mismo principio: la
documentación deja de ser declarativa únicamente y pasa a ser verificablemente consistente con el
sistema, sin perder su papel como documento de diseño.

---

## Estado

**Fase 1, Fase 2A, Fase 2B y Fase 4A cerradas.** El hallazgo se confirma completamente vigente y sin
ninguna corrección desde la auditoría. Reencuadrado por la evidencia: no es una brecha documental
aislada, es una desalineación entre la arquitectura documentada y la arquitectura realmente evolucionada.
D-004.1 aprobada; diseño técnico congelado en un enfoque de sincronización híbrida (implementación +
documentación + validación periódica, responsabilidades separadas), con el alcance de Fase 4B ya fijado
(actualizar diagramas, retirar placeholders obsoletos, incorporar Authentication, promover Coach/
Insights, excluir explícitamente Identity). Pendiente: **Fase 4B (Implementación)**. Estado: se mantiene
🟦 En análisis (no salta a 🟨 hasta Fase 4B). Decisión: se mantiene ✅ Decisión aprobada.
