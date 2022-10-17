const path = require("path");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
const port = process.env.PORT || 80


app.use(express.static("public"));


//Connect to Firebase database
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "biofeedback-9824c",
    private_key_id: "ID",
    private_key:
      "-----BEGIN PRIVATE KEY-----"
      client_email:
      "firebase-adminsdk-rtu4u@biofeedback-9824c.iam.gserviceaccount.com",
    client_id: "ID",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-rtu4u%40biofeedback-9824c.iam.gserviceaccount.com",
  }),
  // The database URL depends on the location of the database
  databaseURL: "https://biofeedback-9824c-default-rtdb.firebaseio.com/",
});

var db = admin.database();

//Auxiliar functions

function readFromFirebase(key, socket) {
    var ref = db.ref(key);
    ref.on("value", function (snapshot) {
      console.log(key , snapshot.val());
      socket.emit('setValue' + key, snapshot.val())
    });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

//start the server
server.listen(port, function () {
  console.log("Server listening on ", port);
});


io.on('connection', (socket) => {

    const modulesNames = ['Caleidoscopio', 'Modulacion','Modulacion2', 'Oscilador2']
    const modules = ["modulateKaleid", "mod","mod2","osc2"];
    
    for (let i = 0; i < modulesNames.length; i++) {
      
      //listen for changes in Firebase
      readFromFirebase(modulesNames[i], socket)

      //listen for changes in module and save in Firebase
      socket.on(modules[i] + 'Value', (value) => {
        console.log('Saving', modulesNames[i], value)
        db.ref(modulesNames[i]).set(value);
      });
    }

});

