# AR-002 — Proceso de ADR-011 ("toda ADR de tecnología preferida requiere sustituta") sin enforcement

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Pregunta de framing que gobierna esta fase

> **¿Sigue siendo real este hallazgo, o quedó resuelto indirectamente por el cierre de AR-001?**

Se formula así porque el hallazgo original (Iteración 19, apoyado en Iteración 16) cita explícitamente
la contradicción ADR-004↔NestJS como su ejemplo — y esa contradicción exacta es lo que AR-001 resolvió.

### 1. Reproducción / verificación directa

- **`docs/03-architecture/adr_011_tech_stack_flexibility.md`** — confirmado, exige un ADR sustituta
  formal (con beneficios técnicos, impacto en costos, complejidad de mantenimiento, esfuerzo de
  migración) para cualquier cambio de "Tecnología Preferida" (Drizzle ORM, NATS en el texto original).
- **`docs/03-architecture/adr_024_official_technology_platform.md:41-43,92`** — confirmado: ADR-024
  (la resolución de AR-001) declara explícitamente _"Cumple el proceso que ADR-011 exige para cambiar
  Tecnologías Preferidas"_ y justifica el cambio de stack con los 4 puntos que ADR-011 pide.
- **Cero mecanismo de enforcement en el repositorio** — confirmado por búsqueda exhaustiva: `.github/`
  solo contiene `ci.yml` (sin plantilla de PR, sin checklist, sin check de CI relacionado con ADRs).
  `ci.yml` no menciona ADRs en ningún paso.

### 2. Línea temporal

| Fecha                   | Evento                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-02              | ADR-011 se escribe el mismo día que se introduce NestJS (commit `8900fee`, según `AR-001/ANALISIS.md`) — el proceso que exige queda, desde el día 1, sin ningún mecanismo que lo haga cumplir.               |
| 2026-07-02 → 2026-07-20 | 18 días en los que la contradicción ADR-004↔NestJS existió sin ninguna ADR sustituta — nadie la detectó automáticamente; la detectó la auditoría original (Iteración 16), no ningún control del repositorio. |
| 2026-07-20              | AR-001 cierra, produce ADR-024 — la contradicción específica queda resuelta, retroactivamente y manualmente, no por ningún mecanismo de enforcement.                                                         |
| 2026-07-02 → hoy        | El enforcement en sí (lint/CI/plantilla) sigue sin existir — confirmado hoy, cero cambios desde entonces.                                                                                                    |

### Respuesta a la pregunta de framing

> **El hallazgo original describía dos cosas distintas que el framing de la auditoría no separaba
> explícitamente: (a) una violación histórica concreta (ADR-004 vs. NestJS) y (b) la ausencia de un
> mecanismo general que detecte futuras violaciones.** (a) **queda resuelta** — AR-001/ADR-024 la
> corrigió y además cumplió formalmente el propio proceso de ADR-011. (b) **sigue completamente sin
> resolver** — no existe ningún lint, check de CI, ni plantilla de PR que detecte una futura violación,
> exactamente como describía la auditoría original. Si hoy se introdujera una segunda "Tecnología
> Preferida" sin su ADR sustituta, nada en el repositorio lo detectaría — la única razón por la que no
> ha vuelto a ocurrir es la disciplina manual de este mismo programa, no un control estructural.

**Consecuencia para el alcance de AR-002:** el alcance se reduce y se precisa — no es "resolver la
contradicción ADR-004/ADR-011" (ya resuelta), es **"introducir el mecanismo de enforcement preventivo
que ADR-011 nunca tuvo."** La propia auditoría original ya lo acotó bien (Recomendación #3, It.19): no
hace falta un proceso nuevo, ADR-011 ya especifica el correcto — falta el mecanismo que lo haga cumplir.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 (principal):** _"Las decisiones arquitectónicas sobre tecnologías preferidas deben estar
respaldadas por un mecanismo automático de enforcement que detecte desviaciones durante el ciclo de
desarrollo antes de que lleguen a la rama principal."_ Respaldada directamente por la evidencia de Fase
1: existe la política (ADR-011), existe la documentación, no existe ningún mecanismo que la haga
verificable.

**Hipótesis alternativas descartadas:**

- **H2** — la revisión manual de PR es suficiente. Descartada: depende de memoria y disciplina humana,
  no de un control reproducible — exactamente el mismo gap que ya describía la auditoría original.
- **H3** — la propia ADR ya constituye el mecanismo de enforcement. Descartada: una ADR documenta una
  decisión, no verifica su cumplimiento — son categorías distintas.
- **H4** — el enforcement debe materializarse únicamente vía CI. Descartada, pero no por estar mal
  encaminada — la evidencia exige que exista enforcement, no que se materialice exclusivamente en una
  capa concreta; restringiría prematuramente el diseño técnico (Fase 4A).

**H1 sobrevive.** Las demás o bien no automatizan el cumplimiento (H2/H3) o restringen prematuramente la
implementación (H4).

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada.**

**D-002.1:** _"Las decisiones clasificadas como 'Tecnología Preferida' deben disponer de un mecanismo de
enforcement verificable que detecte desviaciones antes de su integración en la rama principal."_
Formulada como propiedad — no nombra herramienta, capa, ni mecanismo concreto (nada de "usar GitHub
Actions", "usar Danger", "usar una plantilla de PR"). Mismo patrón exacto que D-043.1/D-054.1/D-044.1-3.

**Una sola decisión, no fragmentada en varias.** El hallazgo restante tras Fase 1 es único (ausencia de
enforcement) — una eventual combinación multicapa (plantilla de PR + lint + CI) pertenece al diseño
técnico de Fase 4A, si la evidencia allí la justifica, no a una fragmentación arquitectónica aquí.

**Explícitamente NO decidido en esta fase:** checklist documental vs. plantilla de PR vs. validación
automática en CI vs. combinación híbrida — las 4 alternativas de materialización quedan para Fase 4A,
junto con qué aspecto exacto cubre cada capa si se combinan.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

### Alternativas evaluadas

- **A — Solo plantilla de PR.** Muy simple, sin infraestructura adicional. Descartada como único
  mecanismo: sigue dependiendo de que el revisor detecte la violación, sin enforcement automático — no
  materializa D-002.1 por sí sola.
- **B — Solo CI.** Un job del pipeline analiza las decisiones marcadas como "Tecnología Preferida" y
  falla si detecta una desviación. Totalmente automático y reproducible, no depende del revisor.
  Descartada como único mecanismo: el desarrollador recibe el feedback tarde (después del push).
- **C — Solo lint local.** Feedback inmediato. Descartada: puede omitirse, depende del entorno local, no
  garantiza cumplimiento en la rama principal.
- **D — Enfoque multicapa (elegida).** No añade herramientas por acumulación — cada capa cubre una
  responsabilidad distinta, sin redundancia entre ellas:

  | Capa            | Responsabilidad                                                                            |
  | --------------- | ------------------------------------------------------------------------------------------ |
  | Plantilla de PR | Declarar conscientemente si se introduce una nueva tecnología o se modifica una preferida. |
  | CI              | Verificar automáticamente el cumplimiento de las reglas objetivas.                         |
  | ADR             | Documentar y justificar cualquier excepción aprobada.                                      |

  La plantilla recoge la intención del cambio; el CI verifica hechos; la ADR preserva la decisión
  arquitectónica. Cada pieza cumple una función diferente — ninguna sustituye a las otras.

### Precaución de diseño

El CI no debe "entender la arquitectura" — solo verificar reglas objetivas (aparición de un framework
prohibido, modificación de un archivo catalogado como tecnología preferida, incorporación de una
dependencia no permitida). La interpretación arquitectónica sigue siendo responsabilidad humana,
delegada a la plantilla de PR y a la ADR, no al CI.

### Criterio de validación para Fase 5

La pregunta de validación no es "¿existe una plantilla?" ni "¿existe un workflow?", sino:

> **¿Una futura desviación respecto a una Tecnología Preferida puede llegar a `main` sin ser detectada
> por ningún mecanismo del proyecto?**

Si la respuesta es **no**, D-002.1 queda materializada independientemente de las herramientas concretas
usadas. Este es el criterio que gobierna la aceptación de la implementación (Fase 4B) y el cierre de la
AR.

---

## Estado

**Fase 1, Fase 2A, Fase 3 y Fase 4A cerradas.** D-002.1 aprobada; diseño técnico congelado en un enfoque
multicapa (plantilla de PR + CI + ADR), sin redundancia entre capas. Pendiente: **Fase 4B
(Implementación)**. Estado: se mantiene 🟦 En análisis (no salta a 🟨 hasta Fase 4B). Decisión: ✅ Decisión
aprobada.
