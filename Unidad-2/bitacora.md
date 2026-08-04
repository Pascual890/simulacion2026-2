# Bitácora — Atacar y protegerse

Unidad 2, actividad 05. Sistema generativo tipo Particle Life hecho en p5.js.

https://editor.p5js.org/Pascual890/full/9zIdgg8IG

---

## La intención

**Quiero explorar la tensión entre atacar y protegerse.**

Cada partícula persigue a una y huye de otra al mismo tiempo. Las dos fuerzas la jalan en direcciones distintas, así que nunca puede hacer las dos cosas: lo que avanza hacia su presa deja la espalda expuesta a quien lo persigue.

Escogí esta intención porque es fácil de explicar y porque la contradicción no es algo que yo le ponga encima al sistema: es la suma de dos vectores opuestos que actúan sobre cada partícula en cada momento.

---

## Cómo funciona

Tres tipos, y todos ocupan el mismo lugar en el ciclo: cada uno persigue a uno y huye del otro.

| | persigue a | huye de | con los suyos |
|---|---|---|---|
| **Bloque** | Grupo | Solitario | cohesión fuerte y de alcance corto |
| **Grupo** | Solitario | Bloque | cohesión débil y de alcance largo |
| **Solitario** | Bloque | Grupo | no se buscan, solo se ocupan espacio |

Lo importante de esta tabla es que **donde una celda dice atracción, la celda contraria dice repulsión**. Eso significa que ninguna pareja puede quedar conforme, y por eso el sistema no se detiene: no es que le meta energía, es que no tiene un punto donde descansar.

También cambia la fricción de cada uno. El Bloque es el más pesado porque arrastra a los suyos, y el Solitario el más ligero porque va suelto.

---

## Versiones y ensayos

### Ensayo 1 - El primer intento no se veía

Al escribir el sistema se me perdió una línea del dibujo y el fondo solo se borraba en una cuarta parte de la pantalla. El resto se llenaba de color hasta quedar ilegible. No era un problema de diseño, era un error mío, pero lo dejo porque me costó darme cuenta.

### Ensayo 2 - Se movía mucho pero no pasaba nada

Ya funcionaba y el movimiento no se acababa, pero se veía como una sopa: cientos de partículas culebreando por todos lados sin formar ningún grupo.

**El problema:** el alcance con el que perseguían era 130 y el alcance con el que se juntaban con los suyos era 55. Como cada partícula sentía a todas las presas de su alrededor al mismo tiempo, las direcciones se promediaban y nadie alcanzaba a agruparse.

**La decisión:** igualar los dos alcances (95 para perseguir, 85 para juntarse) y bajar las velocidades máximas. Ahí aparecieron manadas.

### Ensayo 3 - Ya funciona

Con los alcances parecidos empiezan a verse grupos que se persiguen entre sí, con estelas paralelas que muestran hacia dónde van. Y aparece algo que no programé: **anillos**.

Un Solitario queda rodeado por un anillo de Bloques. Medí uno: 25 Bloques a su alrededor, todos a unos 33 píxeles, repartidos parejo, y el Solitario del centro con velocidad casi cero.

Pasa por dos razones. El anillo se forma porque los Bloques huyen del Solitario pero al mismo tiempo se atraen entre ellos, y se quedan justo donde las dos fuerzas se igualan. Y el Solitario no se va porque está rodeado de lo que persigue: las atracciones apuntan en todas las direcciones y se cancelan. Queda atrapado por su propio impulso de atacar.

Además, como los Solitarios no se buscan entre ellos, ninguno puede sacarlo de ahí. Lo que rompe la trampa es que llegue un Grupo, porque el Solitario huye de él y la simetría se quiebra.

<img width="101" height="107" alt="Screenshot 2026-08-04 131020" src="https://github.com/user-attachments/assets/a2ff3bb9-ac03-46e8-b13a-9873e9da4f87" />


### Ensayo 4 - Bloque y Grupo eran lo mismo

Al mirarlo me di cuenta de que Bloque y Grupo se veían iguales. Los medí y era cierto: la distancia entre compañeros era 7,8 y 6,5 píxeles, prácticamente lo mismo.

**El problema:** yo los había diferenciado con la fuerza de la atracción (1,0 contra 0,6), y resulta que eso casi no importa. Lo que decide qué tan apretado queda un grupo es el radio de repulsión, no la fuerza de atracción. De hecho el Grupo, con la atracción más débil, quedaba más apretado, porque tenía el radio de repulsión más pequeño.

**La decisión:** diferenciarlos por escala en vez de por fuerza. El Bloque se junta fuerte pero solo con lo que tiene muy cerca, así que hace cúmulos chiquitos y densos. El Grupo se junta flojo pero con lo que está lejos, así que hace nubes grandes y difusas. Ahora se distinguen por tamaño y forma, no solo por densidad.

### Ensayo 5 - Los Solitarios se apilaban

Al principio los Solitarios eran completamente indiferentes entre ellos: ni se atraían ni se repelían. La idea era que fueran los únicos que van solos.

**El problema:** al medirlo, la distancia entre Solitarios era de 0,2 píxeles. O sea, se montaban unos encima de otros en el mismo punto. Y eso no era solo feo: una pila de veinte Solitarios empujaba veinte veces más fuerte al Bloque, así que se comportaba como una partícula gigante y deformaba todo el sistema.

**La decisión:** darles un radio de contacto pequeño, de 14 píxeles. Siguen sin buscarse, pero ahora se ocupan espacio. Perdí la casilla de indiferencia pura en la tabla, y lo acepté a cambio de que el sistema no se distorsione.

### Ensayo 6 - Ajustes finales

Cosas que decidí al final:

- Agregué deslizadores para cambiar la cantidad de cada tipo en vivo, sin reiniciar. Así puedo ver qué pasa si le quito casi todos los Bloques a una configuración que ya está formada, en vez de solo comparar entre corridas distintas.
- Hice al Solitario un poco más gordo para poder seguirlo con la vista entre las masas.


<img width="763" height="548" alt="Screenshot 2026-08-04 142559" src="https://github.com/user-attachments/assets/3c3fe117-9524-46a3-8f9a-3fdb3f9a4526" />

<img width="779" height="481" alt="Screenshot 2026-08-04 142704" src="https://github.com/user-attachments/assets/a0db01de-0305-4b02-a41f-02528a1a9bc7" />

<img width="740" height="559" alt="Screenshot 2026-08-04 142638" src="https://github.com/user-attachments/assets/b7b58036-0c11-4960-9ca1-b5f15e15c65f" />

---

## Lo que aprendí

- **La indiferencia no genera movimiento.** Al principio pensaba que hacer que un tipo ignorara a otro iba a producir algo interesante, pero ignorar solo produce quietud. Lo que hace que el movimiento no se acabe es que en una misma pareja uno atraiga y el otro repela.
- **Que la persecución se cierre en círculo es lo que importa.** Si fueran solo dos tipos, el que huye se acabaría apilando contra una pared. Al cerrar el ciclo con un tercero, nadie se sale y el movimiento se organiza.
- **El alcance importa más que la fuerza.** Los dos errores más grandes que cometí fueron de alcance y de radio, no de intensidad.
- **Los números que no programé salen solos.** La velocidad de cada tipo (1,38 el Bloque, 1,54 el Grupo, 1,94 el Solitario) no la puse yo: sale de cuánto se agrupa cada uno. El que va en manada es más lento porque arrastra a los demás.

---

## Lo diseñado y lo emergente

**Lo que diseñé:** que cada uno persiga a uno y huya de otro, cuánto se junta cada tipo con los suyos, y la fricción de cada uno.

**Lo que salió solo:** los anillos y su tamaño, que el perseguidor quede quieto en el centro, las manadas con estelas paralelas, el orden de las velocidades, y que el movimiento nunca se acabe.

---

## Autoevaluación

| Criterio | Peso | Valoración |
|---|---|---|
| La intención es clara y perceptible en el comportamiento. | 20 % |5 | |
| Los tipos, cantidades, matriz y parámetros están justificados desde la intención. | 25 % | 5| |
| Comprendo y puedo modificar el funcionamiento técnico del sistema. | 20 % | 3| |
| El sistema produce variaciones con una identidad reconocible. | 15 % | 5| |
| Experimenté, comparé, seleccioné y descarté con criterios claros. | 10 % | 4| |
| Puedo distinguir y sustentar lo diseñado y lo emergente. | 10 % | 5| |
| **Total** | **100 %** | 90| |

```
aporte = valoración × peso ÷ 100
nota propuesta = puntaje total ÷ 20
```

**Nota propuesta:** 4.5 / 5

### Evidencia de cada criterio

- **Intención perceptible** → la sección "La intención" y el ensayo 3, donde se ve que los grupos se persiguen sin detenerse.
- **Parámetros justificados** → los ensayos 2, 4 y 5. Cada cambio de número tiene atrás una medición y una razón.
- **Comprender y modificar** → los ensayos 4 y 5, donde encontré que estaba moviendo la palanca equivocada y la cambié.
- **Variaciones con identidad** → la tabla de manifestaciones, con las distintas semillas y cantidades.
- **Experimentar y descartar** → los seis ensayos, sobre todo el 2 y el 5, que son cosas que probé y descarté.
- **Diseñado y emergente** → la sección "Lo diseñado y lo emergente", y el anillo del ensayo 3 como ejemplo concreto.
