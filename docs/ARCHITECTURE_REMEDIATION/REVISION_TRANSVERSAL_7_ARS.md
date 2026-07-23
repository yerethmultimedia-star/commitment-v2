# Revisión transversal — patrones metodológicos en las 7 AR cerradas (2026-07-23)

Ejercicio pedido explícitamente por el usuario al cerrar AR-054: **no abrir un nuevo frente técnico
todavía**, y en su lugar revisar las 7 AR ya cerradas (AR-001, AR-028, AR-023, AR-043, AR-008, AR-053,
AR-054) buscando únicamente patrones metodológicos repetidos — sin modificar ninguna decisión
arquitectónica ya tomada, y sin precipitar ninguna promoción a regla permanente que la evidencia
todavía no sostenga. Cada afirmación de este documento está verificada por lectura/grep directo de los
`ANALISIS.md` reales, no por recuerdo de la conversación.

---

## 1. ¿Cuántas veces cambió el propietario del problema?

**2 casos claros, 1 caso más débil que merece mencionarse por honestidad, no por inflar el conteo.**

| AR                      | Propietario supuesto al abrir                   | Propietario real al cerrar                                                                                                   |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| AR-053                  | El sistema (dominio/OCC)                        | Los tests (desactualizados un día después de una decisión de dominio)                                                        |
| AR-054                  | La integración de la aplicación con BullMQ      | El ciclo de vida interno de `RedisConnection` en `bullmq` (dependencia externa)                                              |
| AR-001 (caso más débil) | La elección de plataforma (Supabase vs. NestJS) | El mecanismo de gobernanza que permitió que dos arquitecturas coexistieran sin que ninguna sustituyera formalmente a la otra |

AR-001 se incluye con una nota: no es exactamente un "propietario" en el mismo sentido técnico que
AR-053/AR-054 (no hay un tercero involucrado), pero comparte la misma estructura — la pregunta que se
hizo al abrir la AR no es la pregunta que la cerró. **Dos puntos de dato limpios (AR-053, AR-054),
consistente con lo que ya habías señalado; el tercero (AR-001) es el mismo patrón en su forma más
general y es, de hecho, el origen histórico de la regla "el problema formulado originalmente no es el
problema real."**

**Reinterpretación histórica del propio AR-001 (2026-07-23, del usuario):** hasta esta revisión, AR-001
se leía sobre todo como la validación inicial del proceso de remediación (la plantilla metodológica de
gobernanza). Esta revisión le añade un segundo papel, visible solo en retrospectiva: **es el primer
precedente del cambio de propietario del problema** — el patrón que luego reapareció en AR-053 y AR-054
ya existía desde el origen del programa, simplemente no se había identificado como una instancia
recurrente hasta tener 3 casos para compararlos. No cambia ninguna decisión tomada en AR-001; cambia
cómo se interpreta su lugar en la historia del programa.

Ningún otro cierre (AR-028, AR-023, AR-043, AR-008) mostró un cambio de propietario — en esos casos el
propietario permaneció el mismo (la propia arquitectura/implementación de la aplicación); lo que cambió
fue la causa raíz identificada dentro de ese mismo propietario, no el propietario en sí.

---

## 2. ¿Cuántas decisiones se simplificaron por seguir la evidencia (patrón H-GOV-01)?

**3 casos verificados por grep, no por impresión:**

1. **AR-023** — rechazó eliminar `core/AggregateRoot` (la opción "limpia" y más simple de ejecutar)
   porque ADR-021 todavía lo reserva como dirección válida; produjo el 5º criterio "Preservación de
   opciones arquitectónicas."
2. **AR-043 (H-043.8, Paso 6B)** — rechazó introducir Postgres/Redis solo para Authentication mientras
   los 7 aggregates reales siguen sobre `InMemory*Repository`, sin evidencia específica que lo
   justificara. Primer caso de estudio de H-GOV-01.
3. **AR-054 (Fase 4A)** — rechazó `DiscoveryService` como garantía estructural absoluta, no por
   inviabilidad (se confirmó viable) sino por desproporción entre la complejidad de introducir un
   patrón nuevo y la evidencia real (2 puntos de integración, sin historial de repetición). Tercer caso
   de estudio de H-GOV-01.

Este es el patrón con más repeticiones limpias de todo el programa — 3 casos, cada uno citado
explícitamente como "siguiente punto de dato" del anterior en su propio `ANALISIS.md`. Sigue sin
promoverse a regla permanente (así lo registró el propio programa en README), pero con 3 repeticiones
independientes es, hasta ahora, la hipótesis en observación con más respaldo acumulado.

---

## 3. ¿Cuántas hipótesis fueron rechazadas frente a confirmadas?

Aquí hace falta distinguir dos niveles de granularidad — mezclarlos daría un número engañoso.

### Nivel A — la hipótesis central de cada AR (la pregunta de framing que la abrió)

| AR     | Resultado                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| AR-001 | Confirmada, en forma reencuadrada (gobernanza, no tecnología)                                |
| AR-028 | Confirmada, refinada dos veces (H-028.1 → H-028.2 → framing final)                           |
| AR-023 | Confirmada, refinada (H-023.1 → H-023.3) y dividida en D-023.1/D-023.2                       |
| AR-043 | Confirmada, refinada (H-043.2 → H-043.3)                                                     |
| AR-008 | Confirmada, con framing corregido en Fase 2                                                  |
| AR-053 | **Refutada** — no había ningún defecto de dominio                                            |
| AR-054 | **Parcialmente refutada** — "fuga de recursos" refutada; "integración incompleta" confirmada |

**5 de 7 confirmadas (todas refinadas al menos una vez antes de estabilizarse), 1 refutada, 1
parcialmente refutada.** Ninguna hipótesis central sobrevivió sin refinamiento — esto es consistente con
la regla permanente post-AR-001 ("toda AR debe intentar demostrar que el problema formulado
originalmente no es el problema real"): en la práctica, ninguna lo fue en su forma original, ni siquiera
las que terminaron confirmadas.

### Nivel B — las hipótesis adversariales numeradas dentro de cada AR (H-XXX.Y)

Solo 3 de las 7 ARs usaron numeración formal H-XXX.Y para sub-hipótesis (AR-028, AR-023, AR-043) — las
otras cuatro las formularon en prosa dentro de su framing, sin numerarlas. Contando solo las numeradas:

- **Refutadas explícitamente:** H-028.1 (superada por H-028.2), H-023.2 (superada por H-023.3), H-043.4
  (Credential/Session no deben fusionarse), H-043.6 (Session no puede ser stateless), H-043.7 (refresh
  tokens no son necesarios), H-043.8 (Redis no es necesario) — **6.**
- **Sobrevivieron / confirmadas:** H-028.2 (refinada, no refutada), H-023.1, H-023.3, H-043.1, H-043.2,
  H-043.3 — **6.**
- **Resueltas por clasificación, no por rechazo/confirmación** (preguntas de "¿A o B?" donde ninguna
  opción era la hipótesis de partida): H-043.5 (TokenService: ¿dominio o infraestructura?), H-043.9
  (JWT: ¿beneficio arquitectónico o solo implementación? — resuelta como "solo implementación", lo más
  cercano a un rechazo parcial), H-043.10 (omisión de diseño, categoría nueva) — **3.**

**El reparto entre refutadas y confirmadas está casi equilibrado (6 y 6)** — no hay un sesgo dramático
hacia "todo se refuta" ni hacia "todo se confirma". Esto es, en sí mismo, un dato metodológico útil: el
proceso adversarial no es un ritual que siempre termina rechazando alternativas por rechazar, ni una
formalidad que siempre confirma la primera hipótesis — realmente discrimina.

---

## 4. ¿Qué técnicas de investigación aparecieron en más de una AR?

Verificado por grep directo sobre los 7 `ANALISIS.md`, no por impresión:

| Técnica                                                                                                                    | ARs donde aparece de forma sustantiva                                                                                                                                                     | Nº         |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Reconstrucción de línea temporal con `git log` sobre archivos/commits reales                                               | AR-001, AR-028, AR-023, AR-043, AR-053, AR-054                                                                                                                                            | **6 de 7** |
| Búsqueda activa de precedente interno antes de razonar en abstracto                                                        | AR-001 (precedente del Framework para reclasificar ADRs), AR-043 (Device, TaskDependencyService/ReminderSchedulerPort), AR-054 (búsqueda de precedente de `DiscoveryService`/clases base) | **3 de 7** |
| Escala de ponderación de evidencia de 4 niveles (Implementación > ADR normativa > ADR prospectiva > Hipótesis del roadmap) | Introducida en AR-023, reutilizada explícitamente en AR-043                                                                                                                               | **2 de 7** |
| Instrumentar el runtime/código directamente en vez de especular desde el stack trace                                       | AR-053 (grep exhaustivo de precedentes), AR-054 (grep + instrumentación directa de `EventEmitter.prototype.emit`)                                                                         | **2 de 7** |
| Verificación adversarial explícita (buscar razones para refutar la propia hipótesis, no solo confirmarla)                  | Las 7 — es la disciplina base del programa, no una técnica puntual                                                                                                                        | **7 de 7** |

La técnica más transversal, después de la disciplina adversarial de base, es la **reconstrucción de
línea temporal vía `git log`** — aparece en 6 de las 7 ARs cerradas, siempre como el instrumento que
convierte una sospecha ("esto parece desactualizado / esto parece un remanente") en un hecho fechado y
verificable. Es la técnica con más respaldo empírico de todo el programa hasta ahora, más incluso que la
propia escala de ponderación de evidencia (que solo se ha reutilizado una vez desde que se introdujo).

**Precisión del usuario (2026-07-23), importante para no sobregeneralizar este hallazgo:** no se
formula como "ejecutar siempre `git log`" — eso convertiría una observación condicional en un ritual. Se
formula como: **cuando la hipótesis de una AR involucra causalidad o evolución temporal (¿esto se
escribió antes o después de aquello? ¿qué cambió y cuándo?), la reconstrucción histórica vía Git ha
demostrado hasta ahora un alto poder explicativo en este programa.** Formulada así, deja abierta la
posibilidad de que existan futuras ARs donde Git simplemente no aporte valor (preguntas que no son de
naturaleza temporal/causal) sin que eso contradiga el patrón observado aquí.

---

## Síntesis — qué está listo para convertirse en guía y qué debe seguir en observación

**Con más respaldo empírico, sin promoverlas todavía a regla permanente (el propio ejercicio no precipita esa promoción):**

1. **H-GOV-01** (no perseguir una propiedad/solución más fuerte que la evidencia justifica) — 3
   repeticiones independientes, la de más respaldo del programa.
2. **Reconstrucción de línea temporal con `git log`** — 6 de 7 ARs, la técnica de investigación más
   transversal encontrada.

**Con evidencia genuina pero todavía insuficiente para generalizar (2 puntos de dato cada una):**

3. El propietario de un síntoma puede cambiar durante la investigación (AR-053, AR-054, con AR-001 como
   precedente estructural más antiguo y más general).
4. Escala de ponderación de evidencia de 4 niveles, reutilizada una vez fuera de donde se originó.
5. Instrumentar el runtime directamente en vez de especular desde un stack trace, cuando la evidencia
   superficial no basta para localizar un emisor/origen exacto.

**Dato metodológico sin necesidad de promoción, solo de registro:** el balance entre hipótesis
adversariales refutadas y confirmadas (6 y 6) sugiere que el proceso discrimina genuinamente, no
confirma ni refuta por defecto.

**No se promueve nada a regla permanente en este documento.** Este ejercicio es deliberadamente
observacional — su valor es dejar constancia de qué heurísticas ya acumulan repetición suficiente para
merecer vigilancia prioritaria en las próximas ARs, no decidir todavía que sean universales.

---

## Observación adicional (2026-07-23, del usuario) — no visible en los 4 puntos anteriores, pero emerge de ellos

Un patrón transversal a los 3 casos de cambio de dirección significativo revisados en detalle en esta
sesión: **el cambio siempre vino provocado por evidencia nueva, nunca por argumentación.**

- AR-053 cambió de dirección por reconstrucción histórica (`git log` mostrando el día exacto en que
  cambió el contrato de dominio).
- AR-054 cambió de dirección por instrumentación directa (`EventEmitter.prototype.emit` revelando el
  emisor real sin listener).
- AR-052 cambió de dirección por experimentos discriminantes (casos donde dos hipótesis predicen
  resultados opuestos, no solo ejemplos que las confirman a ambas).

En ningún caso revisado un cambio de dirección importante ocurrió porque una alternativa se defendió de
forma más convincente en la discusión — siempre fue una observación nueva la que lo forzó.

**Hipótesis candidata registrada en observación (README), explícitamente NO promovida — tamaño de
muestra todavía pequeño (3 casos, y los 3 de esta misma sesión, lo que pesa en contra de tratarla como
independiente de quien la señala):**

> Los cambios sustanciales de dirección en una AR deben estar impulsados por nueva evidencia, no por
> argumentación.

Ver `README.md`, sección "Hipótesis en observación", para el registro formal.
