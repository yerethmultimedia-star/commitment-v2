# AR-009 — Merge-gating no verificable desde el repositorio

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas)

- **Dependencias:** AR-009 dependía de AR-008 ("para que el gating importe de verdad") — **cerrada
  2026-07-23.** Sin bloqueos.
- **Evidencia todavía válida:** el hallazgo original (It.17) es de 2026-07-20 (Architecture Review) —
  anterior a AR-002 (2026-07-23), que tocó directamente branch protection. Necesitaba reverificación
  antes de asumir que seguía intacto.
- **Impacto/Esfuerzo:** Alto/Bajo, Riesgo Alto — el propio hallazgo original ya advertía que, si
  resultaba cierto, "cambiaría la prioridad de todo el informe de Testing/CI a Alta."

### Pregunta de framing que gobierna esta fase

> **¿Sigue siendo real este hallazgo tal como lo describió la auditoría, o quedó parcialmente resuelto
> por el cierre de AR-002?**

Se formula así porque AR-002 (cerrada hace instantes en esta misma sesión) activó branch protection en
`main` por primera vez — exactamente el mecanismo cuya ausencia motivó este hallazgo.

### 1. Reproducción / verificación directa

- **Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-4-produccion/17-cicd.md:30,45`): _"Merge-gating
  is unverifiable from the repository alone... it cannot be determined from the filesystem whether CI
  failure is actually enforced or merely advisory"_ — recomendaba explícitamente confirmar, **fuera del
  repo**, si branch protection existía; si no, la prioridad del hallazgo subía a Alta.
- **`find . -iname CODEOWNERS`** → **cero resultados.** El archivo sigue sin existir, igual que en la
  auditoría original.
- **`gh api repos/.../branches/main/protection`** (hoy) → branch protection **sí existe**, con
  `required_status_checks.contexts = ["Backend Lint, Build & Test", "Mobile Typecheck", "Preferred
Technology Enforcement (D-002.1)"]`, `strict: true`, `enforce_admins: false`.
- **Verificación empírica, no solo de configuración:** los 2 pushes directos a `main` que cerraron
  AR-002 (`98c642f`, `84d5ef3`) fueron aceptados por GitHub con el aviso explícito _"Bypassed rule
  violations for refs/heads/main: 3 of 3 required status checks are expected"_ — confirma en
  comportamiento real, no solo en configuración declarada, que (a) el gating existe y aplicaría a un PR
  normal, y (b) los administradores lo eluden por diseño (`enforce_admins: false`).

### 2. Estado del hallazgo, desagregado (mismo patrón que AR-002 Fase 1)

El hallazgo original conflaba 3 preguntas distintas que la evidencia de hoy separa con claridad:

| Sub-pregunta original                                                                                                                                                                                                       | Estado hoy                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) ¿Existe algún branch protection en `main`?                                                                                                                                                                              | **Resuelta.** Sí — activado por AR-002, `required_status_checks` con 3 contexts.                                                                                                                                                                                                                                                                                                                      |
| (b) ¿Es CI realmente obligatorio para un merge normal, o solo informativo?                                                                                                                                                  | **Resuelta.** Obligatorio — confirmado no solo por configuración sino por comportamiento real observado (los pushes de AR-002 fueron marcados explícitamente como "bypass," lo que implica que sin ese bypass habrían sido bloqueados).                                                                                                                                                               |
| (c) ¿Existe `CODEOWNERS` como señal secundaria de propiedad/revisión?                                                                                                                                                       | **Sin resolver.** Sigue sin existir, idéntico a la auditoría original.                                                                                                                                                                                                                                                                                                                                |
| (d, no estaba en el hallazgo original pero la evidencia de hoy la expone) ¿Es la configuración de branch protection verificable **desde el propio repositorio** (archivos versionados), o solo consultable vía API externa? | **Sin resolver, y no resuelta por AR-002.** La configuración vive exclusivamente en GitHub; no hay un archivo en el repo (ni Terraform, ni un script versionado con la política esperada) contra el cual diffear el estado real. `gh api` es hoy la única forma de verificarlo, y requiere credenciales de administrador del repositorio, no está al alcance de cualquier colaborador con clon local. |

### Respuesta a la pregunta de framing

> **El hallazgo original se resolvió solo parcialmente, no por acción directa de AR-009, sino como
> efecto colateral de AR-002.** La mitad más grave — "¿el CI gatea de verdad, o es solo decorativo?" —
> queda respondida que sí gatea, con evidencia de comportamiento real, no solo de configuración
> declarada. Pero el hallazgo tenía una segunda mitad, sobre la que AR-002 nunca decidió nada porque no
> era su alcance: **la propia existencia del gating no es verificable desde el repositorio** (sigue
> dependiendo de `gh api` con credenciales de administrador) **y no existe `CODEOWNERS`** como señal de
> propiedad de código. Ninguna de las dos cosas estaba en el alcance de D-002.1 (que trata sobre
> Tecnologías Preferidas, no sobre gating general ni sobre propiedad de código).

**Consecuencia para el alcance de AR-009:** se reduce y se precisa, con el mismo movimiento que AR-002
hizo sobre su propio hallazgo — no es "¿existe merge-gating?" (ya resuelto, indirectamente, por AR-002),
es **"¿es ese merge-gating verificable y explicable desde el propio repositorio, y existe una señal de
propiedad de código (`CODEOWNERS`) que lo complemente?"**

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 (principal):** _"Las políticas de gobernanza que condicionan la integración de cambios deben ser
verificables desde el propio repositorio mediante artefactos versionados, sin depender exclusivamente
de configuración externa del proveedor."_ Respaldada directamente por la evidencia de Fase 1: la branch
protection existe y funciona, pero su estado solo puede verificarse consultando GitHub con privilegios
administrativos — el repositorio, por sí mismo, no expresa esa parte de la gobernanza.

**Hipótesis alternativas descartadas:**

- **H2** — la configuración de GitHub es suficiente y no necesita representación en el repositorio.
  Descartada: no contradice el funcionamiento técnico, pero deja sin versionar una parte de la
  gobernanza del proyecto, y dificulta auditorías, revisiones offline y forks.
- **H3** — `CODEOWNERS` por sí solo resuelve el problema. Descartada: `CODEOWNERS` cubre asignación
  automática de revisores y propiedad del código; no documenta ni hace verificable la branch
  protection — son responsabilidades distintas.
- **H4** — basta con documentar manualmente la configuración en un documento. Mantenida como
  alternativa de implementación, no como hipótesis arquitectónica — la evidencia exige que la
  gobernanza sea verificable desde el repositorio, no que se materialice necesariamente en un
  documento estático.

**H1 sobrevive.** La evidencia no apunta a un problema de protección de ramas (ya resuelto por AR-002);
apunta a un problema de representación versionada de esa protección.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

**D-009.1:** _"Las políticas de gobernanza que afectan la integración de cambios deben tener una
representación versionada y verificable dentro del repositorio, complementaria a la configuración
aplicada en la plataforma de alojamiento."_

**Una sola decisión, no fragmentada.** No congela GitHub, `CODEOWNERS`, un formato concreto, ni un
archivo específico — solo establece la propiedad: la gobernanza relevante debe ser visible y auditable
desde el propio repositorio. Mismo patrón que D-002.1/D-043.1/D-054.1/D-044.1-3.

**Explícitamente NO decidido en esta fase:** `CODEOWNERS`, un documento versionado que describa la
branch protection esperada, un script de verificación que compare la configuración real con la
declarada, o una combinación — las alternativas de materialización quedan para Fase 4A.

**Pregunta que gobernará Fase 4A (fijada de antemano):**

> **¿Cuál es el conjunto mínimo de artefactos versionados que permite auditar la gobernanza del
> repositorio sin depender exclusivamente de la configuración externa de GitHub?**

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

### Alternativas evaluadas

- **A — Solo `CODEOWNERS`.** Resuelve propiedad del código y asignación automática de revisores.
  Descartada como solución completa: no resuelve branch protection, required status checks, ni reglas
  de merge.
- **B — Solo documento versionado** (p. ej. `docs/governance/branch-protection.md`) describiendo la
  configuración esperada. Auditable, versionado, independiente de GitHub. Descartada como único
  mecanismo: puede divergir de la configuración real si nadie la verifica.
- **C — Solo script de verificación.** Consulta GitHub y compara contra un estado esperado. Detecta
  deriva, pero necesita una fuente de verdad versionada contra la cual comparar — sin ella, solo
  inspecciona el estado actual. No basta por sí mismo.
- **D — Diseño multicapa (elegida).** Cada artefacto cubre una responsabilidad distinta, sin
  redundancia:

  | Artefacto                      | Responsabilidad                                                                                       |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
  | `CODEOWNERS`                   | Declarar propiedad y revisión del código.                                                             |
  | Archivo de política versionado | Declarar el estado esperado de la gobernanza (branch protection, required checks, reglas relevantes). |
  | Script de verificación         | Comparar la configuración real de GitHub con la política declarada y detectar deriva.                 |

  Uno declara responsables; otro declara la política; otro verifica que la plataforma sigue esa
  política.

### Lo que no haría

No se intentaría exportar toda la configuración de GitHub — eso acoplaría innecesariamente el
repositorio a una implementación concreta del proveedor. El archivo de política versionado contiene
únicamente lo que constituye una decisión de gobernanza del proyecto, no un espejo 1:1 de la API de
GitHub.

### Criterio de diseño

> **Si mañana hubiera que reconstruir la gobernanza del repositorio en otra instancia de GitHub (o
> incluso en otro proveedor), ¿los artefactos versionados describen completamente la política del
> proyecto y permiten verificar su correcta aplicación?**

Si la respuesta es afirmativa, D-009.1 queda materializada sin depender exclusivamente de la
configuración externa.

### Preparación para Fase 4B

Cada artefacto congelado con un único propósito, sin decisiones arquitectónicas adicionales esperadas
en la implementación (mismo patrón que AR-002/AR-044):

- **`CODEOWNERS`** → propiedad y revisión.
- **Política versionada** → fuente de verdad declarativa.
- **Script de comprobación** → verificación automática de conformidad.

---

## Estado

**Fase 1, Fase 2A, Fase 2B y Fase 4A cerradas.** El hallazgo original quedó dividido en 2 partes por la
evidencia: (a) "¿el CI gatea de verdad los merges?" — ya resuelta indirectamente por AR-002; (b) "¿es
esa configuración verificable desde el propio repo, y existe `CODEOWNERS`?" — sigue sin resolver.
D-009.1 aprobada; diseño técnico congelado en un enfoque multicapa (`CODEOWNERS` + política versionada +
script de verificación), sin redundancia entre capas. Pendiente: **Fase 4B (Implementación)**. Estado:
se mantiene 🟦 En análisis (no salta a 🟨 hasta Fase 4B). Decisión: se mantiene ✅ Decisión aprobada.
