# 🏛️ ADR-015: Roadmap Reprioritization (2026 Q3)

**Estado:** Aprobado

---

## Contexto

El roadmap original (`ROADMAP.md` v1.4.0) reservaba el número **VS-031** para el sprint
**Search / Filters**, con estado "Planned". No existe ningún commit ni documento que registre el
inicio de ese trabajo.

El **2026-07-12**, el commit `7a49e0d` ("feat(mobile): implement Dashboard engine layer — Block A
(VS-031)") introdujo `DashboardLayoutEngine`, `RecommendationEngine`, su capa de integración y
tests asociados, etiquetando ese trabajo como **VS-031**. Ningún documento de gobernanza
(`ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md`, `engineering/specifications/`,
`engineering/tasks/`, `docs/`) registró en su momento una decisión de reasignar ese número.

Esta colisión fue detectada y documentada mediante un ejercicio de reconciliación de gobernanza:
[`engineering/governance/roadmap_reconciliation_2026Q3.md`](../../engineering/governance/roadmap_reconciliation_2026Q3.md).
Ese reporte confirma, con evidencia de `git log --all`, que:

- No existe ninguna especificación congelada previa para el trabajo etiquetado "Block A".
- No existe evidencia de un Block B, C o posterior.
- No existe evidencia de que Search / Filters haya comenzado bajo ningún otro número.

---

## Decisión

1. **`VS-031` cambia de alcance oficialmente** de "Search / Filters" a **"Product Experience
   Foundation"** (Dashboard Engine: `DashboardLayoutEngine`, `RecommendationEngine`, capa de
   integración, i18n). Su alcance formal reconocido por esta ADR es exactamente el observable en
   el commit `7a49e0d` ("Block A"); no se asume la existencia de bloques adicionales sin evidencia.

2. **Search / Filters se reprograma a `VS-036`**, después de `VS-035` (Offline First & Sync).
   Los sprints `VS-032` a `VS-035` (Calendar, Reminder Settings, Recurrence Management, Offline
   First & Sync) **no cambian de número**.

3. Esta decisión **no reescribe el historial de Git**. Los commits que ya usan la etiqueta VS-031
   para el Dashboard Engine permanecen sin modificar. Esta ADR únicamente alinea la gobernanza
   (`ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md`) con la implementación ya
   commiteada.

4. Bajo el ciclo de vida de sprints definido en
   [`roadmap_reconciliation_2026Q3.md`](../../engineering/governance/roadmap_reconciliation_2026Q3.md#8-proposed-standing-governance-rules)
   (`Proposed → Planned → Frozen → Active → Completed → Closed`), `VS-031` queda:
   - **Frozen** en cuanto a alcance y numeración, a partir de esta ADR.
   - **Active** en cuanto a implementación: "Block A" ya fue entregado, pero no existe todavía un
     Completion Report que verifique su cumplimiento contra criterios de aceptación. `VS-031` no
     se marca como `Completed` ni `Closed` por esta ADR.

---

## Consecuencias

- `ROADMAP.md`, `PROJECT_STATUS.md` y `ENGINEERING_BOARD.md` se actualizan en el mismo ciclo de
  cambios que esta ADR para reflejar la reasignación.
- El futuro Completion Report de VS-031 debe declarar explícitamente que no se encontró una
  especificación congelada previa para "Block A" — documentará el código observado, no una
  comparación plan-vs-real.
- Cualquier reasignación futura de un número de sprint requiere una ADR equivalente a esta (ver
  ADR-016, Sprint Governance Rules).
- El ítem 1 de "Outstanding Decisions" en `roadmap_reconciliation_2026Q3.md` queda resuelto por
  esta ADR.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
