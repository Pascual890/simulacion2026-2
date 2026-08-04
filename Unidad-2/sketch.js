function setup() {
  createCanvas(windowWidth, windowHeight);
  background(30);
  noStroke();
}

function draw() {
  fill(255, 120, 0, 180);
  const x = mouseX;
  const y = mouseY;
  const size = 80 + 40 * sin(frameCount * 0.05);
  ellipse(x, y, size, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
