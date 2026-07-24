# AR-018 — Env vars de Supabase caen en placeholders silenciosos en vez de fallar fuerte

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (filtro programático de 4 pasos, aplicado sobre las 32 AR no cerradas tras AR-034/AR-055)

Parseadas las 55 filas de `REMEDIATION_ROADMAP_V1.md` (23 cerradas). Filtradas por dependencias
resueltas (excluyendo además AR-052, pausada por decisión metodológica explícita, no por bloqueo de
dependencias). Ordenadas por (Impacto desc, Esfuerzo asc, Riesgo asc, Bloquea desc como desempate).
**AR-018 es la única candidata de Impacto Medio con Esfuerzo XS** — el resto de candidatas de Impacto
Medio tienen Esfuerzo S o superior; ninguna otra AR pendiente supera Impacto Medio (AR-001, la única
fuente de Impacto Muy Alto/Alto restante, ya está cerrada). Owner=Claude, Decisión=N/A (ejecución
directa) según el Roadmap — a verificar, como en AR-034/AR-054, si la evidencia sostiene esa etiqueta.

### Pregunta de framing que gobierna esta fase

> **¿Estas variables de Supabase siguen siendo relevantes tras el cierre de AR-001 (que confirmó
> NestJS, no Supabase, como el backend real desde el origen del proyecto), y si lo son, la recomendación
> original de la auditoría ("fallar fuerte fuera de `development`") sigue siendo la corrección correcta?**

Se formula así porque el propio Roadmap deja la dependencia con AR-001 registrada explícitamente como
determinante: _"AR-001 (determina si estas vars siguen siendo relevantes)"_ — la pregunta no es solo
"¿hay que corregir el defecto?", es "¿el defecto descrito sigue siendo el defecto correcto de corregir,
dado lo que AR-001 estableció después de que la auditoría original se escribiera?"

### 1. Reproducción / verificación directa

**Hallazgo original**, citado en 3 documentos de la auditoría (`fase-3-escalabilidad/15-seguridad.md`,
`fase-2-plataforma/06-backend.md`, `PROJECT_HEALTH_DASHBOARD.md`, Iteración 15): _"`env.config.ts`'s Zod
schema defaults `SUPABASE_URL`/`SUPABASE_ANON_KEY` to placeholder strings instead of failing loud on
missing config — a `.env` misconfiguration would silently produce a working-looking backend pointed at
a fake Supabase project rather than crashing at boot."_ La propia auditoría original ya anotó, en
`06-backend.md`, un matiz importante: _"This is a reasonable choice **today** (nothing actually uses
Supabase yet, per Iteration 5)"_ — es decir, la auditoría ya sabía que las variables no se consumían en
ningún sitio, y aun así clasificó el hallazgo como riesgo de un **futuro** despliegue real. Prioridad:
**Baja** (Quick Win, XS).

**Verificado hoy:**

1. **Las dos variables siguen existiendo, exactamente igual que en la auditoría.**
   `apps/backend/src/config/env.config.ts` declara `SUPABASE_URL` (`z.string().url().default('https://placeholder-project.supabase.co')`)
   y `SUPABASE_ANON_KEY` (`z.string().min(1).default('placeholder-anon-key')`) — sin cambios desde su
   introducción.
2. **Cero consumo en todo el repositorio, confirmado por grep exhaustivo.** `grep -rn
"SUPABASE_URL\|SUPABASE_ANON_KEY\|env.SUPABASE" apps/ packages/` no devuelve ninguna referencia fuera
   de la propia declaración del schema (y su `.d.ts` compilado, derivado). Ningún módulo, servicio,
   adaptador o test lee `env.SUPABASE_URL` ni `env.SUPABASE_ANON_KEY`.
3. **Ningún SDK de Supabase fue instalado jamás.** `grep -rn "supabase" apps/backend/package.json
package.json pnpm-lock.yaml` no devuelve ningún paquete `@supabase/*` en ninguna versión del
   lockfile.
4. **`.env.example` (raíz del repo) no menciona estas variables en absoluto** — solo documenta
   `REDIS_HOST`, `REDIS_PORT`, `NOTIFICATION_PROVIDER`. Ni siquiera están registradas como configuración
   esperada para un desarrollador nuevo.
5. **Historial de git: una única aparición, nunca modificada después.** `git log --follow -p` sobre
   `env.config.ts` muestra que ambas líneas se añadieron una vez y no volvieron a tocarse — ningún
   commit posterior las actualizó, las consumió, ni las eliminó.
6. **AR-001 (cerrada 2026-07-20) ya estableció, con evidencia propia, que Supabase nunca fue el backend
   real.** `ADR-024` (`docs/03-architecture/adr_024_official_technology_platform.md`): _"el código real
   (desde antes incluso de escribirse esas ADR) ya usaba NestJS, no Supabase"_ — Supabase pertenece a la
   línea arquitectónica original que ADR-001–010 describían y que nunca llegó a construirse, no a la
   plataforma oficial vigente.

### Respuesta a la pregunta de framing

> **Las variables ya no son relevantes de la misma forma en que la auditoría las describió — y la
> evidencia acumulada desde entonces es más fuerte que la que la propia auditoría tenía disponible.** La
> auditoría original ya sospechaba que "nothing actually uses Supabase yet" (Iteración 5) pero, sin el
> cierre posterior de AR-001, no podía descartar que fuera una integración pendiente de completar. Con
> AR-001/ADR-024 ya cerrados, la evidencia es categórica: cero consumo en código, cero SDK instalado,
> cero mención en `.env.example`, y una confirmación arquitectónica formal de que Supabase nunca fue ni
> es el backend vigente. **La recomendación original ("fallar fuerte fuera de `development`") ya no es
> la corrección correcta** — aplicarla literalmente forzaría que el backend rehusara arrancar en
> producción por la ausencia de configuración para un servicio que el propio backend no usa ni tiene
> forma de usar (no hay ningún cliente Supabase en el código que pudiera consumir esas variables). Fallar
> fuerte sobre una variable que nada consume no es un endurecimiento de seguridad, es una dependencia de
> arranque artificial sobre configuración muerta.
>
> **Sobre si esto sigue siendo "ejecución directa" sin decisión real:** no del todo. La auditoría
> planteaba un binario (placeholder silencioso vs. fallo fuerte) que asumía implícitamente que las
> variables seguirían existiendo. La evidencia de hoy abre una tercera vía que la auditoría no consideró
> porque no tenía cómo saberlo entonces: **eliminar las variables por completo**, en vez de cambiar su
> política de validación. Esa es una elección real entre "endurecer una variable que se queda" y
> "remover una variable que ya no debería estar" — misma clase de bifurcación que AR-034/AR-054
> encontraron bajo la misma etiqueta Owner=Claude/Decisión=N/A.

**Consecuencia para el alcance de AR-018:** a diferencia de AR-022 (donde no había ninguna vía
alternativa real), aquí sí existe una bifurcación genuina entre dos correcciones válidas y varias
más restringidas. Dado el tamaño de la AR (Esfuerzo XS, Impacto Medio, un solo archivo involucrado), no
parece justificado abrir un ciclo completo de Fase 2A/2B — la evidencia ya es suficientemente
concluyente como para que la elección entre alternativas sea una decisión pequeña y acotada, no una
decisión arquitectónica de las que este programa reserva para Owner=Usuario/Ambos. Se deja explícitamente
para que el usuario decida cómo prefiere proceder antes de continuar.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

A diferencia de AR-022 (donde la evidencia dejaba una única conclusión técnica sin alternativas
arquitectónicas reales), aquí sí existen dos hipótesis genuinamente distintas sobre qué representan
estas variables hoy. El criterio de esta fase es someter a prueba adversarial la hipótesis débil (H2),
no solo enunciarla — si sobrevive con evidencia nueva, cambia el resultado; si no, H1 queda confirmada
con más fuerza que por descarte simple.

**H1 (principal) — las variables son residuos de una decisión arquitectónica descartada.** Nunca hubo
consumo, nunca hubo SDK, nunca hubo documentación operativa, y la plataforma oficial (NestJS,
ADR-024) nunca dependió de ellas. Bajo esta hipótesis, la configuración debe eliminarse, no
endurecerse — no hay nada que "proteger con fallo fuerte" porque no hay ningún comportamiento real que
dependa de esos valores.

**H2 (alternativa) — las variables representan una integración futura todavía prevista.** Bajo esta
hipótesis, sí tendría sentido conservarlas y endurecer su validación como preparación.

### Prueba adversarial de H2, no solo ausencia de evidencia a favor

Antes de descartar H2 solo por falta de indicios, se buscó explícitamente el único lugar del proyecto
donde SÍ existe una reserva arquitectónica formal y vigente sobre persistencia/infraestructura real:
**ADR-021**, que AR-003 (D-003.1) ya identificó como la fuente de una "opción arquitectónica abierta"
para 2 documentos del dominio (`postgresql_physical_model.md`, `event_store_model.md` — clasificados
en `docs/02-domain/CLASSIFICATION_STATUS.md` como "Opción arquitectónica abierta", no "Histórico").
**Verificado: `grep -n -i "supabase" adr_021_...md` devuelve cero coincidencias.** La reserva que ADR-021
mantiene vigente es sobre el **patrón** (Event Sourcing real respaldado por PostgreSQL, con replay),
explícitamente independiente del proveedor — los propios documentos de dominio lo declaran así
("¿Es independiente del proveedor tecnológico? Sí", repetido en `bounded_contexts.md`,
`offline_sync_engine.md`, `postgresql_physical_model.md`). **Ni siquiera la única opción arquitectónica
todavía abierta en todo el proyecto menciona ni depende de Supabase específicamente.** Los 2 documentos
que sí mencionan Supabase con más detalle operativo (`bounded_contexts.md`,
`offline_sync_engine.md`) ya están clasificados por AR-003 como **"Histórico (íntegro)"**, con "cero
evidencia reutilizada" — el registro central del propio proyecto ya determinó, antes de esta AR, que
esas menciones no representan intención vigente.

**H2 no sobrevive la prueba adversarial.** No solo falta evidencia a favor — se buscó explícitamente en
el lugar más favorable posible para encontrarla (la única reserva arquitectónica formal del proyecto) y
esa reserva, verificada línea por línea, no menciona ni requiere Supabase. **H1 queda confirmada con
evidencia más fuerte que un simple descarte por ausencia.**

**Precedente registrado, mismo patrón que AR-055 con el plugin de `react-hooks`:** una referencia a algo
nunca realmente adoptado, sin rastro de intención arquitectónica vigente en ningún documento — incluso
el más generoso — se trata como configuración huérfana, no como capacidad pendiente.

---

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-018.1 aprobada.**

**D-018.1:**

> **La configuración correspondiente a tecnologías oficialmente descartadas por una decisión
> arquitectónica posterior (aquí, Supabase, superado por ADR-024) debe eliminarse cuando no exista
> consumo real, dependencia de código, ni intención arquitectónica vigente que la respalde — no debe
> conservarse "por si acaso" ni endurecerse como si protegiera una integración real.**

**2 propiedades congeladas:**

1. **La configuración huérfana se elimina, no se endurece.** Fallar fuerte sobre una variable sin
   ningún consumidor no es una mejora de seguridad — es una dependencia de arranque artificial sobre
   nada.
2. **El criterio de "intención vigente" se verifica contra la evidencia disponible, no se asume.** Antes
   de decidir "descartar" una pieza de configuración ligada a una tecnología abandonada, corresponde
   comprobar — como se hizo en Fase 2A — que ninguna reserva arquitectónica formal (ADR, decisión
   vigente) la respalda todavía. Si en el futuro apareciera una AR o ADR que reintroduce explícitamente
   una integración con Supabase (o un BaaS equivalente), esa sería una decisión nueva, no una excepción
   a D-018.1.

**Deja deliberadamente abierto (implementación):** si además de eliminar las 2 variables corresponde
tocar algún otro archivo (documentación, `.env.example` — ya no las menciona, por lo que probablemente
no aplica). Fase 4A se omite explícitamente por ser un caso de mecanismo único, sin alternativas reales
que comparar (mismo criterio que AR-022): la única forma de "eliminar 2 campos de un schema Zod sin
consumidores" es eliminarlos.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

**Cambio realizado:** eliminadas las 2 propiedades `SUPABASE_URL`/`SUPABASE_ANON_KEY` de `envSchema` en
`apps/backend/src/config/env.config.ts`. Ningún otro archivo requería cambios — `.env.example` nunca las
mencionó, ningún test las referenciaba, y `grep` confirmó cero consumidores en el resto del código antes
de tocar nada.

**Validaciones ejecutadas, con evidencia real:**

1. **Cero referencias residuales tras el cambio** — `grep -rn "SUPABASE" apps/backend/src
apps/backend/test` no devuelve ninguna coincidencia.
2. **El backend sigue arrancando y validando su configuración correctamente** — `validateEnv()` sigue
   funcionando sobre el resto de variables (`NODE_ENV`, `PORT`, `REDIS_URL`, `OTEL_*`,
   `CORS_ALLOWED_ORIGINS`, `THROTTLE_*`), sin ningún campo Supabase.
3. **Build y suite completa del backend, sin regresión** — `tsc --noEmit` limpio; suite completa de
   tests pasa sin cambios de comportamiento (ninguna prueba dependía de estas 2 variables).
4. **`git diff` limitado exclusivamente a `env.config.ts`** — 2 líneas eliminadas, cero archivos
   adicionales tocados.

---

## Fase 5 — Cierre

**Estado: ✅ Cerrada.**

D-018.1 materializada por completo: la configuración huérfana fue eliminada, no endurecida. El
razonamiento de la auditoría original (fallar fuerte) queda explícitamente descartado, con la razón
documentada — respondía a un estado del proyecto anterior a AR-001/ADR-024/AR-003, no al estado
arquitectónico vigente.

**Primer caso del programa enmarcado explícitamente como decisión de retiro (decommissioning), no de
incorporación de capacidad** — mismo rigor de Fase 2 que las decisiones de adopción (AR-034/AR-055),
aplicado a la dirección opuesta: qué hacer cuando una tecnología queda oficialmente descartada y su
configuración residual sobrevive sin consumidores.

---

## Estado

**Fase 1, Fase 2A, Fase 2B, Fase 4B y Fase 5 cerradas (Fase 4A omitida explícitamente, mecanismo único
sin alternativas). AR-018 CERRADA.** D-018.1 aprobada e implementada: eliminadas `SUPABASE_URL`/
`SUPABASE_ANON_KEY` de `env.config.ts`, sin consumidores ni intención arquitectónica vigente que las
respaldara (verificado adversarialmente contra la única reserva arquitectónica abierta del proyecto,
ADR-021, que no menciona Supabase). Build y suite de tests sin regresión. `git diff` limitado a 2 líneas
en un único archivo.
