# MANUAL OFICIAL DE GESTIÓN DEL TIEMPO PERCIBIDO (TIME & LOADING PHILOSOPHY)
**Versión:** 2.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Contrato de Rendimiento y Experiencia Transitoria para UX, Ingeniería y Performance  

---

## REGLA SUPREMA DEL TIEMPO PERCIBIDO
> **El tiempo de espera también es parte de la experiencia. Commitment nunca acelera artificialmente al usuario ni ralentiza artificialmente el sistema. Cada segundo existe porque aporta valor, comprensión o calma. Si un segundo no aporta nada, debe desaparecer.**

---

## 🧭 CLASIFICACIÓN TÉCNICA Y ORIGEN DE LAS ESPERAS

| Tipo de Espera | Origen Técnico | Ejemplo de Aplicación | Comportamiento de Interfaz |
| :--- | :--- | :--- | :--- |
| **Instantánea** | Transiciones UI (<300 ms) | Cambios de estado y toques táctiles. | Animaciones fluidas inmediatas. |
| **Local** | Escritura en almacenamiento local | Guardar microacción en base de datos local. | Confirmación en <200 ms sin bloqueos. |
| **Sincronización** | Comunicación con backend | Sincronización de eventos en la nube. | 100% en segundo plano. Cero bloqueos. |
| **IA Reflexiva** | Generación LLM (OpenAI/Claude) | Estructuración de Blueprint o Rescate. | Construcción progresiva e incremental. |
| **Usuario** | Espera por confirmación humana | Confirmar una adaptación o pacto. | Interfaz en pausa contemplativa. |

---

## ⚡ PRESUPUESTO DE RENDIMIENTO MEDIBLE (PERFORMANCE BUDGET)

Ingeniería y QA deberán auditar que el sistema cumpla con estos tiempos máximos de respuesta:

*   **Abrir Espacio Presente:** Max 300 ms.
*   **Completar Microacción:** Max 200 ms.
*   **Navegar entre Pantallas:** Max 150 ms.
*   **Abrir Biblioteca de Vida:** Max 500 ms.
*   **Generar Blueprint con IA:** Max 8.0 s (con entrega incremental).

---

## 🎨 PRINCIPIOS DE NARRATIVA Y SKELETON STATES

1.  **Regla de Ejecución Asíncrona / Fondo:** Si una operación puede ejecutarse en segundo plano (sincronizar eventos, descargar biblioteca, indexar aprendizajes), **debe ejecutarse en segundo plano**. El usuario jamás esperará mirando una pantalla estática.
2.  **Skeleton States de Estética Calma:** En cargas locales o de red, se muestran estructuras tipográficas en gris suave y limpio (nunca ruedas o spinners robóticos giratorios).
3.  **Espera Cancelable Asíncrona:** Toda generación de IA superior a 5 segundos permite al usuario cerrar la pantalla. Narrativa: *"Puedes cerrar esta pantalla. Tu propuesta estará lista en tu espacio cuando vuelvas."*
4.  **Generación Incremental de IA:** La IA muestra su avance de forma transparente y progresiva (*"Analizando identidad... ──► Organizando microacciones... ──► Finalizando plan"*).
5.  **Regla de Silencio Offline:** Proscrito mostrar *"Esperando conexión..."*. Se opera localmente y se sincroniza después.
6.  **Accesibilidad y Reduce Motion:** Las animaciones de pulso se adaptan automáticamente a las preferencias del sistema operativo (*Reduce Motion* en iOS/Android) y reducen el consumo de batería.
7.  **El Segundo de Silencio Emocional:** Tras completar el Ritual de Cierre, el sistema inserta exactamente **1.0 segundo de silencio visual puro** (pantalla limpia sin botones) para permitir la consolidación emocional del logro antes de pasar a la Biblioteca.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — MANUAL DE GESTIÓN DEL TIEMPO v2.0**
