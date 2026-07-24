# FASE 6.7 — ESTRATEGIA OFFLINE Y MOTOR DE SINCRONIZACIÓN (SYNC ENGINE)

**Versión:** 1.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Especificación Técnica del Motor de Sincronización Local-Nube (Fase 6.7)

---

> **AR-003, D-003.1 — Clasificación: Histórico (íntegro).** Escrito para Flutter (§1); AR-001
> confirmó React Native+Expo como stack oficial. Cero opción normativa viva, cero evidencia
> reutilizada. Ver `docs/02-domain/CLASSIFICATION_STATUS.md`.

---

## 🏛️ 1. ARQUITECTURA OFFLINE-FIRST EXTREMO A EXTREMO

Commitment opera bajo la premisa de que **la red es un estado transitorio y no confiable**. La aplicación móvil funciona de forma idéntica con o sin conexión a internet.

```
[ FRONTEND / UI ] ──► (Lee/Escribe) ──► [ LOCAL SQLITE / SQLCIPHER ]
                                                │
                                                ▼ (Outbox local guarda comandos/eventos)
                                          [ LOCAL OUTBOX ]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼ (Sin red)                                                   ▼ (Con red)
         [ ESPERA SILENCIOSA ]                                         [ SYNC ENGINE PROCESSOR ]
                                                                               │
                                                                               ▼ (Sincroniza)
                                                                       [ SUPABASE / NUBE ]
```

### Tecnologías de Persistencia Local:

- **Local Event Store & Read Models:** Implementados en la base de datos local **SQLite** del dispositivo, cifrada mediante **SQLCipher** utilizando una clave derivada de la clave del usuario por razones de privacidad y seguridad física.

---

## 🔄 2. EL ALGORITMO DE SINCRONIZACIÓN CLIENTE-SERVIDOR

El motor de sincronización se basa en el **Outbox Pattern del Cliente** y el **Inbox Pattern del Servidor** para garantizar la consistencia eventual y evitar duplicaciones.

### Paso 1: Escritura Local

1.  El usuario emite un comando (ej. `EjecutarMicroaccion`).
2.  El agregado local valida el comando y emite el evento localmente en el SQLite local.
3.  El evento y el comando se encolan transaccionalmente en la tabla `local_outbox` en estado `PENDING`.
4.  La interfaz de usuario se actualiza inmediatamente de forma optimista (<50ms).

### Paso 2: Ejecución del Sincronizador (Sync Engine)

Al detectar conectividad, el Sync Engine despierta y ejecuta:

1.  **Descarga (Pull Phase):** Consulta al servidor por nuevos eventos grabados en la nube con `aggregate_version` superior al `LastProcessedVersion` del agregador en local.
2.  **Inbox Check (Deduplicación):** El cliente aplica los eventos de la nube en su base local ignorando duplicaciones mediante el ID único de los eventos (`eventId`).
3.  **Subida (Push Phase):** Si no hay conflictos, el cliente envía por orden en lotes los comandos/eventos pendientes en `local_outbox` al servidor.
4.  **Confirmación:** El servidor responde éxito y el cliente marca los eventos locales en `local_outbox` como `PROCESSED`.

---

## 🧭 3. MÁQUINA DE ESTADOS DE SINCRONIZACIÓN (SYNC FSM)

El Sync Engine opera mediante un ciclo de estados controlado en Flutter:

```
          ┌──────────────────────────► [ Offline ]
          │                               │
          │ (Pérdida de red)              │ (Conexión detectada)
          │                               ▼
    [ Online ] ◄──────────────────── [ Syncing ] ──► (OCC Conflict) ──► [ Conflict ]
          ▲                                                                   │
          │                                                                   │ (Concilia)
          └────────────────────────── [ Recovered ] ◄─────────────────────────┘
```

- **`Offline`:** El cliente opera localmente sobre SQLite. Los eventos de subida se acumulan en `local_outbox`.
- **`Syncing`:** Conexión activa. Sincronizando eventos entrantes y salientes en lotes ordenados secuencialmente.
- **`Conflict`:** Colisión de versiones detectada en el servidor (OCC Conflict). Se detiene el Push y se inicia la reconciliación.
- **`Recovered`:** Conflicto resuelto en local. La cola se re-alinea y el sistema vuelve a `Online`.

---

## ⚡ 4. RESOLUCIÓN DE CONFLICTOS DE CONCURRENCIA (OCC & EVENT SOURCING)

El mayor desafío ocurre cuando dos dispositivos del mismo usuario realizan ediciones offline concurrentes (ej. Teléfono y Web).

### Estrategia de Reconciliación (Conflict Resolution):

1.  El Teléfono intenta sincronizar un evento en versión `6`. El Servidor responde con error OCC `23505` (la versión `6` ya fue escrita por la Web).
2.  El Teléfono inicia la **Reconciliación Local**:
    - Descarga el evento de la nube de versión `6` (ej. `MicroaccionPostergada` enviado por la Web).
    - El Teléfono re-escribe localmente el historial: aplica el evento de la nube en versión `6`.
    - Re-evalúa el evento local pendiente en memoria: dado que el servidor postergó la acción, la ejecución local en versión `7` es inválida o se adapta.
    - La base local se re-calcula aplicando los eventos re-ordenados de forma determinista usando el timestamp `occurredAt` del UUIDv7 de los eventos.
    - El Teléfono envía el nuevo evento reconciliado como versión `7` al Servidor.

---

## 🚨 5. CASOS LÍMITE (EDGE CASES)

1.  **Reloj del Cliente Desincronizado:** Los UUIDv7 contienen marcas de tiempo que garantizan orden lógico local. Al sincronizar, el servidor utiliza su propio reloj para la columna `recorded_at` pero respeta el orden secuencial del `aggregate_version` para mantener la consistencia del Event Store.
2.  **Reinstalación de Dispositivo:** Al iniciar sesión en un dispositivo nuevo, la base de datos local SQLite está vacía. El Sync Engine ejecuta un **Replay Completo** desde la nube, descargando todos los snapshots y eventos para reconstruir el estado local en menos de 10 segundos.

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)

- **Riesgo de Bucle Infinito de Reintentos en Fallos de Red Parciales:** Que una conexión inestable (Edge/3G lento) cause que el cliente envíe eventos, el servidor los guarde, pero la confirmación HTTP de éxito se pierda en el aire. El cliente reintentaría indefinidamente duplicando datos. _(Mitigación: El Inbox Pattern del servidor garantiza que si un evento con el mismo `eventId` (UUIDv7) ya existe en base de datos, se descarta silenciosamente devolviendo éxito 200, evitando duplicación en el Event Store)._

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)

- _Hipótesis 1:_ Asumimos que los conflictos multidispositivo ocurren en menos del 1% de las interacciones normales de los usuarios de Commitment.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

- **¿Es independiente del proveedor tecnológico?** Sí. La lógica de sincronización, la FSM de sync y SQLite/SQLCipher son independientes de Supabase.
- **¿Respeta la Constitución y sus invariantes?** Sí. Protege la inmutabilidad de la historia del usuario y garantiza consistencia eventual sin generar culpa en la UI.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — OFFLINE & SYNC ENGINE v1.0**
