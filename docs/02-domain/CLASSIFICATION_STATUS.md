# Estado de clasificación — `docs/02-domain/`

AR-003, D-003.1 (`docs/ARCHITECTURE_REMEDIATION/AR-003/ANALISIS.md`) — este registro es la fuente de
verdad de la clasificación. Vive en la arquitectura, no en la estructura de carpetas: una futura
reorganización física de estos documentos (mover, archivar, extraer) no requiere volver a clasificar
el conocimiento — solo actualizar dónde vive cada fragmento ya clasificado aquí.

**Unidad de clasificación:** el fragmento de conocimiento, no el archivo. Un documento puede contener
fragmentos con destinos distintos.

**Destinos posibles (Fase 4A):**

- **Histórico** — conocimiento sustituido; el documento (o fragmento) puede archivarse íntegramente
  sin pérdida de valor arquitectónico.
- **Evidencia vigente** — conocimiento ya citado como evidencia real por una AR de este programa; debe
  seguir siendo localizable, no necesariamente en el archivo original.
- **Opción arquitectónica abierta** — conocimiento que respalda una dirección todavía reservada por
  una ADR vigente; se preserva como reserva, nunca se presenta como implementación actual.

---

## Registro

| Documento                      | Clasificación                             | Justificación                                                                                                                                                                                                                                                                                                                                                                                                                         | Trazabilidad                                                                                                                   |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `CONCEPTS.md`                  | Histórico (íntegro)                       | Vocabulario pre-Framework (Microacción, Fricción, Momentum, "Social Context") reemplazado por `THE_COMMITMENT_FRAMEWORK.md` (Capítulos 1-2, 4) y por el dominio realmente enviado (Task/Habit/Goal). Cero evidencia reutilizada por ninguna AR.                                                                                                                                                                                       | `docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md` §6                                                                         |
| `bounded_contexts.md`          | Histórico (íntegro)                       | Mismo vocabulario pre-Framework; el bounded context "Resilience & Inactivity" que modela nunca se construyó. Cero evidencia reutilizada.                                                                                                                                                                                                                                                                                              | `docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md` §6                                                                         |
| `domain_state_machines.md`     | **Mixto** — Histórico + Evidencia vigente | La FSM completa (§1-2, `EnFriccion`/`EnAdaptacion`/`Recuperandose`) es histórica — el ciclo de vida realmente enviado (Commitment Draft→Active) es más simple y no implementa estos estados. **§3.C "AI Commands" es Evidencia vigente**: su regla ("la IA nunca emite un Comando de Dominio de forma directa... solo si el usuario toca 'Aceptar propuesta'") fue citada explícitamente como evidencia real por AR-047 para D-047.1. | Histórico: `FRAMEWORK_FREEZE_PREPARATION.md` §6. Evidencia vigente: `docs/ARCHITECTURE_REMEDIATION/AR-047/ANALISIS.md`, Fase 1 |
| `postgresql_physical_model.md` | Opción arquitectónica abierta             | Describe un modelo relacional para Event Sourcing real — no es la arquitectura presente (in-memory, sin Event Sourcing), pero ADR-021 reserva explícitamente esa dirección como válida a largo plazo.                                                                                                                                                                                                                                 | `docs/03-architecture/adr_021_goal_backend_and_domain_history_infrastructure.md`                                               |
| `event_store_model.md`         | Opción arquitectónica abierta             | Mismo respaldo que `postgresql_physical_model.md` — describe el Event Store como fuente de verdad con replay, la dirección que ADR-021 reserva sin exigir todavía.                                                                                                                                                                                                                                                                    | `docs/03-architecture/adr_021_goal_backend_and_domain_history_infrastructure.md`                                               |
| `read_models.md`               | Opción arquitectónica abierta             | Mismo respaldo — proyecciones CQRS sobre un Event Store real, parte de la misma dirección reservada por ADR-021.                                                                                                                                                                                                                                                                                                                      | `docs/03-architecture/adr_021_goal_backend_and_domain_history_infrastructure.md`                                               |
| `offline_sync_engine.md`       | Histórico (íntegro)                       | Escrito explícitamente para Flutter (_"El Sync Engine opera mediante un ciclo de estados controlado en Flutter"_); AR-001 confirmó React Native+Expo como stack oficial. Cero opción normativa viva, cero evidencia reutilizada.                                                                                                                                                                                                      | `docs/ARCHITECTURE_REMEDIATION/AR-001/ANALISIS.md`; `docs/03-architecture/adr_024_official_technology_platform.md`             |

---

## Precisión de alcance

Este registro cubre exactamente los 7 documentos que AR-003 investigó (`docs/ARCHITECTURE_REMEDIATION/AR-003/ANALISIS.md`,
Fase 1). No cubre el grupo distinto de "7 documentos" que `docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md`
menciona por separado (los 4 fundacionales de `docs/01-product/` + `north_star.md`/`canonical_dictionary.md`/
`UBIQUITOUS_LANGUAGE.md`) — esa es una pregunta abierta del propio Framework, no de esta remediación.
