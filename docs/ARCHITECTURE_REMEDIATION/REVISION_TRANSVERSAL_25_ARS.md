# Revisión transversal — 25/55 AR cerradas (2026-07-24)

Tercera revisión transversal del programa, primera desde la formalización explícita de un marco de
cuatro bloques (Métricas → Hipótesis → Filtro programático → Metodología), acordado con el usuario al
cerrar AR-005. Regla fijada antes de empezar: **la revisión no modifica el programa, lo evalúa** — no
se abren AR nuevas, no se reescriben decisiones, no se ajusta la metodología durante la revisión misma.
El único resultado posible son conclusiones respaldadas por evidencia y, si corresponde, propuestas
para una futura versión de la metodología. Cada cifra de este documento es reproducible por grep/lectura
directa de `REMEDIATION_ROADMAP_V1.md` y de los 25 `ANALISIS.md` reales — no por recuerdo de sesión.

Se trabaja en 4 sesiones consecutivas, una por bloque. Este documento se completa incrementalmente.

---

## Bloque I — Métricas del programa

**Objetivo: determinar si la ejecución fue estable, con datos, no impresiones.**

**Distinción explícita, pedida por el usuario al cerrar este bloque:** los indicadores de abajo no son
todos del mismo tipo.

- **Indicadores descriptivos** (describen el programa, no evalúan el método): distribución por
  Impacto/Esfuerzo/Riesgo, distribución del eje Decisión, naturaleza del cambio (documental/config/
  código). Dicen qué tipo de trabajo ha sido este programa, no si el proceso funcionó.
- **Indicadores normativos** (evalúan si la metodología funcionó): apertura de Fase 2, apertura de
  Fase 4A, AR bloqueadas, spin-offs resueltos, reaperturas, excepciones metodológicas, continuidad de
  sesión. Estos son los que sostienen la conclusión de estabilidad.

Cada subsección de abajo se etiqueta con su tipo.

### Distribución por Impacto / Esfuerzo / Riesgo (25 AR cerradas) — _descriptivo_

| Impacto  | n   | %   |
| -------- | --- | --- |
| Muy Alto | 4   | 16% |
| Alto     | 15  | 60% |
| Medio    | 5   | 20% |
| Bajo¹    | 1   | 4%  |

¹ AR-053: Impacto reclasificado de Medio a "Bajo (revisado de Medio)" al cerrarse como falso positivo
de remediación — la única fila del Roadmap cuyo propio campo Impacto se corrigió post-cierre, no solo
su Estado.

| Esfuerzo | n   | %   |
| -------- | --- | --- |
| XS       | 3   | 12% |
| S        | 4   | 16% |
| Muy Bajo | 1   | 4%  |
| Bajo     | 3   | 12% |
| Medio    | 9   | 36% |
| L        | 2   | 8%  |
| XL       | 3   | 12% |

**Observación de calidad de datos, no de ejecución:** el Roadmap usa dos escalas de Esfuerzo distintas
sin normalizar (XS/S/M/L/XL en unas filas, Muy Bajo/Bajo/Medio/Alto/Muy Alto en otras) — probablemente
heredado de una convención que cambió a mitad del backlog original. No afectó la selección real (el
filtro programático de esta sesión tuvo que mapear ambas escalas a un mismo orden para poder comparar
AR-005 con AR-025), pero es una inconsistencia de formato real, no solo estética — se retoma en el
Bloque III (calidad del filtro).

| Riesgo | n   | %   |
| ------ | --- | --- |
| Bajo   | 10  | 40% |
| Medio  | 9   | 36% |
| Alto   | 6   | 24% |

### Eje Decisión — ¿cuántas AR tuvieron una decisión real? — _descriptivo_

**24 de 25 (96%)** cerraron con algún tipo de decisión formal (`✅ Decisión aprobada` → `✔️ Validada`,
o equivalente) — no solo ejecución mecánica. **Una única excepción: AR-022** (`✅ N/A — ejecución
directa`), cuya Fase 1 concluyó explícitamente que no había ninguna hipótesis que plantear.

Esto contradice una intuición razonable: que "Owner=Claude" implicaría mayoritariamente ejecución
directa sin decisión. **10 de las 25 AR cerradas tienen Owner=Claude en el Roadmap, y sin embargo 9 de
esas 10 sí produjeron una decisión formal** (D-XXX.1) — la única excepción de nuevo es AR-022. Esto ya
está documentado como regla explícita del programa (nota en "Progreso por Decisión" del Dashboard,
precisada 2026-07-23/24): `Owner` describe quién ejecuta, no si existe una decisión de política que
congelar.

### Fase 2 (Hipótesis/Alternativas/Decisión) — ¿se abrió o se saltó? — _normativo_

**23 de 25 (92%) abrieron algún ciclo de Fase 2** (nombrado `Fase 2A`/`Fase 2B` en las convenciones
más recientes, o `Fase 2`/`Fase 2 — Verificación del framing` en las 3 AR más tempranas que preceden esa
convención: AR-008, AR-023, AR-043). **Solo 2 de 25 (8%) lo saltaron por completo**, ambas con la misma
justificación explícita registrada en su propia Fase 1: **AR-022** ("no hay hipótesis que plantear ni
decisión arquitectónica pendiente... directamente a Fase 4B") y **AR-053** (cerrada en la propia Fase 1
al confirmarse que el hallazgo original era un falso positivo — no había nada que decidir porque el
defecto no existía).

### Fase 4A (diseño técnico / alternativas de mecanismo) — ¿se ejecutó, se omitió, o no aplicó? — _normativo_

Sobre las 23 AR que sí abrieron Fase 2:

| Resultado                                                         | n   | %   | AR                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fase 4A ejecutada (comparación real de alternativas de mecanismo) | 18  | 78% | AR-002,003,004,009,024,028,030,034,036,043,044,045,047,048,049,050,054,055                                                                                                                                                                                 |
| Fase 4A omitida explícitamente, con justificación registrada      | 2   | 9%  | AR-005, AR-018 (mecanismo único, sin alternativa real que comparar — precedente: AR-022)                                                                                                                                                                   |
| No aplica (convención de fases previa a su estandarización)       | 3   | 13% | AR-001 (Fase 3 fue su última fase nombrada; implementación fue puramente documental sin mecanismo que elegir), AR-008 (Fase 4 genérica, sin split 4A/4B), AR-023 (cerrada en Fase 2B, nunca llegó a implementar — su segunda mitad se transfirió a AR-052) |

**Lectura correcta de este dato:** "omitir Fase 4A" nunca fue un atajo arbitrario — cada una de las 2
omisiones explícitas cita el mismo criterio (`mecanismo único, sin alternativa real que comparar`) y
cada una referencia el precedente anterior (AR-022 → AR-018 → AR-005, en ese orden cronológico). El
criterio se volvió más explícito con el tiempo sin cambiar de forma.

### AR bloqueadas durante su propia implementación — _normativo_

**1 de 25 (4%): AR-034.** Bloqueada en Fase 4B al descubrir que su mecanismo elegido no podía
validarse (`expo lint` no analizaba ningún archivo `.tsx`) — resuelta mediante un spin-off (AR-055),
sin reabrir su propia decisión. Ningún otro caso entre las 25 AR cerradas experimentó un bloqueo real de
implementación (se revisaron manualmente las menciones de "bloque_" en AR-002/023/028/036/043/048; en
todos los casos el término se refería a otra cosa — bloqueo de cuenta tras intentos fallidos, ausencia
de branch protection, o una aclaración de "no bloqueante" — no a un bloqueo real de la propia AR).

### AR derivadas (spin-offs) — _normativo_

**4 AR nuevas generadas por 3 AR distintas, todas ya cerradas:**

| AR origen | Generó         | Motivo                                                                                     |
| --------- | -------------- | ------------------------------------------------------------------------------------------ |
| AR-023    | AR-052         | D-023.2 (evaluación de una política, distinta de D-023.1 que cerró la propia AR-023)       |
| AR-008    | AR-053, AR-054 | 2 hallazgos colaterales de naturaleza distinta al hallazgo original, aislados sin expandir |
| AR-034    | AR-055         | Precondición técnica descubierta en Fase 4B, no conocida en fases previas                  |

**2 de 25 AR cerradas (8%) generaron un spin-off.** De los 4 spin-offs generados, 3 ya están cerrados
(AR-053, AR-054, AR-055) y 1 permanece pausado por decisión metodológica explícita, no por bloqueo
(AR-052). El programa creció de 52 a 55 AR totales exclusivamente por esta vía — ningún spin-off quedó
huérfano o sin resolución.

### Reaperturas y excepciones metodológicas — _normativo_

**0 de 25 (0%) en ambos casos.** Ninguna decisión ya aprobada (`D-XXX.1`) fue revisada o revertida
después de su cierre. Ninguna AR requirió saltarse una fase del ciclo de 9 sin justificación explícita
— confirmado por la tabla "Estabilidad metodológica" del Dashboard, mantenida AR por AR desde AR-020:
25/25 marcadas "No" en "¿Requirió excepción al ciclo de 9 fases?".

### Continuidad de sesión — _normativo_

**23 de 25 (92%) se completaron dentro de una única sesión de trabajo**, de Fase 1 a cierre. **2 de 25
(8%) abarcaron más de una sesión, ambas por decisión explícita del usuario, no por interrupción
accidental:** AR-043 (pausada tras aprobar D-043.1, antes de Fase 4A, "para empezar con la cabeza
despejada" en una sesión propia) y AR-034 (pausada en Fase 4B, bloqueada por la precondición que
resolvió AR-055, reanudada en la sesión donde AR-055 cerró).

### Tiempo por fase — _normativo (dato no disponible)_

**No es un dato medible con la granularidad que existe hoy.** El Dashboard y los `ANALISIS.md` solo
registran fecha (día), no hora, y la gran mayoría de las AR se completan en la misma sesión de trabajo
— la única unidad de tiempo real disponible ("sesiones," no minutos u horas) no permite calcular un
tiempo medio por fase con ningún significado estadístico. Registrar esto como limitación conocida, no
como métrica ausente por descuido.

### Naturaleza del cambio (documental vs. código de aplicación) — _descriptivo_

Clasificación por el artefacto que cada AR modificó en su Fase 4B/implementación final:

| Tipo                                                      | n   | AR                                                                                                             |
| --------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------- |
| Documentación pura (sin código ni configuración)          | 5   | AR-001, AR-003, AR-004, AR-005, AR-024                                                                         |
| Configuración (ESLint, CI, Docker, sin lógica de dominio) | 5   | AR-002, AR-018, AR-034, AR-045, AR-055                                                                         |
| Código de aplicación/dominio real                         | 14  | AR-008, AR-009, AR-022, AR-028, AR-030, AR-036, AR-043, AR-044, AR-047, AR-048, AR-049, AR-050, AR-053, AR-054 |
| Ninguno (cerrada sin implementar / falso positivo)        | 1   | AR-023 (transferida a AR-052)                                                                                  |

**56% de las 25 AR cerradas modificaron código de aplicación real**, no solo documentación o
configuración — el programa no ha sido predominantemente un ejercicio documental, pese a que varias de
sus AR más recientes (AR-005, AR-018) sí lo fueron.

### Conclusión cuantitativa del Bloque I

La ejecución de las primeras 25 AR es **estable por los cinco indicadores que este programa trata como
señal de estabilidad**: 0 reaperturas, 0 excepciones al ciclo de 9 fases, 100% de los spin-offs
resueltos (ninguno huérfano), 92% completadas en una sola sesión, y el único bloqueo real (AR-034) se
resolvió exactamente por el mecanismo que el programa ya tenía preparado para ese caso (spin-off
unidireccional). La única irregularidad detectada no es de ejecución sino de **formato de datos** (la
doble escala de Esfuerzo en el Roadmap) — no afectó ninguna decisión tomada, pero sí exige atención en
el Bloque III.

---

## Bloque II — Hipótesis acumuladas

**Objetivo: aplicar el criterio de promoción de Fase 0 (5 criterios, ninguno suficiente por sí solo:
repetición independiente, diversidad de contexto, poder predictivo, resistencia a contraejemplos
buscados activamente, coste de equivocarse) a cada hipótesis registrada en "Hipótesis en observación"
de `README.md` — no a impresión, a los 5 criterios explícitamente.** Solo se cuentan como "casos" los
puntos de dato ya registrados formalmente en el README o en un `ANALISIS.md`; no se inventan casos
nuevos para esta revisión.

### Catálogo completo, con veredicto de Fase 0

| #   | Hipótesis (forma corta)                                                                                           | Casos                                                                                                                        | Contextos distintos                                                                                                                                               | Poder predictivo demostrado                                                                                                                                                    | Contraejemplo buscado activamente                                    | Coste de error                                               | Veredicto                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| H1  | Mezcla de responsabilidades entre límites arquitectónicos                                                         | 3 (AR-001, AR-023, AR-043)                                                                                                   | Gobernanza, gobernanza técnica, dominio/auth — poca diversidad real (2/3 son gobernanza)                                                                          | No demostrado — siempre citada en retrospectiva                                                                                                                                | No                                                                   | Medio                                                        | **No promover**                                                                       |
| H2  | **H-GOV-01** — no perseguir propiedad más fuerte que la evidencia                                                 | 3 formales (AR-023, AR-043, AR-054) + 4 aplicaciones prácticas posteriores (AR-003, AR-036, AR-047, AR-050)                  | Gobernanza, infraestructura, integración externa, campo de dominio, enforcement de IA, plataforma de IA — la mayor diversidad de cualquier hipótesis del programa | **Sí, repetidamente** — usada para rechazar opciones _antes_ de construirlas en 4A/043/047/050/054, sin retrospectiva                                                          | **No** — nunca se buscó deliberadamente un caso donde debiera fallar | **Alto** — gobierna decisiones de arquitectura de plataforma | **No promover todavía — falla exclusivamente el criterio 4**                          |
| H3  | Las hipótesis de gobernanza deben pesarse por el riesgo de usarlas como criterio de gobernanza (autorreferencial) | 1 (AR-052)                                                                                                                   | Único — gobernanza del propio proceso                                                                                                                             | No evaluado en un caso nuevo                                                                                                                                                   | No                                                                   | Alto (afecta el mecanismo de promoción mismo)                | **No promover**                                                                       |
| H4  | Validar la realidad del problema antes de construir capacidad de detección                                        | 1 (AR-008)                                                                                                                   | Único — CI/testing                                                                                                                                                | No                                                                                                                                                                             | No                                                                   | Medio                                                        | **No promover**                                                                       |
| H5  | Verificar si el contrato del test sigue vigente antes de culpar al sistema                                        | 1 (AR-053)                                                                                                                   | Único — tests e2e                                                                                                                                                 | No                                                                                                                                                                             | No                                                                   | Bajo                                                         | **No promover**                                                                       |
| H6  | Un contrato de integración externa merece el mismo rigor que uno de dominio                                       | 1 (AR-054)                                                                                                                   | Único — integración de librería externa                                                                                                                           | No                                                                                                                                                                             | No                                                                   | Medio                                                        | **No promover**                                                                       |
| H7  | El propietario real de un síntoma puede cambiar durante la investigación y eso delimita el alcance                | 2 limpios (AR-053, AR-054) + 1 precedente retrospectivo no limpio (AR-001)                                                   | Tests, integración externa — poca diversidad                                                                                                                      | Parcial — explicó, no anticipó                                                                                                                                                 | No                                                                   | Medio                                                        | **No promover**                                                                       |
| H8  | Los cambios de dirección deben venir de evidencia nueva, no de argumentación                                      | 3 (AR-052, AR-053, AR-054)                                                                                                   | Los 3 en la misma sesión — el propio usuario señaló esta debilidad al registrarla                                                                                 | No                                                                                                                                                                             | No                                                                   | Medio                                                        | **No promover — el propio registro ya advierte el sesgo de "misma sesión"**           |
| H9  | La propiedad que un hallazgo reclama puede existir ya de forma estructural                                        | 4 (AR-024, AR-030, AR-047, AR-049)                                                                                           | Dominio (024, 030), enforcement de plataforma (047), sincronización (049) — diversidad real                                                                       | **Sí — el único caso del catálogo con un ejemplo prospectivo limpio** (AR-049 anticipó el resultado antes de leer el código)                                                   | Parcial (ver abajo)                                                  | Medio                                                        | **Candidata más fuerte del catálogo — ver análisis detallado**                        |
| H10 | La fuente de verdad arquitectónica se desplaza de artefactos físicos a modelos explícitos                         | 5 pares citados (ADR→decisión, documento→conocimiento, carpeta→clasificación, implementación→propiedad, estructura→registro) | Alta diversidad, pero es una observación de _forma_ del programa, no una regla operativa que una AR pueda aplicar para decidir algo                               | No aplica — no es una regla accionable, es una tendencia descriptiva                                                                                                           | No aplica                                                            | Bajo (no gobierna ninguna decisión directamente)             | **No es candidata a regla — es una observación de tendencia, categoría distinta**     |
| H11 | Las remediaciones más sólidas desacoplan también capacidades diferidas en el tiempo                               | 2 (AR-048 temporal, AR-050 tecnológico)                                                                                      | Offline, plataforma de IA                                                                                                                                         | No                                                                                                                                                                             | No                                                                   | Medio                                                        | **No promover**                                                                       |
| H12 | Una Fase 4B puede descubrir una precondición no conocida que bloquea una decisión ya validada, sin invalidarla    | 2 (AR-034 origen, AR-055 propia Fase 4B, escala distinta) + 1 cierre íntegro end-to-end (AR-034 reanudada)                   | Lint/tooling en ambos casos — misma clase de problema técnico, poca diversidad de dominio                                                                         | **Sí, el segundo punto de dato fue prospectivo**: la proporcionalidad de la respuesta (nueva AR vs. resolución acotada) se aplicó correctamente sin necesitar más deliberación | No                                                                   | Alto (afecta cuándo se crea una AR nueva)                    | **No promover — 2 puntos de dato, mismo dominio técnico (tooling), falta diversidad** |

### Análisis detallado — H9 (la candidata más fuerte)

**Por qué es la más fuerte de las 12:** es la única con un caso genuinamente prospectivo (AR-049 predijo,
antes de leer código, que "SynchronizationEngine ya satisface D-049.1" — y la evidencia objetiva
(grep direccional + 12/12 tests) lo confirmó). Ningún otro candidato del catálogo tiene un ejemplo así
— los demás siempre se citan en retrospectiva, explicando un caso ya cerrado, no anticipando uno abierto.

**Por qué sigue sin poder promoverse hoy, contra los 5 criterios exactos:**

1. Repetición independiente: ✅ 4 ARs (024, 030, 047, 049).
2. Diversidad de contexto: ✅ dominio puro, enforcement de plataforma, sincronización — 3 subsistemas
   distintos.
3. Poder predictivo: ✅ el más fuerte del catálogo, único caso prospectivo limpio.
4. **Resistencia a contraejemplos buscados activamente: no verificada todavía.** Esta revisión buscó
   explícitamente un contraejemplo entre las 25 AR cerradas — un caso donde una AR asumiera que una
   propiedad ya existía estructuralmente y esa suposición resultara **falsa** (i.e., donde hubo que
   construir la propiedad desde cero pese a la expectativa de que ya existiera). **No se encontró
   ninguno** entre las 25 AR cerradas — pero tampoco se buscó fuera de este conjunto (por ejemplo, entre
   las AR todavía pendientes, donde sí podría existir un caso real de expectativa fallida). La ausencia
   de contraejemplo dentro de un conjunto ya seleccionado por haber sido remediado con éxito no es lo
   mismo que una búsqueda activa e independiente.
5. Coste de equivocarse: Medio — promoverla mal llevaría a Fases 1 más cortas de lo debido, asumiendo
   pre-existencia sin verificarla con el mismo rigor que AR-049 aplicó.

**Veredicto: candidata más sólida del programa, pero todavía a un criterio (el 4º) de calificar para
promoción formal.** Se recomienda mantenerla como hipótesis, con una condición explícita para la
próxima revisión (hito de 35-40 AR, ver Bloque IV): buscar el caso inverso deliberadamente, no solo
esperar a que aparezca.

### Análisis detallado — H2 (H-GOV-01)

**Por qué casi califica:** de las 12, es la única con diversidad de contexto genuinamente alta (6
dominios distintos) y con un historial de aplicación práctica reciente (4 casos adicionales entre
AR-016 y AR-025, más allá de los 3 formalmente registrados) — evidencia de que el programa ya la usa
como heurística de trabajo, no solo como observación pasiva.

**Por qué no se promueve:** al igual que H9, falla específicamente el criterio 4. A diferencia de H9,
aquí el coste de equivocarse es más alto — es una regla que **rechaza** capacidades, no una que las
confirma; promoverla sin haber buscado un caso donde rechazar algo fue un error (una capacidad que
debía construirse y no se construyó, causando un problema real después) sería exactamente el patrón que
la propia Fase 0 fue diseñada para prevenir. **Recomendación: buscar activamente, antes del próximo
hito, si alguna capacidad rechazada bajo este criterio (Postgres/Redis para Auth en AR-043; enforcement
especulativo de IA en AR-047; `DiscoveryService` en AR-054) tuvo algún costo real medible después de
la decisión.** Si ninguna lo tuvo tras 10 AR más, el criterio 4 quedaría satisfecho por primera vez en
el programa.

### Hallazgo transversal de este bloque, no una hipótesis nueva

**Ninguna de las 12 hipótesis del catálogo ha sido sometida jamás al criterio 4 de Fase 0 (resistencia a
contraejemplos buscados activamente) de forma rigurosa — todas se han evaluado únicamente por
repetición y diversidad.** Esto no es una falla de las hipótesis individuales; es una brecha en cómo el
programa ha aplicado su propio criterio de promoción hasta ahora. Fase 0 exige buscar activamente un
caso donde la hipótesis debería fallar, no solo constatar que no ha fallado todavía — y esta revisión es
la primera vez que esa búsqueda se intenta explícitamente (para H9 y H2), en vez de darla por hecha. Se
registra como observación para el Bloque IV: el criterio 4 puede necesitar una definición operativa más
concreta (¿cuánto esfuerzo de búsqueda es "activo" y suficiente?), no solo una declaración de intención.

### Conclusión del Bloque II

**Cero hipótesis se promueven a regla permanente en esta revisión.** La más cercana (H9) y la de mayor
diversidad (H2, H-GOV-01) fallan por la misma razón exacta: ninguna ha sido sometida a una búsqueda
activa de contraejemplo, el criterio que Fase 0 marca explícitamente como "el más fácil de omitir por
descuido". El resto del catálogo (H1, H3-H8, H11, H12) todavía no acumula suficiente repetición o
diversidad de contexto, independientemente del criterio 4. H10 no es una hipótesis candidata a regla en
absoluto — es una observación de tendencia descriptiva, y se reclasifica como tal en vez de evaluarla
contra un criterio que no le corresponde.

## Bloque III — Calidad del filtro programático

_(pendiente)_

## Bloque IV — Metodología

_(pendiente)_
