# Architecture Remediation — Commitment

Companion to `docs/ARCHITECTURE_REVIEW/` (the immutable diagnosis). This folder is the living execution plan.

**Estado formal (2026-07-20):** Architecture Review v1.0 queda cerrada como etapa (histórica, de referencia). Architecture Remediation v1.0 queda formalmente iniciada. A partir de aquí, cada AR se ejecuta con un proceso repetible, medible y trazable hasta su cierre.

**Estado formal (2026-07-23, al cerrar el ciclo AR-001→AR-054):** la metodología misma queda reconocida como un segundo objeto de gobernanza, independiente de la arquitectura que remedia, y se congela como **Metodología de Remediación v1.0** (ver más abajo). Dos ciclos de vida distintos a partir de aquí: la arquitectura evoluciona en cada AR; el método evoluciona solo cuando la evidencia acumulada, evaluada por Fase 0, justifica una nueva versión.

## Regla de versionado (los cinco artefactos del núcleo de gobernanza)

- **Architecture Review** (`docs/ARCHITECTURE_REVIEW/`) → diagnóstico. **No se reescribe; se versiona** (v1, v2, v3... cuando se justifique una nueva auditoría completa, no por correcciones puntuales).
- **Remediation Roadmap** (aquí) → evoluciona continuamente. Los IDs de AR son permanentes; su Wave/Estado/Decisión cambian.
- **Remediation Dashboard** (aquí) → se actualiza al cerrar cada AR, no en batch.
- **ADRs** (`docs/01-product/adr/`, `docs/03-architecture/`) → documentan las decisiones que efectivamente cambian la arquitectura. Una AR puede no generar ninguna ADR (ejecución directa); una decisión de gobernanza sin ADR sustituta cuando una ya existe es exactamente el tipo de contradicción que produjo AR-001.
- **Metodología de Remediación** (esta sección + Fase 0 + el ciclo de 9 fases, más abajo en este mismo documento) → **quinto artefacto versionado, añadido 2026-07-23 al cerrar el ciclo de AR-054.** Ver "Metodología de Remediación v1.0" más abajo — mismo tratamiento que Architecture Review: no se reescribe, se versiona.

**Principio de gobernanza consolidado (2026-07-23) — ya no es una hipótesis metodológica, es una decisión de gobernanza que gobierna a los cinco artefactos anteriores por igual:**

> **Los artefactos históricos no se corrigen; se suceden mediante nuevas versiones cuando la evidencia demuestra que la versión vigente ya no es suficiente.**

No depende de una sola observación repetida — es consistente, por diseño, en los 5 artefactos: los ADRs
se reclasifican, no se editan (AR-001); Architecture Review se versiona, no se reescribe; el Roadmap
degrada dependencias a "no verificadas" en vez de borrarlas; y ahora la propia Metodología de
Remediación sigue la misma regla. Con la incorporación de Metodología v1.0 aparece además una jerarquía
que antes no existía entre los cinco: la arquitectura responde "¿cómo debe construirse Commitment?", la
metodología responde "¿cómo decidimos cambiar esa arquitectura?" — separar ambas preguntas reduce el
riesgo, común en procesos largos, de modificar a la vez el objeto de estudio y el método con el que se
estudia.

## Metodología de Remediación v1.0 (congelada 2026-07-23, al cerrar el ciclo AR-001→AR-054)

Hasta AR-054 el programa tenía un solo objeto de estudio: la arquitectura de Commitment. Con este cierre
aparece un segundo objeto de estudio, con ciclo de vida propio y mucho más lento: **la metodología con
la que Commitment evoluciona.** Tratarla con el mismo rigor de versionado que ya se aplica a Architecture
Review evita dos errores simétricos: reescribir silenciosamente el método cada vez que aparece una
observación nueva, o nunca poder decir con precisión qué cambió y por qué.

**Metodología de Remediación v1.0 — estado: ✅ Congelada. Compuesta exactamente por:**

- El ciclo de 9 fases (`Análisis → Verificación del framing → Modelo arquitectónico (si aplica) →
Alternativas → Decisión → Diseño técnico (si aplica) → Implementación → Validación → Dashboard`).
- **Fase 0** — el criterio de 5 puntos para promover una hipótesis metodológica a regla permanente
  (repetición independiente, diversidad de contexto, poder predictivo, resistencia a contraejemplos
  buscados activamente, coste de equivocarse).
- Todas las reglas permanentes ya registradas en este documento a fecha de cierre de AR-054 (la regla
  post-AR-001, las 3 decisiones post-AR-028, la escala de ponderación de evidencia, la 4ª/5ª categoría y
  criterio de AR-023, H-GOV-01, la separación de niveles documentales, la disciplina de comparabilidad
  para la revisión de 15 ARs).
- `REMEDIATION_ROADMAP_V1.md` y `REMEDIATION_DASHBOARD.md` como aparato de seguimiento.

**Explícitamente NO forma parte de v1.0** (siguen siendo observación, no metodología congelada): todas las
hipótesis de la sección "Hipótesis en observación" de más abajo (H-GOV-01 sin promover todavía, cambio de
propietario, técnica de `git log`, evidencia-vs-argumentación) — son candidatas a v1.1, no parte de la
línea base actual.

**Consecuencia práctica para las revisiones de 15 y 25 ARs (Fase 0, más abajo):** la pregunta deja de ser
abierta ("¿qué aprendimos?") y pasa a ser una evaluación acotada contra una línea base congelada: **¿la
evidencia acumulada justifica pasar de Metodología v1.0 a v1.1?** Si una hipótesis se promueve, v1.1 se
declara explícitamente, con changelog propio (qué entra, qué evidencia lo justificó, qué AR lo detectó
por primera vez) — igual que Architecture Review v2.0 comparará métricas contra v1.0 en vez de sustituirla
en silencio.

**No se modifica nada de esta metodología salvo por necesidad demostrada** — mismo tratamiento que los
ADRs históricos: cambios mínimos, evidencia explícita, trazabilidad completa, nunca reescribir la
historia de por qué v1.0 se congeló con este alcance exacto.

**Criterio para cualquier futura v1.1 (fijado 2026-07-23, antes de que exista el primer caso real):**
cualquier cambio propuesto debe responder explícitamente a una de estas dos preguntas, o no pertenece a
una nueva versión de la metodología:

1. ¿Qué limitación demostrada de v1.0 resuelve este cambio?
2. ¿Qué nueva capacidad verificable aporta que v1.0 no podía ofrecer?

Una mejora meramente plausible, sin responder a ninguna de las dos, no justifica una nueva versión —
mismo principio que ya gobierna el resto del programa: las versiones cambian porque la evidencia
obliga, no porque existan ideas nuevas.

**El objetivo de v1.0 no es demostrar que cambia — es demostrar que resiste.** Si al llegar a 15 ARs
cerradas la conclusión es "no hay evidencia suficiente para cambiar nada," eso no es un resultado pobre
de la revisión — es una validación genuina de que v1.0 sigue explicando adecuadamente el comportamiento
observado, en el mismo sentido en que una teoría gana credibilidad cada vez que sobrevive a un intento
serio de refutarla. **El mejor resultado posible de la revisión de las 15 ARs podría ser, precisamente,
no publicar una v1.1 todavía.** Toda AR ejecutada desde este cierre en adelante es, además de una
remediación en sí misma, una prueba empírica más de si Metodología v1.0 sigue siendo suficiente.

**Umbral operativo explícito para tocar la metodología antes de las revisiones de 15/25 ARs (fijado
2026-07-23):** no modificar nada de Metodología v1.0 hasta que una AR falle **por culpa de la
metodología, no del problema técnico que investiga** — un umbral bastante más sólido que introducir
mejoras preventivas basadas en ideas plausibles, y consistente con el criterio de dos preguntas de
arriba (ninguna mejora preventiva responde a "qué limitación _demostrada_ resuelve").

**Doble plano de evidencia que produce cada AR a partir de este cierre (2026-07-23):** antes, una AR
cerrada validaba únicamente una remediación (plano técnico: ¿el problema arquitectónico quedó resuelto o
correctamente delimitado?). A partir de ahora, cada cierre aporta evidencia en un segundo plano,
independiente del primero: **¿Metodología v1.0 fue suficiente para llegar a esa decisión sin necesitar
modificarse?** Los dos flujos de evidencia se acumulan en paralelo — uno alimenta el Roadmap/Dashboard
de arquitectura, el otro alimenta las futuras revisiones transversales y la evaluación de Fase 0.

**Fricción metodológica — concepto registrado, no todavía una métrica de Dashboard (2026-07-23).**
Operacionaliza el umbral de arriba en un contador único: **Methodological Friction Event (MFE)** — un
evento en el que una AR no puede continuar correctamente sin modificar la metodología vigente. Cuenta
como MFE, por ejemplo: el ciclo no ofrece una fase adecuada para lo que la AR necesita hacer; dos
artefactos de gobernanza entran en conflicto directo; una decisión no tiene propietario claro entre los
5 artefactos; aparece evidencia que ningún artefacto existente sabe clasificar; una revisión transversal
no puede evaluar un caso con los criterios ya fijados. **No cuenta como MFE** que alguien proponga una
idea plausible de mejora — eso es, por definición, lo que el criterio de dos preguntas para v1.1 ya
descarta. **MFE actual: 0** (consistente con, y una generalización de, "Estabilidad metodológica: 7/7
ARs cerradas sin excepciones" ya trackeado en el Dashboard — mismo conteo hoy, definición más amplia
hacia adelante). Deliberadamente no se añade como columna del Dashboard todavía — se mantiene como
concepto en este documento hasta que exista al menos un caso real que justifique trackearlo
formalmente como serie temporal.

**La frontera entre el primer y el segundo ciclo del programa (2026-07-23):** el primer ciclo
(AR-001→AR-054) construyó la metodología. El segundo no debería intentar producir Metodología v1.1 —
debería intentar acumular casos donde v1.0 resulte suficiente sin necesitar cambios. La carga de la
prueba se invierte: la pregunta por defecto deja de ser "¿podemos mejorar el proceso?" y pasa a ser
"¿existe evidencia de que el proceso actual fue insuficiente?". **Patrón simétrico, no diseñado
deliberadamente sino emergente:** en arquitectura, `Hallazgo → AR → Remediación`; en metodología,
`Fricción metodológica (MFE) → Revisión transversal → Metodología vX.Y`. El mismo patrón, un nivel de
abstracción más arriba.

**Disciplina de trabajo para el Ciclo 2 (fijada 2026-07-23) — más una regla de conducta que una regla
metodológica.** Cualquier conversación durante una AR que termine en "deberíamos añadir esto a
Metodología v1.0" debe responder primero, y solo, a esta pregunta:

> **¿La AR quedó bloqueada sin ello?**

Si la respuesta es **no**, la conversación termina ahí — la idea puede registrarse como observación
suelta (o, si se repite, como candidata en "Hipótesis en observación"), pero no genera trabajo
metodológico ni cuenta como MFE. El riesgo del Ciclo 2 ya no es cometer un error arquitectónico — es la
**deriva metodológica**: refinar v1.0 continuamente por entusiasmo, sin que ninguna AR individual haya
demostrado la necesidad, produce el mismo efecto que reescribir un ADR en vez de sucederlo — la
metodología nunca permanece estable el tiempo suficiente como para que la revisión de las 15 ARs pueda
evaluar honestamente si v1.0, tal cual se congeló, fue suficiente. Se estaría evaluando en su lugar una
secuencia no documentada de v1.0.x.

**"Silencio metodológico" durante el Ciclo 2 (fijado 2026-07-23) — la metodología deja de ser tema de
conversación por defecto.** Mientras una AR pueda avanzar con las 9 fases tal como están definidas, no
se abren discusiones metodológicas, no se proponen fases nuevas, no se ajustan criterios, no se crean
artefactos — no porque sean malas ideas, sino porque contaminarían el experimento del Ciclo 2. La única
pregunta metodológica se hace al cerrar la AR, no durante: **¿en algún momento fue imposible continuar
sin modificar la metodología?** Si no, MFE sigue en 0 y no hace falta escribir nada más al respecto. Una
AR que termina sin haber mencionado Metodología v1.0 ni una sola vez es exactamente el resultado que el
Ciclo 2 busca — la señal de un proceso maduro no es que se discuta constantemente, es que se vuelva
invisible.

**Formato esperado del resumen en la revisión de las 15 ARs (fijado de antemano, 2026-07-23), más
preciso que "15 ARs cerradas":**

```
Metodología vigente: v1.0
AR ejecutadas:        15
MFE:                   0
Cambios metodológicos: 0
```

**El experimento real del Ciclo 2, nombrado explícitamente:** ya no evalúa arquitectura — evalúa una
afirmación falsable de nivel superior: _"Metodología v1.0 es suficientemente completa para conducir una
secuencia diversa de remediaciones arquitectónicas sin requerir modificaciones."_ Tiene criterio de
fallo (MFE > 0), hitos de revisión (15 y 25 ARs), y un mecanismo de versionado si resulta insuficiente
(el criterio de dos preguntas para v1.1). Es, desde AR-001, la primera hipótesis metodológica de nivel
superior sometida a prueba continua sin alterar las condiciones del propio experimento — si sobrevive
hasta la revisión de las 15 ARs sin necesitar ninguna excepción, ese resultado pesará más que cualquier
refinamiento incremental que se hubiera podido incorporar por el camino.

## Documentos en esta carpeta

- `REMEDIATION_ROADMAP_V1.md` — las 51 Architecture Remediations (AR-001 a AR-050, más AR-051), organizadas en 6 waves por dependencia de causa raíz, con grafo de bloqueos explícito.
- `REMEDIATION_DASHBOARD.md` — progreso por wave, por eje de Decisión, impacto acumulado, y métricas globales. Se actualiza en cada cambio de estado.
- `HALLAZGOS_PENDIENTES.md` (añadido 2026-07-23, tras el cierre de AR-054) — registro ligero de hallazgos descubiertos durante el trabajo de una AR cuya investigación (¿es un defecto real? ¿de quién es la responsabilidad? ¿merece una AR propia?) todavía no ha empezado. Distinto del Roadmap: no tiene ID permanente hasta que se promueva a AR formal.
- `REVISION_TRANSVERSAL_7_ARS.md` (añadido 2026-07-23, tras el cierre de AR-054) — revisión metodológica transversal de las 7 ARs cerradas hasta ahora, pedida explícitamente por el usuario en vez de abrir un nuevo frente técnico. Tally verificado por grep (no por impresión) de: cambios de propietario del problema, decisiones simplificadas por evidencia (H-GOV-01), balance de hipótesis refutadas/confirmadas, y técnicas de investigación reutilizadas entre ARs. Deliberadamente no promueve nada a regla permanente — solo señala qué patrones ya acumulan repetición suficiente para vigilancia prioritaria.
- `REVISION_TRANSVERSAL_15_ARS.md` (añadido 2026-07-23, al alcanzar el hito 1 — 15 ARs cerradas) — segunda revisión transversal, misma disciplina de comparabilidad (las mismas 4 preguntas) más un marco de evaluación explícito v1.0→v1.1 con la carga de la prueba sobre el cambio. Aplicó los 5 criterios de Fase 0 al candidato más fuerte (H-GOV-01, ahora 5 repeticiones): 3 satisfechos, 1 parcial, 1 no satisfecho (resistencia a contraejemplos buscados activamente) — **no se promueve nada.** Metodología v1.0 se mantiene sin cambios. Registra un patrón nuevo en observación ("la propiedad que un hallazgo reclama puede ya existir estructuralmente") con 3 puntos de dato (AR-024, AR-030, AR-047), distinto del "cambio de propietario" original.

## Artefactos futuros (deliberadamente no creados todavía)

- `ARCHITECTURE_DECISION_LOG.md` — un índice ejecutivo, una fila por decisión (Fecha | AR | ADR | Estado | Impacto), que responda en segundos qué se decidió, cuándo, de qué AR surgió, y qué ADR lo formalizó. No reemplaza las ADRs ni el Roadmap — es navegación, no detalle. Se creará cuando haya suficientes decisiones cerradas para justificarlo (el propio usuario pidió esperar unas semanas), no antes.
- **Architecture Review v2.0** — no una re-auditoría desde cero. Se hará cuando cierren aproximadamente las primeras 10-15 ARs, para responder una pregunta concreta: ¿las remediaciones realmente mejoraron la arquitectura? Reutiliza la metodología de v1.0 y compara métricas entre versiones (Overall Health, Hardening pendiente, Quick Wins pendientes, ADR pendientes, Riesgos altos) para medir la evolución de forma objetiva, no por percepción.
- **Propuesta pendiente (2026-07-23, durante AR-043, Paso 4): Architecture Health Dashboard con rúbrica ponderada por área** (15 áreas — Dominio/DDD, Clean Architecture, CQRS, Backend, Frontend, API, Persistencia, Seguridad, Eventos/Sagas, Offline, Sync Engine, IA/AI Coach, Testing, Observabilidad, DevOps/CI —, cada una con peso, sub-score Arquitectura/Implementación, Δ y semáforo, más una franja superior con Proyecto Global/Arquitectura/Implementación/Programa de Remediación/AR completadas/Fase actual/Estabilidad metodológica/Hipótesis abiertas/Bloqueos). Propuesta explícitamente NO adoptada todavía — sometida al mismo escrutinio adversarial que cualquier otra decisión del programa, y rechazada en su forma inmediata por 3 razones: (1) contradice la decisión ya vigente de que `PROJECT_HEALTH_DASHBOARD.md` permanece congelado hasta la Architecture Review v2.0 (arriba); (2) no existen rúbricas objetivas por área todavía — cualquier porcentaje hoy sería una estimación, violando el propio principio de evidencia que motiva la propuesta; (3) ambigüedad documental — no está decidido si sustituye a `PROJECT_HEALTH_DASHBOARD.md`, a `REMEDIATION_DASHBOARD.md`, o es un tercer artefacto. Tratada con el mismo patrón que D-023.2 → AR-052: registrada como pregunta de gobernanza transversal al programa, no resuelta inline, no bloqueante para AR-043. Candidata natural a evaluarse junto con la Architecture Review v2.0, cuando exista evidencia suficiente para diseñar rúbricas reales por área.
- **"Governance Model" — un sexto artefacto, todavía sin escribir (nombre provisional, 2026-07-23, al cerrar el ciclo de Metodología v1.0).** Los 5 artefactos de gobernanza actuales (ADRs, Architecture Review, Remediation Roadmap/Dashboard, Revisión Transversal, Metodología v1.0) son cada uno gobernado, pero ninguno gobierna explícitamente la relación _entre_ ellos — qué autoridad tiene cada uno sobre los demás, cuáles son históricos vs. versionables, cuáles pueden modificarse dentro de una AR y cuáles solo mediante una revisión transversal, quién puede originar un cambio en cada uno. Hoy esas respuestas existen, pero distribuidas implícitamente. **No se diseña todavía — aplicando el propio H-GOV-01 a esta decisión**: hoy solo existe una versión de la metodología (v1.0), sin conflicto real que un modelo de gobernanza explícito tuviera que resolver. **Condición de disparo registrada, no como hipótesis sino como observación a vigilar:** evaluar la necesidad de un modelo explícito de gobernanza entre artefactos cuando lleguen a coexistir varias versiones de la metodología, o varios artefactos metodológicos activos simultáneamente — no antes.

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
- **H-GOV-01 — "Ninguna AR debería convertirse en la primera excepción tecnológica del proyecto sin evidencia específica que la justifique" (añadida durante el Paso 6B de AR-043, 2026-07-23):** patrón observado dos veces — AR-023 rechazó crear una excepción para `Appearance` (mantenerla en `core/AggregateRoot` en vez de migrarla a `shared/`), y el Paso 6B de AR-043 rechazó introducir Postgres/Redis solo para Authentication mientras los 7 aggregates reales del sistema siguen sobre `InMemory*Repository` (H-043.8, ver `AR-043/ANALISIS.md`). El usuario explícitamente NO la congela como regla todavía — la registra para seguimiento en futuras ARs. **Nota (AR-052, 2026-07-23): H-GOV-01 pasa a ser el primer caso de estudio de AR-052, no un tema a resolver por separado — ver más abajo.** **Nota (AR-054, Fase 4A, 2026-07-23): tercer punto de dato, y generaliza el patrón de "excepción tecnológica" a "propiedad de diseño más fuerte de lo que la evidencia justifica."** AR-054 evaluó explícitamente introducir `DiscoveryService` (primer uso en el proyecto) para lograr una garantía estructural absoluta de que ningún `Queue` viole D-054.1 — y la rechazó no por inviabilidad técnica (se confirmó viable), sino porque la evidencia acumulada (2 puntos de integración, sin precedente de repetición) no justificaba su coste. Formulación más afilada del mismo principio: _"no perseguir una propiedad de diseño más fuerte que la que la evidencia del problema justifica, incluso cuando esa propiedad más fuerte sea técnicamente alcanzable."_ Ver `AR-054/ANALISIS.md`.
- **"Las hipótesis de gobernanza deben evaluarse también por el riesgo que supondría utilizarlas como criterio de gobernanza" (añadida durante AR-052, 2026-07-23):** hallazgo autorreferencial — al someter H-052.3 (ver más abajo) a su propio criterio de promoción, el coste de institucionalizarla si estuviera equivocada resultó alto, porque actuaría sobre el mecanismo por el cual el programa promueve _todas_ las futuras reglas metodológicas. El objeto de estudio (el propio proceso de decisión) modifica el estándar de evidencia exigible, algo que no ocurre en una AR puramente técnica. Un solo punto de datos — se registra para vigilar si reaparece en futuras hipótesis de gobernanza, no como regla todavía.
- **"Toda AR cuyo objetivo sea aumentar la capacidad de detección del sistema debe validar primero la realidad del problema que pretende hacer visible" (añadida al cerrar AR-008, 2026-07-23):** AR-008 asumía, siguiendo al Roadmap, que `test:e2e` "existe y pasa" — en vez de implementar esa suposición directamente, se verificó primero, y resultó parcialmente falsa (7/29 tests fallan de forma reproducible, con Redis real confirmado). Sin esa verificación previa, conectar `test:e2e` a CI habría producido un CI roto desde el primer día, o peor, una falsa sensación de cobertura si el fallo hubiera sido intermitente. Un solo punto de datos — se registra para vigilar si reaparece en futuras ARs de observabilidad/detección (logging, monitoreo, alertas, otros gates de CI) antes de convertirla en regla del programa.
- **"Antes de atribuir un fallo e2e al sistema, verificar si el contrato del test sigue siendo contemporáneo al contrato del dominio" (añadida al cerrar AR-053, 2026-07-23):** AR-053 se abrió como una posible interacción Saga/OCC (heredando la hipótesis especulativa registrada al cerrar AR-008) y terminó siendo, en ambos casos investigados (Commitment y Goal), un test e2e escrito un día antes de que una decisión de dominio ya documentada (ADR-022 §3.1; "Decisión B, Goal Lifecycle") cambiara las reglas de activación/completado — nunca actualizado porque nada lo ejecutaba de nuevo (AR-008). El sistema cumplía su propio contrato correctamente; el "defecto" estaba en la expectativa del test, no en el comportamiento. Un solo punto de datos — se registra para vigilar si reaparece en futuras ARs que investiguen fallos de test (no del sistema) antes de convertirla en regla del programa. Ver `AR-053/ANALISIS.md`.
- **"Cuando el sistema interactúa con otro sistema, el contrato de integración debe tratarse con el mismo rigor que un contrato de dominio" (añadida en la Fase 3 de AR-054, 2026-07-23):** a diferencia de AR-053 (donde el sistema cumplía correctamente su propio contrato de dominio y el defecto estaba en un test desactualizado), AR-054 encontró el patrón inverso — el contrato externo (BullMQ, que exige un manejador de su evento `error`) estaba bien definido desde el principio; lo incompleto era la integración de la aplicación con él, sin que ningún listener existiera desde el día en que BullMQ se introdujo. Un solo punto de dato — a diferencia de H-052.3 (que ya acumulaba varios casos retrospectivos antes de someterse a experimentos discriminantes), aquí todavía no existe historial suficiente para evaluar si generaliza a otros contratos de integración del proyecto (bases de datos, otras colas, SDKs externos, clientes HTTP). Se registra para vigilar si reaparece en futuras ARs que investiguen integraciones con librerías/servicios externos, antes de convertirla en regla del programa. Ver `AR-054/ANALISIS.md`.
- **"La localización precisa del propietario de un síntoma puede cambiar durante la investigación, y ese cambio debe delimitar el alcance de la AR en lugar de expandirla indefinidamente" (añadida al cerrar la Fase 5 de AR-054, 2026-07-23):** segundo punto de dato, tras AR-053. AR-053 pasó de "fallo del dominio" a "tests desactualizados"; AR-054 pasó de "integración incompleta" a "contrato cumplido correctamente + comportamiento residual del ciclo de vida interno de una dependencia externa (`bullmq`'s `RedisConnection.close()`, confirmado como un issue upstream ya abierto y sin resolución oficial — ver `HALLAZGOS_PENDIENTES.md`)." En ambos casos, la implementación (no el análisis inicial) fue lo que reveló el propietario real, y en ambos casos la AR se cerró en el punto donde su propio contrato/decisión quedó satisfecho, moviendo el residuo a un hallazgo separado en vez de perseguirlo dentro de la misma AR. Dos puntos de dato — se registra para vigilar si reaparece antes de convertirla en regla del programa. **Nota (revisión transversal, 2026-07-23):** AR-001 es, en retrospectiva, un tercer precedente más antiguo y más general de la misma estructura (la elección de plataforma resultó ser en realidad un problema de gobernanza) — no cuenta como punto de dato limpio adicional (no hay un tercero/dependencia externa involucrado como en AR-053/054), pero explica por qué el patrón no sorprendió cuando reapareció: ya existía desde el origen del programa. Ver `REVISION_TRANSVERSAL_7_ARS.md`.
- **"Los cambios sustanciales de dirección en una AR deben estar impulsados por nueva evidencia, no por argumentación" (añadida durante la revisión transversal de las 7 ARs cerradas, 2026-07-23):** en los 3 casos de cambio de dirección examinados en detalle esta sesión, el cambio lo forzó una observación nueva, no un argumento más convincente — AR-053 (reconstrucción histórica vía `git log`), AR-054 (instrumentación directa de `EventEmitter.prototype.emit`), AR-052 (experimentos discriminantes entre hipótesis). El propio usuario señaló la debilidad de esta hipótesis al registrarla: los 3 casos surgieron en la misma sesión que la observación, lo que pesa contra tratarla como independiente de quien la señala — un dato a tener en cuenta al evaluar si reaparece en sesiones futuras, no solo si reaparece. Tres puntos de dato, ninguno promovido. **Distinción a vigilar en futuras ARs (añadida por el usuario al cerrar este ciclo, 2026-07-23), antes de dar más peso a esta hipótesis:** separar dos situaciones que hoy podrían confundirse — (a) la argumentación genera una nueva pregunta de investigación (legítimo, no cuenta en contra de la hipótesis) frente a (b) la evidencia nueva cambia efectivamente la dirección ya tomada (el caso que la hipótesis afirma). Solo (b) debería contar como un punto de dato adicional a favor. Ver `REVISION_TRANSVERSAL_7_ARS.md`.
- **"La propiedad que un hallazgo reclama puede ya existir de forma estructural en el sistema, simplemente sin reconocer ni formalizar" (añadida al cerrar AR-047, 2026-07-23):** propuesta explícitamente como pregunta a formular dentro de Fase 1 — Evidencia, antes de plantear cualquier solución, no como sustitución ni modificación del ciclo de 9 fases. Tres puntos de dato citados por el usuario: AR-024 (la exclusión mutua `goalId`/`commitmentId` ya operaba en el código, solo faltaba una ADR que la formalizara); AR-030 (el aggregate `Identity` ya existía a nivel de dominio, solo faltaba el módulo de backend); AR-047 (el enforcement estructural de D-047.1 ya existía — `packages/domain` nunca dependió de `@nestjs/cqrs` — solo faltaba reconocerlo como propiedad arquitectónica deliberada). **Todavía no promovida a regla permanente ni a paso obligatorio del ciclo** — la Metodología v1.0 quedó congelada al cerrar AR-054 precisamente para que ninguna hipótesis nueva se incorpore sin pasar por el criterio de 5 puntos de Fase 0; se registra aquí como candidata, aplicable ya en la práctica de cada Fase 1 (el propio usuario la calificó de "hipótesis que merece comprobarse", no de regla), pendiente de evaluación formal en la revisión transversal de 15 ARs.

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

## Fase 0 — Criterio de promoción de una hipótesis metodológica a regla permanente (añadido 2026-07-23, tras la revisión transversal de las 7 primeras ARs cerradas)

Deliberadamente **no forma parte del ciclo de 9 fases de una AR** — es un proceso aparte, aplicable
únicamente a hipótesis metodológicas (las de la sección "Hipótesis en observación"), no a decisiones
arquitectónicas concretas. Responde a una pregunta que el programa nunca había hecho explícita: no "¿qué
regla promovemos?", sino **"¿qué nivel de evidencia debería exigir el programa antes de promover
cualquier observación?"** El programa ha sido conservador en la práctica desde AR-001 (ninguna hipótesis
en observación se ha promovido todavía, ni siquiera H-GOV-01 con 3 repeticiones), pero ese criterio nunca
se había registrado por escrito.

Cinco criterios, ninguno suficiente por sí solo:

1. **Repetición independiente.** La observación debe aparecer en varias ARs distintas — no basta con que
   se repita varias veces dentro de la misma investigación. (H-GOV-01: 3 ARs independientes — AR-023,
   AR-043, AR-054.)
2. **Diversidad de contexto.** ¿Ocurrió siempre en el mismo tipo de problema, o apareció en dominio,
   infraestructura, gobernanza, testing, integración? Mayor diversidad de contexto implica mayor
   capacidad de generalización real, no solo repetición superficial.
3. **Poder predictivo — el criterio más importante.** No basta con que la hipótesis explique casos
   pasados; debe ayudar a tomar una mejor decisión en una AR _futura_, antes de conocer su desenlace
   (p. ej., si H-GOV-01 permite descartar una solución sobredimensionada antes de implementarla, no solo
   justificarlo después).
4. **Resistencia a contraejemplos buscados activamente.** No basta con acumular confirmaciones — hay
   que buscar deliberadamente una AR donde la hipótesis debería fallar. Si sobrevive a esa búsqueda
   activa (no solo a la ausencia de contraejemplos), su credibilidad aumenta genuinamente.
5. **Coste de equivocarse.** No todas las reglas tienen el mismo riesgo si resultan erróneas — el umbral
   de evidencia exigido debe crecer con ese coste. Promover "usar `git log` cuando la hipótesis involucra
   causalidad" es barato si resulta parcialmente equivocado; promover "nunca usar `DiscoveryService`"
   sería costoso si aparece un caso legítimo que la propia regla impediría considerar.

**Observación autorreferencial (no una hipótesis nueva, solo un registro de coherencia):** el propio
programa, al no haber promovido todavía ninguna hipótesis metodológica pese a tener candidatas con
evidencia real (H-GOV-01, cambio de propietario), ya está aplicando H-GOV-01 — no perseguir una
propiedad más fuerte de lo que la evidencia justifica — a su propio proceso de gobernanza metodológica,
no solo a decisiones técnicas. Es el mismo patrón autorreferencial que cerró la Fase 2 de AR-052
(H-052.3 sometida a su propio criterio), ahora observado un nivel más arriba: el criterio de promoción
en sí mismo se comporta según el principio que uno de sus candidatos a promover ya describe.

**Próximos hitos explícitos para retomar la revisión transversal (no antes):** 15 ARs cerradas (duplica
aproximadamente la base empírica actual) y, después, 25 ARs cerradas (donde empezarán a sobrevivir
patrones frente a una cantidad considerable de casos). Números elegidos como hitos prácticos, no por
fundamento estadístico — no se abre una nueva revisión transversal antes de alcanzar el primero.

**Disciplina de comparabilidad para la revisión de las 15 ARs (fijada 2026-07-23, antes de que exista
esa evidencia):** responder exactamente las mismas 4 preguntas que estructuraron
`REVISION_TRANSVERSAL_7_ARS.md` (cambios de propietario, decisiones simplificadas por evidencia,
balance de hipótesis refutadas/confirmadas, técnicas de investigación reutilizadas) — no añadir
preguntas nuevas salvo que alguna resulte imprescindible. La comparabilidad directa entre ambas
revisiones vale más que ampliar su alcance. **Con Metodología v1.0 ya congelada (ver más arriba), esta
revisión deja de ser una reflexión abierta y pasa a ser una evaluación acotada: ¿la evidencia acumulada
justifica declarar v1.1?**

### Separación de niveles documentales (fijada 2026-07-23, aplicable a cualquier artefacto futuro del programa)

**Nivel 1 — Evidencia histórica.** Responde "¿qué ocurrió?" — nunca prescribe. Ejemplos ya existentes:
`REVISION_TRANSVERSAL_7_ARS.md`, las tablas de métricas/historial de `REMEDIATION_DASHBOARD.md`.

**Nivel 2 — Gobernanza metodológica.** Responde "¿qué hacemos con esa evidencia?" — aquí viven Fase 0,
los criterios de promoción, los umbrales, y el estado de cada hipótesis (este mismo `README.md`).

**Regla:** ningún documento mezcla los dos niveles. La evidencia puede crecer (nuevas revisiones
transversales, nuevos datos en el Dashboard) sin obligar a reescribir las reglas de gobernanza, y las
reglas de gobernanza pueden precisarse sin alterar el registro histórico de lo ya observado.

## La regla de gobernanza que sostiene todo esto

> **Ninguna decisión arquitectónica relevante entra al código sin pasar antes por el mismo ciclo de gobernanza, evaluación y remediación que se estableció aquí.**

Esta regla es la razón por la que existió la Fase 4 de la auditoría (ADR-004 vs ADR-011 nunca pasó por este proceso, y esa es la contradicción más grave que se encontró). Mantenerla desde ahora significa que el backlog de remediación no solo disminuirá — crecerá mucho más lentamente, porque el proceso empieza a prevenir la aparición de nueva deuda arquitectónica, no solo a corregir la existente.

**En la práctica:** cualquier cambio que toque un ADR existente, introduzca una nueva dependencia significativa, o cambie un límite de bounded context, pasa primero por una AR (o una ADR nueva) — no se decide implícitamente dentro de una sesión de código.
