# AR-052 — Del proceso de remediación al proceso de gobernanza del proceso

Registro completo, siguiendo el ciclo validado en AR-001, AR-028, AR-023 y AR-043: `Análisis →
Verificación del framing → Modelo arquitectónico (si aplica) → Alternativas → Decisión → Diseño
técnico (si aplica) → Implementación → Validación → Dashboard`.

**Reencuadre de alcance, hecho antes de abrir Fase 1 formalmente:** el alcance original de AR-052
(al crearse, al cierre de AR-023) era una política sustantiva — _"¿debe el repositorio conservar
implementaciones de referencia de arquitecturas no activas mientras una ADR vigente las mantenga como
opción futura?"_, con `core/AggregateRoot` como caso de estudio. El usuario reencuadra el objetivo a
una pregunta de nivel superior — **el objeto de análisis deja de ser el software y pasa a ser el
propio proceso de remediación**: _"¿cuál es el proceso correcto para convertir conocimiento repetido
en una regla del programa?"_ `core/AggregateRoot`/H-GOV-01 no desaparecen — se convierten en el
**primer caso de prueba** del mecanismo resultante, no en el problema que ese mecanismo debe resolver.
Este reencuadre es, en sí mismo, una aplicación de la regla permanente del programa ("toda AR debe
intentar demostrar que el problema formulado originalmente no es el problema real") — aplicada aquí
antes de que Fase 1 arrancara formalmente, no después.

---

## Fase 1 — Evidencia

**Estado: 🟦 En progreso.**

### H-052.1 — hipótesis de apertura, deliberadamente neutral

> **¿Qué nivel de evidencia debe alcanzar una observación metodológica antes de convertirse en una
> política permanente del programa?**

Formulada para no presuponer que H-GOV-01 (ni ninguna otra hipótesis en observación) deba convertirse
en regla — un resultado legítimo de esta AR es _"ninguna de las hipótesis actuales cumple todavía el
umbral."_

### Taxonomía propuesta por el usuario, a someter a prueba con evidencia real del programa, no a aceptar de entrada

| Nivel               | Definición propuesta                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0 — Observación     | Sucede una vez. No genera ninguna acción.                                                                                 |
| 1 — Hipótesis       | Sucede dos veces. Se registra, se observa. No condiciona decisiones futuras.                                              |
| 2 — Patrón validado | Se repite en múltiples ARs independientes. Empieza a usarse como precedente. Todavía puede romperse con evidencia.        |
| 3 — Política        | La carga de la prueba cambia: de "¿debemos seguir esta práctica?" a "¿hay evidencia suficiente para hacer una excepción?" |

### Catálogo completo de artefactos de gobernanza ya producidos por el programa — la evidencia real contra la que probar la taxonomía

Se cataloga cada regla/herramienta/categoría permanente ya registrada en `README.md`, con cuántas
veces se había observado el patrón **en el momento en que se promovió**, no cuántas veces se ha visto
desde entonces:

| #   | Artefacto                                                       | AR de origen   | Ocurrencias antes de promoción | ¿Promovido a permanente?                                        |
| --- | --------------------------------------------------------------- | -------------- | ------------------------------ | --------------------------------------------------------------- |
| 1   | "Todo AR debe demostrar que el problema original no es el real" | AR-001         | 1                              | Sí, inmediato                                                   |
| 2   | "La evidencia puede modificar el grafo de dependencias"         | AR-028         | 1                              | Sí, inmediato                                                   |
| 3   | "Las remediaciones no absorben hallazgos colaterales"           | AR-028         | 1                              | Sí, inmediato                                                   |
| 4   | Paso "Diseño técnico" (Fase 4A) como parte del ciclo            | AR-028         | 1                              | Sí, inmediato (institucionalizado como paso del ciclo)          |
| 5   | Escala de ponderación de evidencia (4 niveles)                  | AR-023         | 1                              | Sí, inmediato                                                   |
| 6   | "Dependencia sin evidencia → 'no verificada', no se elimina"    | AR-023         | 1                              | Sí, inmediato                                                   |
| 7   | 5º criterio "Preservación de opciones arquitectónicas"          | AR-023         | 1                              | Sí, inmediato                                                   |
| 8   | 4ª categoría "Remediación generadora de política"               | AR-023         | 1                              | Sí, inmediato                                                   |
| 9   | Inversión de la carga de la prueba (Fase 4A→4B)                 | AR-043         | 1                              | Sí, inmediato (registrado como patrón generalizable en memoria) |
| 10  | "Omisión detectada durante validación de implementabilidad"     | AR-043         | 1                              | Sí, inmediato (nueva categoría de desviación)                   |
| 11  | Verificación "real, sin mocks" al reemplazar infraestructura    | AR-043         | 1                              | Sí, inmediato                                                   |
| 12  | "Mezcla de responsabilidades entre límites arquitectónicos"     | AR-001/023/043 | **3**                          | **No** — sigue como hipótesis en observación                    |
| 13  | H-GOV-01 (no exceptuar tecnológicamente sin evidencia)          | AR-023/043     | **2**                          | **No** — sigue como hipótesis en observación                    |

### Resultado — la taxonomía por conteo de repeticiones no explica el patrón real observado

**Hallazgo central de esta fase:** 11 de los 13 artefactos se promovieron a herramienta/regla
permanente tras **una sola ocurrencia** — contradiciendo directamente la definición de "Nivel 1 =
sucede dos veces, no condiciona decisiones futuras" de la taxonomía propuesta. Los únicos dos
artefactos que _no_ se promovieron son, paradójicamente, los que **más repeticiones acumulan** (3 y 2
respectivamente) — más que casi todos los que sí se promovieron.

**El conteo de repeticiones no es, por tanto, el eje que explica las promociones ya ocurridas en este
programa.** Hace falta una segunda variable. Examinando la naturaleza de cada artefacto:

- **Grupo A (promovido tras 1 ocurrencia, ítems 1-11):** todos son **herramientas de procedimiento
  o de decisión** — instrucciones sobre _cómo_ pesar evidencia, _cómo_ clasificar una desviación,
  _cómo_ estructurar un paso del ciclo. Cada uno se necesitaba de inmediato para tomar correctamente
  la _siguiente_ decisión dentro de la misma AR que lo produjo — demorar la promoción no evitaba
  ningún riesgo, solo dejaba esa siguiente decisión sin criterio explícito.
- **Grupo B (no promovido pese a 2-3 ocurrencias, ítems 12-13):** ambos son **afirmaciones
  sustantivas/predictivas sobre la naturaleza del propio proyecto** — "muchos hallazgos son en
  realidad X," "ninguna AR debería ser la primera excepción tecnológica." Promoverlas prematuramente
  no ahorra una decisión pendiente — **introduce el riesgo de sesgar el análisis de ARs futuras**
  (ver `mezcla de responsabilidades` en cada AR nueva porque ya se espera encontrarla; rechazar una
  excepción tecnológica genuinamente justificada porque "ya es regla" en vez de evaluarla con
  evidencia propia).

### H-052.2 — reformulación, a someter a más prueba antes de aceptarla

> **El nivel de evidencia necesario para promover una observación a herramienta permanente del
> programa no depende principalmente de cuántas veces se ha repetido, sino de si es (a) una
> herramienta de procedimiento/decisión — cuyo costo de demora es una decisión inmediata sin criterio
> — o (b) una afirmación sustantiva/predictiva sobre el proyecto — cuyo costo de promoción prematura
> es sesgar el análisis de casos futuros.**

Pendiente de someter a Fase 2 (Verificación del framing/Modelo arquitectónico): ¿sobrevive esta
distinción a un intento explícito de refutarla? ¿Existen artefactos que no encajen limpiamente en
ninguno de los dos grupos? ¿Es "costo de demora vs. costo de promoción prematura" realmente el eje, o
solo una correlación con el tamaño de la muestra disponible (los artefactos de Grupo B son,
casualmente, los dos más recientes y con menos ARs para acumular evidencia)?

---

## Fase 2 — Verificación del framing

**Estado: 🟦 En progreso.** El usuario no intenta refutar H-052.2 directamente — cuestiona primero el
supuesto que dio origen a la taxonomía inicial ("la promoción depende de la cantidad de evidencia
acumulada," ya refutado por los datos de Fase 1) y pide buscar contraejemplos reales dentro del propio
programa antes de aceptar H-052.2, más una hipótesis más profunda (H-052.3, asimetría de riesgo) que
podría explicar la misma observación mejor que "procedimiento vs. sustancia."

### Búsqueda de Contraejemplo A — ¿una herramienta de procedimiento que hiciera falta de inmediato y NO se promoviera?

**Encontrado, dentro de la misma AR-043 que se acaba de cerrar:** la subdivisión de Fase 4B en
`4B.1 (Esqueleto) → 4B.2 (Dominio) → 4B.3 (Application) → 4B.4 (Infraestructura)` es, por su propia
naturaleza, una herramienta de procedimiento — decide _cómo_ secuenciar el trabajo de implementación
con puntos de verificación intermedios, exactamente el mismo tipo de artefacto que el paso "Diseño
técnico" (Fase 4A, promovido de inmediato tras AR-028). Hizo falta de inmediato en AR-043 (sin ella,
Fase 4B habría sido "escribir código" sin ninguna disciplina de checkpoints). **Sin embargo, en
ningún momento se promovió a "todo AR con implementación real debe subdividir su Fase 4B en estos 4
pasos"** — se registró como lo que AR-043 hizo, no como una regla del ciclo de 9 fases (a diferencia
de Fase 4A, que sí quedó incorporada explícitamente al ciclo tras un solo uso).

**Esto es un contraejemplo real de H-052.2 en su forma estricta:** dos herramientas de procedimiento,
estructuralmente análogas (ambas deciden _cuándo_ y _cómo_ dividir el trabajo dentro de una AR), con
destinos de promoción distintos. "Procedimiento vs. sustancia" no basta para explicar por qué una se
volvió regla permanente del ciclo y la otra no.

### Búsqueda de Contraejemplo B — ¿una afirmación sustantiva promovida de inmediato que no produjera sesgo?

**Candidato encontrado, con más ambigüedad que el Contraejemplo A:** _"toda AR debe intentar demostrar
que el problema formulado originalmente no es el problema real"_ (post-AR-001) contiene una afirmación
sustantiva implícita — "los problemas suelen no ser lo que parecen al principio" — y se promovió tras
una sola ocurrencia. En 4 usos (AR-001, 028, 023, 043) no ha producido sesgo observable: cada AR
encontró una reformulación respaldada por evidencia propia, no un patrón forzado para encajar con la
regla. Pero su forma gramatical es imperativa ("debe intentar demostrar"), no descriptiva ("los
problemas suelen ser X") — funciona como instrucción de procedimiento aunque cargue contenido
sustantivo. Se registra como candidato débil, no como contraejemplo confirmado — la ambigüedad entre
forma procedimental y contenido sustantivo es, en sí misma, evidencia de que la distinción
procedimiento/sustancia no es tan nítida como parecía en Fase 1.

### H-052.3 probada contra el Contraejemplo A — ¿explica la asimetría de riesgo lo que "procedimiento vs. sustancia" no explica?

> **Las reglas no se promueven según cuánta evidencia tienen, sino según el tipo de riesgo que
> generan si están equivocadas o si se omiten.**

Aplicada al Contraejemplo A: ¿por qué Fase 4A se volvió obligatoria y la subdivisión interna de Fase
4B no?

- **Saltarse Fase 4A (diseño técnico antes de tocar código):** el riesgo, ya documentado
  textualmente en la propia regla (`README.md`), es concreto y costoso de revertir — _"es probable
  terminar discutiendo la firma de una interfaz después de haber modificado ya sus 4
  implementaciones."_ Es un error que se propaga a todos los consumidores ya tocados; deshacerlo
  exige retrabajo real.
- **Saltarse la subdivisión de Fase 4B en 4 sub-pasos:** el riesgo es mucho menor y fácilmente
  corregible — implementar todo de una vez y verificar al final detectaría casi los mismos problemas,
  solo con menos puntos de control intermedios. No genera un error que se propague ni que sea costoso
  de deshacer.

**Esto sí explica la asimetría que "procedimiento vs. sustancia" no explicaba:** dos herramientas de
la misma categoría (procedimiento) tuvieron destinos distintos porque el costo de equivocarse/omitirlas
era distinto, no porque una fuera "procedimiento" y otra "sustancia." H-052.3 sobrevive esta prueba
mejor que H-052.2.

### Predicción a ciegas — aplicando H-052.3 sin conocer fecha ni repeticiones, contra el historial real

Se describen 4 artefactos solo por su función, sin fecha ni conteo, y se predice promoción inmediata
vs. observación usando el criterio de H-052.3 (costo de estar equivocado/omitirlo: bajo y reversible →
observar; alto y difícil de revertir → promover):

| Descripción funcional (ciega)                                                                                                      | Predicción (H-052.3)                                                                                                                                                                                                                       | Resultado real                                    |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| "Antes de tocar código en una AR que modifica un contrato compartido, diseñar el contrato completo primero."                       | Promover — omitirlo genera retrabajo costoso y propagado.                                                                                                                                                                                  | Promovido de inmediato (Fase 4A). ✅              |
| "Al escribir la implementación de una AR grande, dividirla en sub-pasos con verificación intermedia."                              | Observar/opcional — omitirlo solo reduce puntos de control, no genera error costoso.                                                                                                                                                       | No promovido a regla del ciclo. ✅                |
| "Muchos hallazgos de la auditoría original probablemente describen una mezcla de responsabilidades entre límites arquitectónicos." | Observar — si es falsa, sesga la lectura de cada AR futura hacia ver ese patrón aunque no esté.                                                                                                                                            | No promovido, sigue en observación. ✅            |
| "Ninguna AR debería convertirse en la primera excepción tecnológica del proyecto sin evidencia específica."                        | Observar — aplicarla de forma automática podría bloquear una excepción genuinamente justificada en el futuro sin haberla evaluado con evidencia propia (coste = decisión futura mal tomada por regla prematura, no solo sesgo de lectura). | No promovido (H-GOV-01), sigue en observación. ✅ |

Las 4 predicciones ciegas coinciden con el historial real. H-052.3 empieza a mostrar capacidad
predictiva, no solo explicativa — todavía sobre una muestra pequeña (4 casos, los mismos ya usados
para formularla, por lo que esto es validación débil, no independiente).

### Prueba pendiente, la más exigente — predicción hacia adelante, no hacia atrás

Tal como pide el usuario: la prueba decisiva no es explicar el pasado, es predecir correctamente la
promoción de un artefacto **todavía no existente** antes de que el programa decida qué hacer con él, y
verificar esa predicción en ARs futuras. Esta AR queda con esa prueba pendiente y abierta — no se
fuerza un artefacto nuevo artificialmente solo para completarla ahora.

### Corrección: el Contraejemplo A ya era un experimento discriminante, no solo un contraejemplo aislado

Al revisar la tabla de predicción a ciegas bajo el criterio del usuario ("¿en qué caso las dos
hipótesis predicen cosas distintas?"), se confirma que **el caso de Fase 4B (subdivisión en
sub-pasos) ya cumplía esa condición, sin haberlo señalado explícitamente en su momento**:

- H-052.2 ("procedimiento → promoción rápida"): al ser procedimiento, predice **promover**.
- H-052.3 ("coste de equivocarse/omitirlo"): al ser de coste bajo y reversible, predice **no
  promover**.
- Resultado real: no promovido.

Las dos hipótesis predecían cosas distintas y solo H-052.3 acertó. No era simplemente un contraejemplo
que debilitaba a H-052.2 — ya era el experimento discriminante que el usuario pide diseñar ahora. Se
corrige el registro: esta AR ya tiene un experimento discriminante retrospectivo, no solo una
debilidad encontrada.

### Segundo experimento discriminante retrospectivo — la propuesta del Dashboard con rúbrica ponderada

Se busca un segundo caso independiente para no depender de uno solo. Candidato:
_"Architecture Health Dashboard con rúbrica ponderada por área"_ — la propuesta que el usuario hizo
durante el Paso 4 de AR-043 y que se rechazó en su forma inmediata (registrada en `README.md` §
Artefactos futuros).

- **Forma:** procedimiento — es un método de puntuación (cómo medir el estado de cada área
  arquitectónica), no una afirmación sobre la naturaleza del proyecto.
- **H-052.2 predice:** al ser procedimiento, promoción rápida (adoptarlo ya).
- **H-052.3 predice:** coste de estar equivocado — si se adopta con porcentajes sin rúbricas
  objetivas reales, cada decisión de priorización futura que se apoye en esos números queda
  contaminada; descubrir después que los números eran estimaciones disfrazadas de medición es costoso
  de revertir (daña la credibilidad de todo el aparato de medición, no solo de esa tabla). Predice
  **no promover todavía**.
- **Resultado real:** rechazado en su forma inmediata, exactamente por las 3 razones ya registradas
  en `README.md` (contradice la congelación de `PROJECT_HEALTH_DASHBOARD.md`, no existen rúbricas
  objetivas todavía, ambigüedad documental) — dos de esas tres razones son, en esencia, "el coste de
  adoptarlo ahora con evidencia insuficiente es alto."

**Segundo experimento discriminante, mismo resultado: H-052.3 acierta, H-052.2 falla.** Dos casos
independientes (Fase 4B y el Dashboard ponderado), ambos procedimentales en su forma, ambos con
predicciones opuestas entre las dos hipótesis, ambos resueltos a favor de H-052.3.

### Protocolo pre-registrado para la prueba prospectiva (la decisiva, según el usuario)

En vez de fabricar un artefacto ficticio, se deja definido el criterio exacto para reconocer, en
tiempo real y antes de conocer el desenlace, la próxima vez que aparezca un candidato genuinamente
discriminante en el programa: **es discriminante si (a) tiene forma de procedimiento/mecanismo de
decisión, Y (b) el coste de adoptarlo ya, si estuviera equivocado, es bajo y fácilmente reversible**
(H-052.2 diría "promover", H-052.3 diría "no promover todavía") — **o si (a) tiene forma de
afirmación sustantiva/predictiva sobre el proyecto, Y (b) el coste de no adoptarlo ya, si fuera
correcta, es alto y de difícil reversión** (H-052.2 diría "no promover", H-052.3 diría "promover"). En
cuanto surja un candidato así, en esta AR o en cualquier otra futura, la predicción de ambas hipótesis
debe registrarse en el momento — antes de que el programa decida qué hacer con él — para que la
verificación posterior sea genuinamente prospectiva, no un ajuste retrospectivo más.

### Por qué el segundo experimento (Dashboard) pesa más que el primero (Fase 4B)

Señalado por el usuario: la subdivisión de Fase 4B nació _dentro_ de AR-043, con AR-052 ya en mente
como posible destino de esta reflexión — existe un riesgo real de haber "construido" el ejemplo a
medida. **El Dashboard ponderado no** — fue una decisión tomada por razones completamente distintas
(medir el estado del proyecto), sin ninguna intención de usarla para comparar teorías de gobernanza.
Que sirva igualmente para discriminar entre H-052.2 y H-052.3, sin haber sido diseñada para eso,
reduce el riesgo de sobreajuste y fortalece más el caso a favor de H-052.3 que el primer experimento.

### Cierre de Fase 2 — H-052.3 sometida a su propio criterio

**Hallazgo final de esta fase, el más importante:** H-052.3 afirma que el umbral de evidencia
necesario depende del coste de institucionalizar algo si estuviera equivocado. Aplicada a sí misma:
**¿cuál sería el coste de institucionalizar H-052.3 si estuviera equivocada?** Alto — a diferencia de
una regla técnica cualquiera, H-052.3 actuaría directamente sobre el mecanismo por el cual el programa
promueve _todas_ las futuras reglas metodológicas. Por su propio criterio, eso la coloca en la
categoría de mayor riesgo y, por coherencia interna, exige más evidencia que una hipótesis ordinaria
antes de aceptarse — **H-052.3 eleva el umbral necesario para aceptar H-052.3.** Es una propiedad
autorreferencial, no una contradicción: una hipótesis de gobernanza que exceptuara su propia regla de
promoción sería precisamente el tipo de sesgo que el programa lleva toda la sesión evitando ("quien
propone una regla no puede quedar exento de las reglas que propone" — el mismo principio que ya
sostuvo AR-043, aplicado aquí a la gobernanza en vez de al software).

**Cuarta hipótesis de observación (no permanente todavía) añadida al README:** _"Las hipótesis de
gobernanza deben evaluarse también por el riesgo que supondría utilizarlas como criterio de
gobernanza"_ — el objeto de estudio (el propio proceso de decisión) modifica el estándar de evidencia
exigible, algo que no ocurre en una AR puramente técnica.

**Estado de cierre de esta ronda de AR-052:**

- H-052.1 — superada por la evidencia histórica del catálogo de 13 artefactos (Fase 1).
- H-052.2 (procedimiento vs. sustancia) — refutada mediante dos experimentos discriminantes
  retrospectivos independientes (Fase 4B, Dashboard ponderado); ambos favorecen a H-052.3.
- **H-052.3 (asimetría de riesgo) — hipótesis líder, no promovida.** Dos experimentos discriminantes
  a favor, cero evidencia prospectiva todavía, y sometida (y sobreviviente) a su propia prueba de
  autoconsistencia.

**Próximo paso, explícitamente pendiente, no forzado en esta sesión:** esperar un candidato real que
cumpla el protocolo discriminante ya definido; registrar la predicción de H-052.2/H-052.3 antes de
conocer el desenlace; comparar contra el resultado real. D-023.2/H-GOV-01 (`core/AggregateRoot`)
siguen como primer caso de estudio pendiente de resolver bajo el mecanismo que emerja de esta AR, no
como su objeto central.

**Paralelismo señalado por el usuario, registrado porque conecta AR-043 y AR-052 bajo el mismo
principio de fondo:** en AR-043 el objetivo fue demostrar que la implementación no modifica la
arquitectura; en AR-052, que la gobernanza no modifica el estándar de evidencia para favorecer sus
propias conclusiones. Ambos son la misma disciplina aplicada a capas distintas del programa.
