# Bitácora U3


## Controles

En LAB las teclas de escena reinician el estado, para que cada prueba parta
igual. En PERFORMANCE la misma tecla es un gesto sobre la nube en curso: no
reinicia nada y el cambio llega de forma gradual.

### Escenas

| Tecla | Escena |
|---|---|
| 1 | Inercia |
| 2 | Fuerza constante, hacia abajo |
| 3 | Atracción |
| 4 | Repulsión |
| 5 | Vórtice |
| 6 | Resorte a estructura |
| 7 | Flujo (curl noise) |
| 8 | Magnética |
| 0 | Cohesión: resorte + flujo |
| Q | Pulso radial |

### Gestos en vivo

| Control | Qué hace |
|---|---|
| Puntero | Mueve el atractor. Es el centro del radial, del vórtice y de las ondas |
| Flechas arriba y abajo | Agrandan o encogen la estructura del resorte |
| Flechas izquierda y derecha | Cambian la forma: esfera, anillo, rejilla, hélice |
| Espacio | Invierte el radial mientras se mantenga presionado. Es la ruptura |
| T | Cambia el tempo entre normal y lento |
| Corchetes | Qué tan rápido llega el cambio de escena |

### Modo

| Tecla | Qué hace |
|---|---|
| P | Alterna entre LAB y PERFORMANCE |
| R | Reinicia las partículas |



## Ficha de fuerzas


Ocho fuerzas se suman en el mismo bloque de código, dentro de
src/simulation/createSimulation.js. La única que se aplica aparte es la
magnética, por una razón que se explica en su ficha.

---

### 1. Fuerza constante (viento) — tecla 2

**Ecuación:** F = w

**Dirección:** fija, siempre la misma. No depende de dónde esté la partícula ni de cómo se mueva.

**Parámetros:** dirección y fuerza del viento.

**Predicción:** partiendo quietas, las partículas se aceleran de forma constante en esa dirección.

**Decisión de diseño:** decidí que cayeran hacia abajo en vez de hacia el lado. Se ve mejor por cómo entran y salen de los bordes de la pantalla.

---

### 2. Radial — teclas 3 y 4

**Ecuación:** F = r · G / d²

**Dirección:** hacia el atractor, que va donde yo mueva el puntero. Con la fuerza en negativo empuja hacia afuera en vez de jalar.

**Parámetros:** fuerza (positiva atrae, negativa repele) y un valor de suavizado que evita que reviente en el centro.

**Predicción:** al invertir el signo, el comportamiento se invierte completo. Se cumplió. Como la fuerza cae muy rápido con la distancia, agarra fuerte lo que está cerca del cursor y casi no toca lo lejano.

**Decisión de diseño:** le subí la fuerza para que se sienta más presente al tocar en vivo.

---

### 3. Vórtice — tecla 5

**Ecuación:** F = (z × r) · W

**Dirección:** de lado, perpendicular a la línea que va al atractor. Hace girar en vez de acercar.

**Parámetros:** fuerza del giro.

**Predicción:** debe aparecer giro y no una simple caída hacia el centro. Se cumplió. Al probarlo las partículas terminan casi todas a la misma velocidad, así que ahí el color no varía mucho. Si se pone mientras están muy desordenadas no se nota tanto.

**Decisión de diseño:** lo uso sobre todo cuando las partículas vienen de la esfera del resorte. Arrancando desde ahí el giro se lee mucho mejor que empezando desde el desorden.

---

### 4. Drag (rozamiento)

**Ecuación:** F = −c · v

**Dirección:** siempre en contra del movimiento. Es la única que no puede iniciar nada, solo frenar.

**Parámetros:** cuánto frena.

**Predicción:** deja de acelerar y se estabiliza en una velocidad fija.

**Decisión de diseño:** le amplié el rango para poder frenar mucho más de lo que permitía antes. Sin eso, el flujo y el pulso se veían todos moviéndose a la misma velocidad y no se distinguían.

---

### 5. Resorte a estructura — tecla 6 y flechas

**Ecuación:** F = k · (casa − p)

**Dirección:** cada partícula es jalada hacia su propia casa. A diferencia del radial, jala más fuerte mientras más lejos esté.

**Parámetros:** rigidez, tamaño de la estructura y forma de reposo.

**Predicción:** la nube debe armarse en la figura y quedarse quieta. Se cumplió. Si le quito el freno, oscila sin parar en vez de asentarse.

**Decisión de diseño:** es la fuerza que más uso y la que más control me da. Le agregué cuatro formas de reposo (esfera, anillo, rejilla y hélice) que puedo cambiar en vivo con las flechas, y también el control del tamaño.

Decidí además que la estructura pudiera crecer más grande que el cubo del mundo. Cuando pasa eso, las partículas de los extremos se salen por un lado y entran por el otro, y se arma un rebote que no se detiene. Esa fue la estructura que más me gustó de todo el instrumento que haya salido de forma inesperada, lo descubrí moviendo sliders rápido y subiendo el rebote.

---

### 6. Flujo (curl noise) — tecla 7

**Ecuación:** F = A · rotacional de un campo de ruido

**Dirección:** la del flujo en cada punto. Está construido de forma que no tenga desagües, por eso las partículas fluyen como humo en vez de amontonarse.

**Parámetros:** intensidad, tamaño de los remolinos y qué tan rápido se mueve el campo.

**Predicción:** corrientes continuas, sin grumos. Se cumplió, pero solo con freno: sin él las partículas se aceleran hasta el tope y deja de verse como flujo.

**Decisión de diseño:** la junté con el resorte para armar la escena 0. Una ordena y la otra dispersa, así que juntas me dan el vaivén entre orden y caos que quiero para la pieza.

---

### 7. Magnética — tecla 8

**Ecuación:** F = q · (v × B)

**Dirección:** siempre de costado respecto al movimiento. Curva la trayectoria en hélices sin empujar hacia adelante ni hacia atrás.

**Parámetros:** dirección e intensidad del campo, y qué proporción de partículas lleva carga contraria.

**Predicción:** como empuja siempre de lado, no debería cambiar la velocidad de las partículas. Al medirlo resultó falso, se iban acelerando de a poquito hasta quedar todas pegadas al tope. Es un error de cómo el programa calcula paso a paso, no de la fórmula. Hubo que corregir la forma de aplicarla, y después de eso la velocidad sí se mantuvo fija.

**Decisión de diseño:** la aceleré y le agregué cargas opuestas, para tener dos grupos girando en sentidos contrarios al mismo tiempo. Funciona mucho mejor si antes junto todo en la esfera del resorte y desde ahí prendo el magnetismo.

---

### 8. Pulso radial — tecla Q

**Ecuación:** F = r · A · sin(k·d − w·t)

**Dirección:** radial, pero cambiando de signo. Son ondas que salen desde el atractor.

**Parámetros:** intensidad, separación entre ondas y velocidad de la onda.

**Predicción:** anillos viajando hacia afuera, con las partículas agrupándose entre onda y onda. Se cumplió. Poniendo la velocidad en negativo, las ondas viajan hacia adentro.

**Decisión de diseño:** la agregué porque es la más rítmica de todas y la pieza es muy insistente. Como sale desde el atractor, puedo mover el foco de las ondas con el puntero.

---

### 9. Integración (no es una fuerza)

**Cómo funciona:** primero la fuerza cambia la velocidad, y después la velocidad cambia la posición. En ese orden.

**Parámetros:** el tamaño del paso de tiempo, un tope de velocidad y los bordes del mundo, que son periódicos: lo que sale por un lado entra por el otro.

**Predicción:** el mismo número de pasos debe dar el mismo resultado en cualquier computador. Al principio no era así.

**Decisión de diseño:** decidí que la obra corriera igual en cualquier máquina. Antes iba más rápido en mi computador, que da muchos cuadros por segundo, y se habría puesto lenta al conectar el proyector. Eso me habría cambiado el tempo de todo lo ensayado.

---

### Notas

**La escena 0 no es una fuerza.** Es la combinación de resorte, flujo y freno
encendidos al mismo tiempo. No tiene fórmula propia. La armé así a propósito y
no como una fuerza nueva, para poder seguir probando el resorte y el flujo por
separado cuando lo necesite.


Ensayos y cambios

primero,Añadir un ramp, para que en performance los saltos entre fuerzas no sean inmediatos como un reset.

Añadir otros tipos de fuerzas existentes para exploración. Nuevas formas y comportamientos aparecen. como magnestismo y resorte.

Añadir parametros para el magnetismo y el resorte.

Modificación de tiempos. La ia encontró que unos parametros iban mas rápido porque iban ligados a los fps, mi pc corre muy rápido, entonces los resultados eran más rápidos. Se arregló en el loop principal (main.js), antes se daba un paso de simulación por cada frame, ahora se acumula el tiempo real que pasó y se gasta en pasos fijos de 1/60 de segundo. Así siempre son 60 pasos por segundo, corra la pantalla a 60 o a 160 fps.

Buscando una fuerza que se viera como un ritmo, añadi fuerzas de onda.

Añadi cambio de radio para la fuerza resorte, para cambiar el tamaño de la esfera. L sensibilidad del rebote estaba muy rigida, le subí para que se viera más rebote al llegar al punto.

Cambio de colores, añadir colores y cambiar los parámetros que van a modificar cada cosa


modificar velocidades para coincidir más con la pieza musical.

quitar fuerza térmica.

Añadir formas a resorte que se muevan en perfrmance.

juntar resorte con alguna fuerza de desorden, en este caso con el curl noise.


## Autoevaluación

| Criterio | Peso | Qué debe demostrar la evidencia | Valoración |
|---|---|---|---|
| **Trazabilidad y comprensión del sistema** | 25 | Puedo señalar y explicar estado, fuerzas, integración, render y controles; además puedo ubicar qué partes produjo o modificó la IA. | 4|
| **Verificación del algoritmo de fuerzas** | 25 | Estudié en detalle el proyecto y aunque no comprenda toda la sintaxis, puedo identificar su arquitectura, sus partes, puedo aislar una fuerza central, formular una predicción, la ejecuté y ya analicé, comparé el resultado, cambié deliberadamente un signo o parámetro y expliqué la diferencia. | 3|
| **Diseño de fuerzas e intención** | 20 | Las fuerzas y sus parámetros hacen perceptible una intención; el comportamiento surge de la dinámica y no de trayectorias previamente dibujadas. | 5|
| **Instrumento, score e interpretación** | 15 | El score conecta la escucha con decisiones; escogí pocos controles expresivos y puedo conducir el sistema en vivo sin que el audio lo controle automáticamente. | 5|
| **Experimentación y criterio frente a la IA** | 10 | Comparé alternativas, registré hallazgos y descartes, corregí propuestas de IA y puedo justificar por qué conservé la versión presentada. | 5|
| **Entrega técnica y documentación** | 5 | La URL pública abre; la bitácora permite verificar el proceso. | 5|
| **Total Puntos** | **100** | | |
