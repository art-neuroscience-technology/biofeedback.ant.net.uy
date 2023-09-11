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
    localPort: 5003
});

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});



function process_osc_message(oscMessage) { 
  var address = oscMessage.address
  switch(address) {
    case '/colors':
      socket.emit('setValue_color', oscMessage.args);
      break;
    default:
      // skip
  }

}


udpPort.on("message", function (oscMessage) {
    console.log(oscMessage);
    process_osc_message(oscMessage);
});

udpPort.on("error", function (err) {
    console.log(err);
});

udpPort.open();



//start the server
server.listen(port, function () {
  console.log("Server listening on ", port);
});
