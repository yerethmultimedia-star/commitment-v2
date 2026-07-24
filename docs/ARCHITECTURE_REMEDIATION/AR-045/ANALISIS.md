# AR-045 — Cero artefactos de despliegue para ambas apps

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 36 AR pendientes)

Parseadas todas las filas `⬜ Pendiente` de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-003 (36 de
54; 17 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **AR-045 es la única candidata con Impacto Alto entre las
que tienen dependencias resueltas** — AR-048 empata en Impacto pero tiene Esfuerzo XL frente al
Esfuerzo L de AR-045. Sus 2 dependencias declaradas (AR-001, AR-043) están ambas cerradas. Owner=Ambos.

### Pregunta de framing que gobierna esta fase

> **¿Sigue el hallazgo original vigente en su totalidad, o alguna AR ya cerrada (en particular AR-001)
> resolvió parte de él?**

Se formula así porque el propio hallazgo original ya distinguía dos componentes de naturaleza distinta
y prioridad distinta — una contradicción de gobernanza (Prioridad Alta) y una ausencia de
infraestructura de despliegue (Prioridad Media) — y AR-001 tocó exactamente el tipo de contradicción
ADR↔Implementación que el primer componente describe.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-4-produccion/16-infraestructura.md`, It.16), con
dos componentes explícitamente separados por la propia auditoría:

1. **Cero artefactos de despliegue de cualquier tipo** — sin `Dockerfile`, sin `.dockerignore`, sin
   manifiestos de Kubernetes/Terraform/Pulumi, sin config de PaaS, sin `eas.json` para builds de
   producción de Expo, sin script `"deploy"` en ningún `package.json`. Prioridad: **Media** ("no hay
   usuarios reales todavía, la ausencia en sí no es urgente").
2. **Contradicción de gobernanza ADR-004↔ADR-011** — ADR-004 (aprobada) decidía Supabase; se construyó
   exactamente la alternativa que la propia ADR-004 rechazaba explícitamente (backend NestJS a medida);
   ADR-011 exige una ADR sustitutoria formal para cualquier cambio de Tecnología Preferida, y ninguna
   existía en el momento de la auditoría. Prioridad: **Alta** ("no es un problema de infraestructura
   faltante, es una violación en vivo del propio proceso de control de cambios del proyecto").

**Verificado hoy, componente por componente:**

1. **Artefactos de despliegue — confirmado, sin cambios.** Búsqueda exhaustiva, misma metodología que
   la auditoría: cero `Dockerfile` (raíz, `apps/backend/`, `apps/mobile/`), cero `eas.json`, cero
   script `"deploy"` en ningún `package.json`, cero paso de despliegue en `.github/workflows/ci.yml`.
   Solo existe `docker-compose.yml` (el stack local de Supabase, ya identificado por la auditoría como
   no usado por el backend, sin relación con el despliegue de producción).
2. **Contradicción ADR-004↔ADR-011 — completamente resuelta por AR-001, verificado, no asumido.**
   `docs/03-architecture/adr_024_official_technology_platform.md` se escribió explícitamente para
   satisfacer este requisito: cita literalmente _"Justificación (requerida por ADR-011 para cambiar
   una Tecnología Preferida)"_ y _"Cumple el proceso que **ADR-011** exige para cambiar Tecnologías
   Preferidas"_ — y reclasifica formalmente la autoridad normativa de ADR-004 (entre otras). La
   violación en vivo que la auditoría señaló como Prioridad Alta ya no existe.

### Hallazgo adicional: la dependencia con AR-043 no está explícita en el hallazgo original

El texto completo de `16-infraestructura.md` no menciona autenticación ni AR-043 en ningún punto —
la dependencia declarada en el Roadmap parece haberse asumido al redactar el borrador inicial ("no
desplegar antes de tener auth"), no derivarse de un requisito citado por la propia auditoría. No
cambia el resultado (AR-043 también está cerrada), pero se registra por la misma disciplina de
verificación que este programa ya aplica a toda dependencia declarada.

### Riesgo todavía vigente, no mencionado en el hallazgo pero relevante para el diseño

La auditoría señala explícitamente: escalar horizontalmente (más de una instancia del backend)
**rompería la corrección hoy**, porque cada instancia mantendría su propio estado en memoria
inconsistente con las demás (`InMemoryGoalRepository` y equivalentes). Verificado: AR-028 (cerrada)
introdujo concurrencia optimista sobre ese almacenamiento en memoria, pero no introdujo persistencia
real — los 7 aggregates reales siguen sobre repositorios en memoria, confirmado repetidamente a lo
largo de este programa (AR-043, AR-047, AR-050). Cualquier diseño de despliegue debe tratar esto como
una restricción real, no como un detalle a resolver más tarde.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente solo parcialmente.** Su componente de mayor prioridad (la
> contradicción de gobernanza ADR-004↔ADR-011) está completamente resuelto por AR-001/ADR-024 — ya no
> existe ninguna violación en vivo del proceso de control de cambios. Su componente de menor prioridad
> declarada (cero artefactos de despliegue) sigue exactamente vigente, sin ningún cambio.

**Consecuencia para el alcance de AR-045:** el alcance se reduce al componente que sigue siendo real —
construir los artefactos de despliegue mínimos (Dockerfile, posiblemente `eas.json`, separación de
entornos) — no a resolver ninguna contradicción de gobernanza, que ya no existe. Mismo patrón de
"alcance reducido tras resolución parcial" que AR-002 (respecto a AR-001) y AR-009 (respecto a AR-002).
El riesgo de escalado horizontal (estado en memoria) debe tratarse como una restricción de diseño
explícita en Fase 2A/4A, no como un hallazgo nuevo.

---

## Estado

**Fase 1 cerrada.** El componente de gobernanza (ADR-004↔ADR-011) del hallazgo original está
completamente resuelto por AR-001 — verificado, no asumido. El componente de infraestructura (cero
artefactos de despliegue) se confirma vigente sin ningún cambio. La dependencia declarada con AR-043
no tiene respaldo explícito en el hallazgo original, aunque no afecta el resultado (ambas dependencias
están cerradas). El riesgo de escalado horizontal sobre almacenamiento en memoria sigue vigente y debe
condicionar el diseño. Pendiente: **Fase 2A (Hipótesis)**. Estado: ⬜ → 🟦 En análisis. Decisión: 💭
Pendiente de análisis (Owner=Ambos).
