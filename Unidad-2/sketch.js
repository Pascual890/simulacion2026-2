// ===========================================================================
//  ATAGRU Y PROTEGERSE
//  Sistema generativo tipo Particle Life
//
//  TENSIÓN: quiero explorar la tensión entre atacar y protegerse.
//
//  Cada partícula siente al mismo tiempo la atracción hacia su presa y la
//  repulsión desde su perseguidor, y las dos tiran en direcciones distintas.
//  Nunca puede hacer las dos cosas: lo que se mueve hacia adelante deja la
//  espalda expuesta. La contradicción no es una interpretación puesta encima
//  del sistema — es la suma de dos vectores opuestos actuando sobre cada
//  partícula en cada cuadro.
//
//  LA PROPIEDAD QUE LO SOSTIENE: las seis celdas fuera de la diagonal son
//  ANTISIMÉTRICAS. Donde una dice atracción, la simétrica dice repulsión.
//  No hay una sola pareja que pueda estar de acuerdo, así que no existe
//  ninguna configuración en la que todas las fuerzas se cancelen. El sistema
//  no se detiene porque no tiene dónde detenerse.
//
//  Y la persecución se cierra en CICLO —Bloque persigue a Grupo, Grupo
//  a Solitario, Solitario a Bloque— para que nadie escape del sistema y el
//  movimiento se organice en vez de dispersarse.
// ===========================================================================

// --- Tipos ----------------------------------------------------------------
// Los tres ocupan la misma posición en el ciclo: todos persiguen a uno y
// huyen de otro. Lo que los distingue es cómo se relacionan con los SUYOS.
const BLO = 0; // Bloque    : cohesión fuerte, avanza compacto y pesado
const GRU = 1; // Grupo     : cohesión débil, se mueve suelto
const SOL = 2; // Solitario : indiferente a sí mismo, cada uno va por su cuenta

const NOMBRES = ["Bloque", "Grupo", "Solitario"];
const COLORES = [
  [232, 196, 110], // falange
  [110, 190, 200], // cardumen
  [214, 122, 190]  // solitario
];

// --- LA MATRIZ ------------------------------------------------------------
//  REL[quien_siente][hacia_quien]
//    rMin : radio de repulsión de contacto (ocupación de espacio)
//    rMax : alcance máximo de la relación (== rMin -> solo repele)
//    a    : intensidad de la atracción en la banda media
//    rep  : intensidad de la repulsión por debajo de rMin
//    null : INDIFERENCIA
//
//                    hacia Bloque   hacia Grupo   hacia Solitario
//   Bloque          cohesión        PERSIGUE         HUYE
//   Grupo         HUYE            cohesión         PERSIGUE
//   Solitario          PERSIGUE        HUYE             indiferencia
//
const REL = [
  // ==================== lo que siente la BLOANGE ====================
  [
    // cohesión FUERTE con los suyos: avanza como un bloque, y por eso es la
    // más lenta en reaccionar cuando la alcanzan por detrás.
    // cohesión FUERTE y de alcance CORTO: cúmulos pequeños y compactos.
    // La diferencia con el Grupo está en la ESCALA, no en la intensidad:
    // medimos que la fuerza de cohesión casi no controla lo apretado que
    // queda un grupo —eso lo fija el núcleo de repulsión— sino hasta dónde
    // se extiende. Con 1.0 contra 0.6 los dos tipos eran indistinguibles
    // (7,8 px contra 6,5 px entre compañeros).
    // El alcance tiene que superar el DIÁMETRO del anillo que se forma
    // alrededor de un Solitario atrapado (unos 66 px). Si no, los Bloques de
    // lados opuestos no se sienten entre sí, el anillo no puede cerrarse y el
    // fenómeno desaparece. Con 55 lo maté sin darme cuenta; con 75 vuelve.
    { rMin: 20, rMax: 75, a: 1.2, rep: 1.8 },
    // PERSIGUE al Grupo. El alcance de la persecución tiene que ser
    // PARECIDO al de la cohesión, no mayor: si es mucho mayor, cada
    // partícula es tirada a la vez por todas las presas de su entorno, las
    // direcciones se promedian y no se forma ningún grupo — el sistema queda
    // en sopa uniforme, moviéndose mucho y sin que pase nada.
    { rMin: 12, rMax: 95, a: 0.7, rep: 1.0 },
    // HUYE del Solitario: repulsión pura y de radio amplio. Este vector y el
    // anterior tiran en direcciones distintas — ahí está la contradicción.
    { rMin: 55, rMax: 55, a: 0.0, rep: 1.8 }
  ],
  // ==================== lo que siente el GRUDUMEN ====================
  [
    { rMin: 55, rMax: 55, a: 0.0, rep: 1.8 },     // HUYE de la Bloque
    // cohesión DÉBIL y de alcance LARGO: nubes grandes y difusas, lo opuesto
    // al Bloque en forma y tamaño, no solo en densidad.
    { rMin: 26, rMax: 105, a: 0.35, rep: 1.3 },
    { rMin: 12, rMax: 95, a: 0.7, rep: 1.0 }      // PERSIGUE al Solitario
  ],
  // ==================== lo que siente el SOLANTE ====================
  [
    { rMin: 12, rMax: 95, a: 0.7, rep: 1.0 },     // PERSIGUE a la Bloque
    { rMin: 55, rMax: 55, a: 0.0, rep: 1.8 },     // HUYE del Grupo
    // NO SE BUSCAN: cero atracción entre ellos, solo se ocupan espacio. Cada
    // uno va por su cuenta y ninguno puede sacar a otro de donde esté.
    // La indiferencia total (sin núcleo) resultó inviable: medimos 0,2 px de
    // distancia media entre solitarios —se apilaban en el mismo punto— y una
    // pila de veinte ejerce veinte veces la fuerza, con lo cual actuaba como
    // una partícula gigante y distorsionaba toda la dinámica.
    { rMin: 14, rMax: 14, a: 0.0, rep: 1.2 }
  ]
];

const RMAX_GLOBAL = 105; // alcance mayor de la matriz; define la grilla

// --- Física por tipo ------------------------------------------------------
//  retencion : fracción de velocidad conservada por cuadro (1 - fricción)
//  El que va en bloque es el más pesado; el que va solo, el más ligero. Que
//  la presa pueda escapar es lo que impide que la persecución termine.
const FISICA = [
  { retencion: 0.7, vmax: 1.4 },  // Bloque: pesada, comprometida
  { retencion: 0.85, vmax: 1.7 }, // Grupo: ágil
  { retencion: 0.9, vmax: 2.0 }   // Solitario: el más rápido, y el más solo
];

// Escala global de las fuerzas. No cambia dónde queda el equilibrio —eso lo
// fija la matriz— solo con cuánta violencia se llega a él.
const ESCALA_FUERZA = 1.2;
const TOPE_ACEL = 50; // evita que un solapamiento momentáneo dispare una
                      // partícula fuera del sistema
const MARGEN = 26;    // borde blando: el mundo es finito

// --- Estado ---------------------------------------------------------------
let particulas = [];
let semilla = 1;
let rng;

// Cantidad de cada tipo. Es el único parámetro VARIABLE del sistema: los
// deslizadores lo modifican en vivo, sin reiniciar, para poder ver el efecto
// del peso de cada población sobre el mismo estado en curso.
// Poner el Solitario en cero sirve de CONTRAPRUEBA: al quitar un tipo el
// ciclo se abre y deja de ser ciclo — el Bloque persigue al Grupo, el Grupo
// huye y no tiene a quién perseguir, y todo termina apilado contra una pared.
// Muestra que el movimiento no viene de las fuerzas sino de que la
// persecución se cierre sobre sí misma.
let cantidades = [306, 297, 297];

let enPausa = false;
let panelVisible = true;

let celdas = [];
let cols = 0;
let filas = 0;

// --- Generador aleatorio con semilla (mulberry32) --------------------------
// Para que la variabilidad entre ejecuciones sea reproducible: una misma
// semilla produce siempre la misma manifestación.
function crearRng(s) {
  let a = s >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  const params = new URLSearchParams(window.location.search);
  semilla = parseInt(params.get("seed"), 10) || floor(Math.random() * 999999);

  reiniciar();
  conectarDeslizadores();
  actualizarPanel();
}

// Los deslizadores son la única fuente de verdad de las cantidades: al
// arrancar toman su valor del control, no al revés.
function conectarDeslizadores() {
  const ids = ["s-blo", "s-gru", "s-sol"];
  for (let t = 0; t < 3; t++) {
    const el = document.getElementById(ids[t]);
    if (!el) continue;
    el.value = cantidades[t];
    el.addEventListener("input", function () {
      ajustarCantidad(t, parseInt(el.value, 10));
      actualizarPanel();
    });
  }
}

function reiniciar() {
  rng = crearRng(semilla);
  particulas = [];

  // Distribución inicial al azar uniforme: nada está predefinido. Quién
  // alcanza a quién primero decide cómo se organiza toda la corrida.
  for (let t = 0; t < 3; t++) {
    for (let i = 0; i < cantidades[t]; i++) {
      particulas.push(nueva(t, rng() * width, rng() * height, rng));
    }
  }
  construirGrilla();
}

function nueva(t, x, y, azar) {
  const a = azar || Math.random;
  return { x: x, y: y, vx: (a() - 0.5) * 2, vy: (a() - 0.5) * 2, ax: 0, ay: 0, t: t };
}

// Ajusta una población EN VIVO, sin reiniciar: agrega partículas nuevas en
// posiciones al azar o retira las últimas de ese tipo. Así se puede ver el
// efecto de cambiar el peso de un tipo sobre una configuración ya formada, en
// vez de solo compararlo entre corridas distintas.
function ajustarCantidad(t, n) {
  cantidades[t] = n;
  let actual = 0;
  for (const p of particulas) if (p.t === t) actual++;

  while (actual < n) {
    particulas.push(nueva(t, Math.random() * width, Math.random() * height));
    actual++;
  }
  for (let i = particulas.length - 1; i >= 0 && actual > n; i--) {
    if (particulas[i].t === t) {
      particulas.splice(i, 1);
      actual--;
    }
  }
}

// --- Grilla espacial (para no comparar todas contra todas) ----------------
function construirGrilla() {
  cols = max(1, ceil(width / RMAX_GLOBAL));
  filas = max(1, ceil(height / RMAX_GLOBAL));
  celdas = new Array(cols * filas);
  for (let i = 0; i < celdas.length; i++) celdas[i] = [];
}

function llenarGrilla() {
  for (let i = 0; i < celdas.length; i++) celdas[i].length = 0;
  for (const p of particulas) {
    const cx = constrain(floor(p.x / RMAX_GLOBAL), 0, cols - 1);
    const cy = constrain(floor(p.y / RMAX_GLOBAL), 0, filas - 1);
    celdas[cy * cols + cx].push(p);
  }
}

// --- Perfil de fuerza -----------------------------------------------------
// Negativo = repulsión, positivo = atracción.
function magnitud(r, rel) {
  if (r < rel.rMin) {
    // Núcleo cúbico: crece muy rápido al acercarse a cero. Un perfil lineal
    // no alcanza a contener la suma de atracciones de decenas de vecinos
    // —la atracción suma sobre un área mayor— y todo colapsa en un punto.
    const q = rel.rMin / max(r, 1);
    return -rel.rep * min(q * q * q - 1, 60);
  }
  if (r < rel.rMax) {
    // Banda con pico en el medio y caída a cero en los extremos.
    const medio = (rel.rMin + rel.rMax) * 0.5;
    return rel.a * (1 - abs(r - medio) / (medio - rel.rMin));
  }
  return 0;
}

function aplicarFuerzas() {
  llenarGrilla();

  for (const p of particulas) {
    let ax = 0;
    let ay = 0;

    const gx = constrain(floor(p.x / RMAX_GLOBAL), 0, cols - 1);
    const gy = constrain(floor(p.y / RMAX_GLOBAL), 0, filas - 1);

    for (let oy = -1; oy <= 1; oy++) {
      const yy = gy + oy;
      if (yy < 0 || yy >= filas) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const xx = gx + ox;
        if (xx < 0 || xx >= cols) continue;

        const celda = celdas[yy * cols + xx];
        for (const q of celda) {
          if (q === p) continue;

          const rel = REL[p.t][q.t];
          if (!rel) continue; // indiferencia: no siente nada

          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > RMAX_GLOBAL * RMAX_GLOBAL || d2 < 1e-6) continue;

          const r = sqrt(d2);
          if (r >= rel.rMax && r >= rel.rMin) continue;

          const f = magnitud(r, rel);
          if (f === 0) continue;
          ax += (dx / r) * f;
          ay += (dy / r) * f;
        }
      }
    }

    const m = sqrt(ax * ax + ay * ay);
    if (m > TOPE_ACEL) {
      ax = (ax / m) * TOPE_ACEL;
      ay = (ay / m) * TOPE_ACEL;
    }
    p.ax = ax * ESCALA_FUERZA;
    p.ay = ay * ESCALA_FUERZA;
  }
}

function integrar() {
  for (const p of particulas) {
    const fis = FISICA[p.t];

    // posición <- velocidad <- aceleración
    p.vx = (p.vx + p.ax) * fis.retencion;
    p.vy = (p.vy + p.ay) * fis.retencion;

    // bordes blandos: el mundo es finito
    if (p.x < MARGEN) p.vx += (MARGEN - p.x) * 0.06;
    if (p.x > width - MARGEN) p.vx -= (p.x - (width - MARGEN)) * 0.06;
    if (p.y < MARGEN) p.vy += (MARGEN - p.y) * 0.06;
    if (p.y > height - MARGEN) p.vy -= (p.y - (height - MARGEN)) * 0.06;

    const v = sqrt(p.vx * p.vx + p.vy * p.vy);
    if (v > fis.vmax) {
      p.vx = (p.vx / v) * fis.vmax;
      p.vy = (p.vy / v) * fis.vmax;
    }

    p.x = constrain(p.x + p.vx, 0, width);
    p.y = constrain(p.y + p.vy, 0, height);
  }
}

function draw() {
  // Las estelas: en vez de borrar el lienzo entero cada cuadro, se le quita un
  // poco de opacidad a lo ya dibujado, así lo anterior se va desvaneciendo.
  // No es decoración: hace visible la trayectoria de la persecución, que es de
  // lo que trata el sistema.
  //
  // Se BORRA (erase) en vez de pintar un velo oscuro encima. Pintando un velo,
  // la mezcla se hace con enteros y en cuanto un píxel queda a menos de unas
  // pocas unidades del color de fondo el redondeo deja de restar: se congela
  // ahí y queda un dibujo fantasma permanente de todo lo que pasó. Borrando,
  // la opacidad sí llega a cero y el fondo queda limpio.
  noStroke();
  erase(26);
  rect(0, 0, width, height);
  noErase();

  if (!enPausa) {
    aplicarFuerzas();
    integrar();
  }

  dibujar();
  if (frameCount % 20 === 0) actualizarPanel();
}

function dibujar() {
  noStroke();
  // El Solitario se dibuja algo más grueso que el Grupo: es el único que va
  // suelto y hay que poder seguirlo con la vista entre las masas.
  const tam = [5.2, 4.2, 6.4];

  for (const p of particulas) {
    const v = sqrt(p.vx * p.vx + p.vy * p.vy);
    const c = COLORES[p.t];
    // el brillo sube con la velocidad: se ve quién está corriendo
    fill(c[0], c[1], c[2], 110 + min(v * 50, 145));
    circle(p.x, p.y, tam[p.t]);
  }
}

// --- Panel ----------------------------------------------------------------
function texto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function actualizarPanel() {
  const conteo = [0, 0, 0];
  for (const p of particulas) conteo[p.t]++;

  texto("n-blo", conteo[BLO]);
  texto("n-gru", conteo[GRU]);
  texto("n-sol", conteo[SOL]);
}

function keyPressed() {
  const k = key.toLowerCase();

  if (k === "r") {
    // Reset: vuelve a repartir todo al azar con una semilla nueva, sin tocar
    // las cantidades que hayan quedado en los deslizadores.
    semilla = floor(Math.random() * 999999);
    reiniciar();
  } else if (k === " ") {
    enPausa = !enPausa;
  } else if (k === "h") {
    panelVisible = !panelVisible;
    const el = document.getElementById("panel");
    if (el) el.style.display = panelVisible ? "block" : "none";
  }

  actualizarPanel();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  construirGrilla();
}
