# Alternativas para la persistencia y evolución del backend de Goal

**Estado:** Documento de evaluación (Paso 2/3). Construido directamente sobre
`goal_backend_current_assessment.md` — cada alternativa y cada criterio nace de un hallazgo ya
documentado ahí, no de preferencia tecnológica. Todavía sin decisión.

Deliberadamente **no** titulado "CQRS vs. Event Store" — el Assessment ya estableció que el
problema inmediato es la ausencia total de persistencia para Goal, no una limitación del patrón
CQRS parcial que Commitment/Task/Habit ya usan con éxito.

---

## Alternativas

### A — Extender el patrón actual (CQRS + estado versionado)

Construir `apps/backend/src/goal/` replicando exactamente la estructura ya probada en Commitment/
Task/Habit: comandos (Register, Rename, LinkCommitment, LinkHabit, Complete, Archive — los 5
métodos de mutación que el agregado ya define, más Register), handlers, nestjs-handlers, DTOs,
repositorio en memoria con `Map<string, Goal>` + versión para concurrencia optimista, query
service. Sin Event Store, sin historial dedicado (salvo que se decida replicar también el patrón
`ActivityLogger` de Commitment para Goal).

### B — Generalizar el mecanismo de historial de dominio, usando el Event Store existente como implementación

**Motivación, reformulada (no "tenemos un Event Store, busquemos dónde usarlo"):** el producto
necesita una infraestructura común de historial — ADR-014 ya la estableció para Commitment
específicamente (`ActivityRecord`/`ActivityType`, metadata versionada, paginación por cursor), y
el propio Assessment confirma que Task/Habit no tienen ningún equivalente. Esa necesidad, no la
existencia del Event Store, es el punto de partida. El `InMemoryEventStore` ya construido resulta
ser la implementación que la satisface, porque ya provee exactamente lo que ese tipo de
infraestructura necesita: streams por agregado, concurrencia optimista, persistencia
append-only — construirla desde cero sería reimplementar lo que ya existe sin usarse.

El estado del agregado **sigue viniendo del store versionado de A** (fuente de verdad sin cambios)
— el Event Store pasa a ser una bitácora duradera de eventos de dominio para quien los consuma
(hoy: historial; después, potencialmente: Analytics Engine), no un mecanismo de reconstrucción de
estado.

### C — Migrar progresivamente a Event Sourcing real

El Event Store se convierte en la fuente de verdad: el estado del agregado se reconstruye
reproduciendo sus eventos (`getEvents()` + replay), no se almacena directamente. Goal, al ser un
agregado nuevo sin datos existentes que migrar, sería el piloto natural — evaluando después si
conviene migrar Commitment/Task/Habit.

---

## Mejora transversal, fuera de la matriz A/B/C

**Reducir la infraestructura repetitiva por comando** no es una estrategia de persistencia —
persistencia y boilerplate son ejes distintos, y tratarla como una cuarta alternativa mutuamente
excluyente sugería una comparación que no corresponde. Es compatible con A, B o C por igual:

```text
Cross-cutting improvement
Reduce backend command boilerplate (~7 archivos/comando medido en el Assessment)

Compatible con:
✓ A
✓ B
✓ C
```

Registrada como **iniciativa futura independiente** ("Backend Infrastructure Simplification"), no
como parte de esta decisión ni como Tech Debt necesariamente — ver "Sin decidir todavía" abajo.

---

## Criterios de evaluación

Derivados directamente de los hallazgos del Assessment, no elegidos a priori:

| Criterio                                                                       | Peso       | Por qué                                                                                                                                                                       |
| ------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resuelve el problema inmediato (Goal persistido)                               | Alto       | Es el hallazgo #1 del Assessment — el problema real, no CQRS/ES                                                                                                               |
| Consistencia con el patrón ya probado                                          | Alto       | Commitment/Task/Habit ya funcionan así; una tercera arquitectura de persistencia en el mismo backend es un costo real                                                         |
| Reduce o no empeora el coste de boilerplate medido                             | Alto       | Único dolor técnico cuantificado en el Assessment (~7 archivos/comando)                                                                                                       |
| Aprovecha la inversión ya hecha sin forzarla                                   | Medio      | El Event Store existe, pero su existencia "no constituye evidencia de necesidad" (Observación clave #4)                                                                       |
| Habilita necesidades futuras _confirmadas_, sin sobre-diseñar para hipotéticas | Medio-Alto | Analytics Engine (candidato de roadmap) y VS-035 (Offline/Sync, ya numerado) son reales; Undo/IA/resolución de conflictos no tienen evidencia — no diseñar para ellas todavía |
| Riesgo y complejidad operativa de la migración                                 | Alto       | Restricción explícita del Assessment: migración gradual, no corte único                                                                                                       |
| Reversibilidad (facilidad de cambiar de estrategia después)                    | Medio      | Ninguna decisión aquí debería ser more difícil de revertir de lo necesario, dado lo temprano que está esto                                                                    |

---

## Evaluación

| Criterio                           | A                                | B                                                                                | C                                                                                                            |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Resuelve el problema inmediato     | **Alto**                         | **Alto**                                                                         | Alto, pero más lento                                                                                         |
| Consistencia con el patrón probado | **Alto**                         | Alto                                                                             | Bajo                                                                                                         |
| Boilerplate por comando            | Igual que hoy (no mejora)        | Igual que hoy + trabajo de integrar Event Store                                  | **Peor** (proyecciones, replay, y aún así handlers/DTOs)                                                     |
| Aprovecha inversión sin forzar     | Bajo (Event Store sigue sin uso) | **Alto**                                                                         | Alto, pero lo fuerza como dependencia central                                                                |
| Necesidades futuras confirmadas    | Medio (no dedicated historial)   | **Alto** (habilita historial generalizado, insumo directo para Analytics Engine) | Alto en teoría, no probado en este código                                                                    |
| Riesgo/complejidad de migración    | **Bajo**                         | Bajo-Medio                                                                       | **Alto** — sin precedente en este backend, los 3 agregados existentes tendrían que decidir si migran también |
| Reversibilidad                     | **Alta**                         | Alta                                                                             | Baja — migrar de vuelta desde Event Sourcing es costoso                                                      |

**Por qué cada veredicto, con evidencia:**

**A** resuelve el problema inmediato con el menor riesgo posible — es exactamente el patrón que
Commitment/Task/Habit ya prueban en producción. Pero no aprovecha el Event Store (que ya existe,
construido y probado) ni resuelve el gap de historial que Goal necesitará para el candidato
Analytics Engine — dejaría a Goal en la misma situación que Task/Habit hoy (sin historial alguno).

**B** hereda todas las ventajas de A y además resuelve directamente la Observación clave #3 del
Assessment (el historial de Commitment ya demuestra que no hace falta Event Sourcing completo para
tenerlo) llevándolo un paso más: en vez de que cada agregado reimplemente su propio
`ActivityLogger` (como hizo Commitment, un patrón que Task/Habit nunca replicaron), generalizar
ese mecanismo usando la infraestructura de Event Store ya construida — que literalmente fue
diseñada para esto (concurrencia optimista, streams por agregado) y hoy no le sirve a nadie. Es la
única alternativa que convierte un activo sin usar en valor real sin comprometerse a Event
Sourcing como fuente de verdad.

**C** es la opción de mayor riesgo medido contra las restricciones del propio Assessment
("migración gradual, no un corte único"; sin precedente de Event Sourcing real funcionando en este
backend, solo la infraestructura sin conectar). No hay evidencia de que el problema que resolvería
(reconstrucción de estado desde eventos) sea un problema real hoy — ninguna de las necesidades de
producto confirmadas (persistencia de Goal, historial, offline/sync futuro) requiere
específicamente que el estado se reconstruya por replay en vez de almacenarse versionado. Sigue
siendo una dirección válida a más largo plazo, pero la carga de la prueba que dejó el Assessment
(Observación clave #3) no está satisfecha todavía.

---

## Decisiones confirmadas antes de redactar la ADR (2026-07-17)

1. **Alcance de B — solo la infraestructura, no la migración de todos los agregados.** La ADR
   decide que existe una infraestructura común de historial basada en Event Store; no obliga a
   que Task/Habit la consuman desde el día uno. Secuencia: ADR → Goal la usa → Task/Habit migran
   después, solo si aportan valor demostrado — no como consecuencia automática de la ADR.
2. **D queda fuera de esta ADR, registrada como iniciativa futura independiente** — "Backend
   Infrastructure Simplification", no necesariamente Tech Debt. Optimizar la infraestructura de
   comandos antes de construir el primer módulo que la necesitaría (Goal) sería prematuro; el
   Assessment demuestra que el problema inmediato es la ausencia de backend, no el boilerplate.
3. **No sienta precedente obligatorio para Task/Habit.** La ADR establece que la infraestructura
   de historial es común y está disponible — no que todo agregado deba producirlo. Task y Habit
   podrían generar cientos o miles de eventos diarios sin que esté demostrado que el producto
   quiera conservarlos todos; Commitment, en cambio, ya tiene un ciclo de vida significativo y una
   funcionalidad real que consume su historial. Esa decisión queda explícitamente abierta por
   agregado, no resuelta de antemano.

## Aclaración arquitectónica que debe quedar explícita en la ADR

B no introduce Event Sourcing. El backend mantiene dos responsabilidades ya existentes y
distintas, sin fusionarlas:

```text
Command → Aggregate → Current State Repository   (fuente de verdad, sin cambios)
Domain Events → Event Store → Consumers          (bitácora duradera, no reconstrucción de estado)
```

El Event Store pasa de estar construido-y-sin-uso a ser una bitácora duradera de eventos de
dominio para quien los consuma — no el mecanismo para reconstruir el estado de un agregado. Esa
distinción es la que separa B de C, y debe quedar explícita en la ADR para que no se lea como una
adopción encubierta de Event Sourcing.
