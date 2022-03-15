//envia los eventos al servidor

const canvas = document.getElementById("myCanvas");

canvas.width = 1024;
canvas.height = 1024;
// create a new hydra-synth instance
var hydra = new Hydra({
  canvas,
  detectAudio: false,
  enableStreamCapture: false,
});

var r = 0.3;
var g = 1;
var b = 1;
var k = 4;
var mod = 0;
var mod2 = 0;
var osc2 = 1;

osc(30, 0.05, 1.4)
  .rotate(0, 0.5)
  .mult(osc(10, 0.1).modulate(osc(30).rotate(0, -0.15), 1))
  .add(
    shape(4, 0.2, 1).color(
      () => r,
      () => g,
      () => b,
      0.5
    )
  )
  .modulate(
    osc(6, 0, 1.5)
      .brightness(-0.5)
      .modulate(noise(() => mod2).sub(gradient()), 1),
    () => mod
  )
  .modulate(osc(21, 0.25, () => mod2))
  .modulateScale(osc(() => osc2))
  .modulateKaleid(osc(5), () => k)
  .out(o0);

