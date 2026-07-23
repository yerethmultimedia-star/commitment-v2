# AR-001 — Arquitectura Oficial de Plataforma de Commitment

Registro completo del ciclo de vida de AR-001, actuando bajo el marco: `Análisis → Opciones → Trade-offs → Decisión → Implementación → Validación → Dashboard`. Este archivo es el detalle; `REMEDIATION_ROADMAP_V1.md` y `REMEDIATION_DASHBOARD.md` solo referencian su estado.

---

## Fase 1 — Análisis

**Estado: ✅ Cerrada (2026-07-20).**

### Pregunta original

¿Existe una contradicción entre ADR-004 (usar Supabase) y la implementación actual (NestJS a medida)?

### Material fuente revisado (texto completo, no resúmenes)

- `docs/01-product/adr/adr_001_to_010.md` — ADR-001 a ADR-010 completas.
- `docs/03-architecture/adr_011_tech_stack_flexibility.md` — ADR-011 completa.
- `docs/03-architecture/adr_013*` a `adr_020*` — las 8 ADRs existentes en ese rango (ADR-012 no existe como archivo).
- `docs/ARCHITECTURE_OVERVIEW.md` — completo (252 líneas).
- Cronología de git: fechas y mensajes de commit de los puntos de inflexión reales.

### Hallazgos

**H-001 — No hay evidencia de sustitución formal.** Ninguna ADR sustituye formalmente a Flutter, Supabase, o Event Sourcing. ADR-012 no existe. Ninguna de las ADR-013 a ADR-020 menciona NestJS, ni sustituye Flutter o Event Sourcing explícitamente.

**H-002 — No parece haber sido una deriva.** Cronología:

| Fecha              | Commit    | Evento                                                                                        |
| ------------------ | --------- | --------------------------------------------------------------------------------------------- |
| 2026-07-02 02:14   | `c81a3ed` | Se añaden ADR-001 a ADR-010 (Flutter/Supabase/Event Sourcing)                                 |
| 2026-07-02 03:27   | `8900fee` | Se inicializa el monorepo **con NestJS** — en el mismo commit se añade ADR-011                |
| 2026-07-08         | `88fd4b8` | `ci: remove flutter workflow in favor of node/react-native`                                   |
| 2026-07-10         | `c56d5f1` | Único commit que menciona Supabase — para _desactivar_ servicios, no integrar                 |
| 2026-07-10 a 07-12 | 3 commits | `ARCHITECTURE_OVERVIEW.md` creado y editado por última vez (nunca actualizado desde entonces) |

El pivote a NestJS ocurrió ~73 minutos después de escribirse los ADRs originales, el mismo día. No hay ventana de tiempo consistente con "deriva gradual" — parece una bifurcación desde el día uno, no un cambio posterior.

**H-003 — La gobernanza falló, no necesariamente la arquitectura.** No hay evidencia de que NestJS, React Native, o BullMQ sean malas decisiones técnicas. Lo que falla es que la decisión nunca se institucionalizó vía el proceso que la propia ADR-011 exige.

**H-004 — ADR-014 (2026-07-08) es la evidencia más fuerte.** Dice, en tiempo futuro: _"...de cara a futuras migraciones a PostgreSQL/Supabase..."_ — seis días después del pivote a NestJS, el equipo seguía tratando la migración a Supabase como pendiente, no como abandonada. Nueve días después, ADR-021 (2026-07-17) toma la decisión de persistencia real sin mencionar esa migración "futura."

**H-005 — El problema de AR-001 cambió de naturaleza.** Ya no es "¿Supabase o NestJS?". Es: ¿qué mecanismo de gobernanza permitió que dos líneas arquitectónicas coexistieran sin que ninguna sustituyera formalmente a la otra?

**Hallazgo adicional (no resuelto, solo anotado como evidencia):** `ARCHITECTURE_OVERVIEW.md` tiene referencias absolutas a `file:///Users/yereth/Desktop/Commitment-v2/docs/DECISIONS.md` — la otra carpeta del proyecto encontrada al inicio de esta sesión (`iCloud/Desktop/Commitment-v2`). Sugiere que el documento fue copiado/migrado desde ese otro repositorio, sin corregir sus rutas ni su contenido (todavía describe PostgreSQL, SQLite local, Event Sourcing, y Firebase Push — ninguno de los cuales existe en el código real de este repo).

### Confianza por hipótesis

| Hipótesis                                            | Confianza |
| ---------------------------------------------------- | --------: |
| Deriva tecnológica lenta                             |  Muy baja |
| Dos líneas arquitectónicas paralelas desde el inicio |      Alta |
| La gobernanza no reflejó las decisiones reales       |  Muy alta |

### Conclusión de Fase 1

AR-001 no trata sobre elegir entre Supabase y NestJS. Trata sobre restaurar una única fuente de verdad arquitectónica, preservando la trazabilidad histórica. Es una remediación de gobernanza, no tecnológica — lo cual explica por qué es el nodo más central del grafo de dependencias: no bloquea otras ARs por cambiar una tecnología, sino porque define cómo se reconoce y formaliza una decisión arquitectónica en Commitment.

### Principio establecido, vinculante para el resto de esta AR

**No se reescribirá ninguna ADR existente para que coincida con la realidad posterior.** Las ADR son registro histórico. Si una decisión cambió, la historia debe reflejar que cambió — no ocultarlo. Cualquier remediación que consista en editar ADR-004 (u otra) para que "diga NestJS" queda descartada de origen.

---

## Fase 2A — ¿Qué estamos remediando exactamente?

**Estado: 🟦 En progreso.**

Cuatro opciones sobre la mesa, ninguna descartada todavía salvo la variante de "reescribir ADR-004":

- **Opción A** — La implementación es correcta, la documentación está incorrecta → actualizar ADR (sin reescribir, ver principio arriba).
- **Opción B** — La documentación era correcta, la implementación nunca siguió la gobernanza → nueva ADR.
- **Opción C** — Las ADR-001–010 nunca fueron realmente vinculantes → reclasificar como "arquitectura inicial," crear arquitectura oficial nueva.
- **Opción D** — Hubo un error de proceso al crear el repositorio → reconstrucción histórica mediante ADR retrospectiva.

**Estado: ✅ Cerrada (2026-07-20).** C+D sobrevivieron el primer intento de refutación (ver ataques 1-3 abajo) y quedan como **hipótesis dominante, no decisión final** — el defecto que las bloquea de ser decisión ya no es de gobernanza, es la falta de evidencia técnica sobre si la plataforma actual merece legitimarse. Eso se resuelve en Fase 2B, no aquí.

**Precedente encontrado que reforzó C:** `THE_COMMITMENT_FRAMEWORK.md` Appendix ya trató 4 documentos fundacionales del mismo rango de fechas exacto (2026-07-02 a 07-04) como _"historical design inputs, not authoritative specifications."_ ADR-001–010 comparten la fecha 2026-07-02. C deja de ser una excepción — es la aplicación consistente de una política ya existente en el proyecto.

**Ataque 1 (Framework vs. ADR):** C no edita contenido, cambia estatus documental (autoridad, no historia). Sobrevive.
**Ataque 2 (¿reclasificación oportunista?):** reducido por el precedente — no es una maniobra inventada para justificar NestJS, es la misma práctica ya aplicada a documentos de la misma fecha. Sobrevive.
**Ataque 3 (¿la cronología respalda C?):** sí — 73 minutos entre ADR-001-010 y el bootstrap real de NestJS no da tiempo material a que esas ADR llegaran a gobernar ninguna implementación. Sobrevive.
**Objeción no resuelta:** una ADR retrospectiva (D) puede formalizar _qué_ se implementó, pero no responde _por qué_ debería ser la arquitectura oficial. Institucionalizar sin evaluar sería gobernanza sin arquitectura.

### Hipótesis líder (no decisión)

- **H-L1:** ADR-001–010 son arquitectura inicial de la fase de definición; por el precedente ya establecido, se tratan como documentos históricos de diseño, no especificaciones vigentes.
- **H-L2:** La arquitectura implementada desde 2026-07-02 se documenta retrospectivamente vía una ADR que preserva la trazabilidad histórica (explícita sobre las fechas reales, no las oculta).
- **H-L3:** La arquitectura implementada solo se declara oficial después de superar una evaluación técnica independiente — escalabilidad, mantenibilidad, complejidad, coste, DX, seguridad, evolución futura, alineación con la visión de producto.

---

## Fase 2B — Evaluación técnica de la plataforma

**Estado: 🟦 En progreso.**

**Pregunta que elimina el sesgo de continuidad:** _si hoy empezáramos Commitment desde cero, con los requisitos actuales y sin conocer la implementación existente, ¿seguiríamos eligiendo React Native + Expo, NestJS, BullMQ, Redis, PostgreSQL y el resto del stack?_

Evaluación por componente, contra los 8 criterios de H-L3, usando solo evidencia ya recogida en `docs/ARCHITECTURE_REVIEW/` (citada, no re-derivada) — donde no hay evidencia directa, se dice explícitamente en vez de asumir.

### NestJS (backend)

| Criterio                          | Veredicto                                    | Evidencia                                                                                                                                                                                              |
| --------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Escalabilidad                     | Neutro-positivo                              | El bloqueo real de escalabilidad es el estado en memoria de un solo proceso (Iteración 5/16), no NestJS como framework.                                                                                |
| Mantenibilidad                    | Positivo                                     | Dependency rule limpia, handlers como adaptadores delgados, cero deps de framework en `packages/domain` (Iteración 2, score 73/100).                                                                   |
| Complejidad                       | Mixto                                        | CQRS (`@nestjs/cqrs`) genera valor real en algunos módulos (Sagas, coreografía de eventos) pero es ceremonia sobre CRUD simple en otros (Iteración 4). No es un defecto de NestJS — es de cómo se usó. |
| Coste                             | Neutro                                       | Open source, sin lock-in propio de NestJS.                                                                                                                                                             |
| DX                                | Positivo                                     | Decoradores, Swagger automático, ecosistema maduro.                                                                                                                                                    |
| Seguridad                         | **Negativo, pero no es culpa del framework** | Cero auth (Iteración 6) — NestJS tiene Guards/Passport de primera clase; simplemente nunca se usaron. Argumento a favor de NestJS (la herramienta está lista, falta usarla), no en contra.             |
| Evolución futura                  | Positivo                                     | Framework maduro, comunidad amplia.                                                                                                                                                                    |
| Alineación con visión de producto | Neutro                                       | El Framework/PRODUCT_VISION no exige un backend específico.                                                                                                                                            |

**Veredicto NestJS: SÍ, se elegiría de nuevo.**

### React Native + Expo (mobile)

| Criterio                          | Veredicto       | Evidencia                                                                                                                                        |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Escalabilidad                     | Adecuado        | Sin hallazgos que lo cuestionen.                                                                                                                 |
| Mantenibilidad                    | Positivo        | Separación limpia react-query/zustand (Iteración 7).                                                                                             |
| Complejidad                       | Mixto           | Deuda de adopción del Design System (Iteración 8) — disciplina de aplicación, no del framework.                                                  |
| Coste                             | Neutro-positivo | Multiplataforma iOS/Android/Web vía Expo.                                                                                                        |
| DX                                | Mixto           | Advertencia de versión de Node desactualizada y bug de corepack encontrados esta sesión — ambiente/tooling, no el framework en sí.               |
| Seguridad                         | N/A             | Mayormente cliente.                                                                                                                              |
| Evolución futura                  | Positivo        | Ecosistema Tamagui/Expo Router activo.                                                                                                           |
| Alineación con visión de producto | Mixto           | El bug de Portal/Theme (Iteración 8) es un riesgo real al principio de "diseño calmo consistente" — pero es un fix de una línea, no estructural. |

**Objeción del usuario, aceptada:** probar renderizado Android vs. iOS responde una pregunta de calidad de UI/QA, no la pregunta arquitectónica ("¿elegiríamos esta plataforma hoy?"). La pregunta correcta es si existe un **requisito estratégico documentado** que Flutter resolvería significativamente mejor que Expo hoy — no si el rendering es pixel-perfect.

**Verificación documentada (no genérica) del requisito estratégico:** el argumento original de ADR-001 era específicamente _"excelente soporte nativo para Motion Tokens y transiciones complejas sin caídas de framerate."_ Ese requisito existe y ya se implementó:

- `docs/01-product/commitment_interaction_principles.md` ("Física de la Interacción y Motion System," v2.0 Definitiva, Junio 2026) define un sistema formal de Motion Tokens con física de resorte.
- `TECH_DEBT.md` RI-11/RI-12 documentan que ese sistema **ya se conectó exitosamente sobre React Native + Tamagui**: valores reales de spring (`mass`/`damping`/`stiffness`) estandarizados por producto, driver nativo (`motion.native.ts` para RN Animated, `motion.ts` para CSS en web). Los bugs encontrados ahí fueron errores de configuración de Tamagui, ya corregidos — no limitaciones de React Native como plataforma.
- Sin evidencia de rendimiento extremo, renderizado custom/canvas, consumo de memoria, o integración nativa crítica como requisito activo (wearables está explícitamente "Out of Scope (v1)" en `PRODUCT_VISION.md`).

**Respuesta documentada: No existe hoy un requisito estratégico que Flutter resolvería significativamente mejor.**

**Veredicto RN+Expo: SÍ, con justificación arquitectónica** (no "tentativamente sí") — el argumento histórico de ADR-001 perdió peso en el contexto actual, no hay evidencia de que RN+Expo limite el producto, no hay requisito estratégico que motive una migración, y el coste/riesgo de migrar a Flutter hoy supera cualquier beneficio esperado (equipo, ecosistema Expo 2026 — OTA/EAS/Router/módulos maduros — y roadmap de Offline/Sync/AI/Widgets/Background Tasks ya viables en Expo).

### BullMQ + Redis (colas/notificaciones)

Real, funcionando, con semántica de cola apropiada, confirmado end-to-end (Iteración 14: pipeline OTel→Prometheus mide métricas reales de este sistema; PROJECT_AUDIT confirmó `NotificationsModule` real con `bullmq-execution-engine.ts`).

**Veredicto: SÍ, claramente.**

### PostgreSQL / persistencia real

**Esta pregunta no es evaluable de la misma forma que las anteriores.** No existe una implementación de Postgres (ni directo ni vía Supabase) que evaluar — todo es en memoria (Iteración 5). No es "implementado pero cuestionable," es "no implementado." La pregunta técnica real — Postgres directo vs. Supabase-managed vs. Event Sourcing vs. CQRS de estado versionado — ya está parcialmente resuelta por ADR-021 (versioned-state CQRS, rechaza Event Sourcing) pero sigue sin persistencia real de ningún tipo, y esa decisión (AR-028 y toda la Wave 6) es una AR separada, no parte de AR-001.

**Veredicto: fuera del alcance resoluble de AR-001 — pertenece a AR-028 y a la decisión de persistencia real ya identificada como el segundo nodo más conectado del grafo.**

### Conclusión de Fase 2B

**Estado: ✅ Cerrada (2026-07-20).**

| Componente                     | Veredicto                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| NestJS                         | ✅ Sí                                                                                        |
| React Native + Expo            | ✅ Sí, con justificación arquitectónica                                                      |
| BullMQ + Redis                 | ✅ Sí                                                                                        |
| PostgreSQL / Persistencia real | ⏸️ Pendiente (AR-028, fuera del alcance de AR-001 — nada implementado que legitimar todavía) |

Respondida la pregunta que se impuso esta fase: _si hoy diseñáramos Commitment desde cero con el conocimiento y los requisitos actuales, ¿elegiríamos esta plataforma?_ — sí, en los tres componentes evaluables. La persistencia real quedó correctamente fuera de alcance, no sin resolver por omisión.

---

## Cierre Final — Evaluación del Review Board

**Estado: ✅ AR-001 cerrada (2026-07-20).** Ciclo completo: Análisis → Hipótesis → Refutación → Evaluación técnica → Decisión → Implementación → Validación → Dashboard.

| Dimensión              | Resultado |
| ---------------------- | --------- |
| Evidencia              | A         |
| Rigor metodológico     | A         |
| Calidad de la decisión | A         |
| Trazabilidad           | A         |
| Gobernanza             | A         |
| Riesgo residual        | Muy bajo  |

No significa que la arquitectura sea perfecta — significa que la decisión tomada es defendible. Ese era el objetivo.

**AR-001 queda designada como plantilla metodológica para el resto del programa de remediación.** El giro decisivo fue que la hipótesis inicial ("contradicción Supabase vs. NestJS") no sobrevivió el escrutinio — la conclusión real fue un problema de gobernanza, no tecnológico. Si la implementación hubiera empezado directamente sobre el framing original, se habría resuelto el problema equivocado.

### Regla permanente añadida al programa (2026-07-20)

> **Toda AR debe intentar demostrar que el problema formulado originalmente no es el problema real.**

Antes de diseñar soluciones, cuestionar el framing inicial. Esto es lo que convirtió AR-001 en una investigación arquitectónica genuina en vez de una tarea de documentación — y debe aplicarse a cada AR restante del programa, no solo a las de alta centralidad.

---

## Fase 3 — Decisión

**Estado: ⬜ Pendiente de iniciar.** Ya no se discute si la arquitectura vigente es técnicamente defendible (Fase 2B lo estableció) — se decide cómo formalizarla mediante gobernanza: qué artefactos se crean, mantienen, o reclasifican para restaurar una única fuente de verdad arquitectónica, siguiendo H-L1/H-L2 (reclasificar ADR-001–010, escribir ADR retrospectiva).
