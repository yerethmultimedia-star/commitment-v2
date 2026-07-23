# Architecture Transition 2026

**Propósito:** este documento es exclusivamente histórico. No toma decisiones — esas están en
**ADR-024** (`adr_024_official_technology_platform.md`). Responde una pregunta distinta: _¿cómo
llegó Commitment de la arquitectura concebida en ADR-001–010 a la arquitectura que realmente se
construyó?_ Producido como parte de **AR-001**, la primera remediación del programa Architecture
Remediation v1.0 (ver `docs/ARCHITECTURE_REMEDIATION/AR-001/ANALISIS.md` para el análisis completo
que llevó a este documento).

---

## Cronología, con evidencia de commit

| Fecha              | Commit    | Evento                                                                                                                                                                                                                                                                                          |
| ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-02 02:14   | `c81a3ed` | Se añaden ADR-001 a ADR-010 — arquitectura concebida: Flutter, Supabase (Auth/DB/Storage/Realtime), Event Sourcing sobre PostgreSQL, IA agnóstica, offline resiliente, límite de 3 microacciones, sin gamificación/rachas.                                                                      |
| 2026-07-02 03:27   | `8900fee` | Se inicializa el monorepo **con backend NestJS** — ~73 minutos después de escribirse ADR-001–010. En el mismo commit se añade **ADR-011** (Flexibilidad de Tecnologías Preferidas), la "válvula de escape" de gobernanza para cambiar tecnologías preferidas mediante un proceso formal de ADR. |
| 2026-07-08         | `88fd4b8` | `ci: remove flutter workflow in favor of node/react-native` — commit explícito confirmando el abandono de Flutter. Sin ADR sustituta asociada.                                                                                                                                                  |
| 2026-07-08 23:46   | (ADR-014) | ADR-014 sigue hablando de _"futuras migraciones a PostgreSQL/Supabase"_ en tiempo futuro — el equipo todavía trataba esa migración como pendiente, no como abandonada.                                                                                                                          |
| 2026-07-10         | `c56d5f1` | Único commit de toda la historia del repo que menciona Supabase — `chore(supabase): disable analytics and vector services in local config`. Desactiva servicios, no los integra.                                                                                                                |
| 2026-07-10 a 07-12 | 3 commits | `docs/ARCHITECTURE_OVERVIEW.md` se crea y se edita por última vez. Nunca actualizado desde entonces — sigue describiendo PostgreSQL, SQLite local, Event Sourcing, y Firebase Push, ninguno de los cuales existe en el código real.                                                             |
| 2026-07-17         | (ADR-021) | ADR-021 decide persistencia real: CQRS de estado versionado, rechazando explícitamamente Event Sourcing — sin mencionar ni reconciliar la migración a PostgreSQL/Supabase de la que hablaba ADR-014.                                                                                            |
| 2026-07-20         | —         | Architecture Review v1.0 (20 iteraciones) encuentra la contradicción ADR-004↔implementación como su hallazgo más significativo de toda la revisión. Se abre AR-001.                                                                                                                             |
| 2026-07-20         | —         | AR-001 concluye: no hubo sustitución formal, hubo dos líneas paralelas desde el día 1. Se emite **ADR-024**, formalizando la plataforma real.                                                                                                                                                   |

## Lectura de la evidencia

**No hay ventana de tiempo consistente con "deriva gradual."** El pivote a NestJS ocurrió el mismo
día que se escribieron los ADR originales, no meses o años después. No existió una implementación
real basada en Supabase que luego se abandonara — la implementación NestJS y los ADR Flutter/Supabase
nacieron casi simultáneamente, como dos líneas de trabajo que nunca se sincronizaron.

**No se encontró evidencia de que la implementación real sea técnicamente inferior a lo concebido.**
Ver ADR-024 § Justificación para la evaluación completa contra 8 criterios (escalabilidad,
mantenibilidad, complejidad, costo, DX, seguridad, evolución futura, alineación con visión de
producto) de NestJS, React Native + Expo, y BullMQ + Redis.

**El patrón se repite en más de un componente**, no solo en Supabase/NestJS:

| Concebido (ADR-001–010)                             | Implementado realmente                                         |
| --------------------------------------------------- | -------------------------------------------------------------- |
| Flutter (ADR-001)                                   | React Native + Expo                                            |
| Event Sourcing (ADR-002)                            | CQRS de estado versionado (ADR-021)                            |
| PostgreSQL (ADR-003)                                | En memoria (persistencia real aún no decidida — ver AR-028)    |
| Supabase (ADR-004)                                  | NestJS a medida                                                |
| Offline Resilient como requisito core (ADR-008)     | ~10% implementado (ver Architecture Review, Iteración 11)      |
| Máximo 3 microacciones visibles (ADR-009)           | Concepto removido (ver `THE_COMMITMENT_FRAMEWORK.md` Appendix) |
| Drizzle ORM / NATS como "stack preferido" (ADR-011) | Ningún ORM; BullMQ, no NATS                                    |

ADR-005 (rechazo de Firebase), ADR-006 (rechazo de gamificación) y ADR-007 (IA agnóstica) no se
incluyen en esta tabla — no versan sobre plataforma tecnológica base, o su estado se rastrea por
separado (la tensión de ADR-006 con el copy de gamificación shippeado está registrada en
`docs/00-framework/REVIEW_STATUS.md`, no es parte de esta transición de plataforma).

## Por qué esta reclasificación tiene precedente en el propio proyecto

`docs/00-framework/THE_COMMITMENT_FRAMEWORK.md` (Appendix) ya trató cuatro documentos fundacionales
del mismo rango de fechas exacto (2026-07-02 a 2026-07-04) —
`commitment_constitution.md`, `commitment_behavioral_principles.md`,
`commitment_navigation_philosophy.md`, `commitment_experience_principles.md` — como _"historical
design inputs, not authoritative specifications, per instruction."_ ADR-001–010 comparten la fecha
2026-07-02. La reclasificación que hace ADR-024 no es una excepción creada para este caso — es la
aplicación consistente de una política que este proyecto ya adoptó para documentos de la misma
naturaleza y vintage.

## Qué significa esto para quien lee este documento en el futuro

Si te preguntas por qué existe una ADR-024 numerada muy por encima de ADR-004, y por qué ADR-001 a
ADR-010 siguen en el repositorio en vez de haberse borrado: es exactamente eso. No se ocultó la
historia. Las ADR originales conservan su texto exacto, con una nota de reclasificación que aclara su
estatus actual. ADR-024 es la que rige hoy. Este documento es el puente entre ambas.
