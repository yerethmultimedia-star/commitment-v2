# AR-043 — Cero autenticación/autorización en todo el backend y mobile

Registro completo, siguiendo el ciclo validado en AR-001, AR-028 y AR-023: `Análisis → Verificación del
framing → Modelo arquitectónico (si aplica) → Alternativas → Decisión → Diseño técnico (si aplica) →
Implementación → Validación → Dashboard`.

**Premisa explícita de entrada, fijada por el usuario antes de abrir esta AR:** _"El roadmap es una
hipótesis inicial, no evidencia."_ AR-028 y AR-023 ya corrigieron dependencias declaradas que no
sobrevivieron su propia Fase 1 (AR-023 sobre AR-048/049/050; AR-028 sobre AR-023). El usuario considera
que esto ya no es una excepción sino una propiedad estructural del programa, y pide verificarla de
nuevo aquí antes de aceptar cualquier otro supuesto sobre esta AR.

---

## Fase 1 — Evidencia

**Estado: 🟦 En progreso.** Estructurada en 5 preguntas, en el orden exacto pedido por el usuario —
primero el hallazgo, después la evidencia de código, y solo entonces la verificación de la dependencia
declarada con AR-030 (no si depende, sino por qué se dibujó esa arista y si sobrevive al escrutinio).

### 1. Hallazgo original (texto literal)

**Backend — `fase-2-plataforma/06-backend.md`, Iteración 6:**

> _"Zero authentication exists. Not 'not yet wired' in the sense of a stub interface waiting for an
> implementation — there is no auth package dependency at all (grep of package.json for
> passport/jsonwebtoken/@nestjs/jwt/bcrypt/argon2: zero hits), no AuthGuard, no strategy, no middleware
> performing any check. The one place identity enters the system, RequestContextMiddleware
> (request-context.middleware.ts:20-22), says so in its own comment: 'In a real app, identityId would
> be extracted from the JWT token via an AuthGuard. For now, we leave it undefined or try to extract
> from a dummy header if it existed.' It then reads req.headers['x-identity-id'] verbatim,
> unauthenticated."_
>
> _"Complete authorization bypass by construction is the dominant risk: any client that can reach this
> API can read or mutate any identity's data by simply setting a different x-identity-id header or
> identityId body field."_

**Mobile — `fase-2-plataforma/07-frontend.md`, Iteración 7:**

> _"Auth, confirmed by reading core/auth/auth.store.ts directly: login() does
> set({ identityId: uuidv7(), sessionStatus: 'Authenticated' }) — a locally-generated random UUID with
> no server round-trip at all (...) sessionStatus: 'Authenticated' is a label for 'a UUID exists in
> SecureStore,' not evidence of any actual authentication event."_

Prioridad original: **Alta** (backend) — la única de Fase 1/2 de la auditoría calificada Alta, no Media;
el propio texto la distingue: _"not 'designed but unproven' — it's absent by construction... the first
thing that must be addressed before this backend is exposed to anything beyond a single trusted
developer's machine."_

### 2. Evidencia actual del código — verificada, sin cambios desde la auditoría

- `apps/backend/package.json`: cero dependencias de `passport`, `jsonwebtoken`, `@nestjs/jwt`, `bcrypt`,
  `argon2`. Cero archivos `*auth*` o `*guard*` en `apps/backend/src`.
- `apps/backend/src/app.module.ts`: módulos registrados —
  `CommitmentModule, TaskModule, HabitModule, GoalModule, NotificationsModule, DevicesModule,
MessagingModule`. **Cero `AuthModule`, cero `IdentityModule`.**
- `RequestContextMiddleware` (`request-context.middleware.ts:20-22`) sigue leyendo
  `req.headers['x-identity-id']` sin verificar nada — el mismo comentario de la auditoría, textual, sigue
  en el código.
- `apps/mobile/src/core/auth/auth.store.ts`: `login()` sigue generando `uuidv7()` local, sin round-trip
  a servidor. Cero concepto de `password`/`credential` en todo el repo (`grep` exhaustivo sobre
  `apps/` y `packages/`, excluyendo `node_modules`/`dist`: cero resultados).
- **Hallazgo no reportado en la auditoría original, relevante para el framing:** el `identityId` que
  circula por controllers/DTOs del backend y por `useAuthStore` en mobile **no es el mismo artefacto**
  que el aggregate `Identity` de `packages/domain/src/identity/aggregate/identity.ts` — son dos conceptos
  que solo comparten nombre. Verificado por grep exhaustivo: **cero archivos en `apps/backend` o
  `apps/mobile` importan el aggregate `Identity`, sus value objects, o su repositorio.** El
  `identityId` real que se pasa hoy es un string opaco sin ninguna conexión de código con el módulo de
  dominio Identity.

Conclusión de esta pregunta: el hallazgo original **se confirma sin reinterpretación** — ausencia total
de auth por construcción, en ambos lados de la plataforma, hoy, en código, no en documentación.

### 3. ¿Por qué el roadmap afirma que AR-043 depende de AR-030? — reconstrucción de la lógica original, no aceptación ni rechazo directo

**Hallazgo original de AR-030 (texto literal, Iteración 3 — `fase-1-nucleo/03-bounded-contexts.md`):**

> _"Identity is a domain-complete, integration-incomplete context. It has a real aggregate, value
> objects (...), events, and a repository interface — genuine tactical DDD work exists. But there is no
> IdentityModule anywhere in app.module.ts. Every other context (...) takes identityId as an opaque,
> unvalidated string."_

**La recomendación original de la auditoría (Recomendación 2 de esa misma iteración) es explícita sobre
cuál es la secuencia que exige, y no es AR-043:**

> _"Treat Identity's missing backend module as a prerequisite for any real Coach/AI work, not an
> independent backlog item — sequence it before Iteration 13 (AI Platform) findings get acted on."_

Es decir: **la auditoría original secuencia AR-030 antes del trabajo de IA/Coach (Iteración 13), no
antes de auth (Iteración 6/7).** La sección "Risks" de la misma iteración sí menciona auth de forma
adyacente — _"No real identity enforcement is a structural blocker for anything (...) 'Learning'... this
isn't urgent while the product is single-user/demo-scale, but it is squarely in the path of any real
Coach/AI work"_ — otra vez enmarcado hacia Coach/AI, no hacia el AuthModule en sí.

**En el propio Roadmap:** la fila de AR-030 declara `Dependencias: Ninguna` y `Bloquea: AR-043, AR-050`
— la arista es simétrica (aparece en ambas filas) pero **no lleva ninguna nota explicativa**, a
diferencia de otras filas del roadmap que sí anotan el motivo de una dependencia cuando es menos obvio.
AR-030 mismo está marcado `Owner: Claude` / `Decisión: N/A` — es decir, ni siquiera se considera una
decisión estratégica, es ejecución directa de wiring.

**Separación explícita entre evidencia e inferencia, exigida por el usuario antes de aceptar esta
pregunta como cerrada:**

- **Evidencia (demostrada):** (1) la auditoría secuencia explícitamente Identity antes de Coach/AI
  (Iteración 13), no antes de Auth (Iteración 6/7); (2) en ningún punto del texto de Iteración 3 o de
  Iteración 6/7 se documenta una relación de precedencia Identity → Authentication; (3) la fila de
  AR-030 en el Roadmap no contiene ninguna justificación explícita de la dependencia hacia AR-043.
- **Inferencia (razonable, no un hecho):** la arista probablemente se introdujo por afinidad
  conceptual (ambos hallazgos comparten la palabra "identity" y la observación de fondo de que
  `identityId` es hoy un string opaco sin verificación) al planificar el roadmap.

**Conclusión de esta pregunta, redactada para no convertir la inferencia en hecho:** _No existe
evidencia documental que justifique la dependencia AR-043→AR-030. La explicación más consistente con
la evidencia disponible es que la arista surgió por afinidad conceptual, aunque el origen histórico
exacto no puede determinarse._ Esto es una reconstrucción parcial, no una conclusión cerrada — se
somete a prueba técnica en la Pregunta 4.

### 4. ¿Existe un camino técnico que obligue a completar AR-030 antes de AR-043?

Se buscó, específicamente, una imposibilidad técnica (no una referencia o mención) — es decir: ¿puede
construirse un `AuthModule`/`AuthGuard` funcional sin que exista antes un `IdentityModule` en el backend?

- Un `AuthGuard` mínimo (JWT) necesita: (a) un mecanismo de emisión de tokens tras validar credenciales,
  y (b) un mecanismo de verificación de esos tokens en cada request, extrayendo un `identityId`
  confiable para poblar `RequestContext`. **Ninguno de los dos requiere que el aggregate `Identity` de
  dominio esté integrado en un módulo NestJS.** El propio aggregate `Identity` (email, displayName,
  idioma, zona horaria) modela **datos de perfil**, no credenciales — no existe ningún campo de
  contraseña/hash/secreto en `Identity`, y la pregunta 2 ya confirmó que ninguna credencial existe hoy
  en ningún lugar del repo.
- El aggregate `Identity` sí tiene un campo `email` (`packages/domain/src/identity/aggregate/identity.ts:12`),
  lo cual **podría** en el futuro servir como identificador de login — pero esto es una opción de diseño
  para AR-043, no una dependencia obligatoria: un `AuthModule` puede introducir su propio almacén de
  credenciales (tabla de usuarios/credenciales) desacoplado del aggregate `Identity`, y decidir después,
  como parte de su propio Diseño Técnico (Fase 4A si aplica), si reutiliza o no el `email` de `Identity`
  como campo de correlación.
- Cero código, en ningún lugar del repo, importa el aggregate `Identity`, sus value objects, o su
  repositorio — confirmado en la Pregunta 2. Esto significa que hoy no existe ni siquiera un punto de
  integración parcial entre "lo que ya existe de Identity" y "lo que necesitaría existir para Auth" que
  pudiera generar una dependencia de compilación, de tipos, o de contrato.

**No se encontró ninguna imposibilidad técnica.** La dependencia, tal como está formulada, no está
respaldada por una restricción de código verificable — coincide con lo reconstruido en la Pregunta 3:
afinidad conceptual, no necesidad de ejecución.

### 5. ¿Qué ocurriría si AR-043 se ejecutara completamente sin tocar AR-030?

- El `AuthModule`/`AuthGuard` necesitaría emitir y verificar un `identityId` — hoy ese valor ya circula
  como string opaco en todos los controllers (`commitments.controller.ts`, etc.), exactamente igual que
  como lo consumiría un guard recién construido. No hace falta que ese string provenga de un
  `IdentityModule` real para que el guard lo produzca de forma confiable (vía JWT firmado) en vez de
  confiar en un header del cliente.
- El único costo real de no tener `IdentityModule` primero: si el diseño técnico de AR-043 decide que
  el registro de un usuario debe crear/consultar un aggregate `Identity` real (para reusar `email`,
  `displayName`, etc.), ese acoplamiento se resolvería en la Fase 4A (Diseño técnico) de AR-043 mismo —
  no antes, no como bloqueo previo. Es una decisión de diseño interna a AR-043, no una precondición
  externa.
- Ejecutar AR-043 primero, de hecho, **le da a AR-030 un consumidor real inmediato** (el propio
  `AuthModule`, si decide usar `email` de `Identity`) en vez de ninguno — lo cual sería una motivación
  más fuerte para construir el módulo de Identity que la que existe hoy.

### H-043.1 — Hipótesis a refutar, no a asumir

> _"La dependencia entre AR-043 y AR-030 fue introducida por afinidad conceptual y no por una
> restricción técnica verificable."_

**Resultado: H-043.1 sobrevive el escrutinio de las Preguntas 3 y 4.** No se encontró ninguna
imposibilidad técnica que exija completar AR-030 antes de AR-043; la única conexión encontrada
(`email` en el aggregate `Identity`) es una opción de diseño interna a AR-043, no una precondición.
La recomendación original de la auditoría (Recomendación 2, It.3) secuencia AR-030 antes de Iteración 13
(Coach/AI), nunca antes de auth.

**Corrección de grafo, siguiendo la cuarta regla permanente del programa (post-Fase 1 de AR-023), con
una distinción más fuerte que la de AR-023:** en AR-023, "Dependencia no verificada" fue el marcado
correcto porque las ARs dependientes (AR-025/048/049/050) todavía no habían corrido su propia Fase 1 —
la ausencia de evidencia era, en ese momento, solo ausencia de inspección. Aquí la situación es
distinta: se **buscó activamente** una imposibilidad técnica (Pregunta 4) y no se encontró ninguna,
respaldado además por un hallazgo estructural — `Identity` (aggregate) e `identityId` (el valor que
circula por la aplicación) son entidades completamente desacopladas hoy (cero imports, cero wiring,
cero módulo, cero verificación de tokens). Esto reduce fuertemente la probabilidad de una dependencia
oculta no detectada. Por tanto la dependencia no se marca "no verificada" sino **"eliminada tras
verificación de imposibilidad técnica"** — una conclusión alcanzada mediante el proceso de evidencia,
no una simplificación arbitraria del grafo. Actualizar `REMEDIATION_ROADMAP_V1.md`: la fila de AR-043
pasa a `Dependencias: AR-001 (✅)`; la fila de AR-030 pasa a `Bloquea: AR-050` (elimina la mención de
AR-043), con nota "eliminada tras verificación de imposibilidad técnica (AR-043, Fase 1, 2026-07-23)"
en ambas filas.

**Nota de honestidad metodológica:** esto no significa que la metodología "siempre" descarte
dependencias declaradas — significa que, hasta ahora, cada vez que se ha sometido una dependencia
declarada a un escrutinio real basado en evidencia, no ha sobrevivido intacta. Sigue siendo una
propiedad observada del roadmap inicial (tendía a agrupar por afinidad conceptual), no una regla general
sobre dependencias en abstracto — una dependencia futura podría, en efecto, sobrevivir este mismo
escrutinio y quedar confirmada. Ese es precisamente el cuarto patrón que el usuario espera validar con
AR-043: que el método también sea capaz de confirmar, no solo de descartar.

### Veredicto del usuario (Review Board) sobre la Fase 1

✅ Fase 1 aprobada — calificada por el usuario como "la Fase 1 más limpia de las cuatro ejecutadas hasta
ahora." ✅ H-043.1 aceptada, con la separación evidencia/inferencia de la Pregunta 3 incorporada
literalmente al texto anterior. ✅ Dependencia AR-043→AR-030 eliminada del grafo, con respaldo
metodológico explícito (no una simplificación arbitraria). ✅ Procede a Fase 2.

**Hallazgo que el usuario eleva a framing de Fase 2 — el más importante de toda la Fase 1, más que la
propia dependencia descartada:**

> _El sistema ya distingue implícitamente entre identidad autenticada e identidad de dominio, aunque hoy
> ambas compartan un nombre que induce a confusión._

Esto reformula qué es AR-043: no es "integrar `Identity`" (el aggregate de dominio), es "introducir una
verdadera identidad autenticada" — un concepto distinto, que hoy no existe en ningún lugar del código
bajo ningún nombre. AR-030 (el aggregate de perfil) queda tratando de otra cosa.

---

## Fase 2 — Verificación del framing

**Estado: 🟦 En progreso.**

### H-043.2 — Hipótesis de framing, a refutar, no a asumir

> _El problema real no es la ausencia del aggregate `Identity`; es la ausencia de un bounded context de
> autenticación claramente separado del dominio de negocio._

**Pregunta que estructura esta fase, formulada por el usuario:** ¿la autenticación pertenece realmente
al mismo bounded context que `Identity`, o el proyecto lleva meses tratando dos conceptos distintos como
si fueran uno solo únicamente porque ambos contienen la palabra "identity"?

Si esta hipótesis sobrevive, AR-043 deja de ser "añadir autenticación" (una tarea de implementación) y
pasa a ser "introducir un bounded context de autenticación correctamente separado del dominio" — una
diferencia arquitectónica considerable, del mismo orden que la reformulación que sufrió AR-028
(H-028.1 → H-028.2 → framing final).

### Evidencia recogida a favor de H-043.2

**1. Los ciclos de vida (eventos) de `Identity` y de "autenticación" son disjuntos.**
`packages/domain/src/identity/events/`: exactamente 2 eventos — `identity-created.event.ts`,
`identity-updated.event.ts` (payload: `email`, `displayName`, `preferredLanguage`, `preferredTimeZone`).
Ningún evento de login, logout, emisión/verificación de credencial, expiración de sesión, o reseteo de
contraseña. Un bounded context de autenticación necesitaría, como mínimo, eventos de esa segunda familia
— completamente ausente hoy, en cualquier forma, en cualquier lugar del repo. Por la propia definición
de Eric Evans (un bounded context se delimita por sus propios invariantes y su propio ciclo de vida), dos
conjuntos de eventos disjuntos son el indicador más fuerte de que se trata de dos contextos distintos,
no de una única extensión del mismo.

**2. La intención arquitectónica original (histórica, no vinculante) ya separaba ambas capas.**
ADR-004 (`adr_001_to_010.md`, reclasificada como no vinculante por AR-001, pero válida como evidencia
histórica de intención): _"Para el MVP necesitamos (...) autenticación integrada (...). Decisión:
utilizar Supabase (...). Proporciona (...) gestión de usuarios segura."_ — la autenticación se planeó
desde el origen como una capacidad de **infraestructura/Backend-as-a-Service** (Supabase Auth), no como
parte del modelo de dominio donde vive `Identity` (`packages/domain`). El propio `AR-001/ANALISIS.md`
registra esto en su tabla de evaluación técnica: _"Cero auth (Iteración 6) — NestJS tiene
Guards/Passport de primera clase; simplemente nunca se usaron."_ — auth se sigue conceptualizando como
infraestructura de framework (Guards/estrategias), no como un aggregate de dominio.

**3. Ya existe en este mismo repo un precedente local exacto de la forma que necesitaría Auth si se
mantiene separado.** La propia auditoría (Iteración 3, sección Strengths) calificó a
Notifications/Reminder como _"a textbook-clean generalized context"_: `Reminder` toma `sourceId: string`

- `sourceType` opacos, sin ninguna referencia a los tipos internos de Commitment/Task/Habit — _"a real
  Customer/Supplier relationship done correctly."_ Los 7 aggregates reales ya tratan `identityId` de la
  misma forma hoy — _"every other context takes identityId as an opaque, unvalidated string"_ (Iteración
  3, ya citado en la Pregunta 3 de Fase 1). Es decir: el patrón "el consumidor solo ve un id opaco, nunca
  el aggregate interno del proveedor" ya es una convención establecida y elogiada en este código — Auth
  encajaría en ella de forma natural si se trata como contexto separado.

**4. La palabra "identity" está sobrecargada con una tercera acepción, no solo dos.**
`docs/00-framework/THE_COMMITMENT_FRAMEWORK.md:304/319` describe un **"Identity Anchor"** — un concepto
de producto/comportamiento (el "por qué" motivacional de un Commitment, per la teoría de hábitos),
explícitamente no implementado hoy en el dominio (_"nothing in the shipped domain has it today in any
form"_). Esto es una tercera acepción de "identity" en el proyecto, distinta tanto del aggregate de
dominio como de la autenticación — refuerza que el nombre compartido, por sí solo, no es evidencia de
que los conceptos deban vivir en el mismo módulo.

### Contra-argumento que debe someterse a la misma prueba adversarial que Opción C en AR-023

Antes de aceptar H-043.2 como framing final, hay que preguntar lo contrario con la misma exigencia: **¿existe una razón real para fusionar credenciales y perfil en un único aggregate `Identity` ampliado, en vez de introducir un bounded context nuevo?**

- Es el patrón más simple y común en aplicaciones pequeñas/monolíticas de un solo desarrollador (un
  `User`/`Identity` con email+hash de contraseña en la misma tabla/aggregate) — evita construir un
  módulo, un repositorio, y un límite de contexto nuevos para un proyecto de este tamaño.
- `Identity` ya tiene un repositorio de dominio definido (`identity.repository.ts`) sin ningún
  consumidor real todavía — extenderlo con credenciales reutilizaría infraestructura ya diseñada
  (aunque no integrada) en vez de construir una nueva desde cero.
- El plan original (Supabase Auth como BaaS externo) ya no aplica — AR-001 cerró con NestJS a medida
  como plataforma oficial, así que el razonamiento original de ADR-004 (evidencia del punto 2) describe
  una arquitectura que el proyecto ya abandonó; no puede usarse como argumento de autoridad para la
  decisión de hoy, solo como dato histórico de intención.

**Este contra-argumento no refuta H-043.2** — el punto 1 (ciclos de vida disjuntos) y el punto 3
(precedente local ya validado por la propia auditoría) no dependen de si Supabase sigue vigente o no, y
siguen siendo válidos incluso si la implementación termina siendo un único módulo NestJS. Pero sí
significa que "bounded context separado" no implica necesariamente "servicio/infraestructura distinta"
— puede materializarse como una separación **dentro** del mismo backend (un `AuthModule` propio, con su
propio aggregate/tabla de credenciales, que emite/verifica `identityId` sin ser el aggregate `Identity`
mismo) en vez de una fusión. Esta distinción — separación de responsabilidades vs. separación de
despliegue — se resuelve en Fase 2A (Modelo Arquitectónico)/Alternativas, no aquí.

**Estado de H-043.2 al cierre de esta ronda de evidencia: sobrevive el contra-argumento, no refutada.**
Pendiente de someterse a las Alternativas formales (Fase 2B) antes de aceptarse como decisión.

### Veredicto del usuario (Review Board) sobre la Fase 2

✅ Fase 2 cerrada — sin vacío de evidencia que justifique prolongarla. H-043.2 aceptada como
suficientemente respaldada, **no por un único indicio concluyente sino por cuatro líneas de evidencia
independientes que convergen**: (1) ciclos de vida disjuntos — el argumento más fuerte, un aggregate
sin eventos de autenticación no está modelando autenticación; (2) ADR-004 no demuestra que Supabase sea
la decisión correcta hoy, demuestra que el proyecto ya concebía auth como infraestructura, no como
dominio, independientemente de la tecnología; (3) Notifications/Reminder reformulado como
**"precedente interno consistente,"** no como demostración — ya existe en este código un patrón
validado de módulo que usa ids opacos sin conocer el aggregate propietario; (4) el "Identity Anchor"
del Framework confirma que "identity" nombra al menos tres conceptos distintos en este proyecto —
un problema de lenguaje ubicuo, no solo técnico. El contra-argumento (fusionar credenciales en
`Identity`) se confirma correcto como ejercicio, y no destruye H-043.2 — solo descarta una
interpretación excesiva de ella: H-043.2 implica **responsabilidad separada**, no necesariamente
microservicio, backend, o base de datos distintos. Procede a Fase 2B.

---

## Fase 2B — Alternativas

**Estado: 🟦 En progreso.**

### Opciones sobre la mesa

- **A.** Auth como bounded context separado, dentro del mismo backend NestJS (módulo propio, aggregate
  de dominio deliberadamente pequeño para credenciales/sesiones, `identityId` opaco como en Device).
- **B.** Fusionar Auth e Identity en un único aggregate de dominio ampliado.
- **C.** Mantener el modelo actual e introducir autenticación como una capa puramente técnica
  (Guards/estrategia JWT de NestJS), sin ninguna representación explícita en el dominio.

### H-043.3 — hipótesis adicional, a refutar

> _El proyecto no necesita un aggregate `Authentication` grande; necesita un bounded context de
> autenticación cuyo dominio sea deliberadamente pequeño — credenciales, sesiones, emisión/verificación
> de tokens — no perfiles de usuario._

### Comparación contra 5 criterios (los mismos que el programa ya usa: consistencia con el dominio

existente, complejidad/esfuerzo, riesgo, preservación de opciones arquitectónicas, precedente/consistencia
con convenciones ya validadas en este repo)

**1. Consistencia con el dominio existente**

- A: alta — separa exactamente por los ciclos de vida disjuntos que la Fase 2 encontró.
- B: baja — mezclaría, en un solo aggregate, dos ciclos de vida que la propia evidencia mostró disjuntos.
- C: media — evita mezclar ciclos de vida, pero también evita modelar como invariantes de dominio
  reglas que sí lo son (expiración de token, bloqueo tras intentos fallidos, revocación) — las deja como
  lógica ad-hoc de infraestructura/middleware, sin invariante centralizada y testeable.

**2. Complejidad/esfuerzo**

- A: medio — un módulo nuevo, un aggregate pequeño (precedente directo: `Device`, 93 líneas, 2 eventos).
- B: bajo a corto plazo (reutiliza el repositorio de `Identity` ya existente, sin consumidores) pero con
  deuda futura alta si los dos conceptos deben divergir.
- C: bajo a corto plazo — usa Guards/Passport "de fábrica," exactamente lo que AR-001 ya señaló como
  disponible y sin usar.

**3. Riesgo** (el roadmap marca esta AR como Riesgo Alto)

- A: mitiga mejor el riesgo — las reglas de seguridad quedan encapsuladas en un dominio pequeño,
  testeable con unit tests de dominio (igual que los 7 aggregates reales ya lo son).
- B: riesgo adicional — cambios en el perfil (`Identity`) comparten blast radius con las credenciales de
  seguridad, en un aggregate más grande y más difícil de razonar.
- C: mayor riesgo — reglas de seguridad sensibles (revocación, expiración, bloqueo) quedan dispersas
  como lógica de infraestructura sin invariante centralizada verificable por tests de dominio.

**4. Preservación de opciones arquitectónicas**

- A: mantiene abierta la evolución de Auth (más métodos de login, proveedores externos, MFA si algún
  día se requiere) sin tocar `Identity`.
- B: cierra esa opción de forma cara — separar después exigiría migrar datos de un aggregate ya
  fusionado.
- C: no compromete el dominio estructuralmente, pero pospone indefinidamente la decisión de modelar
  invariantes de seguridad reales — no es preservar una opción, es diferir el hallazgo #1 de Fase 2.

**5. Precedente/consistencia con convenciones ya validadas en este repo**

- A: coincide exactamente con el patrón `Device` (aggregate real, pequeño, 2 eventos —
  `registered`/`updated` —, toma `identityId` como string opaco, cero import del aggregate `Identity`)
  — prueba, no hipótesis, de que este patrón ya funciona en este código hoy mismo.
- B: sin precedente en el repo — sería la primera vez que un aggregate mezcla dos ciclos de vida
  claramente disjuntos.
- C: sin precedente de "capacidad con invariantes de seguridad reales, sin ningún modelo de dominio" —
  los módulos puramente técnicos que sí existen hoy (`ObservabilityModule`, `HealthModule`) no protegen
  ningún invariante de negocio por-identidad; son wiring sin estado, no comparables.

### Verificación adicional de H-043.3: ¿hay algo en los requisitos documentados que exija un dominio de

auth más grande que "credenciales + sesión"?

Búsqueda exhaustiva en `docs/00-framework/`, `docs/01-product/`, `docs/03-architecture/` de
OAuth/social login/MFA/SSO: **cero menciones en todo el repo.** Nada documentado exige hoy un dominio de
autenticación más rico que login por email/contraseña + sesión. Esto es evidencia a favor, no en contra,
de H-043.3 — no hay ningún requisito conocido que obligue a un aggregate `Authentication` grande.

### Ranking

**A ≈ mejor opción en las 5 dimensiones. B pierde en las 5. C pierde en 3 de 5 (1, 3, 4) y solo iguala
en esfuerzo inmediato (2), a costa de posponer el hallazgo central de Fase 2.**

**H-043.3: sobrevive.** No solo se sostiene el framing "bounded context separado" (H-043.2) — la
evidencia adicional (precedente `Device`, ausencia de requisitos de auth más ricos documentados en
ningún lugar del repo) respalda específicamente que ese bounded context debe mantenerse deliberadamente
pequeño (credenciales + sesión + tokens), no expandirse hacia un aggregate `Authentication` que replique
la riqueza de `Identity`.

### Veredicto del usuario (Review Board) sobre la Fase 2B

✅ Fase 2B aprobada — sin inconsistencia metodológica. La evidencia ya no cambia el espacio de
alternativas, solo modula la confianza en ellas (mismo punto de madurez que AR-028 antes de decidir).

- **Opción A** gana no por preferencia sino por **convergencia de cuatro tipos de evidencia
  independientes**: modelo de dominio (ciclos de vida disjuntos), precedente interno (`Device`), ADR
  vigente (ADR-004, intención histórica), y ausencia de requisitos que justifiquen un dominio más rico.
- **Opción B** no solo mezcla responsabilidades — **introduce una relación que el dominio actual lleva
  meses evitando de forma consistente** (todo aggregate ya trata `identityId` como opaco). Esto eleva su
  carga de prueba: ya no basta con "podría simplificar," tendría que demostrar por qué el dominio
  existente está equivocado — y hoy no hay evidencia de eso.
- **Opción C** pierde no por seguridad sino por **modelabilidad**: si existen invariantes propias
  (expiración, revocación, bloqueo, emisión), existe comportamiento de dominio — y si existe
  comportamiento de dominio, merece representación explícita, por pequeña que sea.
- **`Device` como hallazgo, elevado a la altura de OCC en AR-028:** deja de ser una discusión teórica —
  _"la arquitectura ya contiene un bounded context pequeño que referencia `identityId` como
  identificador opaco y funciona correctamente. No se está inventando un patrón, se está replicando."_

✅ H-043.3 aceptada. ✅ Opción A claramente dominante. Procede a Fase 3, formulando la decisión en
términos de bounded context y responsabilidad — no de tecnología (eso es Fase 4).

---

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada.**

### D-043.1

> **La autenticación constituye un bounded context independiente del aggregate `Identity`, con un
> dominio deliberadamente pequeño orientado exclusivamente a credenciales, sesiones y
> emisión/verificación de tokens.**

Deliberadamente formulada sin mencionar NestJS, Passport, JWT, Guards, ni ningún mecanismo concreto —
eso pertenece a Fase 4 (Diseño técnico), no a esta decisión. La decisión es arquitectónica: dónde vive
la responsabilidad y qué tan grande es su dominio, no cómo se implementa.

**Preguntas explícitamente diferidas a Fase 4A (Diseño técnico), no a resolver aquí:** mecanismo de
token (JWT u otro), Passport vs. implementación propia, diseño de Guards, refresh tokens, persistencia
de sesiones, revocación, integración con `Device` (que ya modela `identityId` como opaco y tendrá que
relacionarse con el nuevo módulo de Auth). Todas son decisiones técnicas derivadas de D-043.1, no parte
de ella.

### Observación metodológica del usuario (hipótesis de observación, explícitamente NO una regla

permanente todavía)

> _Muchos hallazgos de la auditoría inicial pueden estar describiendo problemas donde el verdadero
> defecto no es la ausencia de un componente, sino la mezcla de responsabilidades que deberían
> pertenecer a límites arquitectónicos distintos._

Patrón observado hasta ahora en las tres ARs con reformulación de framing: AR-001 separó gobernanza de
implementación; AR-023 separó decisión técnica de política; AR-043 separa autenticación de identidad de
dominio. El usuario pide mantenerla como hipótesis a vigilar en futuras ARs, no registrarla todavía como
herramienta permanente del programa — necesita más de tres puntos de datos antes de generalizarse.

---

## Fase 4A — Diseño técnico

**Estado: 🟦 En progreso.** Modo de trabajo distinto a Fases 1-3: ya no se busca refutar el framing, se
busca el diseño de menor complejidad que satisfaga D-043.1 sin introducir capacidades que el producto
todavía no necesita.

### Pregunta de apertura

> **¿Cuál es el conjunto mínimo de responsabilidades necesarias para que el bounded context
> Authentication satisfaga D-043.1?**

### Propuesta inicial del usuario (a someter a refutación)

Tres responsabilidades de dominio: **1. Credenciales** (validar la identidad frente a un secreto — no
perfil, no preferencias, no permisos de negocio); **2. Sesión** (creación, expiración, revocación de un
acceso vigente — no el mecanismo técnico); **3. Emisión y verificación de tokens** (transformar una
sesión válida en un token verificable y viceversa — el token es transporte, no dominio). Exclusiones
explícitas, respaldadas por la ausencia documentada de requisitos ya verificada en Fase 2B: User
Profile, Identity Aggregate, Device, OAuth, Social Login, MFA, Roles, Permissions, Organizations,
Tenants, Recovery workflows, Preferences.

### Búsqueda de una 4ª responsabilidad esencial — evidencia, no solo razonamiento abstracto

**Verificación adicional de ausencia de requisitos** (complementa la de Fase 2B, que ya cubrió
OAuth/social login/MFA/SSO): grep exhaustivo en `docs/00-framework/`, `docs/01-product/`,
`docs/03-architecture/` sobre reseteo de contraseña / recuperación de cuenta / verificación de email —
**cero menciones en todo el repo.** Refuerza que "Recovery workflows" y "verificación de email" no son
responsabilidades a añadir — y si algún día lo fueran, encajan como estados/operaciones dentro de
**Credenciales** (un `Credential` con estado `pendiente-de-verificar` o un flujo de reseteo es una
operación más sobre el mismo aggregate, no un cuarto concepto).

**`apps/mobile/src/app/(auth)/login.tsx`** — leído en detalle: hoy es un único botón "Continuar" que
llama a `login()` (genera un UUID local). Cero campos de email/contraseña, cero pantalla de registro en
todo `apps/mobile/src/app`. Esto confirma que no hay ningún compromiso de UI ya construido que imponga
una forma concreta al flujo de autenticación — el diseño tiene libertad real, no solo teórica.

**Se examinaron explícitamente tres candidatos a 4ª responsabilidad, y los tres se descartan con
evidencia, no por intuición:**

1. **¿"Registro" (crear una credencial nueva) es una responsabilidad separada de "Credenciales"?**
   No — es una operación sobre el mismo concepto, exactamente como `Identity.register()` e
   `Identity.update()` conviven en el mismo aggregate (`packages/domain/src/identity/aggregate/identity.ts`).
   La redacción original de "Credenciales" enfatizaba solo "validar" (verificar) — se corrige aquí para
   incluir explícitamente la emisión/creación de la credencial como parte de la misma responsabilidad,
   no como una responsabilidad nueva.

2. **¿"Autorización" (mencionada literalmente en el hallazgo original de Iteración 6 — "Cero
   autenticación/**autorización**") es una responsabilidad que falta en el modelo de tres piezas?**
   No, con evidencia: el propio texto del hallazgo original describe el riesgo como _"any client (...)
   can read or mutate any identity's data by simply setting a different x-identity-id header"_ — es
   decir, el problema de "autorización" en este proyecto se reduce enteramente a **la falta de un
   `identityId` confiable**, no a un sistema de roles/permisos (que Fase 2B ya descartó por ausencia de
   requisitos). Cada módulo de dominio ya filtra sus consultas por `identityId` (comprobado en Fase 1 —
   los 7 aggregates ya tratan `identityId` como el criterio de pertenencia). Una vez que **Sesión/Token**
   entrega un `identityId` verificado en vez de un header sin verificar, la "autorización" del hallazgo
   original queda resuelta sin necesidad de una cuarta responsabilidad — la palabra "autorización" en el
   título de AR-043 no apunta a un concepto de dominio nuevo, apunta a una consecuencia de tener
   Sesión/Token funcionando.

3. **¿"Aprovisionamiento de `Identity`" (crear el perfil de dominio cuando se registra una credencial
   nueva) es una responsabilidad de Auth?**
   No, y verificado técnicamente: `IdentityId` es un value object que envuelve un UUID
   (`packages/domain/src/identity/value-objects/identity-id.ts`) — generarlo no requiere que el aggregate
   `Identity` exista ni esté integrado, exactamente como `Device.register()` ya recibe `identityId` como
   string opaco sin importar `Identity` (patrón confirmado en Fase 2B). Auth puede emitir su propio
   `identityId` al crear una credencial sin ninguna dependencia del módulo `Identity` (que además sigue
   sin backend — AR-030, todavía pendiente). Si en el futuro se decide aprovisionar un perfil `Identity`
   automáticamente al registrarse, eso es una **integración** (Paso 5: un handler/saga reaccionando a un
   evento de Auth, el mismo patrón Customer/Supplier que ya usa Reminder/Notifications) — no una
   responsabilidad del dominio de Auth mismo.

### Veredicto de esta ronda

**No se encontró ninguna cuarta responsabilidad esencial.** Los tres candidatos examinados (registro,
autorización, aprovisionamiento de Identity) se resuelven dentro de las tres responsabilidades
propuestas o como integración de Fase 5, no como una pieza de dominio adicional. Único ajuste de
redacción: **Credenciales** incluye explícitamente emisión (creación) además de verificación — el mismo
aggregate, ambas operaciones, sin ampliar el alcance conceptual.

**El modelo de tres responsabilidades (Credenciales, Sesión, Emisión/Verificación de Tokens) sobrevive
la prueba de la cuarta responsabilidad.** Pendiente: pasar al Paso 1 (Modelo de dominio — entidades,
value objects, invariantes) sobre esta base ya acotada.

**Nota registrada, a petición del usuario, porque cambia la lectura del hallazgo original:** la palabra
"autorización" en el título de AR-043 ("Cero autenticación/autorización...") **no describe un cuarto
dominio** — describe una consecuencia de la ausencia de autenticación. Una vez que Sesión/Token entrega
un `identityId` verificado, la comprobación de pertenencia que cada uno de los 7 aggregates ya hace
(filtrar por `identityId`) resuelve el riesgo de "autorización" descrito en Iteración 6, sin necesitar
ningún concepto de dominio adicional (roles/permisos, ya descartados por ausencia de requisitos en Fase
2B).

### Refinamiento terminológico (antes de modelar): Token no es un objeto de dominio

D-043.1 habla de "emisión/verificación de tokens" como **capacidad**, no como objeto. JWT/PASETO/cookies
firmadas son mecanismos de transporte intercambiables — si el dominio modelara "Token" como entidad, un
cambio de mecanismo obligaría a tocar el dominio. Se adopta la reformulación: **Credential** y
**Session** son los dos aggregates de dominio; **TokenService** es un **servicio de dominio** sin
estado propio, que traduce una Sesión válida a un artefacto verificable y viceversa, sin conocer JWT,
HTTP, ni ningún detalle técnico — solo contratos. Esto mantiene el dominio independiente del formato de
transporte, coherente con D-043.1.

### Paso 1 — Modelo de dominio

### H-043.4 — hipótesis adversarial final antes de aceptar el modelo, a refutar

> **`Credential` y `Session` pertenecen realmente al mismo ciclo de vida y deberían formar un único
> aggregate `Authentication`.**

**Evidencia contra H-043.4 — cuatro líneas, no solo la intuición de "una credencial dura años, una
sesión dura minutos":**

1. **Cardinalidad 1:N con crecimiento no acotado.** Una `Credential` puede tener múltiples `Session`
   concurrentes (multi-dispositivo — el propio proyecto ya modela `Device` como concepto independiente
   por identidad, confirmando que el multi-dispositivo es un caso real, no hipotético). Modelar `Session`
   como colección embebida dentro de `Credential` es exactamente el anti-patrón que Vernon (_Effective
   Aggregate Design_) documenta como el error más común de diseño de aggregates: una colección
   1:N sin límite natural no debe vivir dentro del aggregate padre.

2. **Consecuencia de concurrencia, directamente ligada al trabajo ya hecho en AR-028 (OCC).** Si
   `Session` viviera dentro de `Credential`, cada login desde cualquier dispositivo tendría que escribir
   sobre el mismo aggregate `Credential` bajo el control de concurrencia optimista que AR-028 implementó
   para los 7 aggregates reales — dos dispositivos iniciando sesión de forma simultánea competirían por
   la misma versión de un aggregate que no debería tener relación causal entre ambos intentos. Esto es
   exactamente la clase de contención que el diseño de aggregates pequeños busca evitar.

3. **Precedente ya establecido en este mismo código, verificado ahora, no asumido.** `Task` referencia
   `commitmentId`/`goalId` como ids opacos (`packages/domain/src/task/aggregate/Task.ts:53-54`) — ni
   `Commitment` ni `Goal` embeben una colección de sus hijos (`grep` confirmó cero
   `Task[]`/`commitments:` en esos aggregates). La convención ya establecida en todo el dominio de
   Commitment es: **hijo con ciclo de vida/cardinalidad propia → aggregate separado, referenciado por
   id**, nunca embebido. `Session` (referenciando `credentialId`/`identityId`) encaja exactamente en
   esta convención ya validada por el propio proyecto.

4. **El único argumento real a favor de fusionar — el invariante "una credencial bloqueada no debe
   tener sesiones válidas" — no requiere que sean el mismo aggregate.** Este proyecto ya tiene un
   patrón establecido para exactamente este tipo de consistencia entre aggregates:
   `apps/backend/src/commitment/application/sagas/recurring-commitment.saga.ts` — un Saga reaccionando a
   un evento para propagar una consecuencia a otro aggregate, sin fusionarlos. El mismo patrón resuelve
   esto: `CredentialBlocked` dispara un handler que revoca las `Session` activas de esa `Credential` —
   consistencia eventual (unos milisegundos), aceptable y ya precedentada en este código, no una excusa
   para evitar el análisis.

**H-043.4 refutada — no sobrevive.** `Credential` y `Session` quedan confirmados como dos aggregates
separados.

### Modelo de dominio resultante

**Aggregate — `Credential`**

- Responsabilidad: demostrar que una identidad conoce un secreto válido. Incluye emisión (registro) y
  verificación — misma responsabilidad, dos operaciones (paralelo directo a `Identity.register()` +
  `Identity.update()` en el mismo aggregate).
- Estado: `CredentialId`, `IdentityId` (opaco — sin import del aggregate `Identity`, mismo patrón que
  `Device`), `CredentialHash`, `Estado` (activa/bloqueada), metadata de fechas.
- Invariantes: una credencial pertenece a exactamente una identidad; una credencial bloqueada no
  autentica; el secreto nunca existe en texto plano dentro del dominio.
- Eventos: `CredentialRegistered`, `CredentialUpdated`, `CredentialBlocked`.

**Aggregate — `Session`**

- Responsabilidad: representar que una identidad autenticada posee acceso vigente.
- Estado: `SessionId`, `IdentityId` (opaco), `Expiration`, `Revoked`.
- Invariantes: una sesión revocada nunca vuelve a validarse; una sesión expirada nunca se reactiva; toda
  sesión pertenece a una identidad.
- Eventos: `SessionCreated`, `SessionRevoked`, `SessionExpired`.
- Relación con `Credential`: por id, nunca embebida — consistente con `CredentialBlocked` propagando
  revocación vía handler/saga, no vía transacción compartida.

**Servicio de dominio — `TokenService`**

- Responsabilidad: emitir un token verificable para una `Session` válida; verificar un token recibido;
  extraer `SessionId`/`IdentityId` de un token válido.
- Sin estado propio. Sin conocimiento de JWT/HTTP — solo contratos, para no atar el dominio a un
  mecanismo de transporte concreto.

**Explícitamente no modelado:** ningún aggregate `Authentication` que fusione Credential/Session —
descartado por evidencia, no por preferencia.

### Verificación adicional antes de cerrar Paso 1: ¿`Credential` debe conocer `Device`?

Pregunta planteada por el usuario como comprobación, no como objeción. Verificado con evidencia, no
solo por intuición: `Device` (`packages/domain/src/devices/aggregate/device.ts`) solo tiene
`identityId`, `platform`, `pushToken`, `appVersion`, `lastSeenAt` — cero campo de sesión/credencial.
Grep exhaustivo en `docs/00-framework/`, `docs/01-product/`, `docs/03-architecture/`, y
`packages/domain/src/devices`: **cero menciones de vincular sesión/credencial a dispositivo.** No hay
ningún requisito, documentado o en código, que obligue a `Credential` a conocer `Device`. Confirmado:
`Credential` no debe tener ninguna referencia a `Device` — pertenece a otro bounded context
(Notifications/Devices) sin relación con demostrar posesión de un secreto. `Session` sí podría llevar
opcionalmente un `deviceId` opaco (mismo patrón de referencia por id que todo lo demás) si en Paso 2/3
se decide que hace falta para UX ("cerrar sesión en este dispositivo") — pero eso no es una necesidad de
Paso 1, es una opción de diseño a decidir con evidencia de requisito real cuando/si aparezca, no antes.

### Veredicto del usuario (Review Board) sobre el Paso 1 — con tres refinamientos incorporados

✅ Paso 1 cerrado. El usuario reordena la fuerza relativa de la evidencia: el argumento decisivo no es la
cardinalidad 1:N (aunque correcto per Vernon), es el **punto 2 — la consecuencia de concurrencia
directamente heredada de AR-028**: fusionar Credential/Session haría que logins concurrentes desde
distintos dispositivos compitieran por la versión del mismo aggregate bajo el mismo control de
concurrencia optimista que AR-028 ya construyó para los 7 aggregates reales. El punto 3 (precedente
interno Commitment/Task/Goal) se destaca como uno de los mejores argumentos de toda la AR precisamente
porque no apela a autoridad externa (Vernon) sino a coherencia interna ya demostrada en este código. El
punto 4 (Saga) se generaliza: cada vez que aparece la objeción "¿y la consistencia entre aggregates?",
la respuesta ya no es una herramienta nueva, es un patrón que el proyecto ya usa correctamente.

**Dos ajustes de modelo incorporados:**

- `Credential.Estado` deja de ser un booleano `Blocked` y pasa a ser **`CredentialStatus`**
  (`Active | Blocked`, extensible sin romper el modelo a `Pending`/`ResetRequired`/etc. si algún día
  hace falta — no implementados hoy, solo el enum deja espacio).
- `Session.Revoked` deja de ser un booleano y pasa a ser **`SessionStatus`**
  (`Active | Revoked | Expired`) — "expirada" y "revocada" son invariantes distintos (una expira por
  tiempo, la otra por acción explícita) y un solo booleano los confundía.

**Confirmado con evidencia (no solo intuición):** `Credential` no conoce `Device` — cero requisito,
cero precedente de código que lo exija. `Session` puede llevar opcionalmente un `deviceId` opaco más
adelante, pero no es una necesidad de este paso.

**Estado alcanzado, confirmado por el usuario:** Bounded Context Authentication ✅; Aggregate
`Credential` ✅; Aggregate `Session` ✅; Domain Service `TokenService` ✅; `IdentityId` como referencia
opaca ✅; consistencia eventual vía Saga ✅; separación respaldada por DDD + precedente interno + AR-028
✅. Paso 1 cerrado.

### Paso 2 — Casos de uso

**Estado: 🟦 En progreso.** Principio explícito del usuario para esta fase: _"modelar únicamente los
casos de uso que D-043.1 exige hoy, y rechazar cualquier operación cuya única justificación sea una
posible evolución futura del producto"_ — auth es un área donde sobrediseñar antes de tener requisitos
reales es particularmente fácil.

**Propuesta, aplicando esa disciplina a cada candidato de la lista original (login/refresh/logout/validate):**

- **Login** — necesario, sin duda: verificar `Credential`, crear `Session`, emitir token vía
  `TokenService`.
- **Logout** — necesario: revocar `Session` (`SessionStatus → Revoked`). Ya existe como concepto en la
  UI hoy (`useAuthStore.logout()` en mobile), aunque hoy no revoque nada real.
- **Validate** — necesario: dado un token, resolver `identityId` verificado. Es el caso de uso que
  resuelve directamente el hallazgo original (sustituye la lectura sin verificar de `x-identity-id`).
  Distinto en naturaleza a los otros tres: no lo invoca una acción deliberada del usuario, lo invoca la
  infraestructura (un Guard) en cada request — vale la pena registrar esa diferencia aunque siga
  contando como caso de uso del bounded context.
- **Refresh — cuestionado, no aceptado por defecto.** Aplicando el mismo principio que ya rechazó
  OAuth/MFA/roles en Fase 2B: ¿hay algún requisito documentado que exija un esquema de rotación de
  tokens de corta duración? Búsqueda: `apps/mobile/src/core/auth/auth.store.ts` usa
  `persist(createJSONStorage(...))` — la sesión ya se diseñó, en la implementación actual (aunque sea el
  placeholder de hoy), para sobrevivir reinicios de la app de forma persistente, no como una ventana
  corta que necesite renovación activa. Cero mención documentada de requisitos de expiración corta o de
  rotación de tokens en `docs/00-framework/`, `docs/01-product/`, `docs/03-architecture/`. **No hay
  evidencia que justifique "refresh" como caso de uso hoy** — puede resolverse con una `Session` de
  vigencia suficientemente larga, revalidada en cada `Validate`, sin necesitar una operación explícita de
  renovación. Se deja fuera del alcance de Paso 2, no rechazado permanentemente: si en el futuro se
  decide acortar la vigencia de las sesiones por razones de seguridad, "refresh" se añadiría entonces,
  con su propio requisito real respaldándolo.

**Conjunto propuesto de casos de uso: Login, Logout, Validate.** Sin Refresh, salvo que el usuario
tenga evidencia adicional no contemplada aquí.

### Veredicto del usuario sobre Refresh, y una propuesta de MVP aún más pequeña

✅ Exclusión de Refresh confirmada — y con un argumento más fuerte que la evidencia circunstancial del
`useAuthStore`: aplicando sistemáticamente la pregunta _"¿qué requisito actual queda incumplido si X no
existe?"_, Refresh no tiene respuesta (es una optimización de un modelo de expiración que todavía no se
ha decidido, no un caso de uso fundamental) — mientras que Login/Logout/Validate sí la tienen.
Reformulación aceptada: **Validate → "Validate Session"** (no estamos validando un token, estamos
respondiendo si una sesión sigue representando válidamente a una identidad; el token es el mecanismo,
la pregunta pertenece a `Session`).

El usuario propuso ir un paso más allá, dado que la UI hoy no tiene ningún campo de
email/contraseña/registro (ya confirmado en Fase 4A): un MVP todavía más pequeño — **Login, Validate
Session, Logout**, sin exponer **Register** como caso de uso público todavía.

### H-043.5 (implícita en la propuesta del usuario) — sometida a la misma prueba, no aceptada sin refutarla primero

Aplicando la pregunta del propio usuario a Register: _¿qué requisito actual queda incumplido si Register
no existe, ni siquiera como caso de uso interno/no público?_

**Respuesta: el propio Login.** Sin ningún mecanismo — público o no — que cree una `Credential`, no
existe ninguna credencial contra la que `Login` pueda verificar nada. A diferencia de Refresh (que
puede omitirse sin que nada más falle), omitir Register por completo deja **Login estructuralmente
inalcanzable** — no es una optimización que falta, es una dependencia dura del caso de uso que sí se
ha aceptado como indispensable. Verificación adicional: no existe en el repo ningún mecanismo de
"seed"/bootstrap de credenciales (`apps/mobile/src/core/demo/*` es un _switch_ de origen de datos
local-vs-backend, sin ninguna relación con crear credenciales) que pudiera sustituir a Register como
vía alternativa de creación.

**Matiz que sí sobrevive de la propuesta del usuario, y que la refina en vez de descartarla del todo:**
la distinción correcta no es "Register existe o no," es **"Register como capacidad de aplicación
(indispensable) vs. Register como funcionalidad de producto autoservicio con pantalla propia
(no justificada hoy)."** El propio Paso 1 ya modela la creación de `Credential` como una operación del
mismo aggregate (`CredentialRegistered`), no como una responsabilidad nueva — aquí se decide que esa
operación necesita _algún_ punto de entrada ejecutable (uso interno/administrativo/seed, sin pantalla
pública de auto-registro) para que Login sea alcanzable en absoluto, sin que eso obligue a construir un
flujo de signup con verificación de email, validaciones de UX, etc.

**Conjunto final de casos de uso — 4, no 3:** **Register Credential** (capacidad de aplicación necesaria
para que exista al menos una credencial; sin compromiso de exponerse como pantalla pública de
autoregistro), **Login**, **Validate Session**, **Logout**. Sin Refresh.

### Refinamiento conceptual final del usuario: Register = provisionar, no "sign up"

El usuario precisa el porqué de la entrada de Register: **no entra porque el usuario deba registrarse a
sí mismo — entra porque el dominio necesita garantizar que pueda existir una `Credential` antes de
autenticar.** D-043.1 no exige _cómo_ aparece esa credencial: comando administrativo, migración,
bootstrap, importación, un flujo de auto-registro futuro, o un proveedor externo de identidad — todos
satisfacen el mismo requisito de dominio por igual. "Register (Provision) Credential" describe la
**creación** de la credencial, explícitamente no la experiencia de autoservicio del usuario — evita que
en el futuro alguien lea "Register" y asuma que el producto debe tener una pantalla pública de signup
por esa sola razón.

**Propiedad resultante, señalada por el usuario:** los 4 casos de uso cubren el ciclo completo del
bounded context sin solapamiento ni hueco — Provision (crea la capacidad de autenticarse) → Login (crea
una sesión) → Validate Session (verifica su vigencia) → Logout (la destruye). Ninguno sobra, ninguno
falta, ninguno existe por tradición.

### Observación metodológica del usuario: no confundir ausencia de UI con ausencia de necesidad de dominio

El usuario señala un patrón que ya apareció en AR-023: la suposición inicial razonable pero incorrecta
de que "como no hay UI de registro, Register probablemente no existe" dependía de la evidencia de
_implementación visible_ (la pantalla actual), no del _modelo del dominio_ — que es lo que realmente
determina si un caso de uso es necesario. La corrección correcta separó ambas cosas explícitamente. Es
el mismo tipo de corrección que el proceso ha exigido repetidamente (no convertir ausencia de evidencia
en conclusión sin verificarla primero contra el nivel correcto de análisis).

### Veredicto final del usuario — Paso 2 cerrado

**Casos de uso mínimos aceptados:** Register (Provision) Credential, Login, Validate Session, Logout.

**Casos de uso descartados por falta de evidencia (no por ser malas ideas):** Refresh, Password Reset,
Change Password, Revoke All Sessions, MFA, OAuth Login, Social Login, Email Verification, Role
Assignment, Permission Management — ninguno necesario para satisfacer D-043.1 con la evidencia
disponible hoy.

Pendiente: Paso 3 — Puertos, sobre esta base ya delimitada.

### Paso 3 — Puertos

**Estado: 🟦 En progreso.** Principio explícito del usuario: _"cada puerto debe existir porque un caso
de uso lo necesita, no porque una tecnología lo sugiera."_ Todavía sin JWT/HTTP/Postgres/Redis.

**Propuesta inicial del usuario, 4 candidatos:** `CredentialRepository` (persistir/buscar/actualizar
`Credential`), `SessionRepository` (crear/obtener/revocar `Session`), `TokenService` (ya identificado en
Paso 1 como servicio de dominio — `issue`/`verify`/`extractIdentity`/`extractSession`), `CredentialHasher`
(`hash(secret)`/`verify(secret, hash)`, sin conocer el algoritmo concreto).

### Verificación: ¿puede eliminarse alguno sin romper un caso de uso?

- `CredentialRepository` y `SessionRepository`: no — sin ellos, Register/Login/Validate Session/Logout no
  tienen dónde persistir ni consultar estado. Confirmados.
- ¿Fusionar `CredentialHasher` dentro de `CredentialRepository`? No — persistencia y transformación
  criptográfica son responsabilidades técnicas distintas (el propio usuario ya lo señaló: "el repositorio
  no conoce hashing"). Mantenerlos separados es correcto.
- ¿Fusionar `TokenService` dentro de `SessionRepository`? No — uno persiste el aggregate `Session`, el
  otro transforma una `Session` en/desde un artefacto externo verificable (serialización/transporte);
  son concernientes técnicos distintos aunque ambos operen sobre `Session`.

**Los 4 puertos sobreviven la prueba de eliminación — ninguno se fusiona con otro.**

### H-043.5 — ¿`TokenService` es un servicio de dominio o un puerto de infraestructura? Resuelto con

precedente interno, no con teoría DDD abstracta

Búsqueda del patrón ya establecido en este código para distinguir ambas categorías:

- **`packages/domain/src/task/services/task-dependency.service.ts`** — el único "domain service" que
  existe hoy en `packages/domain`. Su propio comentario lo define explícitamente: _"Pure domain service
  (no I/O) — the caller (Application Layer) is responsible for loading the relevant graph from the
  repository first. This class only reasons about the graph it's handed."_ Cero conocimiento de
  infraestructura, cero I/O, opera exclusivamente sobre datos ya cargados en memoria (`TaskDependency[]`,
  `TaskId`).
- **`apps/backend/src/notifications/application/ports/reminder-scheduler.port.ts`** —
  `ReminderSchedulerPort`: contrato expresado enteramente en vocabulario de dominio (`sourceId`,
  `sourceType`, `identityId`, `recurrencePattern`), pero su implementación real depende de una capacidad
  técnica externa (el scheduler/worker). Vive en `application/ports/`, no en `packages/domain`, y no se
  le llama "domain service" en ningún lugar del código.

**Aplicando esta distinción a `TokenService`:** emitir/verificar un token requiere, por su propia
naturaleza, una capacidad criptográfica externa (firma, claves, posible rotación) — no es "razonar sobre
datos ya cargados en memoria" como `TaskDependencyService`, es producir/consumir un artefacto técnico.
Aunque su contrato esté expresado en vocabulario de dominio (`Session`, `IdentityId` — igual que
`ReminderSchedulerPort`), esa combinación (vocabulario de dominio + dependencia de una capacidad técnica
externa) es exactamente la definición que este código ya usa para un **Port de aplicación**, no para un
domain service.

**H-043.5 resuelta: `TokenService` se reclasifica de "servicio de dominio" (Paso 1) a Port de
aplicación** — mismo contrato conceptual definido en Paso 1 (`issue`/`verify`/`extractIdentity`/
`extractSession`, sin conocer JWT/HTTP), pero con la ubicación arquitectónica corregida para seguir la
convención ya validada del propio proyecto: vive junto a los demás puertos del bounded context
(paralelo a `application/ports/` en los módulos existentes), no dentro de `packages/domain/*/services/`
— esa carpeta queda reservada, por convención ya demostrada, a lógica pura sin ninguna dependencia
técnica externa.

**`CredentialHasher` confirmado como Port por el mismo criterio, con un margen todavía mayor:** su
contrato (`hash(secret)`, `verify(secret, hash)`) ni siquiera menciona vocabulario de dominio
(`Credential`, `Session`) — es una capacidad técnica genérica, un caso todavía más claro de Port que
`TokenService`.

### Conjunto final de puertos — 4, ubicación de cada uno

Siguiendo la convención de dos niveles que ya usa el proyecto (interfaz de repositorio a nivel de
dominio + puerto de aplicación específico del backend cuando aplica, como `goal.repository.ts` +
`versioned-goal-repository.port.ts`):

- **`CredentialRepository`** — interfaz de dominio (paralelo a `identity.repository.ts`), en el bounded
  context Authentication dentro de `packages/domain`.
- **`SessionRepository`** — igual.
- **`TokenServicePort`** — puerto de aplicación (no domain service), vocabulario de dominio, contrato
  agnóstico de JWT/HTTP.
- **`CredentialHasherPort`** — puerto de aplicación, vocabulario genérico, agnóstico de algoritmo.

Pendiente: Paso 4 — Persistencia.

### Veredicto del usuario sobre H-043.5 y cierre del Paso 3

✅ H-043.5 cerrada, con la lectura del usuario incorporada como la formulación de referencia: el
criterio de clasificación en este proyecto **no es el vocabulario del contrato, es la naturaleza de la
implementación requerida** — `ReminderSchedulerPort` ya demuestra que un contrato en lenguaje de dominio
puede depender de infraestructura sin dejar de ser un Port. `TaskDependencyService` fija el otro extremo:
razonamiento puro, sin I/O, sobre datos ya cargados. `TokenService` cae del lado de `ReminderSchedulerPort`
— reclasificado a Port. **Paso 3 cerrado:** `CredentialRepository`/`SessionRepository` (dominio),
`TokenServicePort`/`CredentialHasherPort` (aplicación). Sin puertos adicionales hasta que aparezca
evidencia de un requisito nuevo.

### Paso 4 — Persistencia

**Estado: 🟦 En progreso.** Cambio de modo de trabajo señalado por el usuario: de derivar
responsabilidades a hablar de almacenamiento — pero todavía sin tecnología. Pregunta de apertura:
_"¿cuál es la persistencia mínima necesaria para soportar los cuatro casos de uso ya aprobados?"_

### H-043.6 — hipótesis adversarial central de esta fase

> **¿`Session` necesita persistirse realmente, o un token auto-contenido (stateless) sería suficiente
> para satisfacer D-043.1?**

Enfrenta dos modelos: Sesión persistida (stateful) vs. token completamente auto-contenido (stateless,
validez determinada solo por firma + expiración, sin ningún estado consultable en servidor).

**Prueba aplicando la misma pregunta usada en todo Paso 2: ¿qué requisito ya aceptado queda incumplido
si `Session` no se persiste en absoluto?**

- **Logout, ya aceptado como caso de uso indispensable en Paso 2, queda incumplido.** Un token
  completamente auto-contenido no tiene ningún estado externo que mutar al cerrar sesión — su validez
  depende únicamente de su firma y su expiración. La única acción posible sería borrar el token del
  dispositivo, pero un token robado o interceptado _antes_ de ese borrado seguiría siendo válido hasta su
  expiración natural. Esto no es un detalle de implementación — es una propiedad matemática de los
  tokens auto-contenidos.
- **El invariante de `Session` ya aceptado en Paso 1 — "una sesión revocada nunca puede validarse" —
  queda incumplido.** Sin ningún estado persistido, no existe ningún lugar donde registrar que una
  sesión ha sido revocada antes de su expiración natural.

**Alternativa intermedia considerada, no solo el extremo puro:** ¿un contador de generación a nivel de
`Credential` (incrementado al revocar, embebido en cada token emitido, comparado en `Validate`) bastaría
sin persistir `Session` en absoluto? Se descarta por una razón de consistencia interna, no de
preferencia: esta alternativa solo puede revocar **todas** las sesiones de una credencial a la vez —
destruye exactamente la capacidad (granularidad por sesión/dispositivo, múltiples sesiones concurrentes
por identidad) que la propia refutación de H-043.4 estableció como requisito real (multi-dispositivo,
"cerrar sesión en este dispositivo"). Aceptar esta alternativa contradiría el resultado ya validado de
Paso 1, no solo introduciría una limitación nueva.

**H-043.6 refutada — `Session` debe persistirse**, al menos en la forma mínima ya necesaria para que
Logout y el invariante de revocación tengan un lugar donde aplicarse.

### Modelo de persistencia mínimo resultante (sin tecnología concreta — hoy sería `InMemory*`, como los

7 aggregates reales; Postgres/Redis es una decisión de Paso 6, no de aquí)

**`Credential`:** CredentialId, IdentityId, CredentialHash, CredentialStatus, CreatedAt, UpdatedAt.

**`Session`:** SessionId, IdentityId, SessionStatus, ExpiresAt, CreatedAt. **El token NO se persiste** —
el token es un artefacto de transporte derivable/verificable a partir de la sesión, no una segunda
fuente de verdad; persistirlo introduciría una duplicación de estado (¿qué manda si el token dice una
cosa y `SessionStatus` dice otra?) que el modelo ya evita al no incluirlo.

Pendiente: Paso 5 — Integración con el resto del backend.

### Paso 5 — Integración con el resto del backend

**Estado: ✅ Cerrado.** Pregunta de apertura del usuario: _"¿cuál es el conjunto mínimo de puntos de
integración que Authentication necesita con el resto de Commitment para satisfacer D-043.1, sin
acoplarse a otros bounded contexts?"_ Hipótesis del usuario (2-3 integraciones como máximo) confirmada
con evidencia — precedente verificado: `apps/backend/src/filters/problem-details-exception.filter.ts`
existe (creado en AR-028 para `OptimisticConcurrencyError → 409`).

**3 integraciones necesarias, cada una por necesidad arquitectónica, no por conveniencia:**

1. **Request Pipeline** — sustituye la confianza en `x-identity-id` sin verificar por
   `TokenServicePort.verify()` → `Validate Session` → `identityId` confiable. Cambia el _origen_ del
   `identityId`, no su forma — los 7 aggregates reales siguen consumiéndolo exactamente igual.
2. **Problem Details** — extiende el filtro centralizado que AR-028 ya estableció (no introduce una
   convención nueva, amplía una ya aceptada) para mapear fallos de autenticación (credencial
   inválida/sesión expirada o revocada) a 401.
3. **Cliente Mobile** (`useAuthStore`) — deja de fabricar un `uuidv7()` local y pasa a consumir el flujo
   real de Login/Register/Logout del backend. El dominio no cambia; el contrato de autenticación sí.

**Integraciones explícitamente descartadas, por ausencia de evidencia, no por descuido:** `Identity`
(AR-030, confirmado en Fase 1 — cero dependencia técnica), `Device` (confirmado en Paso 1 — sin
requisito que lo exija), y los aggregates de negocio (`Goal`, `Commitment`, `Task`, `Habit`,
`Reminder`) — ninguno requiere modificación, ya filtran por `identityId` como string opaco desde
`RequestContext`. Tampoco CQRS/Event Bus/Sagas adicionales — el diseño no genera nuevos eventos que
otros bounded contexts necesiten consumir hoy.

**Propiedad más significativa de esta fase, señalada por el usuario:** lo relevante no es que haya 3
integraciones, es lo que no aparece — Authentication no invade el resto del dominio, solo sustituye el
mecanismo por el cual el resto del sistema obtiene un `identityId` confiable. Confirma, con evidencia
de integración real (no solo de modelo), la misma independencia de `Identity` que Fase 1 y Paso 1 ya
habían establecido por separado.

Pendiente: Paso 6 — Detalles tecnológicos (JWT, Passport, Guards, elección de almacenamiento, etc.) —
primera fase de AR-043 donde la evidencia técnica de plataforma (NestJS, Postgres, Redis...) tiene un
papel legítimo, después de haber demostrado que el modelo de dominio se sostiene sin depender de ella.

---

## Paso 6 — Detalles tecnológicos

**Estado: 🟦 En progreso.** Cambio de marco explícito, fijado por el usuario antes de empezar: el
diseño conceptual (bounded context, aggregates, invariantes, casos de uso, puertos, persistencia
conceptual, integraciones) queda **congelado**. Ninguna decisión tecnológica puede modificarlo — si una
tecnología obliga a cambiar el diseño, la carga de la prueba recae en la tecnología, no en el modelo.
Dividido en bloques independientes: 6A (Autenticación) → 6B (Persistencia) → 6C (Framework) → 6D
(Criptografía) → 6E (API). Empezando por 6A porque condiciona el resto.

### 6A — Autenticación

**H-043.7 — hipótesis adversarial:** _¿son los Refresh Tokens realmente necesarios como detalle
tecnológico imprescindible, aunque el Paso 2 ya demostrara que no son un caso de uso?_ Pregunta distinta
a la del Paso 2 — ahí se preguntó si el producto necesita la _capacidad_ de renovar sesión; aquí se
pregunta si el _mecanismo_ access+refresh es indispensable dado el modelo ya congelado.

**Evidencia decisiva, que ya estaba implícita en la refutación de H-043.6 pero no se había hecho
explícita hasta ahora:** el invariante _"una sesión revocada nunca puede validarse"_ (Paso 1) exige que
`Validate Session` compruebe el `SessionStatus` **persistido y vigente** en cada validación — no puede
confiar solo en una expiración firmada dentro del propio token, porque eso es exactamente lo que
H-043.6 ya rechazó (un token auto-contenido no puede reflejar una revocación posterior a su emisión).
Esto significa que el modelo ya congelado **obliga a una consulta de estado vivo en cada validación**,
independientemente del formato del token.

El patrón clásico access-token-corto + refresh-token-largo existe específicamente para **evitar** esa
consulta en la mayoría de las peticiones (tokens de acceso autocontenidos y de vida corta, para no
pagar el coste de una consulta a base de datos en cada request; el refresh token, sí validado contra
almacenamiento, se usa solo ocasionalmente para renovar). **Ese beneficio ya no aplica aquí** — el diseño
ya congelado paga el coste de la consulta en cada validación de todos modos, para poder cumplir el
invariante de revocación. Introducir Refresh Tokens no evitaría ese coste, solo añadiría un segundo
artefacto (un segundo endpoint, una segunda superficie de robo/rotación) sin resolver ningún problema
que el modelo ya congelado no resuelva de otra forma: extender la vigencia de la misma `Session`
(`ExpiresAt` deslizante) revalidada contra estado vivo logra el mismo resultado práctico (uso
prolongado sin re-login) sin un segundo artefacto.

**Evidencia adicional de producto, no solo técnica:** ADR-008 (Offline Resilient, reclasificada como
histórica no vinculante por AR-001 pero con su contenido factual intacto) establece la resiliencia
offline como requisito core — _"el usuario puede perder conexión... la sincronización se produce
silenciosamente al recuperar la red."_ Un modelo de expiración corta + refresh activo asume
conectividad frecuente para renovar; una sesión de vigencia larga y deslizante encaja mejor con un
producto que ya asume huecos de conectividad como algo normal, no excepcional.

**H-043.7 refutada — Refresh Tokens no son necesarios, ni como caso de uso (Paso 2) ni como mecanismo
técnico (Paso 6A).** Se resuelve con: un único token por sesión, `Session.ExpiresAt` deslizante
(se extiende en cada `Validate Session` exitoso), revocación real vía `SessionStatus` comprobado en
cada validación.

**Duración de sesión:** vigencia larga por defecto (días/semanas, no minutos), consistente con el
patrón ya observado en `useAuthStore` (`persist()`, pensado para sobrevivir reinicios de la app) y con
el requisito de resiliencia offline de ADR-008 — ningún requisito documentado exige lo contrario.

**Claims mínimas:** siguiendo el contrato de `TokenServicePort` ya fijado en Paso 3
(`extractIdentity`/`extractSession`) — únicamente `sessionId` e `identityId`. Nada de roles/permisos
(ya descartados en Fase 2B/Paso 2 por ausencia de requisitos) ni ningún dato de perfil de `Identity`.

**JWT vs. token opaco — la única pregunta de 6A que no se resuelve por necesidad, sino por
conveniencia, y se registra como tal:** dado que el modelo ya obliga a una consulta de estado vivo en
cada validación, un JWT autocontenido pierde su ventaja principal (evitar esa consulta) — la elección
entre JWT firmado y un token opaco (id aleatorio, buscado directamente en `SessionRepository`) no está
forzada por ningún requisito de dominio ya establecido. Se deja abierta para 6C (Framework), donde el
soporte nativo de NestJS (Guards/Passport, ya señalado como disponible y sin usar desde AR-001) puede
inclinar la decisión sin que eso contradiga el diseño congelado — cualquiera de las dos opciones
satisface igual de bien el contrato ya fijado de `TokenServicePort`.

Pendiente: 6B (Persistencia) — PostgreSQL/Redis/ambos/ninguno para `CredentialRepository`/
`SessionRepository`.

### Veredicto del usuario sobre 6A

✅ 6A cerrado, con la reformulación del usuario adoptada como la lectura de referencia: la refutación de
H-043.7 no es "el MVP no lo necesita" (simplicidad), es **consistencia arquitectónica** —
Paso 1 (invariante de revocación) → Paso 4 (por eso `Session` se persiste) → Paso 5 (toda petición pasa
por `Validate Session`) → consecuencia inevitable: **cada petición ya consulta estado vivo**, lo cual
elimina el beneficio arquitectónico que el patrón Access+Refresh existe para dar. Token único, sin
Refresh, claims mínimas (`SessionId`+`IdentityId`), expiración larga controlada por `Session`. JWT vs.
opaco queda correctamente como la única pregunta de implementación, no de dominio, diferida a 6C.

### 6B — Persistencia

**Estado: 🟦 En progreso.**

**H-043.8 — hipótesis adversarial:** _¿Authentication necesita dos mecanismos de persistencia
(PostgreSQL + Redis), o uno solo satisface completamente el diseño ya aprobado?_ Evaluada contra los 4
criterios del usuario, con evidencia, no con "todo sistema de auth moderno usa Redis":

**Criterio 1 — ¿algún requisito funcional exige Redis?** No encontrado. Búsqueda exhaustiva de
requisitos funcionales de Authentication (Pasos 1-5 completos): ninguno menciona ni depende de un
almacén clave-valor específico.

**Criterio 2 — ¿algún requisito de rendimiento documentado hace insuficiente PostgreSQL?** No existe
ningún requisito de rendimiento concreto y actual (RPS, usuarios concurrentes, latencia objetivo) en
`docs/00-framework/`, `docs/01-product/`, `docs/03-architecture/`. Sí existe un principio de diseño a
largo plazo — la _"Regla de los Diez Años"_ (`north_star.md`, `commitment_constitution.md` Apéndice C):
_"si Commitment tuviera 10 millones de usuarios en 10 años, ¿seguiríamos tomando exactamente esta
decisión?"_ — pero es una prueba de diseño aspiracional, no un requisito de rendimiento actual (mismo
tipo de evidencia de Nivel 3-4 en la escala de ponderación del programa, no Nivel 1). Aplicada de todos
modos, con honestidad: PostgreSQL como único almacén de sesiones, con índices por `SessionId` (lookup) e
`IdentityId` (revocar-todo), es un patrón estándar y ya probado a gran escala en sistemas de producción
reales — Redis, si algún día hiciera falta, entraría como una capa de caché _delante_ de Postgres
(una optimización de latencia), no como una necesidad estructural desde el primer día. Supera la prueba
de los Diez Años sin necesitar Redis todavía.

**Criterio 3 — ¿alguna ADR vigente prescribe Redis específicamente para Authentication?** No. **ADR-024**
(Arquitectura Oficial de Plataforma, vigente) ya menciona Redis explícitamente, pero con un alcance
acotado y verificado: _"Mensajería / Colas: BullMQ sobre Redis"_ — confirmado además en el código
(`apps/backend/src/app.module.ts`, `BullModule.forRoot({ connection: { host: REDIS_HOST... } })`, único
uso real de Redis hoy en todo el backend). Ninguna ADR vigente extiende ese alcance a sesiones o
autenticación.

**Criterio 4 — ¿introducir Redis elimina una limitación real o solo optimiza una carga que todavía no
existe?** Lo segundo, confirmado repetidamente a lo largo de toda la Architecture Review y de este
propio AR: el sistema corre hoy en modo local/single-trusted-developer, sin carga de producción real
(hallazgo original de Iteración 6, nunca contradicho). No hay ninguna limitación real que eliminar.

**H-043.8 refutada — un solo mecanismo de persistencia basta.** La carga de la prueba recae sobre
Redis, no sobre PostgreSQL, y Redis no la supera en ninguno de los 4 criterios.

**Elección de almacén, con la misma calibración que el resto del backend:** `CredentialRepository` y
`SessionRepository` se implementan hoy como `InMemory*Repository` — exactamente la misma convención que
ya usan los 7 aggregates reales del sistema (ninguno tiene todavía un backing store Postgres real,
verificado en `apps/backend/src/app.module.ts`: solo módulos in-memory registrados). PostgreSQL, cuando
llegue, es un trabajo de persistencia real transversal a _todo_ el backend, no algo específico ni
prioritario de Authentication — introducirlo solo para Auth sería tratar esta AR como excepción del
resto del sistema sin ninguna razón que lo justifique.

Pendiente: 6C (Framework) — Guards/Interceptors/Middleware, Passport vs. implementación propia, y la
decisión diferida de JWT vs. token opaco.

### Veredicto del usuario sobre 6B

✅ 6B cerrado. Reformulación adoptada como resultado de referencia: el hallazgo real no es "PostgreSQL
mejor que Redis," es _"no existe evidencia de que Authentication deba convertirse en la primera
excepción arquitectónica del proyecto."_ Persistencia actual: `CredentialRepository`/`SessionRepository`
como `InMemory*`, consistente con el resto del sistema. Persistencia futura: migran junto con el resto
de aggregates cuando la persistencia real transversal se implemente — no aislado. Hipótesis de
gobernanza **H-GOV-01** registrada en el README (no permanente todavía): _"ninguna AR debería
convertirse en la primera excepción tecnológica del proyecto sin evidencia específica que la
justifique"_ — 2 puntos de datos (AR-023/`Appearance`, AR-043/Authentication).

### 6C — Framework

**Estado: 🟦 En progreso.**

**H-043.9 — hipótesis adversarial final de AR-043:** _¿aporta JWT algún beneficio arquitectónico real
frente a un token opaco, dentro del diseño ya congelado?_ Pregunta más específica que "JWT vs.
sesiones" (ya resuelta en 6A) — ambos modelos comparten `Session` persistida, `Validate Session`,
`SessionStatus`, `Logout` y revocación real; la única diferencia es qué viaja entre cliente y servidor.

**Verificación de las 4 razones ya descartadas por el usuario, más búsqueda activa de un quinto
beneficio no cubierto — el mismo nivel de escrutinio aplicado a cada hipótesis anterior de esta AR:**

1. No elimina consultas al almacenamiento — confirmado, `SessionStatus` se valida en cada petición de
   todas formas (6A).
2. No reduce acoplamiento — `IdentityId` ya es la referencia opaca en ambos modelos.
3. No evita mantener estado — `Session` persiste igual en ambos casos.
4. No simplifica `Logout` — la revocación depende de `SessionStatus`, no del formato del token.
5. **Candidato no cubierto, examinado y descartado:** ¿permite JWT verificación sin red en múltiples
   servicios independientes (el beneficio clásico de JWT en arquitecturas distribuidas)? No aplica —
   `apps/backend` es un único proceso NestJS monolítico (`app.module.ts` registra todos los módulos de
   dominio en el mismo proceso, verificado repetidamente en Fase 1/Paso 5); no hay servicios
   independientes que necesiten verificar sin llamar al mismo almacén. **Candidato menor, real pero
   marginal:** un JWT permite un rechazo barato de tokens obviamente malformados/expirados antes de
   pagar una consulta a `SessionRepository` (verificación de firma en memoria, sin I/O) — una
   optimización operativa pequeña, no arquitectónica, y no exclusiva de JWT (un token opaco también
   puede validarse por formato/longitud antes de la consulta).

**Conclusión: JWT no aporta ningún beneficio arquitectónico que el diseño ya congelado no tenga por
igual con un token opaco.** Lo único que queda a favor de JWT es exactamente lo que el usuario ya
identificó — conveniencia de ecosistema (`@nestjs/jwt`, Guards ya disponibles y sin usar desde el
hallazgo original de AR-001) — y el rechazo barato de input malformado, ambos beneficios de
implementación, no de arquitectura.

**Decisión de 6C: adoptar JWT, explícitamente por razones de implementación, no de arquitectura.**
Registrado así para que ningún lector futuro confunda esta elección con un requisito de diseño: el
formato del token es intercambiable sin tocar `Credential`, `Session`, los casos de uso, los puertos, ni
las integraciones — si en el futuro `@nestjs/jwt` dejara de ser la opción más conveniente, migrar a un
token opaco no requeriría rediseñar nada de lo ya congelado en Pasos 1-5.

**Framework, resuelto en el mismo movimiento:** Guards de NestJS (no Middleware ni Interceptors —
Guards son el punto de extensión diseñado específicamente para decisiones de autenticación/autorización
en NestJS, consistente con el comentario ya citado en Fase 1: _"NestJS tiene Guards/Passport de primera
clase; simplemente nunca se usaron"_), implementando `TokenServicePort` sobre `@nestjs/jwt`. Passport se
deja fuera deliberadamente — Passport aporta valor cuando hay múltiples estrategias de autenticación que
unificar (local, OAuth, SAML...); con un único mecanismo (credenciales propias) ya decidido y sin
evidencia de estrategias adicionales (OAuth/social login ya descartados en Fase 2B por ausencia de
requisitos), añadir Passport sería una capa de indirección sin beneficio demostrado — el mismo criterio
de "no introducir complejidad que la evidencia no exige" que ha gobernado toda la AR.

**AR-043 — Paso 6 completo (6A, 6B, 6C cerrados).** Diseño tecnológico resuelto sin haber modificado en
ningún punto el modelo congelado en Pasos 1-5. Pendiente: cierre formal de Fase 4A (síntesis) y
transición a Fase 4B (Implementación).

---

## Cierre formal de Fase 4A

**Estado: ✅ Cerrada.** Separación deliberada entre diseño (Fase 4A) e implementación (Fase 4B),
exigida por el usuario antes de escribir código, por la misma razón que ya sostuvo el resto del
programa: sin este corte, cualquier cambio posterior sería ambiguo entre "cambió el diseño" y "cambió
la implementación."

**Objetivo inicial:** definir completamente el bounded context de Authentication sin depender de
decisiones tecnológicas. **Resultado: cumplido.**

**Decisiones estabilizadas (arquitectura — no se tocan en Fase 4B sin reabrir esta fase):**

- Bounded Context `Authentication`, independiente del aggregate `Identity` (D-043.1).
- Dos aggregates: `Credential`, `Session` — no fusionados (H-043.4 refutada).
- Un servicio/puertos de aplicación: `TokenServicePort`, `CredentialHasherPort` (H-043.5 resuelta por
  precedente interno — `ReminderSchedulerPort` vs. `TaskDependencyService`).
- Cuatro casos de uso mínimos: Register (Provision) Credential, Login, Validate Session, Logout — sin
  Refresh (Paso 2), confirmado también a nivel técnico (H-043.7).
- `CredentialRepository`/`SessionRepository` como interfaces de dominio (Paso 3).
- Persistencia conceptual: `Session` debe persistirse (H-043.6 refutada); el token nunca es la fuente de
  verdad.
- Tres puntos de integración: Request Pipeline, Problem Details (extiende el precedente de AR-028),
  Cliente Mobile — cero acoplamiento con `Identity`, `Device`, o los 7 aggregates de negocio (Paso 5).
- Modelo tecnológico derivado sin modificar el dominio: `InMemory*` hoy (consistente con el resto del
  sistema, H-043.8 refutada), JWT vía `@nestjs/jwt` y Guards de NestJS, sin Passport (6A-6C, H-043.9
  confirmada).

**Hipótesis resueltas dentro del alcance de esta fase:** H-043.4, H-043.5, H-043.6, H-043.7, H-043.8,
H-043.9 — las seis sobrevivieron o fueron refutadas con evidencia, ninguna quedó sin resolver.
**Hipótesis abiertas: ninguna.**

**Decisiones de implementación explícitamente diferidas a Fase 4B, y explícitamente clasificadas como
NO arquitectónicas — para que ninguna lectura futura las confunda con D-043.1:** formato del token
(JWT, vía `@nestjs/jwt`), mecanismo de extensión de NestJS (Guards), almacén de persistencia
(`InMemory*`, hoy). Las tres son intercambiables sin rediseñar nada de lo estabilizado arriba — si
cualquiera cambia en el futuro (p. ej. `InMemory*` → Postgres cuando la persistencia real transversal
llegue), esa es una decisión de Fase 4B/futuro, no una revisión de D-043.1.

**Patrón metodológico validado a lo largo de esta fase, reutilizable para futuras ARs, independientemente
del tema técnico:** formular una hipótesis → buscar evidencia en el repositorio y las ADRs → intentar
refutarla → aceptarla solo si sobrevive → registrar la decisión y su evidencia. Aplicado de forma
idéntica en las seis hipótesis de esta fase, no solo en las de fases anteriores.

**Transición a Fase 4B:** la pregunta que gobierna el trabajo se invierte. De _"¿cuál es el mejor
diseño?"_ a **"¿la implementación preserva exactamente el diseño ya aprobado?"** La implementación no
debe introducir nuevas decisiones arquitectónicas — su función es materializar las ya tomadas en esta
fase.

---

## Fase 4B — Implementación

**Estado: 🟦 En progreso.**

### Regla operativa de esta fase (inversión de la carga de la prueba respecto a Fase 4A)

> **Toda desviación detectada entre la implementación y el diseño congelado se trata primero como un
> posible defecto de implementación, no como una oportunidad para modificar la arquitectura. Solo si la
> implementación demuestra una imposibilidad real del diseño se reabre la decisión arquitectónica
> mediante una nueva hipótesis.**

En Fase 4A, cualquier hipótesis podía cambiar el modelo si la evidencia lo exigía — esa carga de la
prueba se invierte aquí: ahora el modelo tiene la presunción de corrección, y es la implementación la
que debe justificar cualquier apartamiento de él.

### Criterios de aceptación (Fase 4B no se cierra si alguno falla)

1. El código implementa exactamente los cuatro casos de uso aprobados (Register/Provision Credential,
   Login, Validate Session, Logout) — ninguno más, ninguno menos.
2. Los únicos aggregates son `Credential` y `Session` — no aparece ningún `AuthenticationAggregate` ni
   fusión de ambos.
3. No aparecen nuevos puertos sin una decisión documentada (los 4 ya fijados: `CredentialRepository`,
   `SessionRepository`, `TokenServicePort`, `CredentialHasherPort`).
4. No aparecen dependencias directas hacia `Identity` (ni el aggregate, ni sus value objects, ni su
   repositorio).
5. Los tres puntos de integración aprobados (Request Pipeline, Problem Details, Cliente Mobile) son los
   únicos incorporados.
6. JWT permanece como detalle intercambiable de infraestructura — ningún caso de uso, aggregate, ni
   puerto referencia JWT/claims/HTTP directamente en su contrato.
7. Ningún cambio de esta fase obliga a modificar los documentos de Fase 4A — si alguno lo exige, la
   desviación debe pasar primero por la regla operativa de arriba antes de tocar el diseño.

### Fase 4B.1 — Esqueleto del módulo (completa, pendiente de confirmación del usuario en un punto)

**Estado: 🟡 Implementado, sujeto a la regla operativa de esta fase antes de darse por definitivo.**

Creados: `packages/domain/src/credential/*` (aggregate, `CredentialStatus`, 2 eventos, interfaz de
repositorio), `packages/domain/src/session/*` (aggregate, `SessionStatus`, 3 eventos, interfaz de
repositorio), exportados desde `packages/domain/src/index.ts`. `apps/backend/src/authentication/*`:
`RegisterCredentialHandler`, `LoginHandler`, `LogoutHandler`, `ValidateSessionHandler` (CQRS,
`@nestjs/cqrs`), `InMemoryCredentialRepository`/`InMemorySessionRepository`, `StubTokenService`/
`StubCredentialHasher` (placeholders explícitos, no la decisión de Paso 6C/6D — reemplazados en
4B.4), `SessionAuthGuard` vacío (lanza si se invoca), `AuthenticationModule` registrado en
`app.module.ts`. Sin controllers/endpoints. Verificado: `tsc --noEmit` limpio en `packages/domain` y
en `apps/backend` (los 2 errores preexistentes en specs de `commitment`/`notifications` no tocados
por este cambio, confirmado con `git status` — ninguno de los dos archivos aparece modificado);
15 suites / 268 tests de `packages/domain` pasan, cero regresión.

**Desviación detectada durante la implementación — elevada a mini-hipótesis (H-043.10) en vez de
clasificarse directamente, por pedido del usuario.** Paso 1 especificó los campos de `Credential`
(CredentialId, IdentityId, CredentialHash, CredentialStatus, fechas) sin incluir ningún campo de
búsqueda para `Login` — `IdentityId` no sirve porque el cliente no lo conoce antes de autenticarse por
primera vez.

### H-043.10

> **¿Puede `Authentication` implementar `Login` sin un identificador de búsqueda propio dentro de
> `Credential`, sin introducir acoplamiento con `Identity`?**

Formulada para permitir "sí" o "no" — no presupone la solución (`loginIdentifier`) de antemano.

**Tres alternativas evaluadas:**

- **A — `findByIdentityId()`:** el cliente no posee ese dato antes de autenticarse. Descartada — no
  ejecutable, no una cuestión de preferencia.
- **B — consultar `Identity` primero para resolver `IdentityId`:** rompe D-043.1 directamente —
  `Authentication` dejaría de ser independiente de `Identity`, contradiciendo la decisión ya aprobada
  y las 6 hipótesis que la sostienen. Descartada.
- **C — un identificador propio dentro de `Credential`** (`loginIdentifier`, deliberadamente sin
  nombrarlo `email`/`username` — describe la responsabilidad, no una implementación de producto
  concreta; hoy podría ser un email, mañana un username o teléfono, sin que el modelo cambie):
  preserva Login ejecutable y la independencia de `Identity` a la vez. Sobrevive.

**H-043.10: respuesta "no" — `Authentication` no puede implementar `Login` sin su propio
identificador de búsqueda.** `loginIdentifier` se incorpora a `Credential` con Alternativa C.

**Reclasificación de la desviación, corrigiendo mi propia clasificación inicial:** ni "defecto de
implementación" ni "nueva decisión arquitectónica" — es una **omisión detectada durante la validación
de implementabilidad**. Las decisiones de Pasos 1-5 siguen intactas; ningún invariante ni
responsabilidad de aggregate cambia; lo único que ocurre es que, al materializar el modelo, se
descubre un atributo indispensable para una responsabilidad ya aprobada (`Login`) que no había sido
enumerado explícitamente. No cambia el diseño, lo completa — Fase 4A no se reabre. `loginIdentifier`
ya estaba implementado exactamente así antes de esta discusión; no requiere cambio de código, solo esta
clasificación y registro.

Pendiente: Fase 4B.2 (Dominio — tests de invariantes de `Credential`/`Session`).

### Fase 4B.2 — Dominio (completa)

**Estado: ✅ Completa.** `packages/domain/src/credential/__tests__/credential.spec.ts` (5 tests) y
`packages/domain/src/session/__tests__/session.spec.ts` (6 tests) — cubren exactamente los
invariantes ya congelados, ninguno nuevo: `Credential` pertenece a una identidad, bloqueada no
autentica, nunca expone el secreto en texto plano (solo `credentialHash`), `block()` idempotente;
`Session` pertenece a una identidad, revocada nunca vuelve a validarse (`revoke()` idempotente),
expirada nunca se reactiva (`markExpired()` idempotente, y `extend()` rechaza explícitamente
reactivar), `markExpired()` no sobrescribe una sesión ya revocada (revocado es más terminal que
expirado), extensión deslizante (`extend()`) solo sobre una sesión válida (Paso 6A — sin Refresh
Token). Verificado: `tsc --noEmit` limpio; 17 suites / 279 tests en `packages/domain` (268 previos +
11 nuevos), cero regresión; rebuild de `dist` confirmado; `apps/backend` `tsc --noEmit` sigue con
solo los 2 errores preexistentes no relacionados.

Pendiente: Fase 4B.3 (Application — tests de los 4 casos de uso con dobles de los puertos).

### Fase 4B.3 — Application (completa)

**Estado: ✅ Completa.** Cambio de enfoque respecto a 4B.2, tal como pidió el usuario: de "¿cada
aggregate protege sus invariantes?" a "¿cada caso de uso orquesta el dominio sin lógica de negocio
fuera de los aggregates?" Los 4 handlers, con dobles de los 4 puertos (`jest.Mocked`, mismo patrón que
`PauseCommitmentCommandHandlerCore.spec.ts`):

- `register-credential.handler.spec.ts` (2 tests): hashea vía `CredentialHasherPort` y nunca guarda el
  secreto en claro; rechaza un `loginIdentifier` duplicado sin llamar al hasher.
- `login.handler.spec.ts` (4 tests): credencial inexistente/bloqueada/secreto incorrecto → 401 sin
  crear `Session`; éxito → crea `Session` y emite token vía `TokenServicePort`. **Verificado
  explícitamente que el handler delega toda la comparación a `hasher.verify(secret, credentialHash)` —
  no la implementa ni la duplica.**
- `logout.handler.spec.ts` (3 tests): revoca sesión existente; no-op idempotente sobre sesión
  inexistente o ya revocada.
- `validate-session.handler.spec.ts` (5 tests): token inválido → null sin tocar el repositorio;
  sesión inexistente/revocada → null; sesión activa pero vencida → `markExpired()` + persistida +
  evento publicado; sesión válida → `identityId` devuelto y expiración extendida (deslizante, Paso
  6A). **Verificado explícitamente que el handler nunca inspecciona el formato del token — solo
  consume el resultado ya verificado de `TokenServicePort.verify()`.**

**Criterio de "pseudocódigo legible" verificado, no asumido:** los 4 handlers miden 35-65 líneas cada
uno, sin ramas anidadas más allá de un nivel; `grep` confirma **cero menciones de jwt/bcrypt/argon2 en
todo el código de aplicación** (solo aparecen en comentarios de los propios puertos, explicando la
frontera). Ninguna lógica criptográfica ni de parsing de token escapó del puerto correspondiente hacia
el handler.

Verificación completa: `tsc --noEmit` limpio (solo los 2 errores preexistentes no relacionados); 4
suites nuevas / 14 tests de aplicación, todos pasan; suite completa de `apps/backend`, **29 suites /
131 tests, todos pasan, cero regresión** (117 previos + 14 nuevos).

Pendiente: Fase 4B.4 (Infraestructura — JWT vía `@nestjs/jwt`, Argon2, `SessionAuthGuard` real,
endpoints, `ProblemDetailsExceptionFilter`, integración con `useAuthStore`).

### Fase 4B.4 — Infraestructura (backend completo; integración con `useAuthStore` pendiente de sesión de mobile)

**Estado: 🟡 Backend completo y verificado.**

**4B.4.1 — `JwtTokenService`** (`infrastructure/jwt-token.service.ts`): implementa `TokenServicePort`
sobre `@nestjs/jwt` (instalado — `@nestjs/jwt@^11.0.2`, ya en `apps/backend/package.json`). Claims
mínimas (`sessionId`, `identityId`), expiración derivada de `Session.expiresAt` en cada emisión (Paso
6A — sin Refresh Token). Único archivo del repo con permiso de importar `JwtService`.

**4B.4.2 — `Argon2CredentialHasher`** (`infrastructure/argon2-credential-hasher.ts`): implementa
`CredentialHasherPort` sobre `argon2` (instalado — `argon2@^0.45.1`; requirió aprobar su script de
build nativo vía `onlyBuiltDependencies` en `pnpm-workspace.yaml`, verificado compilando). Único
archivo con permiso de importar `argon2`.

**4B.4.3 — `SessionAuthGuard`** (real, reemplaza el stub de 4B.1): extrae el token del header
`Authorization: Bearer`, invoca `ValidateSessionQuery` vía `QueryBus` (nunca toca
`SessionRepository`/`TokenServicePort` directamente — confirmado por grep), puebla
`RequestContext.current().identityId` (sustituye la lectura sin verificar de `x-identity-id`, el
hallazgo original de Iteración 6) y adjunta `sessionId` al request (para que `Logout` no tenga que
reverificar el token). Traduce a `UnauthorizedException` (401) cuando corresponde.

**4B.4.4 — HTTP**: `AuthenticationController` con exactamente 3 endpoints — `POST /auth/register`,
`POST /auth/login`, `POST /auth/logout` (protegido por `SessionAuthGuard`). Ningún endpoint
adicional. Validación con Zod, mismo patrón que `commitments.controller.ts`.

**4B.4.5 — Problem Details**: **cero cambios de código requeridos** — verificado, no asumido.
`ProblemDetailsExceptionFilter` (AR-028) ya mapea genéricamente cualquier `HttpException` a su
status code real vía `instanceof HttpException`; `UnauthorizedException`/`BadRequestException` (las
únicas excepciones que usa Authentication) ya caen en esa rama. Solo `OptimisticConcurrencyError`
necesitó una rama `instanceof` propia porque no es un `HttpException` estándar — Authentication no
introduce ningún error de ese tipo. El precedente se reutiliza exactamente, sin mecanismo paralelo.

**Verificación de la frontera arquitectónica, con grep, no por inspección visual:**

- `JwtService`: cero referencias fuera de `infrastructure/` (solo `jwt-token.service.ts`).
- `argon2`: cero referencias fuera de `infrastructure/` (la única excepción,
  `authentication.module.ts`, es la raíz de composición registrando `Argon2CredentialHasher` como
  clase concreta tras el token `'CredentialHasherPort'` — exactamente el mismo patrón que
  `DevicesModule` ya usa con `InMemoryDeviceRepository`, no una fuga).
- El Guard: cero referencias a `SessionRepository`/`TokenServicePort`/`CredentialRepository`/
  `CredentialHasherPort` — solo `QueryBus.execute(new ValidateSessionQuery(...))`.
- Los aggregates `Credential`/`Session`: cero referencias a jwt/argon2/bcrypt/nestjs.

**Test nuevo, deliberadamente sin mocks — la única prueba de todo AR-043 que no usa dobles de los
puertos:** `authentication.integration.spec.ts` levanta el `AuthenticationModule` real completo
(Argon2 real, JWT real) y verifica: Register→Login→Guard end-to-end con un JWT genuinamente firmado
(3 segmentos, no el stub base64 de 4B.1); Login rechaza un secreto incorrecto porque
`argon2.verify()` genuinamente falla, no un mock; el Guard rechaza un token manipulado porque la
verificación de firma JWT genuinamente falla. Más `authentication.controller.spec.ts` (4 tests,
mismo patrón que `commitments.controller.spec.ts` — `CommandBus`/`QueryBus` mockeados).

Verificación completa: `tsc --noEmit` limpio (solo los 2 errores preexistentes no relacionados);
**31 suites / 139 tests en `apps/backend`, todos pasan, cero regresión** (117 previos + 22 nuevos).
`StubTokenService`/`StubCredentialHasher` (placeholders de 4B.1) eliminados — sin código muerto.

**Criterios de aceptación de 4B.4, verificados uno por uno:**

- ✅ JWT aparece únicamente en infraestructura.
- ✅ Argon2 aparece únicamente en infraestructura.
- ✅ El Guard solo coordina autenticación (extraer, invocar, poblar, traducir — nada más).
- ✅ Los handlers siguen sin conocer el formato del token (verificado en 4B.3, no re-tocado aquí).
- ✅ Los aggregates siguen sin conocer infraestructura.
- ✅ No se añadieron nuevos casos de uso.
- ✅ No se añadieron nuevos puertos.
- ✅ El diseño de Fase 4A permanece inalterado.

**Pendiente, fuera del alcance de esta sesión de backend:** integración con `useAuthStore` (mobile) —
requiere una sesión dedicada a `apps/mobile`, no forma parte de este cierre de infraestructura de
backend.

### Auditoría final de independencia arquitectónica, antes de cerrar

Verificación explícitamente distinta de las anteriores — no una prueba funcional, una prueba de
que Domain/Application no desarrollaron ninguna dependencia hacia infraestructura durante 4B.4:

- `packages/domain` → **0 referencias a `@nestjs`/NestJS.**
- `apps/backend/src/authentication/application` (+ `guards`/`api`) → **0 referencias a
  `JwtService`.**
- Idem → **0 referencias a `argon2`.**
- Idem → **0 referencias a Passport** (coherente con la decisión de 6C de no introducirlo).

Las cuatro búsquedas devuelven cero resultados. La dirección de las dependencias se mantuvo correcta
durante toda la Fase 4B.

---

## Cierre de AR-043

**Estado: ✅ Cerrada.** Backend completo, verificado, sin regresión. Integración con `apps/mobile`
(`useAuthStore`, persistencia del token, reacción a 401, inicialización de sesión al arrancar) se
trata explícitamente como **trabajo distinto — consumo de una arquitectura ya implementada**, no como
continuación del diseño de Authentication. Requiere su propia sesión; las preguntas que responderá
("¿cómo migra `useAuthStore`?") son de otra naturaleza que las que gobernaron esta AR ("¿qué hace
Login?").

**Resumen del ciclo completo, las 9 fases:**

1. **Análisis:** hallazgo original confirmado literal (auth ausente por construcción, backend+mobile).
2. **Verificación del framing:** dependencia con AR-030 eliminada tras verificación de imposibilidad
   técnica (H-043.1); framing elevado de "integrar Identity" a "introducir una identidad autenticada
   real" tras descubrir que `identityId` e `Identity` ya eran artefactos desacoplados.
3. **Modelo arquitectónico:** H-043.2/H-043.3 — Authentication es un bounded context propio,
   deliberadamente pequeño, separado de `Identity`, respaldado por 4 líneas de evidencia
   convergentes y el precedente vivo de `Device`.
4. **Alternativas:** A (bounded context separado) domina sobre B (fusión) y C (sin dominio) en 5
   criterios.
5. **Decisión:** D-043.1 aprobada, formulada sin tecnología.
6. **Diseño técnico (Fase 4A, 6 pasos):** modelo de dominio → casos de uso → puertos → persistencia
   → integración → tecnología. 6 hipótesis adversariales (H-043.4 a H-043.9), todas resueltas con
   evidencia — ninguna sobrevivió por defecto, ninguna se asumió.
7. **Implementación (Fase 4B, 4 sub-fases):** esqueleto → dominio → aplicación → infraestructura.
   Una décima hipótesis (H-043.10) emergió durante la implementación y se resolvió con el mismo
   rigor, sin reabrir ninguna decisión previa.
8. **Validación:** 31 suites / 139 tests, cero regresión; auditoría de independencia arquitectónica
   con 0 resultados en las 4 búsquedas críticas.
9. **Dashboard:** actualización pendiente, siguiente paso de esta sesión.

**El logro metodológico que el usuario destaca, y que se registra aquí porque cambia la lectura de
toda la AR:** AR-043 demuestra que un bounded context completo puede recorrer el camino completo desde
la revisión arquitectónica hasta una implementación funcional real **sin que el diseño cambie en el
camino** — las 6 hipótesis de Fase 4A y la única de Fase 4B (H-043.10) se resolvieron todas sin tocar
D-043.1 ni ninguna decisión ya aprobada. Es la cuarta clase de remediación validada por el programa:
AR-001 (gobernanza) → AR-028 (técnica) → AR-023 (híbrida) → **AR-043 (diseño→implementación sin
deriva)**.
