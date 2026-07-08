# Architecture Review

## Checklist

- [ ] **Aggregate Ownership:** Aggregate is the exclusive owner of lifecycle and transition rules.
- [ ] **Lean Handlers:** Command Handlers orchestrate only, no domain-level decisions.
- [ ] **Event Integrity:** Exactly one Domain Event is emitted per real state transition.
- [ ] **CQRS Read Model:** Query Handlers never reconstruct a view from aggregates; they always read from a projection (eventually consistent).
- [ ] **Inter-Module Integration:** Event-consuming modules (Notifications, Analytics, etc.) never invoke aggregates or repositories from other modules directly. Integration is strictly via Domain Events or explicit contracts.

### Contexto de Devices

1. **Identidad no es un Push Token.** El contexto de dispositivos gestiona plataformas y tokens. Notificaciones debe proyectar esa información consumiendo eventos, no haciéndole consultas síncronas a Devices.
2. **Single Responsibility Providers.** Los Notification Providers actúan estrictamente como canales (envían un mensaje). Nunca orquestan lógica, no administran estado, ni consultan bases de datos.

### Contexto de Messaging (Outbox)

1. **Aggregates Ignorance.** Ningún Aggregate conoce la existencia del Outbox. Los agregados producen _Domain Events_; es la capa de aplicación quien mapea a _Integration Messages_ y los deposita en el Outbox.
2. **Read Only Adapters.** Los adaptadores de mensajería (Message Brokers, Outbox Publishers) nunca modifican el estado de dominio de la aplicación.
3. **No Direct Publishing.** Ningún Worker o Application Service publica mensajes directamente al broker sin pasar por el Outbox.
4. **Integration Messages vs Domain Events.** Los Integration Messages son contratos públicos para cruzar Bounded Contexts. Los Domain Events son contratos internos. Nunca deben reutilizarse como la misma clase para evitar el acoplamiento y facilitar el versionado.

- [ ] **Agnostic Execution Engines:** Execution Engines never contain business rules. Their only responsibility is to transport work to a Worker.
- [ ] **Single Responsibility Providers:** Notification Providers must be strictly "channels" that only know how to send messages (`send(NotificationMessage)`). They must never orchestrate or manage state.
- [ ] **Dependency Injection:** Handlers rely on abstract types/interfaces (`import type`).
- [ ] **Pipeline:** Lint, build, and tests are completely green.
