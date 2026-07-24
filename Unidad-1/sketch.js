// ---------------------------------------------------------------------------
// MICELIO — Navegar la incertidumbre
//
// Un solo sistema de crecimiento continuo. Cada hifa (caminador) vive las
// 5 "reglas" del reto a la vez, no en fases separadas:
//   Posibilidad -> dirección inicial uniforme en un arco amplio
//   Tendencia   -> "commitment" que crece con la edad y sesga el rumbo
//   Normalidad  -> giro por paso ~ gaussiana; nacimiento en X ~ gaussiana
//   Excepción   -> dispersión de esporas (distancia tipo Lévy) que funda
//                  colonias nuevas, sin que la hifa de origen se mueva
//   Influencia  -> el puntero/dedo deforma el campo de rumbo (nutriente)
// Ruido Perlin da la corriente ambiental de fondo que nunca se detiene.
// ---------------------------------------------------------------------------

const W = 1080;
const H = 1920;
const MAX_HYPHAE = 170;

const BG_COLOR = [21, 19, 17];
const HYPHA_BASE = [225, 205, 170];
const FLASH_COLOR = [255, 150, 60];
const FLASH_DURATION = 22;
const MAX_COMMITMENT = 0.18;

// desvanecimiento del rastro: uno continuo muy suave (para que una rama
// se vea completa mientras crece, no solo su tramo más reciente) + un
// "reflujo" periódico más fuerte que hace la limpieza de fondo a largo plazo
const TRAIL_FADE_ALPHA = 1.4;
const RECESSION_INTERVAL = 900;
const RECESSION_STRENGTH = 90;
let lastRecession = 0;

// influencia del puntero: radio amplio; el jalón sube con la distancia al
// cuadrado (más fuerte cerca) pero cada hifa apunta a un punto con jitter
// propio, así no colapsan todas en el mismo pixel aunque el jalón sea fuerte
const POINTER_RADIUS = 1450;
const POINTER_MAX_PULL = 0.55;

let cnv;
let trails;
let hyphae = [];
let colonies = [];
let spores = [];
let spawnTimer = 0;
let spawnOrigins = [];

let pointerX = W / 2;
let pointerY = H / 2;
let pointerInfluence = 0;

function setup() {
  cnv = createCanvas(W, H);
  cnv.parent("canvas-wrap");
  pixelDensity(1);
  angleMode(RADIANS);

  trails = createGraphics(W, H);
  trails.clear();

  // 1 a 3 puntos de origen, en posiciones distintas cada vez que carga:
  // así no siempre queda más denso justo en el centro
  const originCount = floor(random(1, 4));
  for (let i = 0; i < originCount; i++) {
    spawnOrigins.push({
      x: random(W * 0.25, W * 0.75),
      y: random(H * 0.3, H * 0.7),
    });
  }

  fitCanvas();
  seedInitialGrowth();
}

function pickSpawnOrigin() {
  return random(spawnOrigins);
}

function windowResized() {
  fitCanvas();
}

function fitCanvas() {
  const scale = min(windowWidth / W, windowHeight / H);
  cnv.elt.style.width = W * scale + "px";
  cnv.elt.style.height = H * scale + "px";
}

function seedInitialGrowth() {
  for (let i = 0; i < 30; i++) {
    const origin = pickSpawnOrigin();
    const x = constrain(randomGaussian(origin.x, W * 0.16), 10, W - 10);
    const y = constrain(randomGaussian(origin.y, H * 0.14), 10, H - 10);
    const h = new Hypha(x, y, random(TWO_PI), 0);
    h.age = floor(random(0, 150));
    hyphae.push(h);
  }
}

function draw() {
  updatePointerInfluence();
  updateColonies();
  handleSpawning();

  for (let i = hyphae.length - 1; i >= 0; i--) {
    const h = hyphae[i];
    h.update();
    h.renderTrail();
    if (!h.alive) hyphae.splice(i, 1);
  }

  updateSpores();

  trails.noStroke();
  trails.fill(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], TRAIL_FADE_ALPHA);
  trails.rect(0, 0, W, H);

  if (frameCount - lastRecession > RECESSION_INTERVAL) {
    trails.fill(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], RECESSION_STRENGTH);
    trails.rect(0, 0, W, H);
    lastRecession = frameCount;
  }

  background(BG_COLOR);
  image(trails, 0, 0);

  // brillo de puntas y esporas: efímero, se dibuja después de componer el
  // rastro para que sí sea visible (antes se dibujaba y se tapaba en el
  // mismo frame por el background()+image() de arriba)
  drawTips();
  drawSporeDots();
}

// --- interacción: el puntero es nutriente, no lápiz -------------------------

function updatePointerInfluence() {
  let active = false;
  if (touches.length > 0) {
    pointerX = touches[0].x;
    pointerY = touches[0].y;
    active = pointerX >= 0 && pointerX <= W && pointerY >= 0 && pointerY <= H;
  } else {
    pointerX = mouseX;
    pointerY = mouseY;
    active = mouseX >= 0 && mouseX <= W && mouseY >= 0 && mouseY <= H;
  }
  pointerInfluence = lerp(pointerInfluence, active ? 1 : 0, active ? 0.08 : 0.02);
}

function touchMoved() {
  return false;
}
function touchStarted() {
  return false;
}

// --- colonias fundadas por dispersión de esporas ----------------------------

function registerColony(x, y) {
  colonies.push({ x, y, age: 0 });
  if (colonies.length > 8) colonies.shift();
}

function updateColonies() {
  for (const c of colonies) c.age++;
  colonies = colonies.filter((c) => c.age < 4000);
}

function findNearestColony(x, y, maxR) {
  let best = null;
  let bestD = maxR;
  for (const c of colonies) {
    const d = dist(x, y, c.x, c.y);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  if (!best) return null;
  return { x: best.x, y: best.y, strength: 1 - best.age / 4000 };
}

// --- esporas: viajan a la vista y germinan una colonia nueva al llegar ------

function updateSpores() {
  for (let i = spores.length - 1; i >= 0; i--) {
    const s = spores[i];
    s.t += 1 / s.duration;
    const ct = min(s.t, 1);
    const baseX = lerp(s.x, s.tx, ct);
    const baseY = lerp(s.y, s.ty, ct);

    // pequeña deriva perpendicular tipo viento, que se apacigua al llegar
    const perpAngle = atan2(s.ty - s.y, s.tx - s.x) + HALF_PI;
    const wobble = sin(ct * PI * 3 + s.wobbleOff) * 16 * sin(ct * PI);
    s.curX = baseX + cos(perpAngle) * wobble;
    s.curY = baseY + sin(perpAngle) * wobble;

    trails.stroke(FLASH_COLOR[0], FLASH_COLOR[1], FLASH_COLOR[2], 80);
    trails.strokeWeight(1.6);
    trails.line(s.px, s.py, s.curX, s.curY);
    s.px = s.curX;
    s.py = s.curY;

    if (s.t >= 1) {
      germinateSpore(s.tx, s.ty);
      spores.splice(i, 1);
    }
  }
}

function germinateSpore(x, y) {
  const h = new Hypha(x, y, random(TWO_PI), 0);
  h.flashTimer = FLASH_DURATION;
  hyphae.push(h);
  registerColony(x, y);
}

function drawTips() {
  noStroke();
  fill(HYPHA_BASE[0], HYPHA_BASE[1], HYPHA_BASE[2], 60);
  for (const h of hyphae) {
    circle(h.x, h.y, h.lastW * 3);
  }
}

function drawSporeDots() {
  noStroke();
  for (const s of spores) {
    fill(FLASH_COLOR[0], FLASH_COLOR[1], FLASH_COLOR[2], 60);
    circle(s.curX, s.curY, 16);
    fill(FLASH_COLOR[0], FLASH_COLOR[1], FLASH_COLOR[2], 235);
    circle(s.curX, s.curY, 7);
  }
}

// --- nacimiento de nuevas hifas ----------------------------------------------

function handleSpawning() {
  spawnTimer--;
  if (spawnTimer <= 0 && hyphae.length < MAX_HYPHAE) {
    const origin = pickSpawnOrigin();
    const x = constrain(randomGaussian(origin.x, W * 0.16), 10, W - 10);
    const y = constrain(randomGaussian(origin.y, H * 0.14), 10, H - 10);
    hyphae.push(new Hypha(x, y, random(TWO_PI), 0));
    spawnTimer = floor(random(4, 13));
  }

  if (pointerInfluence > 0.4 && hyphae.length < MAX_HYPHAE && random(1) < 0.012) {
    const jx = pointerX + randomGaussian(0, 90);
    const jy = pointerY + randomGaussian(0, 90);
    if (jx > 0 && jx < W && jy > 0 && jy < H) {
      hyphae.push(new Hypha(jx, jy, random(-PI, 0), 0));
    }
  }
}

function angleLerp(a, b, t) {
  const diff = (((b - a + PI) % TWO_PI) + TWO_PI) % TWO_PI - PI;
  return a + diff * t;
}

// --- la hifa: caminador correlacionado con tendencia creciente ---------------

class Hypha {
  constructor(x, y, heading, generation) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.heading = heading;
    this.generation = generation || 0;
    this.age = 0;
    this.maxAge = random(260, 520) - this.generation * 40;
    // al nacer se decide, una sola vez, si esta hifa soltará una espora
    // alguna vez en su vida, y en qué momento (sorteado de un rango) —
    // en vez de tirar el dado cada frame mientras vive
    this.willSporulate = random(1) < 0.01;
    this.sporeAge = this.willSporulate ? random(30, this.maxAge) : Infinity;
    this.stepLen = random(0.6, 1.0);
    this.alive = true;
    this.toneJitter = random(-14, 14);
    this.noiseOff = random(1000);
    this.commitment = 0;
    // cada hifa apunta a un punto cercano al puntero, no al píxel exacto,
    // para que no converjan todas en el mismo lugar y formen un remolino
    this.pointerJitterX = randomGaussian(0, 130);
    this.pointerJitterY = randomGaussian(0, 130);
    this.flashTimer = 0;
    this.lastW = 0.9;
  }

  update() {
    this.age++;
    this.commitment = constrain(this.age / 900, 0, MAX_COMMITMENT);

    const flowN = noise(this.x * 0.0022, this.y * 0.0022, frameCount * 0.0018 + this.noiseOff);
    const flowAngle = -HALF_PI + (flowN - 0.5) * PI * 1.1;

    let target = angleLerp(this.heading, -HALF_PI, this.commitment * 0.15);
    target = angleLerp(target, flowAngle, 0.18);

    const colony = findNearestColony(this.x, this.y, 260);
    if (colony) {
      const a = atan2(colony.y - this.y, colony.x - this.x);
      target = angleLerp(target, a, 0.12 * colony.strength);
    }

    if (pointerInfluence > 0.01) {
      const dx = pointerX + this.pointerJitterX - this.x;
      const dy = pointerY + this.pointerJitterY - this.y;
      const d = sqrt(dx * dx + dy * dy);
      if (d < POINTER_RADIUS) {
        const falloff = 1 - d / POINTER_RADIUS;
        const pull = falloff * falloff * pointerInfluence * POINTER_MAX_PULL;
        target = angleLerp(target, atan2(dy, dx), pull);
      }
    }

    this.heading = angleLerp(this.heading, target, 0.06);
    this.heading += randomGaussian() * 0.16;

    this.px = this.x;
    this.py = this.y;
    this.x += cos(this.heading) * this.stepLen;
    this.y += sin(this.heading) * this.stepLen;

    if (this.flashTimer > 0) this.flashTimer--;

    if (this.willSporulate && this.age >= this.sporeAge) {
      this.releaseSpore();
      this.willSporulate = false;
    }

    if (this.commitment > 0.15 && this.generation < 3 && random(1) < 0.006) {
      hyphae.push(new Hypha(this.x, this.y, this.heading + randomGaussian() * 0.9, this.generation + 1));
    }

    if (this.age > this.maxAge || this.x < -40 || this.x > W + 40 || this.y < -40 || this.y > H + 40) {
      this.alive = false;
    }
  }

  releaseSpore() {
    const alpha = 1.5;
    const len = min(800, 12 / pow(random(0.001, 1), 1 / alpha));
    const dir = random(TWO_PI);
    const tx = constrain(this.x + cos(dir) * len, 20, W - 20);
    const ty = constrain(this.y + sin(dir) * len, 20, H - 20);

    spores.push({
      x: this.x,
      y: this.y,
      px: this.x,
      py: this.y,
      tx,
      ty,
      t: 0,
      duration: floor(random(55, 100)),
      wobbleOff: random(1000),
    });
  }

  renderTrail() {
    const w = map(this.commitment, 0, MAX_COMMITMENT, 0.9, 2.4) / (this.generation * 0.6 + 1);
    const a = map(this.commitment, 0, MAX_COMMITMENT, 110, 190);
    this.lastW = w;

    // sube y baja suavemente (0 -> 1 -> 0) en vez de aparecer de golpe
    const flashProgress = 1 - this.flashTimer / FLASH_DURATION;
    const flashAmt = this.flashTimer > 0 ? sin(PI * flashProgress) : 0;
    const col = [
      lerp(HYPHA_BASE[0] + this.toneJitter, FLASH_COLOR[0], flashAmt),
      lerp(HYPHA_BASE[1] + this.toneJitter, FLASH_COLOR[1], flashAmt),
      lerp(HYPHA_BASE[2] + this.toneJitter * 0.6, FLASH_COLOR[2], flashAmt),
    ];

    trails.stroke(col[0], col[1], col[2], a);
    trails.strokeWeight(w);
    trails.line(this.px, this.py, this.x, this.y);
  }
}
