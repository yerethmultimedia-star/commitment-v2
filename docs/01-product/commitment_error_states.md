# ESPECIFICACIÓN DE RESILIENCIA Y OPERACIONES DE CONFIANZA (ERROR STATES)

**Versión:** 2.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Contrato Funcional de Resiliencia para UX, Ingeniería, QA e Inteligencia Artificial

---

## REGLA SUPREMA DE CONFIANZA OPERATIVA

> **Commitment nunca culpa al usuario, nunca culpa al entorno y nunca se bloquea por un fallo técnico. Toda interrupción se degrada de manera elegante y transparente.**

---

## 🧭 PROTOCOLO ESTRUCTURADO DE RECUPERACIÓN (RECOVERY PATH)

Todo estado de fallo o límite técnico responde obligatoriamente a esta estructura de 3 preguntas:

1. **¿Qué pasó?** (Diagnóstico silencioso).
2. **¿Qué hace Commitment?** (Acción de protección automática).
3. **Recovery Path** (_Autómática_, _Asistida_, _Manual_, _Sin acción requerida_).

---

## 🛡️ MATRIZ COMPLETA DE ERRORES, LÍMITES Y RECUPERACIÓN

### 📍 1. Fallo del Proveedor de IA (LLM Caído) - [Tipo: Fallo Técnico]

- **¿Qué pasó?** La API de IA no responde o retornó error.
- **¿Qué hace Commitment?** Oculta la IA sin mostrar mensajes técnicos de error ("Error 500"). Conmuta a reglas estáticas calmas.
- **Narrativa UX:** _"Hoy continuaremos con tu último plan confirmado. Tu constancia sigue su curso."_
- **Recovery Path:** **Autómática.** El sistema reintenta la conexión en segundo plano silenciosamente.

### 📍 2. Abstención de IA por Incertidumbre - [Tipo: Línea de Protección]

- **¿Qué pasó?** El prompt del usuario es ambiguo o la IA carece de contexto suficiente para recomendar una adaptación.
- **¿Qué hace Commitment?** La IA se abstiene de inventar o alucinar respuestas.
- **Narrativa UX:** _"No tengo suficiente contexto para recomendarte un cambio todavía. ¿Prefieres que mantengamos el plan actual o deseas darme más detalles?"_
- **Recovery Path:** **Asistida.** El usuario decide si aporta más información o mantiene su plan.

### 📍 3. Boundary States (ImposibilidadOperativa) - [Tipo: Límite de Sistema]

- **¿Qué pasó?** El usuario intenta una acción no disponible momentáneamente (ej. exportar mientras se procesa otra descarga, o compartir sin red).
- **¿Qué hace Commitment?** Explica el límite operativo sin usar palabras negativas ("Error", "No se pudo").
- **Narrativa UX:** _"Esta función estará disponible tan pronto como finalice la descarga actual."_
- **Recovery Path:** **Sin acción requerida / Autómática.** El sistema desbloquea la función al terminar el proceso.

### 📍 4. Manejo de Permisos del Dispositivo (Notificaciones, Biometría) - [Tipo: Permisos]

- **¿Qué pasó?** El usuario deniega o no ha otorgado un permiso del sistema operativo.
- **¿Qué hace Commitment?** Ofrece funcionalidad completa sin chantajear ni bloquear la app.
- **Narrativa UX:** _"Commitment funciona perfectamente sin este permiso. Si deseas activar notificaciones calmas en el futuro, puedes hacerlo desde tus ajustes."_
- **Recovery Path:** **Manual (Opcional).** El usuario decide si explora la función.

### 📍 5. Error de Sincronización Emocional - [Tipo: Continuidad]

- **¿Qué pasó?** Cambio reciente de estado en un dispositivo diferente que requiere actualización en la interfaz actual.
- **¿Qué hace Commitment?** Evita términos agresivos ("Actualizando datos...", "Sincronizando base de datos").
- **Narrativa UX:** _"Sincronizando tu último cambio..."_ (Transición respiratoria suave).
- **Recovery Path:** **Autómática.**

### 📍 6. Input de Usuario Ambiguo o Errático - [Tipo: Empatía de Entrada]

- **¿Qué pasó?** El usuario escribe caracteres aleatorios o abandona un flujo a la mitad.
- **¿Qué hace Commitment?** Aplica la regla: _Interpretar primero ──► Preguntar después ──► Bloquear al final_. Nunca asume mala intención.
- **Narrativa UX:** _"Parece que la conexión o la idea se pausó. ¿Deseas guardar esto como borrador o prefieres reiniciar?"_
- **Recovery Path:** **Asistida.**

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ESPECIFICACIÓN DE RESILIENCIA v2.0**
