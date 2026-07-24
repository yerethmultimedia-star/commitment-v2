# Revisión transversal — patrones metodológicos en las 15 AR cerradas (2026-07-23)

Segunda revisión transversal del programa, abierta al alcanzar el **hito 1** (15 ARs cerradas)
pre-registrado al cerrar AR-054 junto con el criterio de promoción de Fase 0. A diferencia de la
primera (`REVISION_TRANSVERSAL_7_ARS.md`), esta se plantea explícitamente como una evaluación acotada,
no como una reflexión abierta: **¿existe evidencia suficiente para cambiar una metodología que lleva
15/15 ARs cerradas sin excepciones al ciclo?** La carga de la prueba recae sobre el cambio, no sobre la
metodología vigente. Sigue la disciplina de comparabilidad ya fijada en `README.md`: responde
exactamente las mismas 4 preguntas que estructuraron la revisión de 7 ARs, extendidas a las 15
(AR-001, AR-028, AR-023, AR-043, AR-008, AR-053, AR-054, AR-044, AR-002, AR-009, AR-036, AR-004,
AR-024, AR-030, AR-047), antes de añadir el marco de evaluación v1.0→v1.1. Cada afirmación está
verificada por lectura/grep directo de los `ANALISIS.md` reales, no por recuerdo de la conversación.

---

## 1. ¿Cuántas veces cambió el propietario del problema?

**Sin casos nuevos limpios en las 8 ARs añadidas desde la revisión de 7 — pero un patrón distinto,
emparentado, ocupó su lugar como señal dominante de este segundo lote.**

El patrón estricto de "cambio de propietario" (un tercero resulta responsable en vez del sospechoso
original — AR-053: tests, no dominio; AR-054: `RedisConnection` interna de `bullmq`, no la integración
propia) no reapareció en AR-002, AR-004, AR-009, AR-024, AR-030, AR-036, AR-044 ni AR-047. En su lugar,
3 de las 8 (AR-024, AR-030, AR-047) comparten una estructura distinta, ya registrada como hipótesis en
observación al cerrar AR-047:

| AR     | Se asumía al abrir                                    | Se encontró al cerrar                                                                                        |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| AR-024 | Hay que diseñar el límite Goal→Commitment→Task        | El límite ya operaba en el código (`1ead830`, 2 días antes de la auditoría); faltaba formalizarlo            |
| AR-030 | Hay que diseñar el aggregate `Identity` desde cero    | El aggregate ya existía y cumplía las invariantes; faltaba el módulo de backend                              |
| AR-047 | Hay que construir un mecanismo de enforcement para IA | El enforcement ya era estructural (`packages/domain` sin dependencia de `@nestjs/cqrs`); faltaba reconocerlo |

**No es el mismo patrón que "cambio de propietario"** (aquí no hay un tercero al que reasignar la
culpa) — es más cercano a la forma general de AR-001 (donde la pregunta abierta resultó ya resuelta por
la realidad, solo sin formalizar). De hecho, esta revisión confirma la nota que la revisión de 7 ARs ya
había registrado sobre AR-001 ("primer precedente, más general, del mismo cambio de propietario") — con
3 casos adicionales, ese precedente general tiene ahora una identidad propia, distinta del patrón
estricto de AR-053/AR-054. Es exactamente la hipótesis que el usuario registró en observación al cerrar
AR-047 (ver README, sección "Hipótesis en observación").

**Total combinado (15 ARs):** 2 casos estrictos de cambio de propietario (AR-053, AR-054) + 1 precedente
más general y más antiguo (AR-001) + 3 casos de un patrón emparentado pero distinto, "la propiedad ya
existe, falta reconocerla" (AR-024, AR-030, AR-047). Ningún otro cierre (AR-028, AR-023, AR-043, AR-008,
AR-002, AR-009, AR-036, AR-004, AR-044) mostró ninguno de los dos patrones.

---

## 2. ¿Cuántas decisiones se simplificaron por seguir la evidencia (patrón H-GOV-01)?

**5 casos verificados por grep — el patrón con más repeticiones independientes de todo el programa,
y el que más diversidad de contexto acumula.**

Los 3 ya conocidos (AR-023: preservar `core/AggregateRoot`; AR-043 H-043.8: rechazar Postgres/Redis
para Authentication; AR-054 Fase 4A: rechazar `DiscoveryService`) más **2 nuevos**:

4. **AR-036 (Fase 4B)** — al modelar la eliminación del concepto "streak", se rechazó eliminar el campo
   de dominio `Habit.currentStreakDays` (la opción "más pura" en apariencia) porque la evidencia no
   exigía tocarlo — el problema era de modelo conceptual de producto, no de dato de dominio. Cita
   explícita: "mismo principio que ya usó H-GOV-01 en otras ARs."
5. **AR-047 (Fase 4B)** — rechazó construir infraestructura de enforcement para un consumidor de IA que
   todavía no existe (Alternativa A), y en su lugar aprovechó una propiedad estructural ya presente en
   el monorepo en vez de añadir mecanismo nuevo alguno. Cita explícita al patrón por su nombre.

**Contextos cubiertos ahora:** gobernanza de arquitectura de referencia (AR-023), stack tecnológico de
seguridad (AR-043), integración de infraestructura con una librería externa (AR-054), modelo de producto
en mobile (AR-036), límite arquitectónico para una capacidad futura (AR-047) — **5 dominios genuinamente
distintos**, el criterio de "diversidad de contexto" de Fase 0 queda ampliamente satisfecho.

---

## 3. ¿Cuántas hipótesis fueron rechazadas frente a confirmadas?

Igual que en la revisión de 7, se distinguen dos niveles — mezclarlos daría un número engañoso. Las 8
ARs nuevas introdujeron además una tercera convención de numeración, distinta a las dos anteriores, que
conviene no fusionar sin nota.

### Nivel A — la hipótesis/hallazgo central de cada AR

| AR     | Resultado                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| AR-002 | Confirmada, alcance reducido (la parte histórica ya resuelta por AR-001)                                             |
| AR-009 | Confirmada, alcance reducido (la parte de merge-gating ya resuelta por AR-002)                                       |
| AR-036 | Confirmada, reencuadrada (de "copy en 3 pantallas" a "modelo conceptual transversal")                                |
| AR-004 | Confirmada, sin reducción — la brecha había crecido, no se redujo                                                    |
| AR-024 | Confirmada, reencuadrada (decisión ya operativa, no pendiente de diseño)                                             |
| AR-030 | Confirmada, sin reducción — ausencia total, sin ninguna resolución parcial                                           |
| AR-044 | Confirmada (CSRF descartado en Fase 1; 3 hallazgos independientes de seguridad sí vigentes)                          |
| AR-047 | Confirmada, matizada (propiedad arquitectónica futura, no vulnerabilidad presente — no vulnerabilidad materializada) |

**8 de 8 confirmadas en esta segunda tanda — cero refutaciones.** Contraste honesto con la primera
tanda (5 confirmadas, 1 refutada — AR-053 —, 1 parcialmente refutada — AR-054). **Combinado (15 ARs): 13
confirmadas (todas reencuadradas o con alcance ajustado al menos una vez), 1 refutada, 1 parcialmente
refutada.** No se interpreta como que el proceso "dejó de encontrar falsos positivos" — los 2 casos
refutados de la primera tanda surgieron de una fuente específica (tests desactualizados / contrato de
librería externa) que no reaparece con la misma frecuencia en el tipo de hallazgo que trataron las 8 ARs
nuevas (predominantemente gobernanza/documentación/producto/arquitectura de dominio, no verificación de
suites de test contra comportamiento real).

### Nivel B — hipótesis adversariales/alternativas numeradas dentro de cada AR

**Aquí las dos tandas usan convenciones distintas — no se suman directamente sin marcarlo:**

- **Primera tanda (H-XXX.Y, sub-hipótesis adversariales dentro de un framing ya fijado):** 6 refutadas,
  6 confirmadas, 3 resueltas por clasificación (ver `REVISION_TRANSVERSAL_7_ARS.md` §3).
- **Segunda tanda (H1 "principal" + H2/H3/H4 "alternativas", en 7 de las 8 ARs — todas menos AR-044):**
  cada una de las 7 sigue el mismo patrón exacto: **1 H1 sobrevive, 3 alternativas (H2/H3/H4)
  descartadas** — 7 confirmadas, 21 descartadas.

**Por qué no se combinan en un solo número:** la primera convención numera hipótesis adversariales
dentro de un hallazgo ya framed (¿A o B, dado que ya sabemos que hay un problema?); la segunda numera
alternativas de framing completo (¿es este el problema real, o es alguno de estos otros?) — son
preguntas de granularidad distinta. **Lo que sí es comparable y sí es un hallazgo genuino:** la segunda
tanda tiene una proporción mucho más desequilibrada hacia "descartada" (7:21 frente al 6:6 casi
perfecto de la primera). Esto no es evidencia de que el proceso adversarial se haya vuelto menos
riguroso — es consecuencia de un cambio de **formato**, no de disciplina: la segunda tanda adoptó
consistentemente la estructura "1 hipótesis principal + N alternativas deliberadamente descartables"
(fijada por el usuario desde AR-002 en adelante), mientras que la primera dejaba que el número de
sub-hipótesis emergiera libremente de la investigación. **Observación registrada, no promovida:** un
formato de hipótesis más estandarizado parece producir un ratio de descarte más alto de forma mecánica,
no porque el razonamiento sea menos adversarial — cualquier comparación futura de "tasa de rechazo"
entre ARs debe normalizar por formato antes de sacar conclusiones.

---

## 4. ¿Qué técnicas de investigación aparecieron en más de una AR?

Verificado por grep directo sobre las 15 `ANALISIS.md`, no por impresión. Se combinan los conteos de la
primera tanda con lo encontrado en la segunda.

| Técnica                                                                                                   | ARs donde aparece de forma sustantiva                                                                                                                                                 | Nº combinado |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Reconstrucción de línea temporal con `git log` sobre archivos/commits reales                              | AR-001, AR-028, AR-023, AR-043, AR-053, AR-054 + **AR-024, AR-030** (nuevas, uso pleno) + AR-047 (uso menor, solo confirma ausencia de cambio)                                        | **9 de 15**  |
| Verificación adversarial explícita (buscar razones para refutar la propia hipótesis, no solo confirmarla) | Las 15 — disciplina base del programa                                                                                                                                                 | **15 de 15** |
| Búsqueda activa de precedente interno antes de razonar en abstracto                                       | AR-001, AR-043, AR-054 + **AR-044** (nueva: patrón guard/interceptor global ya existente en `app.module.ts`)                                                                          | **4 de 15**  |
| Grep exhaustivo de imports cruzados para verificar independencia entre bounded contexts                   | AR-043 (Identity↔Authentication) + **AR-030, AR-047** (nuevas)                                                                                                                        | **3 de 15**  |
| Escala de ponderación de evidencia de 4 niveles                                                           | AR-023, AR-043 — **sin reutilizar en ninguna de las 8 nuevas**                                                                                                                        | **2 de 15**  |
| Instrumentar el runtime/build directamente en vez de especular                                            | AR-053, AR-054 + **AR-047** (nueva variante: verificar por dependencia de paquete/`require.resolve`, no por monkey-patching de `EventEmitter` — misma disciplina, mecanismo distinto) | **3 de 15**  |

**La técnica más transversal, después de la disciplina adversarial de base, sigue siendo la
reconstrucción de línea temporal vía `git log`** — ahora 9 de 15, reforzada, no debilitada, por la
segunda tanda. **Precisión que se mantiene sin cambios respecto a la primera revisión:** sigue sin
formularse como "ejecutar siempre `git log`" — solo cuando la hipótesis de una AR involucra causalidad o
evolución temporal.

**Técnica nueva, sin precedente en la primera tanda:** verificar una prohibición arquitectónica
consultando la propia estructura de dependencias del monorepo (`package.json`, resolución de módulos)
en vez de una regla de lint o una convención — usada por primera vez en AR-047 para demostrar que
`packages/domain` no puede alcanzar `CommandBus`. Un solo punto de dato — se registra para vigilar si
reaparece en futuras ARs que necesiten demostrar (no solo declarar) un límite arquitectónico.

---

## Marco de evaluación — ¿justifica la evidencia acumulada declarar Metodología v1.1?

Estructurado exactamente según las 3 preguntas que el usuario fijó al abrir esta revisión, con la carga
de la prueba sobre el cambio, no sobre v1.0.

### Pregunta 1 — ¿La metodología v1.0 ha producido resultados consistentes?

| Indicador                                  | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasa de cierre de ARs abiertas             | 15 de 16 ARs abiertas están cerradas (93.75%) — la única no cerrada es AR-052, pausada deliberadamente (no abandonada ni fallida), a la espera de un caso prospectivo genuino para su propio protocolo pre-registrado.                                                                                                                                                                                                                                                                         |
| AR reabiertas                              | **0.** Verificado por grep (`reabiert`) en las 15 carpetas `AR-*/ANALISIS.md` + Dashboard — todas las menciones encontradas son negaciones ("no se reabre X"), ninguna es una reapertura real.                                                                                                                                                                                                                                                                                                 |
| Excepciones al ciclo de 9 fases            | **0 de 15** (tabla "Estabilidad metodológica", `REMEDIATION_DASHBOARD.md`) — ninguna AR saltó ni forzó una fase.                                                                                                                                                                                                                                                                                                                                                                               |
| Cambios metodológicos durante la ejecución | Sí, pero exclusivamente por el canal ya designado para eso: Fase 4A se añadió al ciclo tras AR-028 (activada condicionalmente, "si aplica" — no una excepción ad hoc); el 5º criterio de evaluación y la 4ª categoría de remediación se añadieron tras AR-023; ninguna hipótesis nueva (H-GOV-01, cambio de propietario, git log, "propiedad ya existe") se forzó al ciclo — todas quedaron en observación, exactamente donde el propio programa decidió que debían quedar hasta pasar Fase 0. |

**Conclusión de la Pregunta 1: sí, consistentes.** El único "cambio metodológico" real (Fase 4A) ocurrió
una vez, temprano (tras la segunda AR cerrada), y desde entonces el ciclo de 9 fases se sostiene sin
modificación en las 13 ARs restantes.

### Pregunta 2 — ¿Han aparecido patrones suficientemente repetidos como para convertirse en reglas?

Antes de contar candidatos nuevos, una distinción necesaria: dos de los cuatro patrones que el usuario
propuso examinar **ya son parte estructural del ciclo de 9 fases, no candidatos externos a él**:

- **"No asumir que el hallazgo sigue vigente"** — esto es literalmente lo que la fase "Verificación del
  framing" hace en las 15 ARs, no un patrón emergente que compita por promoción; ya está dentro de v1.0
  desde su congelación.
- **"Separar arquitectura de diseño" (propiedad vs. mecanismo)** — esto es lo que Fase 2B (Decisión) y
  Fase 4A (Diseño técnico) hacen por construcción en las 15 ARs, sin una sola excepción: D-002.1,
  D-009.1, D-036.1, D-004.1, D-024.1, D-030.1, D-043.1, D-054.1, D-044.1-3 y D-047.1 — **10 decisiones,
  10 veces la misma disciplina de fijar la propiedad y diferir el mecanismo.** No es un patrón que deba
  promoverse; es la prueba de que la fase ya congelada en v1.0 funciona exactamente como se diseñó.

**Candidatos genuinamente nuevos, externos al ciclo, con repetición real:**

1. **H-GOV-01** — 5 repeticiones independientes, máxima diversidad de contexto (ver §2 arriba).
2. **"La propiedad que un hallazgo reclama puede ya existir estructuralmente, sin reconocer"** — 3
   repeticiones (AR-024, AR-030, AR-047), registrada al cerrar AR-047.
3. Reconstrucción de línea temporal vía `git log` — 9 de 15, la técnica (no regla de decisión) con más
   repetición del programa.

### Pregunta 3 — ¿Existe evidencia suficiente para promover alguno de estos patrones a metodología?

Se aplican los 5 criterios de Fase 0 al candidato más fuerte, H-GOV-01, con honestidad sobre qué
criterios se satisfacen y cuáles no — no se asume el resultado de antemano:

1. **Repetición independiente — satisfecho.** 5 ARs distintas, en 5 sesiones de trabajo distintas.
2. **Diversidad de contexto — satisfecho, con holgura.** Gobernanza, seguridad, infraestructura,
   producto/mobile, arquitectura de IA — 5 dominios genuinamente distintos.
3. **Poder predictivo — parcialmente satisfecho.** En AR-054 y AR-047, H-GOV-01 se usó activamente
   _durante_ la fase de diseño para descartar una alternativa antes de implementarla (no solo para
   justificarla después) — esto es señal real de valor predictivo. Pero en ningún caso del programa se
   ha hecho una **predicción registrada antes de conocer el desenlace** de un caso futuro (el mismo
   estándar, más exigente, que AR-052 exige para H-052.3) — todas las 5 repeticiones son, en sentido
   estricto, retrospectivas dentro de su propia AR, no una predicción externa verificada después.
4. **Resistencia a contraejemplos buscados activamente — no satisfecho todavía.** Esta revisión hizo un
   primer intento real (no solo constató su ausencia): se revisaron las 15 ARs cerradas buscando un caso
   donde una solución "más fuerte que la evidencia" hubiera sido, en retrospectiva, la decisión correcta
   — no se encontró ninguno. Pero esta búsqueda es interna al mismo corpus que generó la hipótesis, no
   independiente de él — no cuenta como una búsqueda de contraejemplo genuinamente adversarial. Sigue
   pendiente un intento real, sobre casos futuros, no sobre el historial que ya la respalda.
5. **Coste de equivocarse — favorable.** Promover "no perseguir una propiedad más fuerte de la que la
   evidencia exige" como regla permanente tiene un coste de error relativamente bajo — es una guía contra
   el sobre-diseño, no una prohibición absoluta; una AR futura con evidencia genuina para una propiedad
   más fuerte seguiría pudiendo justificarla con esa misma evidencia.

**Veredicto: 3 de 5 criterios satisfechos (1 y 2 con holgura, 5 favorable), 1 parcial (3), 1 no
satisfecho (4).** Fase 0 es explícita: los 5 criterios, ninguno suficiente por sí solo — no se promueve
H-GOV-01 todavía. Ningún otro candidato (propiedad-ya-existe: 3 repeticiones; git log: es una técnica de
investigación, no una regla arquitectónica, y no está claro que Fase 0 — pensada para hipótesis de
decisión — sea el mecanismo correcto para "promover" una técnica de investigación) se acerca más.

---

## Conclusión

- **Metodología v1.0: se mantiene sin cambios.** 15/15 ARs cerradas sin excepciones al ciclo de 9 fases;
  el único cambio metodológico real (Fase 4A) ocurrió una vez, hace 13 ARs, por el canal correcto.
- **Metodología v1.1: no se publica.** Ningún candidato satisface los 5 criterios de Fase 0 — H-GOV-01
  es el más fuerte (3/5 satisfechos, 1 parcial, 1 pendiente de un contraejemplo genuinamente
  independiente) pero no cumple el listón que el propio programa fijó antes de conocer esta evidencia.
- **Hipótesis nuevas: permanecen en observación.** "La propiedad ya existe estructuralmente" (3 casos) se
  mantiene como candidata — necesita más repetición y, sobre todo, un caso donde permita anticipar
  correctamente una solución antes de construirla, no solo explicarla después de encontrarla.
- **Este documento es el entregable de la revisión — un documento de evidencia, no una nueva versión de
  la metodología.**

Este resultado se interpreta como positivo, no como estancamiento: una metodología que sobrevive 15
aplicaciones consecutivas — incluyendo AR-047, cuyo propio entregable fue "reconocer una propiedad ya
existente en vez de construir una nueva" — sin necesitar ajustes demuestra estabilidad. Cambiarla
únicamente porque se alcanzó un número de ARs cerradas violaría el mismo principio de evidencia que el
programa aplica a cada decisión arquitectónica individual. El criterio de promoción a v1.1 fijado antes
de esta revisión ("¿qué limitación demostrada de v1.0 resuelve? / ¿qué capacidad verificable aporta que
v1.0 no podía ofrecer?") tampoco se satisface por ninguno de los candidatos examinados — ambas preguntas
se responden "ninguna" con la evidencia disponible hoy.

**Próxima revisión transversal: no antes de 25 ARs cerradas (hito 2), como ya estaba fijado.**
