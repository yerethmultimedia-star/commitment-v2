# FASE 6.2 — CATÁLOGO COMPLETO DE EVENTOS (EVENT CATALOG)
**Versión:** 2.0 (Definitiva y Documento Congelado con Clasificaciones Contractuales)  
**Fecha:** Junio 2026  
**Estado:** Contrato y Especificación de Eventos de Dominio (Fase 6.2)  

---

## ✉️ 1. EL ENVELOPE COMÚN DE METADATA (ESTÁNDAR DE EVENTOS)

Todos los eventos del dominio persistidos en el *Event Store* comparten obligatoriamente la siguiente estructura envolvente:

```json
{
  "eventId": "UUIDv7 (Identificador único del evento)",
  "aggregateId": "UUIDv7 (Identificador del agregado raíz)",
  "aggregateVersion": "Int (Versión secuencial del agregado)",
  "eventVersion": "Int (Versión evolutiva del payload del evento, ej. 1)",
  "occurredAt": "Timestamp ISO 8601 (Hora real del suceso en cliente)",
  "recordedAt": "Timestamp ISO 8601 (Hora de registro en servidor)",
  "actorType": "String ('USER' | 'SYSTEM' | 'AI_PROPOSAL')",
  "actorId": "UUIDv7 (Identificador del actor que gatilló el evento)",
  "correlationId": "UUIDv7 (Id de correlación para trazar flujos completos)",
  "causationId": "UUIDv7 (Id del evento/comando causante)",
  "tenantId": "UUIDv7 (Identificador de inquilino si aplica, por defecto nulo)",
  "payload": {
    "//": "Datos específicos del evento de dominio"
  }
}
```

---

## 🏷️ 2. TAXONOMÍA Y CLASIFICACIÓN DE EVENTOS

Para organizar e integrar el Event Store de forma robusta, clasificamos los eventos por tres dimensiones inmutables:

### A. Clasificación por Naturaleza (Categorías del Dominio)
1.  **Lifecycle Events:** `CompromisoConcebido`, `PactoActivado`, `CompromisoCompletado`, `CompromisoCanceladoConsciente`.
2.  **Execution Events:** `MicroaccionProgramada`, `MicroaccionEjecutada`, `MicroaccionPostergada`.
3.  **Resilience Events:** `FriccionDetectada`, `RescateOfrecido`, `VictoriaDeRegresoRegistrada`.
4.  **Identity Events:** `ValoresDefinidos`, `RitmoRe-calculado`, `ContextoModificado`.
5.  **Library Events:** `ReflexionRegistrada`, `CapsulaInmortalizada`.
6.  **Support Network Events:** `InvitacionGenerada`, `MensajeRecibido`.

### B. Clasificación por Ámbito y Visibilidad
*   **Internal Event:** Consumido únicamente dentro del Bounded Context emisor (ej. `MicroaccionProgramada`).
*   **Integration Event:** Publicado al bus de eventos público para ser escuchado por otros contextos (ej. `CompromisoCompletado` escuchado por `Wisdom Context`).
*   **Audit Event:** Conservado únicamente con fines históricos y de depuración forense.
*   **Telemetry Event:** Eventos analíticos consumidos por `Insights & Analytics Context`.

### C. Clasificación de Datos (Privacidad / GDPR)
*   **Public:** Sin datos identificables (ej. ID de Blueprint N3).
*   **Internal:** Datos internos de operación no sensibles.
*   **Confidential:** Datos no indexables (IDs internos).
*   **Sensitive / Highly Sensitive:** Notas personales, anclas de identidad y reflexiones. **Deben ser cifrados en reposo en el Event Store** (GDPR Compliance).

---

## 📝 3. ESPECIFICACIÓN DETALLADA DE EVENTOS CORE

A continuación se especifican los 3 eventos nucleares de Commitment que sirven como contrato técnico:

### 📍 EVENTO 1: `CompromisoConcebido` (Lifecycle Event)
*   **Nombre Canónico:** `commitment.lifecycle.conceived`
*   **Bounded Context:** *Commitment Lifecycle & Execution Context*
*   **Aggregate Propietario:** `Compromiso` (Root)
*   **Comando Originador:** `ConcebirCompromiso`
*   **Precondiciones:** El usuario ha completado el onboarding y validado la intención de identidad.
*   **Ámbito:** `Integration Event` | **Estabilidad:** `Stable`
*   **Política de Replay:** `Replay Always` (Obligatorio para proyectar el estado en hidratación).
*   **Sensibilidad de Datos:** `Highly Sensitive` (El campo `identityAnchor` debe ser cifrado en reposo).
*   **Esquema de Payload:**
    *   `commitmentId`: UUIDv7.
    *   `userId`: UUIDv7.
    *   `identityAnchor`: String (El porqué).
    *   `initialBlueprintId`: UUIDv7 (Opcional).
*   **Consumidores Autorizados:** `Resilience Context`, `Wisdom Context`.
*   **Proyecciones Afectadas:** `TableroCompromisosView`.
*   **Política de Idempotencia:** Ignorar si el `commitmentId` ya existe en el Stream.
*   **Ejemplo JSON:**
    ```json
    {
      "eventId": "018f6b5c-42e1-7000-8000-000000000001",
      "aggregateId": "018f6b5c-42e1-7000-8000-999999999999",
      "aggregateVersion": 1,
      "eventVersion": 1,
      "occurredAt": "2026-06-30T00:15:00.000Z",
      "recordedAt": "2026-06-30T00:15:02.000Z",
      "actorType": "USER",
      "actorId": "018f6b5c-42e1-7000-8000-111111111111",
      "correlationId": "018f6b5c-42e1-7000-8000-aaaa22222222",
      "causationId": "018f6b5c-42e1-7000-8000-bbbb33333333",
      "payload": {
        "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
        "userId": "018f6b5c-42e1-7000-8000-111111111111",
        "identityAnchor": "Convertirme en un padre más presente y paciente."
      }
    }
    ```
*   **Caso de Prueba (Given-When-Then):**
    *   *Given:* Un usuario con ID `UserId` y un Ancla de Identidad válida.
    *   *When:* Se procesa el comando `ConcebirCompromiso`.
    *   *Then:* El agregado emite el evento `CompromisoConcebido` con versión `1` y estado `Borrador`.

---

### 📍 EVENTO 2: `MicroaccionEjecutada` (Execution Event)
*   **Nombre Canónico:** `commitment.execution.microaction_executed`
*   **Bounded Context:** *Commitment Lifecycle & Execution Context*
*   **Aggregate Propietario:** `Compromiso` (Root)
*   **Comando Originador:** `EjecutarMicroaccion`
*   **Precondiciones:** La micro-acción debe estar en estado `Pendiente` y tener fecha efectiva del día de hoy.
*   **Ámbito:** `Integration Event` | **Estabilidad:** `Stable`
*   **Política de Replay:** `Replay Always`
*   **Sensibilidad de Datos:** `Confidential`
*   **Esquema de Payload:**
    *   `microactionId`: UUIDv7.
    *   `commitmentId`: UUIDv7.
    *   `executionTimeSeconds`: Int (Tiempo que tomó completar la acción).
*   **Consumidores Autorizados:** `Resilience Context`, `Insights & Analytics Context`.
*   **Proyecciones Afectadas:** `PresenteView` (Home Screen), `ConstanciaDashboard`.
*   **Política de Idempotencia:** Rechazar ejecuciones duplicadas para el mismo `microactionId`.
*   **Ejemplo JSON:**
    ```json
    {
      "eventId": "018f6b5c-42e1-7000-8000-000000000002",
      "aggregateId": "018f6b5c-42e1-7000-8000-999999999999",
      "aggregateVersion": 4,
      "eventVersion": 1,
      "occurredAt": "2026-06-30T08:00:00.000Z",
      "recordedAt": "2026-06-30T08:00:01.000Z",
      "actorType": "USER",
      "actorId": "018f6b5c-42e1-7000-8000-111111111111",
      "correlationId": "018f6b5c-42e1-7000-8000-aaaa22222222",
      "causationId": "018f6b5c-42e1-7000-8000-cccc44444444",
      "payload": {
        "microactionId": "018f6b5c-42e1-7000-8000-777777777777",
        "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
        "executionTimeSeconds": 45
      }
    }
    ```

---

### 📍 EVENTO 3: `VictoriaDeRegresoRegistrada` (Resilience Event)
*   **Nombre Canónico:** `resilience.rescue.victory_of_return_recorded`
*   **Bounded Context:** *Resilience & Adaptation Context*
*   **Aggregate Propietario:** `RegistroDeFriccion` (Root)
*   **Comando Originador:** `AceptarRescate`
*   **Precondiciones:** El compromiso debe estar en estado `EnFriccion` y la micro-acción debe haberse adaptado a su versión atómica de 60s.
*   **Ámbito:** `Integration Event` | **Estabilidad:** `Stable`
*   **Política de Replay:** `Replay Always`
*   **Sensibilidad de Datos:** `Confidential`
*   **Esquema de Payload:**
    *   `commitmentId`: UUIDv7.
    *   `friccionId`: UUIDv7.
    *   `rescueActionId`: UUIDv7.
*   **Consumidores Autorizados:** `Commitment Context` (Transiciona a `Recuperandose`), `Wisdom Context` (Suma evidencia de resiliencia).
*   **Proyecciones Afectadas:** `BibliotecaDeVidaView`.
*   **Ejemplo JSON:**
    ```json
    {
      "eventId": "018f6b5c-42e1-7000-8000-000000000003",
      "aggregateId": "018f6b5c-42e1-7000-8000-888888888888",
      "aggregateVersion": 2,
      "eventVersion": 1,
      "occurredAt": "2026-06-30T09:30:00.000Z",
      "recordedAt": "2026-06-30T09:30:03.000Z",
      "actorType": "USER",
      "actorId": "018f6b5c-42e1-7000-8000-111111111111",
      "correlationId": "018f6b5c-42e1-7000-8000-aaaa22222222",
      "causationId": "018f6b5c-42e1-7000-8000-dddd55555555",
      "payload": {
        "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
        "friccionId": "018f6b5c-42e1-7000-8000-888888888888",
        "rescueActionId": "018f6b5c-42e1-7000-8000-555555555555"
      }
    }
    ```

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — EVENT CATALOG v2.0**
