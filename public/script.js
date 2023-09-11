const canvas = document.getElementById("myCanvas");

canvas.width = 1024;
canvas.height = 1024;
var hydra = new Hydra({
  canvas,
  detectAudio: false,
  enableStreamCapture: false,
});

// Set up an interval to continuously check for changes in the colors array and update visuals
setInterval(updateVisuals, 300); // Adjust the interval time as needed

// Function to update visuals based on the colors array
function updateVisuals() {
  var colors = document.getElementById('colors').value
  colors = colors.split(',')
  speed=8
  shape(99,.15,.5).color(colors[0],colors[1], colors[2])

  .diff( shape(240,.5,0).scrollX(.05).rotate( ()=>time/10 ).color(colors[3],colors[4], colors[5]) )
  .diff( shape(99,.4,.002).scrollX(.10).rotate( ()=>time/20 ).color(colors[6],colors[7], colors[8]) )
  .diff( shape(99,.3,.002).scrollX(.15).rotate( ()=>time/30 ).color(colors[0],colors[1], colors[2]) )
  .diff( shape(99,.2,.002).scrollX(.20).rotate( ()=>time/40 ).color(colors[3],colors[4], colors[5]) )
  .diff( shape(99,.1,.002).scrollX(.25).rotate( ()=>time/50 ).color(colors[6],colors[7], colors[8]) )

  .modulateScale(
    shape(240,.5,0).scrollX(.05).rotate( ()=>time/10 )
    , ()=>(Math.sin(time/3)*.2)+.2 )

  .scale(1.6,.6,1)
  .out()
}
