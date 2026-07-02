# CONTRATO DE DISEÑO UNIVERSAL Y ACCESIBILIDAD (ACCESSIBILITY SYSTEM)
**Versión:** 2.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Especificación Oficial de Accesibilidad para UX/UI, Frontend, QA e Ingeniería  

---

## PRINCIPIO SUPREMO DE ACCESIBILIDAD
> **La accesibilidad no existe para un grupo reducido de usuarios. Existe porque todos los seres humanos cambian de capacidad según el contexto, el cansancio, el entorno y el momento de vida. La velocidad percibida también forma parte de la accesibilidad: una interfaz lenta aumenta la carga cognitiva y destruye la autonomía.**

---

## ♿ ESTÁNDAR TÉCNICO Y ACCESSIBILITY TOKENS

*   **Estándar Mínimo Obligatorio:** **WCAG 2.2 AA** en todas las pantallas y componentes. Objetivo deseable WCAG 2.2 AAA en lectura prolongada.
*   **Color Independence:** Queda estrictamente prohibido comunicar significado o estado únicamente mediante el color. Toda indicación debe utilizar una combinación de **Texto + Ícono + Forma + Posición**.
*   **Keyboard-First (Navegación Web):** La plataforma web es 100% ejecutable mediante teclado (`Tab`, `Shift+Tab`, `Enter`, `Escape`, `Space`) sin requerir mouse.

### ACCESSIBILITY TOKENS OFICIALES
| Token | Valor / Especificación | Aplicación |
| :--- | :--- | :--- |
| **Touch XS** | 44 x 44 pt/dp | Área táctil mínima secundaria. |
| **Touch S** | 48 x 48 pt/dp | Área táctil estándar recomendada. |
| **Touch M** | 56 x 56 pt/dp | Área táctil principal de alta accesibilidad. |
| **Contrast AA** | Min 4.5:1 | Contraste de texto principal e íconos. |
| **Contrast AAA**| Min 7.0:1 | Contraste de texto en lectura de Biblioteca. |

---

## 🧠 COGNITIVE & CONTEXT ACCESSIBILITY

Commitment se diseña específicamente para adaptarse al estado mental y al entorno físico fluctuante del ser humano:

*   **Cognitive Support:** Diseñado para acompañar casos de TDAH, autismo, dislexia, ansiedad, fatiga mental, burnout, duelo y privación de sueño. El límite de 3 microacciones y la ausencia de pirotecnia reducen la sobrecarga ejecutiva.
*   **Context Support:** Diseñado para funcionar perfectamente cuando el usuario está caminando, usando una sola mano, cuidando un bebé, con poca luz, ruido ambiental, batería baja o estrés extremo.
*   **Voice-First Integration:** Usabilidad mediante VoiceOver (iOS) y TalkBack (Android). La app se diseña para ser **utilizable sin mirar**, permitiendo completar microacciones y escuchar reflexiones por voz.

---

## 👥 ACCESSIBILITY PERSONAS (REPRESENTACIÓN REAL)

1.  **Persona A (Burnout y Estrés):** 40 años, alta sobrecarga cognitiva, poca energía mental. Requiere extrema calma y cero decisiones.
2.  **Persona B (Baja Visión y Pulso Lento):** Vista reducida, requiere Dynamic Type XL y áreas táctiles generosas.
3.  **Persona C (TDAH y Alta Impulsividad):** Propenso a la parálisis por análisis. Requiere estructura atómica de 1 paso a la vez.
4.  **Persona D (Ansiedad y Miedo a Fallar):** Sensible a la culpa. Requiere el mensaje del Rescate Resiliente sin reproches.
5.  **Persona E (Usuario Ciego / VoiceOver):** Navega exclusivamente por audio y síntesis de voz.
6.  **Persona F (Contexto Físico Limitado):** Usa la app con una sola mano mientras sostiene a su hijo en el transporte público.

---

## 🔍 ACCESSIBILITY LINTER (CHECKLIST DE QA)

| Regla de Accesibilidad | Cumple (Sí / No) |
| :--- | :--- |
| 1. ¿Cumple con el estándar WCAG 2.2 AA como mínimo? | [  ] |
| 2. ¿Es 100% navegable por teclado en Web (sin mouse)? | [  ] |
| 3. ¿Toda la información es independiente del color? | [  ] |
| 4. ¿Respeta los Touch Tokens mínimos (48x48dp)? | [  ] |
| 5. ¿Es usable por voz mediante VoiceOver/TalkBack sin mirar? | [  ] |
| 6. ¿Soporta Dynamic Type sin cortar textos o layouts? | [  ] |
| 7. ¿Mantiene la velocidad percibida dentro del Performance Budget? | [  ] |

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ACCESSIBILITY SYSTEM v2.0**
