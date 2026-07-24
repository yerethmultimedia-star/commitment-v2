# AR-030 — Identity completo a nivel de dominio, sin módulo de backend

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas)

- **Dependencias:** Ninguna. Bloquea AR-050 (dependencia con AR-043 ya eliminada tras verificación de
  imposibilidad técnica, ver `AR-043/ANALISIS.md` Fase 1). Owner=Claude (ejecución directa).
- **Evidencia todavía válida:** el hallazgo es de la Architecture Review (It.3,
  `fase-1-nucleo/03-bounded-contexts.md`) — necesitaba reverificación, sobre todo porque **AR-043**
  (Authentication, cerrada) creó un módulo backend nuevo que también gira en torno a `identityId`, el
  mismo concepto central de este hallazgo.
- **Impacto/Esfuerzo:** Alto/Medio, Riesgo Medio — empatada con AR-047 en este tier, ambas bloquean
  solo AR-050; Owner=Claude (ejecución directa) frente a Owner=Ambos de AR-047, menor fricción para
  abrir Fase 1.

### Pregunta de framing que gobierna esta fase

> **¿Sigue Identity sin módulo de backend, o AR-043 (Authentication) resolvió indirectamente parte de
> este hallazgo al introducir su propio manejo de `identityId`?**

Se formula así porque AR-043 tocó exactamente el mismo concepto (`identityId`) que este hallazgo
describe como "opaco y sin validar en el servidor" — necesitaba verificarse si esa AR cambió algo aquí.

### 1. Reproducción / verificación directa

**Hallazgo original** (`fase-1-nucleo/03-bounded-contexts.md`, Weaknesses #2): _"Identity is a
domain-complete, integration-incomplete context. It has a real aggregate, value objects, events, and a
repository interface... But there is no `IdentityModule` anywhere in `app.module.ts`. Every other
context... takes `identityId` as an opaque, unvalidated string. The context exists as a concept but has
no enforcement boundary in the running system."_ Riesgo señalado (Risks): _"No real identity enforcement
is a structural blocker for anything Chapter 5 of the Framework describes as AI 'Learning'... squarely in
the path of any real Coach/AI work."_ Recomendación #2: tratar el módulo de backend de Identity como
prerrequisito de cualquier trabajo real de Coach/AI, secuenciado antes de la Iteración 13 (AI Platform).

**Verificado hoy, directamente en el código:**

- `packages/domain/src/identity/` — aggregate, value objects (`preferred-time-zone.ts`,
  `display-name.ts`, `preferred-language.ts`), events (`identity-created.event.ts`,
  `identity-updated.event.ts`), interfaz de repositorio — todo presente, sin cambios.
- **`git log` confirma que el dominio de Identity no ha cambiado ni una vez desde su creación**
  (`6a511ca`, 2026-07-04 — el único commit que lo toca). Es decir, no solo sigue igual desde la
  auditoría (2026-07-20): sigue igual desde el primer día del proyecto.
- **`grep -n "Identity" apps/backend/src/app.module.ts` → cero resultados.** Sigue sin existir ningún
  `IdentityModule` registrado.
- **Verificado explícitamente si AR-043 (Authentication) cambió algo aquí — no lo hizo, por diseño:**
  `SessionAuthGuard` (`apps/backend/src/authentication/guards/session-auth.guard.ts`) valida un token
  de sesión y expone `identityId` en el `RequestContext`, pero ese `identityId` proviene únicamente de
  `Session`/`Credential` (creados en el registro) — en ningún punto de `ValidateSessionHandler` ni de
  ningún otro handler de `authentication/` se consulta el repositorio de `Identity` ni se instancia el
  aggregate. El único comentario que menciona "Identity" en todo el módulo (`authentication.module.ts:
16`) lo dice explícitamente: _"AR-043 D-043.1 — Authentication bounded context, independent of
  `Identity` (AR-030)."_ Fue una decisión deliberada de diseño (D-043.1), no un descuido — pero el
  efecto neto es que **`identityId` sigue siendo exactamente lo que la auditoría describió: un string
  opaco que ningún módulo de backend valida contra un aggregate real**, ahora con un consumidor
  adicional (Authentication) que perpetúa el mismo patrón en vez de resolverlo.
- **Coach/AI, mencionados en la Recomendación #2 original:** confirmado que Coach (`RuleRecommendationProvider`/`CoachRecommendationProvider`, tocados extensamente en AR-036) sigue
  siendo puramente basado en reglas, sin ningún componente de AI real — la advertencia de la auditoría
  ("esto es un bloqueador estructural para cualquier trabajo real de Coach/AI") todavía no se ha puesto
  a prueba, porque ese trabajo real de AI (AR-050) tampoco ha comenzado.

### Respuesta a la pregunta de framing

> **El hallazgo sigue completamente vigente, sin ninguna resolución parcial.** AR-043 introdujo un
> nuevo consumidor de `identityId` (Authentication) pero, por una decisión de diseño explícita y
> correcta en sus propios términos (D-043.1, independencia de bounded contexts), **no tocó ni resolvió
> la ausencia de un módulo de backend para `Identity`** — de hecho, añadió un segundo lugar del código
> donde `identityId` circula sin verificación contra el aggregate real, reforzando el patrón que la
> auditoría señaló, no corrigiéndolo.

**Consecuencia para el alcance de AR-030:** ninguna reducción — el alcance es exactamente el que
describía la auditoría original: introducir el módulo de backend de `Identity` que hoy no existe. A
diferencia de AR-024, aquí no hay una decisión ya operativa esperando formalización — la ausencia es
real y total, confirmada por `git log` desde el primer día del proyecto.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

AR-030 presenta un patrón distinto al de AR-024: la evidencia no muestra una decisión implícita
pendiente de formalizar — muestra **una ausencia de concepto de dominio** que ya empieza a afectar a
más de un módulo. Observación clave: AR-043 no creó deuda, simplemente hizo más visible una deuda ya
existente.

**H1 (principal):** _"El sistema necesita que `Identity` deje de ser un identificador opaco y pase a
constituir un agregado de dominio explícito con invariantes propias, de modo que las referencias
mediante `identityId` tengan un significado verificable dentro del modelo de dominio."_ Respaldada por
la evidencia de Fase 1: existe un identificador ampliamente utilizado, no existe el aggregate que le da
significado, y el número de consumidores está creciendo (Authentication es el segundo).

**Hipótesis alternativas descartadas:**

- **H2** — Authentication debería validar directamente contra Identity. Descartada: contradice
  explícitamente D-043.1; Authentication resolvió un problema distinto (autenticación y sesión), no la
  existencia del aggregate de identidad.
- **H3** — el problema es únicamente de validación de cadenas (`string`). Descartada: el tipo del
  identificador es un síntoma; la ausencia del aggregate es el problema arquitectónico.
- **H4** — puede mantenerse indefinidamente un `identityId` sin aggregate mientras exista una
  convención común. Descartada: las convenciones no sustituyen invariantes de dominio; cuantos más
  consumidores aparezcan, mayor la dependencia de una regla que hoy no está materializada.

**H1 sobrevive.** El problema no consiste en validar un identificador — consiste en que el dominio
todavía no posee la entidad que justifica la existencia de ese identificador.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

No se decide todavía cómo será `Identity` — eso pertenece al diseño. Se congela únicamente la
propiedad arquitectónica.

**D-030.1:** _"Todo identificador compartido que represente una entidad de dominio y sea utilizado
como fundamento de relaciones entre múltiples capacidades del sistema debe corresponder a un agregado
de dominio explícito que defina su identidad e invariantes."_

**No fija deliberadamente:** la estructura de `Identity`, sus atributos, sus relaciones, el mecanismo
de persistencia, ni el modelo de autenticación. Solo establece una propiedad: los identificadores
compartidos no pueden ser conceptos vacíos dentro del dominio. Mismo patrón que
D-002.1/D-009.1/D-036.1/D-004.1/D-024.1/D-043.1/D-054.1/D-044.1-3.

**Aspecto a vigilar en Fase 4A, registrado de antemano:** mantener estricta la separación con AR-043 —
Authentication seguirá autenticando, Identity deberá representar la identidad del dominio; ninguno debe
absorber al otro. El diseño no debe partir de los consumidores actuales (`Session`, `Credential`,
etc.) — el aggregate `Identity` debe modelarse desde sus propias responsabilidades e invariantes; los
consumidores se adaptan a ese modelo, no al revés.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**AR-030 es, hasta ahora, la primera remediación cuyo núcleo es el diseño de un nuevo aggregate de
dominio, no la corrección de uno existente.** Cualquier decisión innecesaria aquí condicionaría
capacidades futuras.

**Pregunta que gobierna esta fase (deliberadamente no formulada como "¿cómo representamos Identity?"):**

> **¿Cuál es el conjunto mínimo de responsabilidades e invariantes que justifican la existencia de un
> aggregate `Identity` independiente?**

Esto obliga a modelar el aggregate desde el dominio, no desde los consumidores actuales.

### Alternativas evaluadas

- **A — Identity como simple contenedor de `identityId`.** Descartada: no resuelve D-030.1 — seguiría
  existiendo un identificador sin comportamiento ni invariantes.
- **B — Fusionar Identity con Authentication.** Descartada: contradice directamente D-043.1 y mezcla
  dos responsabilidades distintas (Authentication demuestra quién accede; Identity representa quién es
  la entidad dentro del dominio).
- **C — Identity construido alrededor de Session/Credential.** Descartada: los consumidores actuales no
  deben definir el modelo de dominio — invertiría la dependencia arquitectónica.
- **D — Identity como aggregate autónomo (elegida).** El aggregate existe porque el dominio lo
  necesita, no porque otros módulos lo referencian. Los consumidores (Authentication, perfiles, futuras
  capacidades) dependen de ese modelo, nunca al revés.

### Diseño congelado

No se congelan atributos concretos — se congelan responsabilidades:

> **Identity es un agregado de dominio autónomo cuya responsabilidad es representar una identidad
> consistente dentro del sistema, definiendo sus propias invariantes y sirviendo como punto de
> referencia para las relaciones entre capacidades, sin incorporar responsabilidades de autenticación,
> autorización o gestión de sesiones.**

Deja deliberadamente abierto: atributos, persistencia, APIs, eventos, repositorios — eso pertenece a
la implementación.

### Relación con Authentication

Dependencia unidireccional: Authentication puede referenciar una `Identity`; Identity no debe conocer
Authentication. Preserva la separación ya establecida en AR-043/D-043.1.

### Alcance fijado para Fase 4B

- Creación del aggregate `Identity` (ya existe a nivel de dominio — confirmar si necesita ajustes para
  cumplir las invariantes mínimas fijadas aquí, o si ya las cumple).
- Definición de sus invariantes mínimas.
- Adaptación de referencias para que apunten al aggregate real cuando corresponda.
- **Ninguna incorporación de lógica de autenticación, credenciales o sesiones.**

### Criterio de validación para Fase 5

1. ¿Existe ahora un aggregate `Identity` explícito en el dominio?
2. ¿`identityId` deja de ser un identificador sin significado y pasa a referenciar ese aggregate?
3. ¿Authentication continúa separado y no transfiere responsabilidades al nuevo aggregate?
4. ¿Las invariantes de `Identity` están definidas dentro del propio aggregate, no repartidas entre
   consumidores?
5. ¿Los consumidores dependen de `Identity` sin definir su comportamiento?

### Observación registrada (no promovida)

AR-030 tiene el potencial de convertirse en una AR fundacional — a diferencia de otras remediaciones,
no corrige una representación existente, introduce un concepto de dominio que servirá de base para
capacidades futuras. El éxito del diseño depende más de mantener el aggregate pequeño, cohesionado y
con responsabilidades bien delimitadas que de anticipar todos los usos futuros de la identidad.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

Implementación deliberadamente conservadora: materializar el aggregate en el sistema en ejecución, no
completar la visión futura de identidad.

### 1. Aggregate `Identity`

Confirmado (no modificado): `packages/domain/src/identity/aggregate/identity.ts` ya cumplía las
invariantes mínimas fijadas en Fase 4A — Value Objects propios (`Email`, `DisplayName`,
`PreferredLanguage`, `PreferredTimeZone`) que validan en su propio constructor, `register()`/`update()`
como única superficie de mutación, cero referencias a `Session`/`Credential`/`Authentication`. No se
añadió ningún atributo nuevo — no había ningún consumidor concreto pidiendo uno, y la regla fijada en
Fase 4A es explícita: un atributo que exista solo para satisfacer a un consumidor no pertenece al
aggregate.

### 2. Módulo de backend (lo que no existía)

Nuevo `apps/backend/src/identity/`:

- `infrastructure/in-memory-identity.repository.ts` — implementa `IdentityRepository`
  (`save`/`findById`), mismo patrón que `InMemoryCredentialRepository`.
- `application/commands/register-identity.{command,handler}.ts` — la capacidad de crear una
  `Identity` real: construye los Value Objects, invoca `Identity.register()`, persiste, publica el
  evento. Sin controller HTTP — no hay ningún requisito documentado que pida una API pública todavía
  (misma postura que adoptó `RegisterCredentialHandler` en AR-043 Paso 2: la capacidad, no un
  compromiso con un llamador concreto).
- `identity.module.ts` — registra `InMemoryIdentityRepository` bajo el token `'IdentityRepository'`,
  importado en `apps/backend/src/app.module.ts`. Esto es, literalmente, lo que el hallazgo original
  decía que no existía: ahora hay un `IdentityModule` en el árbol de módulos en ejecución.

### 3. Adaptación de referencias — por qué no se tocó Authentication

Fase 4A dejó esto condicionado a "cuando corresponda". Se investigó el único consumidor real de
`identityId` hoy: `AuthenticationController.register()` (`apps/backend/src/authentication/api/
authentication.controller.ts:65-66`) genera `identityId = randomUUID()` sin invocar ningún aggregate.

**No se adaptó ese punto.** Razón: `Identity.register()` exige `email`, `displayName`,
`preferredLanguage` y `preferredTimeZone` — el DTO de registro de Authentication
(`RegisterCredentialDto`) solo recoge `loginIdentifier` y `secret`, deliberadamente, porque ese
endpoint (AR-043 Paso 2) **no es un flujo de alta pública**, es solo aprovisionamiento de credencial.
Fabricar `displayName`/`preferredLanguage`/`preferredTimeZone` con valores por defecto para poder
llamar a `Identity.register()` habría significado inventar datos de perfil enriquecido — exactamente lo
que esta AR excluye explícitamente de su alcance. Adaptar esa referencia sin datos reales de dominio no
habría materializado D-030.1, lo habría simulado.

### 4. Exclusiones respetadas

Ningún cambio en `Session`, `Credential`, `authentication.module.ts`, ni en ningún handler de
Authentication. `grep` confirma cero imports cruzados entre `identity/` y `authentication/` en ambas
direcciones salvo el comentario ya existente (`authentication.module.ts:16`).

---

## Fase 5 — Validación

**Estado: ✅ Validada.**

### Comprobaciones estructurales

1. **¿Existe un aggregate `Identity` con invariantes propias?** Sí — ya existía, confirmado sin
   cambios; ahora además tiene un punto de materialización real en el backend (`IdentityModule`).
2. **¿Depende de Authentication?** No. `grep -rn "authentication" apps/backend/src/identity/` → cero
   resultados.

### Comprobación de dirección de dependencia

`grep` sobre `apps/backend/src/authentication/` no muestra ningún import de `identity/`,
`IdentityRepository` ni `IdentityModule` — solo coincidencias léxicas no relacionadas
(`ValidatedIdentity`, campo `identityId`). Es decir: la dependencia unidireccional (Authentication →
Identity, nunca al revés) queda disponible pero, hoy, **ningún lado la ejercita todavía** — consistente
con no haber forzado la adaptación de Authentication (punto 3 de Fase 4B).

### Las 5 preguntas de dominio (Fase 4A)

1. **¿Puede explicarse `Identity` sin mencionar Authentication?** Sí — el aggregate representa una
   identidad de dominio (email, nombre, idioma, zona horaria); nada en su código o su test menciona
   sesión, credencial o autenticación.
2. **¿Las invariantes pertenecen exclusivamente al aggregate?** Sí — las cuatro validan en su propio
   constructor (Value Object), no en ningún consumidor.
3. **¿Los consumidores referencian una entidad de dominio real, no un string opaco?** Parcialmente: la
   capacidad de hacerlo existe y está probada (`RegisterIdentityHandler` + `InMemoryIdentityRepository`,
   4/4 tests); el único consumidor real actual (Authentication) sigue sin ejercitarla, por la razón de
   diseño documentada en el punto 3 de Fase 4B — no por una limitación del aggregate o del módulo.
4. **¿El aggregate se mantiene pequeño y cohesionado?** Sí — cero atributos nuevos, cero
   responsabilidades nuevas.
5. **¿Se evitó anticipar necesidades futuras?** Sí — no se construyó API pública, ni perfil
   enriquecido, ni lógica de autenticación; solo la capacidad mínima de crear y persistir el aggregate.

### Evidencia de ejecución (no solo inspección)

- `pnpm --filter backend test` → **143/143 passing** (incluye los 4 tests nuevos de `identity/`:
  registro válido, rechazo de email inválido vía el Value Object, guardado/recuperación por id,
  `findById` de un id inexistente devuelve `null`).
- `pnpm --filter backend build` → compila sin errores (`nest build`, `tsc` limpio).

### Observación registrada (no promovida a hallazgo)

El punto 3 de la pregunta de dominio #3 queda parcial de forma consciente, no por omisión: es la misma
clase de precisión de alcance que AR-002 registró con `enforce_admins` — una AR puede clausurar su
diseño (D-030.1) sin migrar a todos los consumidores existentes, cuando migrar exigiría violar una
exclusión explícita de su propio alcance (aquí: perfiles enriquecidos). Si en el futuro Authentication
necesita un flujo de alta real con datos de perfil, esa es una decisión de producto de
**AR-043/Authentication**, no una tarea pendiente de AR-030.

---

## Estado

**Fase 1, Fase 2A, Fase 2B, Fase 4A, Fase 4B y Fase 5 cerradas. AR-030 cerrada.** El hallazgo original
("Identity domain-complete, integration-incomplete... no `IdentityModule` anywhere in `app.module.ts`")
queda resuelto en su forma mínima y correcta: el aggregate ya existía y no necesitó cambios; ahora
también existe su límite de aplicación en el backend en ejecución (`IdentityModule`, registrado,
probado). La adaptación de `Authentication` se evaluó explícitamente y se descartó por una razón de
diseño documentada, no por alcance insuficiente. Dependencia unidireccional Authentication → Identity
preservada (D-043.1 intacta). 143/143 tests backend passing, build limpio. Decisión: ✅ Decisión
aprobada → ✔️ Validada.
