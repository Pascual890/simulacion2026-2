# Bitacora U3
Ensayo 1
primero,Añadir un ramp, para que en performance los saltos entre fuerzas no sean inmediatos como un reset.

Añadir otros tipos de fuerzas existentes para exploración. Nuevas formas y comportamientos aparecen.

Añadir parametros para el magnetismo y el resorte.

Modificción de tiempos. La ia encontró que unos parametros iban mas rápido porque iban ligados a los fps, mi pc corre muy rápido, entonces los resultados eran más rápidos. Se arregló en el loop principal (main.js), antes se daba un paso de simulación por cada frame, ahora se acumula el tiempo real que pasó y se gasta en pasos fijos de 1/60 de segundo. Así siempre son 60 pasos por segundo, corra la pantalla a 60 o a 160 fps.

Cambio de colores, añadir colores y cambiar los parámetros que van a modificar cada cosa


## Autoevaluación

| Criterio | Peso | Qué debe demostrar la evidencia | Valoración |
|---|---|---|---|
| **Trazabilidad y comprensión del sistema** | 25 | Puedo señalar y explicar estado, fuerzas, integración, render y controles; además puedo ubicar qué partes produjo o modificó la IA. | |
| **Verificación del algoritmo de fuerzas** | 25 | Estudié en detalle el proyecto y aunque no comprenda toda la sintaxis, puedo identificar su arquitectura, sus partes, puedo aislar una fuerza central, formular una predicción, la ejecuté y ya analicé, comparé el resultado, cambié deliberadamente un signo o parámetro y expliqué la diferencia. | |
| **Diseño de fuerzas e intención** | 20 | Las fuerzas y sus parámetros hacen perceptible una intención; el comportamiento surge de la dinámica y no de trayectorias previamente dibujadas. | |
| **Instrumento, score e interpretación** | 15 | El score conecta la escucha con decisiones; escogí pocos controles expresivos y puedo conducir el sistema en vivo sin que el audio lo controle automáticamente. | |
| **Experimentación y criterio frente a la IA** | 10 | Comparé alternativas, registré hallazgos y descartes, corregí propuestas de IA y puedo justificar por qué conservé la versión presentada. | |
| **Entrega técnica y documentación** | 5 | La URL pública abre; la bitácora permite verificar el proceso. | |
| **Total Puntos** | **100** | | |
