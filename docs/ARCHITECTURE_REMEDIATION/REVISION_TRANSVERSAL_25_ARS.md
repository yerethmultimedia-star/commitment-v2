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

### Distribución por Impacto / Esfuerzo / Riesgo (25 AR cerradas)

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

### Eje Decisión — ¿cuántas AR tuvieron una decisión real?

**24 de 25 (96%)** cerraron con algún tipo de decisión formal (`✅ Decisión aprobada` → `✔️ Validada`,
o equivalente) — no solo ejecución mecánica. **Una única excepción: AR-022** (`✅ N/A — ejecución
directa`), cuya Fase 1 concluyó explícitamente que no había ninguna hipótesis que plantear.

Esto contradice una intuición razonable: que "Owner=Claude" implicaría mayoritariamente ejecución
directa sin decisión. **10 de las 25 AR cerradas tienen Owner=Claude en el Roadmap, y sin embargo 9 de
esas 10 sí produjeron una decisión formal** (D-XXX.1) — la única excepción de nuevo es AR-022. Esto ya
está documentado como regla explícita del programa (nota en "Progreso por Decisión" del Dashboard,
precisada 2026-07-23/24): `Owner` describe quién ejecuta, no si existe una decisión de política que
congelar.

### Fase 2 (Hipótesis/Alternativas/Decisión) — ¿se abrió o se saltó?

**23 de 25 (92%) abrieron algún ciclo de Fase 2** (nombrado `Fase 2A`/`Fase 2B` en las convenciones
más recientes, o `Fase 2`/`Fase 2 — Verificación del framing` en las 3 AR más tempranas que preceden esa
convención: AR-008, AR-023, AR-043). **Solo 2 de 25 (8%) lo saltaron por completo**, ambas con la misma
justificación explícita registrada en su propia Fase 1: **AR-022** ("no hay hipótesis que plantear ni
decisión arquitectónica pendiente... directamente a Fase 4B") y **AR-053** (cerrada en la propia Fase 1
al confirmarse que el hallazgo original era un falso positivo — no había nada que decidir porque el
defecto no existía).

### Fase 4A (diseño técnico / alternativas de mecanismo) — ¿se ejecutó, se omitió, o no aplicó?

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

### AR bloqueadas durante su propia implementación

**1 de 25 (4%): AR-034.** Bloqueada en Fase 4B al descubrir que su mecanismo elegido no podía
validarse (`expo lint` no analizaba ningún archivo `.tsx`) — resuelta mediante un spin-off (AR-055),
sin reabrir su propia decisión. Ningún otro caso entre las 25 AR cerradas experimentó un bloqueo real de
implementación (se revisaron manualmente las menciones de "bloque_" en AR-002/023/028/036/043/048; en
todos los casos el término se refería a otra cosa — bloqueo de cuenta tras intentos fallidos, ausencia
de branch protection, o una aclaración de "no bloqueante" — no a un bloqueo real de la propia AR).

### AR derivadas (spin-offs)

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

### Reaperturas y excepciones metodológicas

**0 de 25 (0%) en ambos casos.** Ninguna decisión ya aprobada (`D-XXX.1`) fue revisada o revertida
después de su cierre. Ninguna AR requirió saltarse una fase del ciclo de 9 sin justificación explícita
— confirmado por la tabla "Estabilidad metodológica" del Dashboard, mantenida AR por AR desde AR-020:
25/25 marcadas "No" en "¿Requirió excepción al ciclo de 9 fases?".

### Continuidad de sesión

**23 de 25 (92%) se completaron dentro de una única sesión de trabajo**, de Fase 1 a cierre. **2 de 25
(8%) abarcaron más de una sesión, ambas por decisión explícita del usuario, no por interrupción
accidental:** AR-043 (pausada tras aprobar D-043.1, antes de Fase 4A, "para empezar con la cabeza
despejada" en una sesión propia) y AR-034 (pausada en Fase 4B, bloqueada por la precondición que
resolvió AR-055, reanudada en la sesión donde AR-055 cerró).

### Tiempo por fase

**No es un dato medible con la granularidad que existe hoy.** El Dashboard y los `ANALISIS.md` solo
registran fecha (día), no hora, y la gran mayoría de las AR se completan en la misma sesión de trabajo
— la única unidad de tiempo real disponible ("sesiones," no minutos u horas) no permite calcular un
tiempo medio por fase con ningún significado estadístico. Registrar esto como limitación conocida, no
como métrica ausente por descuido.

### Naturaleza del cambio (documental vs. código de aplicación)

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

_(pendiente — siguiente sesión)_

## Bloque III — Calidad del filtro programático

_(pendiente)_

## Bloque IV — Metodología

_(pendiente)_
