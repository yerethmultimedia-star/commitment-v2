# 🏛️ ADR-016: Sprint Governance Rules

**Estado:** Aprobado

---

## Contexto

La reconciliación documentada en
[`engineering/governance/roadmap_reconciliation_2026Q3.md`](../../engineering/governance/roadmap_reconciliation_2026Q3.md)
encontró que `ROADMAP.md`, `PROJECT_STATUS.md` y `ENGINEERING_BOARD.md` permanecieron sin
actualizar durante cinco sprints etiquetados (`VS-026` a `VS-031`, del 2026-07-09 al 2026-07-12),
todos ellos posteriores a la última sincronización de gobernanza (2026-07-08). Adicionalmente, el
número `VS-031` fue reutilizado para un alcance distinto al que el roadmap ya le había asignado
("Search / Filters"), sin que ninguna decisión de gobernanza quedara registrada (ver ADR-015).

Ambos síntomas comparten una misma causa raíz: la arquitectura y el código evolucionaron más
rápido que el proceso de gobernanza que se supone debe rastrearlos, y no existía ninguna regla
que lo impidiera estructuralmente.

---

## Decisión

Se adoptan tres reglas permanentes de gobernanza:

### Regla 1 — Sincronización obligatoria al cerrar un sprint

Ningún sprint puede considerarse cerrado hasta que, en el mismo cambio, se actualicen al menos
estos documentos:

- `ROADMAP.md`
- `PROJECT_STATUS.md`
- `ENGINEERING_BOARD.md`
- `walkthrough.md`
- El archivo de tarea del sprint (`engineering/tasks/`)
- El Completion Report correspondiente (`slice-closure.md`), cuando aplique

### Regla 2 — Los números de sprint no se reutilizan sin ADR

Un número de sprint (`VS-0XX`) no puede reutilizarse ni reasignarse a un alcance distinto sin una
ADR o decisión de gobernanza registrada explícitamente. Esta regla, de haber existido antes,
habría evitado la colisión de `VS-031` documentada en ADR-015.

### Regla 3 — Sprint Freeze y ciclo de vida completo

Se reemplazan los tres estados actuales (`Planned` / `Active` / `Completed`) por el siguiente
ciclo de vida:

| Estado     | Significado                                                                                 |
| :--------- | :------------------------------------------------------------------------------------------ |
| Proposed   | Idea inicial; el alcance todavía puede cambiar libremente.                                  |
| Planned    | Existe un plan preliminar, pero el alcance aún puede ajustarse.                             |
| **Frozen** | Alcance, numeración y criterios de aceptación aprobados; cualquier cambio requiere una ADR. |
| Active     | Implementación en curso.                                                                    |
| Completed  | Implementación terminada y verificada.                                                      |
| Closed     | Completion Report aprobado, documentación sincronizada, gobernanza actualizada.             |

Un sprint entra en estado **Frozen** una vez que su alcance, su identificador y sus criterios de
aceptación quedan aprobados. A partir de ese punto, su identificador y alcance solo pueden
cambiar mediante una ADR o decisión de gobernanza equivalente.

La separación entre **Completed** y **Closed** es deliberada: `Completed` describe el estado del
código; `Closed` describe el estado de la gobernanza. VS-025 a VS-031 alcanzaron (según evidencia
autodeclarada en sus commits) el estado `Completed` sin haber alcanzado nunca `Closed` — la
gobernanza nunca se sincronizó. Bajo este modelo, esa brecha queda visible en vez de silenciosa.

---

## Consecuencias

- `ROADMAP.md`, `PROJECT_STATUS.md` y `ENGINEERING_BOARD.md` deben adoptar el vocabulario de
  estados de esta ADR en sus próximas actualizaciones.
- Todo futuro Completion Report debe confirmar explícitamente que las Reglas 1 y 2 se cumplieron
  antes de marcar un sprint como `Closed`.
- Esta ADR formaliza, como regla permanente del proyecto, la sección 8 de
  `engineering/governance/roadmap_reconciliation_2026Q3.md`.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
