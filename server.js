const path = require("path");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var socket = require("socket.io")(server);
const port = process.env.PORT || 80


app.use(express.static("public"));

var osc = require("osc");


/****************
 * OSC Over UDP *
 ****************/

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 5001
});

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});


function transform_scale(old_value, old_min, old_max, new_min, new_max){
  new_value = ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min
  return new_value
}

function process_osc_message(oscMessage) { 
  var address = oscMessage.address
  console.log(oscMessage)
  switch(address) {
    case '/muse/elements/delta_absolute':
      new_value = transform_scale(oscMessage.args[1], -1, 1, 1, 8)
      socket.emit('setValue_delta', new_value)
      break;
    case '/muse/elements/theta_absolute': 
      new_value = transform_scale(oscMessage.args[1], -1, 1, 0, 0.5)
      socket.emit('setValue_theta', new_value)
      break;
    case '/muse/elements/alfa_absolute':
      new_value = transform_scale(oscMessage.args[1], -1, 1, 0, 0.5)
      socket.emit('setValue_alfa', new_value)
      break;
    case '/muse/elements/beta_absolute':
      new_value = transform_scale(oscMessage.args[1], -1, 1, 0, 50)
      socket.emit('setValue_beta', new_value)
      break;
    case '/muse/elements/gamma_absolute':
      new_value = transform_scale(oscMessage.args[0],-1, 1, -0.5, 0.5)
      socket.emit('setValue_gamma', new_value)
      break;
    default:
      // skip
  }

}


udpPort.on("message", function (oscMessage) {
    process_osc_message(oscMessage)
});

udpPort.on("error", function (err) {
    console.log(err);
});

udpPort.open();



//start the server
server.listen(port, function () {
  console.log("Server listening on ", port);
});
