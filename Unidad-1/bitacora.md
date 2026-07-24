## Actividad 1

Micelio

La idea que quería en la experiencia era representar alguna estructura de la naturaleza con estructuras de apariencia aleatoria para juntar los conceptos de ciencia y creatividad. Para eso elegí el micelio, el cuerpo subterraneo de los hongos que mantiene en constante cambio. Cómo debe ser una pantalla en la entrada que está constantemente funcionando, el micelio queda bien para crear una visual interesante y a la vez reactiva al usuario.

Para que sea parecido al micelio real decidí que los colores debían ser colores de tierra con un color más blanco para el micelio.

Las probabilidades deben crear un movimiento que tuviera aleatoriedad pero se viera orgánico y creada un movimiento y estructuras similares a las redes de micelio.

Como interacción del usuario, quería que pudiera influenciar la dirección de crecimiento en donde estuviera el mouse, para poder cambiar el peso de donde crece el micelio.

Decidí que iba a tener una pequeña tendencia hacia arriba como si fuera para la superficie. 

Un problema inicial es que con el tiempo quedaba muy concentrada la estructura en el medio. Me tocó hacer un cambio en la manera en que salían las hifas

<img width="307" height="547" alt="Screenshot 2026-07-24 124209" src="https://github.com/user-attachments/assets/359fd71e-af4e-4154-8860-f22c4aa2e381" />

Para cambiar eso, se puso que al inicio fuera en unos lugares aleatorios, además ya salen cerca al mouse en un porcentaje bajo.

La otra dificultad que tuve era que solo se creaban ramas pero nada se borraba, eventualmente quedaba blanco todo

<img width="292" height="520" alt="Screenshot 2026-07-24 072357" src="https://github.com/user-attachments/assets/8328b35b-1adb-41af-be5e-bbfa708db5e9" />

Para usar el levy, implementé una espora que sale aleatoriamente cada cierto tiempo de una hifa. Con esta probabilidad se define la distancia que viaja la espora antes de caer y crecer otra hifa.

<img width="47" height="35" alt="Screenshot 2026-07-24 123405" src="https://github.com/user-attachments/assets/b82395ef-5843-43ad-8439-8f0e3a044e0b" />

Espora

Se usó IA para código. Algunos funcionamientos propuestos por ia se modificaron a unos mas sencillos. Se modificaron los valores de las probabilidades para acercarlo al producto pensado. Se aumentó el radio de atracción del mouse y la fuerza, para que se note más la intención del usuario.

Producto final

<img width="379" height="665" alt="Screenshot 2026-07-24 123819" src="https://github.com/user-attachments/assets/3be50ce0-a5f7-4120-9886-46c30308780a" />
