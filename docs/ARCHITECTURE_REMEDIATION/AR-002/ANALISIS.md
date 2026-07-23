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

## Estado

**Fase 1 cerrada.** Hallazgo parcialmente resuelto (la violación histórica concreta) y parcialmente
vigente (el enforcement general, todavía ausente). Estado: ⬜ → 🟦 En análisis. Decisión: pendiente de
Fase 2A/2B — ¿qué forma debe tener el enforcement (checklist de PR, lint, CI check) y sobre qué debe
verificar exactamente?
