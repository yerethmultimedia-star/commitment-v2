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

## Estado

**Fase 1 cerrada.** El hallazgo original se confirma vigente en su síntoma (placeholders silenciosos)
pero su remedio recomendado queda obsoleto por evidencia posterior a la auditoría (AR-001/ADR-024): las
variables no tienen ningún consumidor real en el código, ningún SDK de Supabase fue instalado, y no
están documentadas en `.env.example`. Pendiente: decidir entre eliminar las variables (tratarlas como
configuración muerta) vs. conservarlas con validación de fallo fuerte (tratarlas como configuración
legítima pendiente de uso futuro) vs. alguna alternativa intermedia. Estado: ⬜ → 🟦 En análisis.
Decisión: pendiente.
