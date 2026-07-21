function setup() {
  createCanvas(640, 480);
  background(20);
}

function draw() {
  background(20);

  fill(255, 204, 0);
  noStroke();
  circle(mouseX, mouseY, 80);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Hola, p5.js", width / 2, height / 2 + 90);
}
