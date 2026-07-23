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

## Estado

**Fase 1 cerrada.** El hallazgo se confirma completamente vigente, sin ninguna corrección ni resolución
parcial desde la auditoría — ni siquiera por AR-043, que tocó el mismo concepto central (`identityId`)
pero, por diseño deliberado, no resolvió la ausencia de un módulo de backend de `Identity`. El dominio de
`Identity` no ha cambiado desde el primer commit del proyecto (2026-07-04). Estado: ⬜ → 🟦 En análisis.
Decisión: pendiente Fase 2A (Owner=Claude — ejecución directa; la fase de decisión trata sobre todo el
alcance mínimo del módulo de backend, no un juicio estratégico de producto).
