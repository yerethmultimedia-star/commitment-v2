# FASE 6.3 — CATÁLOGO DE COMANDOS (COMMAND SPECIFICATION CATALOG)
**Versión:** 2.0 (Definitiva y Documento Congelado con Envelopes de Aplicación)  
**Fecha:** Junio 2026  
**Estado:** Contrato y Especificación de Comandos de Aplicación (Fase 6.3)  

---

## ✉️ 1. EL ENVELOPE COMÚN DE METADATA (ESTÁNDAR DE COMANDOS)

Todos los comandos enviados al Dominio de Commitment desde cualquier cliente (Móvil, Web) o servicio interno deben encapsularse obligatoriamente en el siguiente envelope común:

```json
{
  "commandId": "UUIDv7 (Identificador único del comando)",
  "commandVersion": "Int (Versión evolutiva del payload del comando, ej. 1)",
  "issuedAt": "Timestamp ISO 8601 (Hora de emisión en el cliente)",
  "actorId": "UUIDv7 (Identificador del usuario u operador de sistema)",
  "actorType": "String ('USER' | 'SYSTEM' | 'AI_PROPOSAL')",
  "correlationId": "UUIDv7 (Id para trazar el flujo de ejecución completo)",
  "causationId": "UUIDv7 (Id del evento o comando detonante, opcional)",
  "deviceId": "String (Identificador único del dispositivo cliente)",
  "clientVersion": "String (Versión de la app cliente, ej. '1.0.4')",
  "locale": "String (Idioma y región del cliente, ej. 'es-ES')",
  "timeZone": "String (Huso horario del cliente, ej. 'Europe/Madrid')",
  "payload": {
    "//": "Datos específicos del comando de aplicación"
  }
}
```

---

## ⚙️ 2. PROTOCOLO COMÚN DE VALIDACIÓN Y CONSISTENCIA

Los comandos siguen una validación estricta en dos capas:
1.  **Validación Sintáctica (Capa de Aplicación):** Control de tipos, obligatoriedad y estructura básica del JSON.
2.  **Validación Semántica (Capa de Dominio):** Verificación por el Agregado de precondiciones e invariantes.

---

## 📝 3. ESPECIFICACIÓN DETALLADA DE COMANDOS CORE

A continuación se especifican los 3 comandos principales de la capa de aplicación:

### 📍 COMANDO 1: `EjecutarMicroaccion` (Human Command)
*   **Nombre Canónico:** `commitment.execution.execute_microaction`
*   **Actor Autorizado:** `Usuario` (Soberano) | **Autorización Requerida:** `Self (Propietario del Compromiso)`
*   **Bounded Context:** *Commitment Lifecycle & Execution Context*
*   **Aggregate Destino:** `Compromiso` (Root)
*   **Nivel de Consistencia:** `Inmediata` (El usuario espera ver el check en la UI en <200ms).
*   **Efectos Secundarios:**
    *   Invalida caché local de `PresenteView`.
    *   Actualiza proyecciones `PresenteView` y `ConstanciaDashboard`.
    *   Suma +1 a la métrica `executionTime` en telemetría.
*   **Política de Reintento & Timeout:**
    *   *Timeout:* 4000 ms.
    *   *Retry Policy:* `Exponential` (Máx 5 reintentos, delay inicial 500ms, backoff 2.0).
*   **Payload del Comando:**
    *   `commitmentId`: UUIDv7 (Obligatorio).
    *   `microactionId`: UUIDv7 (Obligatorio).
    *   `executionTimeSeconds`: Int (Opcional).
*   **Validaciones Sintácticas:** IDs UUIDv7 correctos. `executionTimeSeconds` positivo.
*   **Validaciones de Negocio (Precondiciones):**
    *   El Compromiso debe estar en estado `Activo` o `Recuperandose`.
    *   La Microacción debe existir en estado `Pendiente` para la fecha de hoy.
*   **Invariantes que Protege:** Impedir la compleción de microacciones de días futuros.
*   **Eventos Generados:** `MicroaccionEjecutada`.
*   **Errores de Dominio Posibles:** `ErrMicroactionNotFound`, `ErrInvalidCommitmentState`, `ErrMicroactionAlreadyCompleted`.
*   **Política de Idempotencia:** Descartar silenciosamente si el `microactionId` ya está registrado en el Stream histórico de eventos con éxito.
*   **Ejemplo JSON:**
    ```json
    {
      "commandId": "018f6b5c-42e1-7000-8000-000000000010",
      "commandVersion": 1,
      "issuedAt": "2026-06-30T08:00:00.000Z",
      "actorId": "018f6b5c-42e1-7000-8000-111111111111",
      "actorType": "USER",
      "correlationId": "018f6b5c-42e1-7000-8000-aaaa22222222",
      "causationId": "018f6b5c-42e1-7000-8000-bbbb33333333",
      "deviceId": "iPhone-15-Pro-018f",
      "clientVersion": "1.0.0",
      "locale": "es-ES",
      "timeZone": "Europe/Madrid",
      "payload": {
        "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
        "microactionId": "018f6b5c-42e1-7000-8000-777777777777",
        "executionTimeSeconds": 45
      }
    }
    ```

---

### 📍 COMANDO 2: `RegistrarFriccion` (System Command)
*   **Nombre Canónico:** `resilience.friction.register_friction`
*   **Actor Autorizado:** `Sistema (ResilienceEvaluator)`
*   **Bounded Context:** *Resilience & Adaptation Context*
*   **Aggregate Destino:** `RegistroDeFriccion` (Root)
*   **Nivel de Consistencia:** `Eventual` (Procesado asíncronamente en segundo plano).
*   **Efectos Secundarios:**
    *   Actualiza proyecciones del motor adaptativo de resiliencia.
    *   Gatilla el algoritmo de cálculo de micro-acción de rescate (Trigger #5).
*   **Política de Reintento & Timeout:**
    *   *Timeout:* 8000 ms.
    *   *Retry Policy:* `Exponential` (Máx 3 reintentos).
*   **Payload del Comando:**
    *   `commitmentId`: UUIDv7.
    *   `lastActivityTimestamp`: Timestamp ISO 8601.
    *   `rescheduleCount`: Int.
*   **Eventos Generados:** `FriccionDetectada`.

---

### 📍 COMANDO 3: `AceptarRescate` (Human Command)
*   **Nombre Canónico:** `resilience.rescue.accept_rescue`
*   **Actor Autorizado:** `Usuario` (Soberano) | **Autorización Requerida:** `Self`
*   **Bounded Context:** *Resilience & Adaptation Context*
*   **Aggregate Destino:** `RegistroDeFriccion` (Root)
*   **Nivel de Consistencia:** `Inmediata` (El usuario espera ver la pantalla de Modo Rescate disiparse al instante).
*   **Efectos Secundarios:**
    *   Invalida caché de proyecciones diarias.
    *   Genera actualización en `BibliotecaDeVidaView` (Bounce-back Ledger).
*   **Política de Reintento & Timeout:**
    *   *Timeout:* 4000 ms.
    *   *Retry Policy:* `Exponential` (Máx 5 reintentos).
*   **Payload del Comando:**
    *   `commitmentId`: UUIDv7.
    *   `friccionId`: UUIDv7.
    *   `rescueActionId`: UUIDv7.
*   **Eventos Generados:** `VictoriaDeRegresoRegistrada`.

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)
*   **Riesgo de Conflictos por Clientes con Versiones de Comando Desactualizadas:** Que un cliente con `clientVersion` antigua envíe un comando v1 cuando el servidor espera v2. *(Mitigación: El backend implementará un intermediario de traducción / upcaster de comandos que normaliza DTOs antiguos basándose en el campo `commandVersion` antes de enviarlo al Dominio).*

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)
*   *Hipótesis 1:* Asumimos que los tiempos de reintento exponencial manejan el 99.9% de los fallos de red en modo offline de forma transparente para el usuario.

### 3. 🧪 Experimentos Futuros (¿Cómo lo comprobaremos en el MVP?)
*   **Simulación de Caída de Red en Check-in:** Forzar fallos de red continuos durante la ejecución de microacciones y validar que la cola de comandos local (`Command Queue`) ejecute los reintentos correctos sin duplicar los eventos en Supabase.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

*   **¿Puede implementarse sin ambigüedad?** Sí. Los envelopes, políticas de reintento y niveles de consistencia están definidos estrictamente.
*   **¿Es independiente del proveedor tecnológico?** Sí. Payload y metadatos definidos en formato DTO puro JSON.
*   **¿Soporta offline y versionado?** Sí. Mediante `commandVersion` y cola local offline con persistencia idempotente.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — COMMAND CATALOG v2.0**
