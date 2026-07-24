# AR-034 — Cero enforcement de lint contra imports crudos de `tamagui`

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 33 AR pendientes)

Parseadas todas las filas no cerradas de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-022 (33 de
54; 21 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc, Bloquea desc como desempate). **AR-034 es la única candidata
de Impacto Medio/Esfuerzo S que además desbloquea (parcialmente) otra AR** (AR-035, Card sin congelar
props) — el resto de candidatas empatadas en Impacto/Esfuerzo/Riesgo no bloquean nada. Owner=Claude,
Decisión=N/A (ejecución directa) según el Roadmap.

### Pregunta de framing que gobierna esta fase

> **¿Sigue existiendo la misma ausencia total de enforcement mecánico, y — dado que existen ~82
> archivos con imports directos de `tamagui` hoy — la introducción de la regla es realmente
> "ejecución directa" sin decisión que tomar, o esconde una elección real sobre severidad/alcance?**

Se formula así porque el hallazgo original (Recomendación #2, `08-design-system.md`) especifica
exactamente el mecanismo a construir (`no-restricted-imports`), pero no dice cómo introducirlo sin
romper el build para el volumen de violaciones ya existente — una pregunta que este programa ya
encontró antes (AR-054) y que terminó requiriendo una decisión real pese a partir de Owner=Claude.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-2-plataforma/08-design-system.md`, It.8):
_"Zero automated enforcement of design-system adoption. El `.eslintrc.json` raíz es genérico
(`eslint:recommended` + `@typescript-eslint/recommended`, más `no-console`/`no-unused-vars`) — no
existe ninguna regla `no-restricted-imports` o equivalente en todo el repositorio que bloquee `import
{ Button } from 'tamagui'` en código de aplicación."_ Prioridad: **Media** — "la única corrección de
toda esta fase de auditoría que prevendría una clase entera de hallazgos futuros, no solo cerraría
una instancia."

**Verificado hoy:**

1. **Cero enforcement, confirmado sin cambios.** `.eslintrc.json` raíz: idéntico al citado por la
   auditoría, sin ninguna regla `no-restricted-imports`. `apps/mobile` no tiene su propio
   `.eslintrc*`/`eslint.config*` (usa `expo lint`, que resuelve su config internamente vía
   `eslint-config-expo` — tampoco contiene ninguna restricción sobre `tamagui`).
2. **El volumen de la violación creció, no se mantuvo constante.** Grep hoy: **82 archivos** en
   `apps/mobile/src` importan directamente de `'tamagui'` (excluyendo `packages/design-system`) — la
   auditoría original no cuantificó un número exacto, solo citó 2 ejemplos (`CommitmentForm.tsx`,
   `HabitForm.tsx`). El repositorio ha seguido creciendo sin ningún mecanismo de contención.
3. **Un dato nuevo y significativo, no citado por la auditoría original:** `@commitment/design-system`
   (`packages/design-system/src/index.ts:1`) ya ejecuta `export * from 'tamagui'` — el paquete ya
   re-exporta el 100% de la superficie de Tamagui, con sus propios componentes (`Button`, `Card`,
   `Badge`, `Input`, layout `Stack`/`Inline`/etc.) sobrescribiendo explícitamente los nombres
   equivalentes (confirmado: `tsc --noEmit` limpio en `packages/design-system`, sin conflicto de
   exports duplicados — la resolución de módulos de TypeScript ya prioriza correctamente los exports
   nombrados explícitos sobre el `export *`). **Consecuencia práctica: cualquier import que hoy
   apunte a `tamagui` podría redirigirse a `@commitment/design-system` sin cambiar ningún
   comportamiento** para los componentes que el paquete no sobrescribe, y con mejoras reales
   (i18n, tokens, accesibilidad) para los que sí sobrescribe. La regla de lint no depende de
   construir nada nuevo en `design-system` — el paquete ya está listo para ser el único punto de
   entrada.
4. **El P1 específico citado por la auditoría original ya fue corregido, como mantenimiento
   ordinario, no como parte de este programa.** `CommitmentForm.tsx`/`HabitForm.tsx` ya importan
   `Button` desde `@commitment/design-system` (confirmado hoy); `TECH_DEBT.md` (líneas 133-151)
   documenta esta corrección puntual, ya tachada como resuelta. **Pero la corrección fue narrow — solo
   `Button` en 2 archivos** — no tocó el resto de sus propios imports crudos (`YStack` en ambos
   formularios sigue viniendo de `'tamagui'` directamente) ni construyó ningún mecanismo de
   prevención. Confirma exactamente el patrón que la auditoría señaló como el riesgo real: "fixing the
   7 known instances treats symptoms; the lint-enforcement gap is the actual recurring risk."
5. **Precedente interno directamente aplicable, no citado por la auditoría (que es anterior a
   AR-054):** `apps/backend/eslint.config.mjs` ya tiene una regla `@typescript-eslint/no-restricted-imports`
   real en producción (AR-054, D-054.1) — restringe `BullModule`/`InjectQueue` a 3 archivos
   designados, con mensajes de error explicativos citando la AR/decisión correspondiente. Mismo
   mecanismo ESLint, ya validado en este mismo repositorio; sirve de plantilla de estilo, aunque
   `apps/backend` usa flat config (`eslint.config.mjs`) y `apps/mobile`/raíz usan el formato legacy
   (`.eslintrc.json`) — la sintaxis de la regla en sí es idéntica en ambos formatos.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente e incluso agravado en volumen** (82 archivos hoy, sin
> cifra exacta en la auditoría original) — cero enforcement mecánico sigue existiendo. **La instancia
> puntual que la auditoría citó como ejemplo (P1, `Button` en 2 formularios) ya se corrigió como
> mantenimiento ordinario, sin construir ningún mecanismo de prevención** — confirma precisamente el
> riesgo que la propia auditoría señaló (tratar síntomas, no la causa mecánica).
>
> **Sobre si esto es "ejecución directa" sin decisión real:** el mecanismo (`no-restricted-imports`)
> ya está completamente especificado por la auditoría, y `@commitment/design-system` ya es
> arquitectónicamente capaz de ser el único punto de entrada (re-exporta el 100% de `tamagui`) — en
> ese sentido, no hay ninguna propiedad arquitectónica nueva que congelar. **Pero introducir la regla
> con 82 violaciones existentes sí implica una elección real de severidad/alcance** (¿`error` que
> rompe el build hoy para 82 archivos? ¿`warn` que no bloquea nada nuevo? ¿excluir los 82 archivos
> existentes vía `overrides` y aplicar `error` solo a partir de ahora?) — la misma clase de pregunta
> que AR-054 encontró bajo la misma etiqueta Owner=Claude/Decisión=N/A, y que terminó requiriendo una
> decisión real entre alternativas.

**Consecuencia para el alcance de AR-034:** a diferencia de AR-022 (donde el diagnóstico y la
corrección venían completamente dados, sin ninguna elección real pendiente), aquí sí existe una
elección genuina de diseño sobre cómo introducir la regla sin romper el build ni volver la regla
inofensiva. Se deja explícitamente para que el usuario decida si esto justifica una Fase 2/2B propia
(como ocurrió con AR-054/AR-044/AR-002/AR-004/AR-030) o si prefiere fijar directamente el criterio de
alcance antes de pasar a Fase 4B.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**Decisión sobre el propio proceso, tomada antes de la fase:** esta AR sí abre Fase 2, pero acotada —
no porque exista una decisión arquitectónica pendiente (la arquitectura objetivo ya está decidida:
_"el único punto de entrada permitido debe ser `@commitment/design-system`"_, dada por la propia
evidencia de Fase 1), sino porque existe una **decisión de transición** genuina: cómo introducir la
restricción sin romper el estado actual del repositorio (82 violaciones). Saltar directamente a Fase
4B habría significado congelar una política de adopción sin comparar alternativas — precisamente lo
que Fase 2 existe para evitar.

**H1 (principal, la que se espera que sobreviva):** introducir la regla permitiendo una adopción
incremental (mecanismo de baseline/exclusiones temporales para las violaciones ya existentes, bloqueo
estricto solo para imports nuevos).

**Hipótesis alternativas:**

- **H2** — activar `error` inmediatamente para todo el código, incluidas las 82 violaciones
  existentes.
- **H3** — introducir únicamente `warn`, sin bloqueo real en ningún caso.

**Expectativa registrada, sin resolverla formalmente todavía en esta fase:** se anticipa que sobrevive
una variante de H1 — la evidencia ya demuestra que las 82 violaciones son deuda existente, y que el
propósito de esta AR es impedir deuda **futura**, no bloquear el desarrollo hasta migrar los 82
archivos de una vez.

**Diferencia explícita con AR-022, registrada como criterio de cuándo abrir Fase 2 pese a
Owner=Claude:** AR-022 no tenía ningún estado intermedio posible — la implementación correcta era
única. Aquí existen varias implementaciones distintas, todas compatibles con la misma arquitectura
objetivo, con consecuencias distintas sobre el proceso de desarrollo — cuando eso ocurre, corresponde
un ciclo completo de Fase 2 → Fase 2B → Fase 4A antes de Fase 4B, no porque la arquitectura esté en
duda, sino porque la estrategia de transición todavía no está decidida.

---

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-034.1 aprobada.**

La hipótesis superviviente no deriva de una preferencia por la adopción gradual, sino de la evidencia
disponible: existen 82 violaciones ya presentes; el punto de entrada arquitectónico ya existe
(`@commitment/design-system`); el objetivo de la AR es prevenir nueva deuda, no bloquear la existente;
existe un precedente de enforcement en el repositorio (AR-054). Se congela una decisión de política,
no de implementación.

**D-034.1:**

> **`@commitment/design-system` constituye el único punto de entrada autorizado para los componentes
> y APIs de Tamagui. A partir de la adopción de esta decisión, las nuevas importaciones directas
> desde `tamagui` quedan prohibidas. Las importaciones históricas podrán mantenerse únicamente
> mediante un mecanismo de transición explícito y temporal hasta su migración.**

**4 propiedades congeladas:**

1. **Unicidad del punto de entrada** — todo consumo futuro pasa por `@commitment/design-system`.
2. **Prevención de nueva deuda** — no pueden aparecer nuevas importaciones directas de `tamagui`.
3. **Compatibilidad con la deuda existente** — las 82 ocurrencias actuales no obligan a una migración
   masiva inmediata.
4. **Temporalidad** — el mecanismo de transición no forma parte de la arquitectura objetivo; existe
   únicamente para facilitar la migración.

**Deja deliberadamente abierto (Fase 4A):** `error` vs. `warn`, `no-restricted-imports` con
excepciones, overrides por directorio, baseline, allowlist, estrategia de eliminación de las
excepciones.

**Consistencia con el programa:** Fase 2B congela qué política arquitectónica debe cumplirse; Fase 4A
decide cómo implementarla con el menor coste de transición — la decisión permanece estable incluso si
en el futuro cambian las capacidades de ESLint o se elige un mecanismo técnico distinto para hacer
cumplir la misma política.

**Eje Decisión reclasificado, mismo criterio que AR-054/AR-044/AR-002/AR-004/AR-030:** esto no es una
excepción al proceso de 9 fases — es una excepción a quién suele ser el propietario habitual de las
decisiones. D-034.1 no nació de una preferencia de diseño; nació porque la evidencia de Fase 1 dejó
una propiedad de política arquitectónica concreta que decidir (varias implementaciones válidas con
consecuencias distintas sobre el desarrollo). `Owner=Claude` sigue describiendo correctamente quién
ejecuta la AR.

---

## Estado

**Fase 1, Fase 2A y Fase 2B cerradas.** D-034.1 aprobada: `@commitment/design-system` es el único
punto de entrada autorizado para Tamagui; nuevas importaciones directas quedan prohibidas; las 82
históricas se permiten solo bajo un mecanismo de transición explícito y temporal. Pendiente: **Fase
4A (Diseño técnico)** — comparar alternativas concretas de mecanismo (severidad, exclusiones,
overrides, baseline) sin reabrir ninguna de las 4 propiedades congeladas. Estado: se mantiene 🟦 En
análisis. Decisión: N/A → ✅ Decisión aprobada.
