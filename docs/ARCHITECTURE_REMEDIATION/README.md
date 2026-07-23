# Architecture Remediation — Commitment

Companion to `docs/ARCHITECTURE_REVIEW/` (the immutable diagnosis). This folder is the living execution plan.

**Estado formal (2026-07-20):** Architecture Review v1.0 queda cerrada como etapa (histórica, de referencia). Architecture Remediation v1.0 queda formalmente iniciada. A partir de aquí, cada AR se ejecuta con un proceso repetible, medible y trazable hasta su cierre.

## Regla de versionado (los cuatro artefactos del núcleo de gobernanza)

- **Architecture Review** (`docs/ARCHITECTURE_REVIEW/`) → diagnóstico. **No se reescribe; se versiona** (v1, v2, v3... cuando se justifique una nueva auditoría completa, no por correcciones puntuales).
- **Remediation Roadmap** (aquí) → evoluciona continuamente. Los IDs de AR son permanentes; su Wave/Estado/Decisión cambian.
- **Remediation Dashboard** (aquí) → se actualiza al cerrar cada AR, no en batch.
- **ADRs** (`docs/01-product/adr/`, `docs/03-architecture/`) → documentan las decisiones que efectivamente cambian la arquitectura. Una AR puede no generar ninguna ADR (ejecución directa); una decisión de gobernanza sin ADR sustituta cuando una ya existe es exactamente el tipo de contradicción que produjo AR-001.

## Documentos en esta carpeta

- `REMEDIATION_ROADMAP_V1.md` — las 51 Architecture Remediations (AR-001 a AR-050, más AR-051), organizadas en 6 waves por dependencia de causa raíz, con grafo de bloqueos explícito.
- `REMEDIATION_DASHBOARD.md` — progreso por wave, por eje de Decisión, impacto acumulado, y métricas globales. Se actualiza en cada cambio de estado.

## Artefactos futuros (deliberadamente no creados todavía)

- `ARCHITECTURE_DECISION_LOG.md` — un índice ejecutivo, una fila por decisión (Fecha | AR | ADR | Estado | Impacto), que responda en segundos qué se decidió, cuándo, de qué AR surgió, y qué ADR lo formalizó. No reemplaza las ADRs ni el Roadmap — es navegación, no detalle. Se creará cuando haya suficientes decisiones cerradas para justificarlo (el propio usuario pidió esperar unas semanas), no antes.
- **Architecture Review v2.0** — no una re-auditoría desde cero. Se hará cuando cierren aproximadamente las primeras 10-15 ARs, para responder una pregunta concreta: ¿las remediaciones realmente mejoraron la arquitectura? Reutiliza la metodología de v1.0 y compara métricas entre versiones (Overall Health, Hardening pendiente, Quick Wins pendientes, ADR pendientes, Riesgos altos) para medir la evolución de forma objetiva, no por percepción.
- **Propuesta pendiente (2026-07-23, durante AR-043, Paso 4): Architecture Health Dashboard con rúbrica ponderada por área** (15 áreas — Dominio/DDD, Clean Architecture, CQRS, Backend, Frontend, API, Persistencia, Seguridad, Eventos/Sagas, Offline, Sync Engine, IA/AI Coach, Testing, Observabilidad, DevOps/CI —, cada una con peso, sub-score Arquitectura/Implementación, Δ y semáforo, más una franja superior con Proyecto Global/Arquitectura/Implementación/Programa de Remediación/AR completadas/Fase actual/Estabilidad metodológica/Hipótesis abiertas/Bloqueos). Propuesta explícitamente NO adoptada todavía — sometida al mismo escrutinio adversarial que cualquier otra decisión del programa, y rechazada en su forma inmediata por 3 razones: (1) contradice la decisión ya vigente de que `PROJECT_HEALTH_DASHBOARD.md` permanece congelado hasta la Architecture Review v2.0 (arriba); (2) no existen rúbricas objetivas por área todavía — cualquier porcentaje hoy sería una estimación, violando el propio principio de evidencia que motiva la propuesta; (3) ambigüedad documental — no está decidido si sustituye a `PROJECT_HEALTH_DASHBOARD.md`, a `REMEDIATION_DASHBOARD.md`, o es un tercer artefacto. Tratada con el mismo patrón que D-023.2 → AR-052: registrada como pregunta de gobernanza transversal al programa, no resuelta inline, no bloqueante para AR-043. Candidata natural a evaluarse junto con la Architecture Review v2.0, cuando exista evidencia suficiente para diseñar rúbricas reales por área.

## Checkpoint de validación del proceso (planeado, no antes de tiempo)

Después de resolver AR-028, AR-043, y al menos una AR de Wave 4 — una muestra de remediaciones genuinamente técnicas, no solo de gobernanza como AR-001 — se revisará si el proceso (framing → refutación → evidencia → decisión → implementación → validación) sigue produciendo decisiones de la misma calidad. No se cambia la metodología por el éxito de una sola AR; se observa si se sostiene en problemas más técnicos antes de declararla aplicable a todo el programa.

## Postura durante la ejecución de remediaciones

A partir de AR-001, el rol cambia de **arquitecto** (proponiendo cambios, como en la fase de auditoría) a **revisor técnico independiente**: para cada AR, buscar deliberadamente razones para NO hacer el cambio propuesto antes de recomendarlo. Si el cambio sigue siendo la mejor opción después de ese escrutinio adversarial, se ejecuta con mucha más confianza. Aplica con especial rigor a AR-001 por su efecto en cascada sobre el resto del roadmap.

## Ciclo de vida de cada AR

```
Análisis → Verificación del framing → Modelo arquitectónico (si aplica) → Alternativas →
Decisión → Diseño técnico (si aplica) → Implementación → Validación → Dashboard
```

Con el mismo rigor que tuvo la auditoría original. Ninguna AR se marca ✅ Cerrada sin haber pasado por Validación. El paso "Diseño técnico" (Fase 4A en AR-028) se activa cuando la AR modifica un contrato compartido (una interfaz/puerto usado por múltiples consumidores) — no todas las ARs lo necesitan, pero ninguna que sí lo necesite debe saltárselo.

## Regla permanente de proceso (añadida 2026-07-20, tras el cierre de AR-001)

> **Toda AR debe intentar demostrar que el problema formulado originalmente no es el problema real.**

AR-001 empezó como "¿Supabase o NestJS?" y terminó siendo "¿qué mecanismo de gobernanza permitió que dos arquitecturas coexistieran sin que ninguna sustituyera formalmente a la otra?" — un problema completamente distinto. Si la implementación hubiera arrancado sobre el framing original, se habría resuelto el problema equivocado. Cada AR debe pasar por este mismo cuestionamiento del framing antes de pasar a Opciones — no es opcional, es lo que distingue una investigación arquitectónica real de una tarea de documentación con pasos extra. AR-001 queda designada como la plantilla metodológica de referencia para remediaciones de gobernanza (ver `AR-001/ANALISIS.md` § Cierre Final).

**AR-028 (2026-07-20) queda designada como la plantilla de referencia para remediaciones técnicas** — la primera con cambios de código reales, validando que el mismo rigor se sostiene fuera de casos de gobernanza pura. Reformuló su propio framing dos veces (H-028.1 → H-028.2 → framing final) antes de llegar a una decisión, exactamente la misma disciplina que AR-001 estableció.

### Tres decisiones permanentes añadidas al cerrar AR-028

1. **La evidencia puede modificar el grafo de dependencias, no solo el framing de una AR individual.** AR-028 encontró que AR-048 no dependía de ella tanto como se creía, y que ella misma no dependía de AR-023 como se había asumido al planificar el roadmap. El grafo de `REMEDIATION_ROADMAP_V1.md` es un artefacto vivo, sujeto a revisión con la misma evidencia que revisa cualquier AR — no una estructura fija decidida de antemano.
2. **Las remediaciones no se expanden para absorber hallazgos colaterales.** AR-028 encontró que `InMemoryEventStore.saveEvents()` tiene el mismo defecto (`throw` no-`async`) que se corrigió en los 4 repositorios. Se documentó como hallazgo separado, fuera de alcance — no se corrigió, porque Fase 3 ya había decidido explícitamente no tocar el Event Store. Un hallazgo colateral real durante la implementación no es licencia para ampliar el alcance ya aprobado.
3. **El contrato arquitectónico se diseña antes de tocar código, siempre que la AR module una interfaz compartida.** Institucionalizado como el paso "Diseño técnico" (Fase 4A) del ciclo de vida — ver arriba. Sin este paso, es probable terminar discutiendo la firma de una interfaz después de haber modificado ya sus 4 implementaciones, en vez de antes.

**AR-023 (2026-07-20) queda designada como la plantilla de referencia para revisar la validez del propio grafo de dependencias** — la primera AR cuyo objetivo principal no fue resolver el hallazgo, sino verificar si merecía seguir siendo el nodo de mayor centralidad. Encontró que 3 de sus 4 dependencias declaradas (heredadas del borrador inicial del roadmap, construido por afinidad conceptual — "AggregateRoot → versiones → Offline → Sync" — no por dependencia ejecutable) no tenían respaldo verificable en el código.

### Escala de ponderación de evidencia (herramienta permanente, añadida al cerrar la Fase 1 de AR-023)

Cuando una AR necesita pesar evidencia documental contra evidencia de implementación, usar esta escala de 4 niveles, de mayor a menor confianza:

1. **Evidencia de implementación** (código, tests, call sites reales) — peso máximo.
2. **ADR normativa vigente** (una decisión arquitectónica actual, no superada) — peso alto.
3. **ADR prospectiva** (lenguaje de intención/futuro, no de estado actual) — peso medio.
4. **Hipótesis del roadmap** (una dependencia declarada sin verificación propia) — peso bajo.

**Principio explícito que gobierna esta escala:** la evidencia se pondera según lo que realmente demuestra, no según el prestigio o el historial del documento que la contiene. Un documento con un track record de lenguaje "futuro" no materializado (como ADR-014, ya señalado por AR-001) no pierde por eso el crédito de una mención distinta dentro de sí mismo — se pesa esa mención por su propio nivel en la escala (normalmente nivel 3, prospectiva), no se descarta por asociación con el historial del documento.

### Cuarta decisión permanente añadida al cerrar la Fase 1 de AR-023

4. **Una dependencia sin evidencia no se elimina del grafo — se marca "Dependencia no verificada."** Distinto de "no bloquea": una AR que todavía no ha corrido su propia Fase 1 podría, en teoría, descubrir un requisito real relacionado. La corrección del grafo debe reflejar honestamente el estado del conocimiento — ni conservar una dependencia sin respaldo como si estuviera confirmada, ni eliminarla como si estuviera refutada, hasta que la AR dependiente la confirme o descarte en su propia Fase 1.

### Quinto criterio de evaluación permanente (añadido en Fase 2B de AR-023): Preservación de opciones arquitectónicas

Al comparar alternativas para cualquier remediación que elimine o simplifique código, no basta con evaluar consistencia, complejidad, código muerto, y riesgo — hay que preguntar también: **¿esta remediación elimina únicamente código operativo, o también elimina conocimiento arquitectónico que el proyecto ha decidido conservar como opción futura?**

AR-023 encontró que `core/aggregate-root.base.ts` (código sin consumidores reales) cumple dos funciones separables que deben evaluarse por separado: (1) código ejecutable — sin uso, valor bajo; y (2) artefacto de conocimiento arquitectónico — la única implementación existente en el repo de un patrón (Event Sourcing real, rehidratación de identidad desde eventos) que **ADR-021 mantiene explícitamente abierta como "dirección válida a largo plazo... no antes"** (evidencia de nivel 2 en la escala de ponderación — ADR normativa vigente, no solo lenguaje prospectivo). Eliminar código sin verificar esta segunda función arriesga cerrar silenciosamente una puerta que el proyecto decidió, por escrito, mantener abierta. No toda "limpieza de código sin consumidores" es gratis.

### AR-023 cerrada (2026-07-23) — cuarta categoría de remediación: "Remediación generadora de política"

El programa ya distinguía **remediaciones de gobernanza** (AR-001) y **remediaciones técnicas** (AR-028). AR-023 introdujo una tercera categoría: una AR cuyo análisis descubre una pregunta que excede su propio alcance y exige una política reutilizable para todo el programa, en vez de una respuesta específica a su hallazgo original.

AR-023 se dividió en dos decisiones independientes, no bloqueantes entre sí:

- **D-023.1** (técnica, madura, ejecutada): la arquitectura operativa usa exclusivamente `shared/AggregateRoot` — `Appearance` migrado desde `core/aggregate-root.base.ts`. Cierra AR-023.
- **D-023.2** (gobernanza, de alcance mayor que AR-023): ¿debe el repositorio conservar implementaciones de referencia de arquitecturas evaluadas-pero-no-elegidas mientras una ADR vigente las mantenga como opción futura? Transferida a **AR-052** — no se resuelve dentro de AR-023 porque su respuesta es reutilizable para cualquier artefacto futuro en la misma situación, no solo para `core/aggregate-root.base.ts`.

**Regla permanente:** cuando el análisis de una AR descubre una pregunta de gobernanza que trasciende su propio alcance técnico, se separa en una AR nueva con ID propio (no se fuerza la respuesta dentro de la AR original, ni se bloquea su cierre esperando resolver la pregunta más amplia). El nuevo caso (`core/AggregateRoot`) se convierte en el primer caso de estudio de la política, no en el problema que la política debe resolver — la política resultante debe ser reutilizable para cualquier artefacto futuro en la misma situación.

### Evaluación del usuario tras el cierre de AR-023 (2026-07-23): taxonomía de tres patrones y reencuadre del programa

Con tres ARs cerradas, el usuario identificó que no son tres ejecuciones equivalentes del mismo ciclo, sino **tres clases distintas de remediación que terminaron respetando el mismo proceso**:

- **AR-001 → gobernanza:** el problema se reclasifica (dos arquitecturas documentales paralelas, ninguna reemplaza formalmente a la otra).
- **AR-028 → técnica:** el problema permanece, pero cambia la causa raíz técnica identificada (duplicación de responsabilidades sobre versión, no ausencia de concurrencia optimista).
- **AR-023 → híbrida (técnica + política):** el problema se descompone en una decisión técnica cerrada (D-023.1) y una política de gobernanza transferida (D-023.2 → AR-052).

Esto eleva el valor de la métrica **3/3 sin excepciones al ciclo de 9 fases**: no mide que el mismo tipo de problema se resolvió tres veces, mide que el proceso sobrevive a tres clases estructuralmente distintas de remediación.

**Decisión explícita del usuario sobre la siguiente AR: AR-043 antes que AR-052.** No porque AR-052 sea menos importante, sino porque AR-052 introduce otra política permanente — antes de eso, el usuario quiere validar que el método sigue funcionando en una remediación cuyo resultado vuelva a ser **principalmente técnico u operativo, sin generar una nueva política**. Si AR-043 completa el ciclo sin excepciones, la secuencia de validación quedaría: AR-001 (gobernanza) → AR-028 (técnica) → AR-023 (híbrida) → AR-043 (control: ¿el método funciona sin necesitar generar política?). Solo después de ese resultado el usuario abordaría AR-052, apoyándose en un proceso ya validado en las cuatro clases.

**Reencuadre del programa:** el usuario ya no lo describe como una "remediación arquitectónica" (que tiene un final) sino como un **sistema de gobierno de arquitectura basado en evidencia** (que permanece y se reutiliza ante nuevas decisiones o tecnologías). El logro no es solo haber resuelto tres hallazgos concretos — es haber convertido el propio proceso de decisión en un activo de la arquitectura.

## Hipótesis en observación (deliberadamente NO reglas permanentes todavía)

A diferencia de las reglas permanentes de las secciones anteriores, esto es una lista de patrones que el usuario ha pedido explícitamente vigilar en futuras ARs, sin promoverlos a regla hasta que se acumulen suficientes puntos de datos. No aplicar como si ya fueran reglas del programa.

- **"Mezcla de responsabilidades entre límites arquitectónicos" (añadida durante la Fase 3 de AR-043, 2026-07-23):** _"Muchos hallazgos de la auditoría inicial pueden estar describiendo problemas donde el verdadero defecto no es la ausencia de un componente, sino la mezcla de responsabilidades que deberían pertenecer a límites arquitectónicos distintos."_ Patrón observado hasta ahora: AR-001 separó gobernanza de implementación; AR-023 separó decisión técnica de política; AR-043 separa autenticación de identidad de dominio (`Identity`, D-043.1, ver `AR-043/ANALISIS.md`). Tres puntos de datos, insuficiente para generalizar — el usuario pide observar si reaparece en próximas ARs antes de convertirla en regla del programa.
- **H-GOV-01 — "Ninguna AR debería convertirse en la primera excepción tecnológica del proyecto sin evidencia específica que la justifique" (añadida durante el Paso 6B de AR-043, 2026-07-23):** patrón observado dos veces — AR-023 rechazó crear una excepción para `Appearance` (mantenerla en `core/AggregateRoot` en vez de migrarla a `shared/`), y el Paso 6B de AR-043 rechazó introducir Postgres/Redis solo para Authentication mientras los 7 aggregates reales del sistema siguen sobre `InMemory*Repository` (H-043.8, ver `AR-043/ANALISIS.md`). El usuario explícitamente NO la congela como regla todavía — la registra para seguimiento en futuras ARs. **Nota (AR-052, 2026-07-23): H-GOV-01 pasa a ser el primer caso de estudio de AR-052, no un tema a resolver por separado — ver más abajo.**
- **"Las hipótesis de gobernanza deben evaluarse también por el riesgo que supondría utilizarlas como criterio de gobernanza" (añadida durante AR-052, 2026-07-23):** hallazgo autorreferencial — al someter H-052.3 (ver más abajo) a su propio criterio de promoción, el coste de institucionalizarla si estuviera equivocada resultó alto, porque actuaría sobre el mecanismo por el cual el programa promueve _todas_ las futuras reglas metodológicas. El objeto de estudio (el propio proceso de decisión) modifica el estándar de evidencia exigible, algo que no ocurre en una AR puramente técnica. Un solo punto de datos — se registra para vigilar si reaparece en futuras hipótesis de gobernanza, no como regla todavía.
- **"Toda AR cuyo objetivo sea aumentar la capacidad de detección del sistema debe validar primero la realidad del problema que pretende hacer visible" (añadida al cerrar AR-008, 2026-07-23):** AR-008 asumía, siguiendo al Roadmap, que `test:e2e` "existe y pasa" — en vez de implementar esa suposición directamente, se verificó primero, y resultó parcialmente falsa (7/29 tests fallan de forma reproducible, con Redis real confirmado). Sin esa verificación previa, conectar `test:e2e` a CI habría producido un CI roto desde el primer día, o peor, una falsa sensación de cobertura si el fallo hubiera sido intermitente. Un solo punto de datos — se registra para vigilar si reaparece en futuras ARs de observabilidad/detección (logging, monitoreo, alertas, otros gates de CI) antes de convertirla en regla del programa.
- **"Antes de atribuir un fallo e2e al sistema, verificar si el contrato del test sigue siendo contemporáneo al contrato del dominio" (añadida al cerrar AR-053, 2026-07-23):** AR-053 se abrió como una posible interacción Saga/OCC (heredando la hipótesis especulativa registrada al cerrar AR-008) y terminó siendo, en ambos casos investigados (Commitment y Goal), un test e2e escrito un día antes de que una decisión de dominio ya documentada (ADR-022 §3.1; "Decisión B, Goal Lifecycle") cambiara las reglas de activación/completado — nunca actualizado porque nada lo ejecutaba de nuevo (AR-008). El sistema cumplía su propio contrato correctamente; el "defecto" estaba en la expectativa del test, no en el comportamiento. Un solo punto de datos — se registra para vigilar si reaparece en futuras ARs que investiguen fallos de test (no del sistema) antes de convertirla en regla del programa. Ver `AR-053/ANALISIS.md`.
- **"Cuando el sistema interactúa con otro sistema, el contrato de integración debe tratarse con el mismo rigor que un contrato de dominio" (añadida en la Fase 3 de AR-054, 2026-07-23):** a diferencia de AR-053 (donde el sistema cumplía correctamente su propio contrato de dominio y el defecto estaba en un test desactualizado), AR-054 encontró el patrón inverso — el contrato externo (BullMQ, que exige un manejador de su evento `error`) estaba bien definido desde el principio; lo incompleto era la integración de la aplicación con él, sin que ningún listener existiera desde el día en que BullMQ se introdujo. Un solo punto de dato — a diferencia de H-052.3 (que ya acumulaba varios casos retrospectivos antes de someterse a experimentos discriminantes), aquí todavía no existe historial suficiente para evaluar si generaliza a otros contratos de integración del proyecto (bases de datos, otras colas, SDKs externos, clientes HTTP). Se registra para vigilar si reaparece en futuras ARs que investiguen integraciones con librerías/servicios externos, antes de convertirla en regla del programa. Ver `AR-054/ANALISIS.md`.

### AR-052 (en progreso, 2026-07-23) — nueva herramienta permanente: experimentos discriminantes entre hipótesis de gobernanza

AR-052 se reencuadró de una política sustantiva concreta (¿qué hacer con `core/AggregateRoot`?) a una
pregunta de nivel superior: ¿qué proceso decide cuándo una observación repetida se convierte en regla
del programa? Su Fase 1 encontró que la taxonomía inicial (promoción por número de repeticiones) no
explica el catálogo real de 13 artefactos de gobernanza ya producidos por el programa — 11 se
promovieron tras una sola ocurrencia, y los 2 que no se promovieron acumulan más repeticiones, no
menos. Su Fase 2 sometió dos hipótesis sucesivas (H-052.2: procedimiento-vs-sustancia; H-052.3:
asimetría de riesgo) a **experimentos discriminantes** — no ejemplos que solo confirman una hipótesis,
sino casos donde dos hipótesis competidoras predicen resultados opuestos, de forma que solo uno puede
acertar. **Regla permanente añadida:** cuando compitan dos hipótesis metodológicas y ambas parezcan
explicar la misma evidencia, no basta con acumular más ejemplos que las confirmen a las dos por igual
— hay que buscar (o reconocer, si ya existe) un caso donde discrepen, idealmente uno que no se haya
construido a propósito para la comparación (más fuerte cuanto más independiente sea su origen del
debate que se está tratando de resolver). Aplicado con éxito: la subdivisión de Fase 4B de AR-043 y la
propuesta de Architecture Health Dashboard (rechazada durante AR-043, sin relación con AR-052 en su
origen) discriminaron entre H-052.2 y H-052.3 a favor de esta última — la segunda pesa más que la
primera precisamente por no haber nacido como evidencia para AR-052.

**Hallazgo autorreferencial de esta misma fase:** una hipótesis de gobernanza debe someterse a su
propio criterio de promoción antes de aceptarse. H-052.3 (asimetría de riesgo), aplicada a sí misma,
exige más evidencia de la que tiene hoy — porque institucionalizarla si estuviera equivocada afectaría
al mecanismo que gobierna la promoción de _todas_ las futuras reglas del programa, la categoría de
mayor riesgo según su propio criterio. **Estado actual: H-052.3 es la hipótesis líder, con dos
experimentos discriminantes retrospectivos a favor, pero NO promovida a regla — falta evidencia
prospectiva** (predicción registrada antes de conocer el desenlace de un caso futuro real, no
fabricado). Ver `AR-052/ANALISIS.md` para el registro completo.

## La regla de gobernanza que sostiene todo esto

> **Ninguna decisión arquitectónica relevante entra al código sin pasar antes por el mismo ciclo de gobernanza, evaluación y remediación que se estableció aquí.**

Esta regla es la razón por la que existió la Fase 4 de la auditoría (ADR-004 vs ADR-011 nunca pasó por este proceso, y esa es la contradicción más grave que se encontró). Mantenerla desde ahora significa que el backlog de remediación no solo disminuirá — crecerá mucho más lentamente, porque el proceso empieza a prevenir la aparición de nueva deuda arquitectónica, no solo a corregir la existente.

**En la práctica:** cualquier cambio que toque un ADR existente, introduzca una nueva dependencia significativa, o cambie un límite de bounded context, pasa primero por una AR (o una ADR nueva) — no se decide implícitamente dentro de una sesión de código.
