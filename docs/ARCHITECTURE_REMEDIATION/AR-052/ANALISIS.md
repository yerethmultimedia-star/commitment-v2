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

---

## Fase 3 — Alternativas (intento sistemático de falsación de H-052.3)

**Estado: 🟦 En progreso.** Cambio de enfoque explícito respecto a Fase 2: ya no se busca dónde
H-052.3 vuelve a acertar, se busca activamente **qué tipo de decisión demostraría que es incompleta o
falsa**. No se espera pasivamente un caso real futuro — se prepara el terreno con una hipótesis
competidora nueva y un protocolo de pre-registro.

### H-052.4 — hipótesis competidora, introducida como control

> **La promoción depende principalmente de la irreversibilidad del cambio, no del riesgo
> epistemológico.**

Formulada para producir predicciones distintas de H-052.3 al menos en algunos casos — no para
sustituirla de entrada.

### Verificación preliminar: ¿son H-052.3 y H-052.4 realmente independientes?

Antes de diseñar experimentos, se revisa si H-052.4 es una hipótesis genuinamente distinta o si ya
estaba parcialmente contenida en la formulación original de H-052.3. Relectura de Fase 2: la
redacción original de H-052.3 ya mezclaba dos ideas — _"el coste... es bajo y fácilmente
reversible"_ — es decir, la irreversibilidad ya formaba parte de cómo se estaba midiendo el "coste de
estar equivocado". **Esto significa que H-052.4 no es completamente independiente — extrae un
componente (irreversibilidad mecánica del artefacto) que H-052.3 ya incluía dentro de un concepto más
amplio (coste total, que también incluye sesgo epistémico acumulado).** Un experimento discriminante
real, por tanto, no puede limitarse a buscar "reversible vs. irreversible" en abstracto — necesita un
caso donde la reversibilidad _mecánica del artefacto_ y el _coste epistémico de sus consecuencias_
apunten en direcciones distintas.

### Intento de falsación 1 — revisar el Dashboard ponderado bajo esta distinción más fina

Se re-examina el mismo caso ya usado contra H-052.2 (Fase 2), ahora contra H-052.4 directamente:

- **Reversibilidad mecánica del artefacto:** alta — el Dashboard/tabla de porcentajes puede borrarse o
  reescribirse sin ningún costo técnico. Por H-052.4 (solo mira el artefacto), esto predice
  **promover ya**.
- **Coste epistémico de sus consecuencias, si los números fueran estimaciones sin rúbrica real:**
  alto — una vez que una cifra ("Backend: 52%") se cita en una conversación de priorización, esa
  decisión ya está tomada; revertir el artefacto no deshace las decisiones ya influidas por él. Por
  H-052.3 (coste total, incluyendo esto), esto predice **no promover todavía**.
- **Resultado real:** no promovido, exactamente por las razones ya registradas en el README.

**H-052.4 falla aquí donde H-052.3 acierta.** Este es el primer experimento discriminante genuino
entre las dos hipótesis (no solo entre H-052.2 y H-052.3) — y usa, de nuevo, un caso que no se
construyó pensando en esta comparación, lo cual mantiene la misma fuerza evidencial que ya se valoró
en Fase 2.

### Intento de falsación 2 — búsqueda activa de un caso que rompa a H-052.3, no solo a H-052.4

Se revisan los 13 artefactos del catálogo de Fase 1 buscando específicamente uno con **riesgo
epistémico alto que, sin embargo, se haya promovido de inmediato** (lo que refutaría a H-052.3 tal
como se refutó a H-052.2). Candidato más cercano encontrado: **ítem 9, "inversión de la carga de la
prueba" (Fase 4A→4B), promovida tras 1 sola ocurrencia.** Si esta regla fuera incorrecta en algún caso
futuro (un diseño genuinamente defectuoso que la implementación revela, pero que la regla empuja a
tratar primero como "defecto de implementación"), el riesgo epistémico es real: podría enmascarar un
problema arquitectónico real bajo la apariencia de un simple ajuste de código.

**Por qué esto no rompe a H-052.3, tras análisis:** la regla no es absoluta — incluye su propia
válvula de escape ("solo si la implementación demuestra una imposibilidad real del diseño se reabre la
decisión arquitectónica"), lo que acota el riesgo epistémico en vez de eliminarlo. H-052.3, bien leída,
no dice "coste cero," dice "coste suficientemente bajo o acotado" — una regla que incluye su propio
mecanismo de reapertura tiene un coste de estar equivocada estructuralmente menor que una regla sin esa
válvula (como lo sería, por ejemplo, prohibir permanentemente reabrir cualquier decisión de Fase 4A).
**No se encontró un falsificador aquí — pero se registra el intento explícitamente, incluyendo por qué
no funcionó, en vez de omitirlo.** Un intento de falsación fallido no es evidencia a favor tan fuerte
como un experimento discriminante ganado, y se registra con esa distinción.

### Refinamiento de H-052.3, derivado de este intento de falsación

> **H-052.3 (revisada):** el coste relevante no es binario (alto/bajo) sino si la regla incorpora o no
> un mecanismo propio de reapertura acotada. Una regla con válvula de escape explícita puede
> promoverse antes que una regla equivalente sin ella, incluso con el mismo riesgo aparente.

Registrada como refinamiento, no como nueva hipótesis separada — no se le asigna número propio todavía
porque no se ha sometido a su propio experimento discriminante independiente.

### ¿La válvula de escape es contenido de H-052.3, o una condición límite de su ámbito de aplicación?

Pregunta exigida por el usuario antes de aceptar el refinamiento, para evitar el problema clásico de
una hipótesis que va absorbiendo excepciones cada vez que aparece un caso nuevo (inmunizándose contra
la refutación en vez de mantenerse falsable). Prueba propuesta: **¿se podría haber escrito la válvula
de escape antes de revisar el ítem 9, o solo pudo formularse después de ver ese caso concreto?**

**Respuesta: sí se podría haber escrito antes — no es contenido nuevo, es una instancia de la variable
que H-052.3 ya medía.** La formulación original de Fase 2 ya definía el eje como _"el tipo de riesgo
que generan si están equivocadas o si se omiten"_ — el riesgo de estar equivocado. Que una regla incluya
su propio mecanismo de reapertura acotada no introduce una variable distinta: es, precisamente, una de
las formas en que el riesgo de estar equivocado puede ser bajo (el error es corregible dentro de la
propia regla, no necesita una intervención externa). No se necesitó ver el ítem 9 para deducir esto —
se necesitó verlo para **confirmar una instancia concreta** de algo que la definición original ya
implicaba, sin haberlo hecho explícito hasta ahora.

**Verificación cruzada, buscando si el mismo principio explica también otros ítems del catálogo, no
solo el 9 — para descartar que sea un parche ad hoc inventado únicamente para salvar ese caso:**

- **Ítem 6** ("dependencia sin evidencia → 'no verificada', no se elimina"): tiene su propia válvula
  de escape incorporada en el contenido mismo de la regla — _"hasta que la AR dependiente la confirme
  o descarte en su propia Fase 1."_ Consistente con su promoción inmediata.
- **Ítem 1** ("todo AR debe demostrar que el problema no es el real"): no tiene una válvula de escape
  en ese mismo sentido (no hay una cláusula de reapertura), pero tiene un mecanismo distinto que logra
  el mismo efecto — el coste de verificarlo es barato incluso si resulta innecesario (si el problema sí
  era el que parecía, solo se gastó esfuerzo de verificación, no hubo error que corregir). Distinto
  mecanismo, mismo resultado: coste bajo de estar equivocado.

**Conclusión: la válvula de escape no es una excepción añadida a H-052.3 caso por caso — es una
instancia reconocible de la misma variable que la hipótesis ya definía desde Fase 2.** Se documenta
como una **condición de aplicación mejor delimitada**, no como contenido nuevo de la hipótesis.
H-052.3 mantiene exactamente su formulación original; lo que cambia es la precisión con la que se
identifica cuándo el "coste de estar equivocado" es bajo.

### Protocolo de pre-registro, aplicado retroactivamente a esta misma fase como ejercicio de disciplina

Antes de cerrar Fase 3, se aplica el protocolo que pide el usuario — registrar predicciones de las 3
hipótesis antes de mirar el resultado — sobre los dos intentos de falsación ya ejecutados arriba,
para verificar que el orden de razonamiento no se invirtió después de conocer el desenlace:

| Caso                                              | H-052.2                     | H-052.3                                                   | H-052.4                                                                       | Evidencia requerida                       | Resultado real         |
| ------------------------------------------------- | --------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- |
| Dashboard ponderado                               | Promover (es procedimiento) | No promover (coste epistémico alto y poco reversible)     | Promover (artefacto mecánicamente reversible)                                 | Rúbricas objetivas por área, ya definidas | No promovido           |
| "Inversión de la carga de la prueba" (Fase 4A→4B) | Promover (es procedimiento) | Promover (riesgo acotado por su propia válvula de escape) | Promover (bajo por sí solo — reversible: basta con dejar de aplicar la regla) | — (ya promovida, caso ya cerrado)         | Promovido de inmediato |

**En el segundo caso las tres hipótesis coinciden — no es discriminante, se incluye en la tabla por
transparencia (un intento de falsación real, no solo los que salen bien), no porque distinga nada.**

### Dos escenarios hipotéticos futuros, registrados para vigilancia — no fabricados como evidencia retrospectiva

Distintos de los experimentos anteriores: estos son escenarios plausibles que **todavía no han
ocurrido**, registrados de antemano para reconocerlos si aparecen, con la predicción ya fijada antes
del desenlace real — cumpliendo genuinamente la prueba prospectiva, no una más retrodictiva:

| Escenario hipotético (no ocurrido todavía)                                                                            | H-052.2                                                 | H-052.3                                                                                                                                                               | H-052.4                                                                          |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Una regla que exija respaldo de base de datos antes de cualquier migración de esquema en producción                   | Depende de si se lee como procedimiento (sí) → promover | Promover (bajo coste si la regla resulta innecesaria; alto coste si se omite y falla)                                                                                 | Promover (una migración fallida sin respaldo es difícil o imposible de revertir) |
| Una regla que exija aprobación del usuario para el nombre de cualquier bounded context nuevo antes de escribir código | Promover (es procedimiento)                             | No promover (fricción acumulada en cada AR futura + riesgo de anclar el nombre antes de que el modelado de dominio esté completo, como ya pasó con `loginIdentifier`) | No promover (renombrar código después es mecánicamente barato)                   |

El primer escenario no discrimina (las tres coinciden). **El segundo si aparece alguna vez de forma
real, sí discriminaría entre H-052.3 y H-052.2** (ambas predicen "no promover" aquí, frente a H-052.2
que diría "promover" por ser procedimiento) — queda registrado con su predicción fijada de antemano.

### Pregunta más ambiciosa, señalada por el usuario y registrada para no perderla, sin forzar una respuesta ahora

> **¿Qué propiedad debe tener una regla para que promoverla reduzca el riesgo total del programa?**

Si esta pregunta terminara respondiéndose, H-052.3 (y su refinamiento de la válvula de escape) podrían
resultar un caso particular de una teoría más general sobre diseño de reglas, no solo sobre cuándo
promoverlas. No se persigue todavía — se deja como dirección observada, a retomar si la evidencia la
exige, no antes.

### Estado de cierre de Fase 3

- H-052.4 introducida, sometida a un experimento discriminante real (Dashboard ponderado) — **falla
  donde H-052.3 acierta.**
- Intento de falsación directa contra H-052.3 (ítem 9 del catálogo) — no encontró un falsificador,
  pero produjo un candidato a refinamiento (la válvula de escape).
- **Verificado que la válvula de escape es una condición de aplicación mejor delimitada, no contenido
  nuevo añadido a la hipótesis** — se podría haber escrito antes de revisar el ítem 9 (es una instancia
  de la variable "coste de estar equivocado" que Fase 2 ya definía, no un axioma añadido para salvar
  ese caso), y el mismo principio explica también el ítem 6 sin necesitar un mecanismo distinto para
  cada caso. H-052.3 mantiene su formulación original; solo se precisó su aplicación.
- Protocolo de pre-registro aplicado por primera vez de forma explícita, incluyendo un caso donde las
  tres hipótesis coinciden (registrado por transparencia, no por valor discriminante).
- Dos escenarios futuros registrados con predicciones fijadas de antemano, pendientes de un caso real.
- **H-052.3 sigue siendo la hipótesis líder — sobrevivió el primer intento sistemático y genuino de
  romperla, sin necesitar absorber excepciones ad hoc para lograrlo.**

**Cierre de esta ronda de AR-052, decidido explícitamente por el usuario: no se abre Fase 4.** Más
análisis retrospectivo sobre el mismo catálogo de 13 artefactos tendría rendimientos decrecientes y
aumentaría el riesgo de sobreajuste de la hipótesis al historial ya conocido — prácticamente todo el
valor extraíble de esa evidencia ya se obtuvo. **La siguiente evidencia relevante no vendrá de seguir
investigando el pasado, sino del protocolo ya pre-registrado activándose sobre un candidato real y
nuevo** — el primer test genuinamente independiente del conjunto de datos con el que nació H-052.3, la
prueba que puede convertirla de una buena explicación retrospectiva en una hipótesis con poder
predictivo demostrado. AR-052 queda en pausa a la espera de ese evento, no de más trabajo de análisis.
