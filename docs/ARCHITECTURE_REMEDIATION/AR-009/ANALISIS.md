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

## Estado

**Fase 1 cerrada.** El hallazgo original quedó dividido en 2 partes por la evidencia: (a) "¿el CI gatea
de verdad los merges?" — **ya resuelta indirectamente por AR-002**, confirmado con evidencia de
comportamiento real, no solo de configuración; (b) "¿es esa configuración verificable desde el propio
repo, y existe `CODEOWNERS`?" — **sigue sin resolver**, fuera del alcance original de AR-002. Alcance de
AR-009 se reduce a (b). Estado: ⬜ → 🟦 En análisis. Decisión: pendiente Fase 2A (Owner=Usuario — el
hallazgo original así lo marca; Fase 1 fue evidencia pura, la fase de hipótesis/decisión sí requiere el
juicio del usuario sobre qué nivel de garantía vale la pena para un repo de este tamaño).
