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
    private_key_id: "1f584d2567a67ad176a17b51ee7e9634db590ae8",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5lpcB3mlBvK4l\nZewHeeabFxfat7pMtRgpu19ruSaPCwnGwlQRsQE+uR31i6w80I5HicqPOklmK7x9\n0d5mFobqMgWATvXslJk0DP1vK2bzujt5CBubv5+IlbEj7mW7LruTBJ5Wf5xaXQUm\nMBar511B9S0m+Y+almQCzXcg9ApcW+GVORsSwhcVimpLKQ4jkVZ17b0Opk72Homa\nbnkmk1UNgq9fStMnuubUDJ1GIx/VNqv+mOktADhOD/zjxlaJpv91W+lQUT1PnznZ\nBSXTMQ/AC0LX6xXdnyVXllUZN1lu79eNcUjCwJTHhmQa8JPtnbo1GuD0xop7MOsE\niIKqmG8TAgMBAAECggEAN1Vi6Le7glITSis9WG1MCGm2PwwQi9Ziwe6P4LpveK69\n13kRP8Uarezbtd5TGD7GbSX0MwgZ4lCf/pOYT6/fwevwH/Vq9YLIuvA0j/TM2VZp\nbQix0pororme+yuVQV4Jpyf1XazmnTqm0l/8Inz1HTlQoRI/csPsRbmlDzoz7J0m\nB9aZaHt5ZT77NcgeDe4Uyfy3n4WwdZaDRaPNMdlSiA8U1OAWiPhvIt5mg95tVIvs\nFB/grHdIVoYv7VMLbCttoPIXZQEHufe6UbmPWOpYjaezLGfPMq4ROXNMAWfGhP2T\niOsZY/rhrVoqmQ7/3Pa/im1769mHS4xhaA8UUPSyYQKBgQDt3EwTIobcuEScy9VF\n0B6LDWatlqblmOTPXCVKykX401mShUkUqUXsOwSX5Dvyryqi27foF1FhXDxI8msO\nn5zTuvfxPir1lEkSE0xZWfdw+nXa8OYQC8gdQob1hExRnO/QEVPYot5Yppke9R3l\nKwxxwOma5Eh4B+OnztuAvN9FdQKBgQDHvcqVmh4ru9v9iwXAziCjyftTpRn7N7d9\nMGkcd/3bPVYQlt0RcA8Z/2lEZXRJxn7mZBJcDktdIYj+Qou+/UmcL1zjzUiLMMi1\nqrwWEhG4c03PMSJSj5VDnvvpc28Xyz0TFgwdLdHqRLjCuJbgSJYLmIxgMnwKGpV2\n7Y9J7tzpZwKBgQC9UTPznu18S+XAbrQnRsiooFfzHg9ketbS/GJqLqiWrZGDfzZ1\njW0r4qV7R5s3Q5hJ21t7DOQm+8S3wsrW7s9h7lRd3L9Qi1/FVTrVezfo4lBfnJFg\ngCAcudC1JUGhS6nMD56OtMMICEGjVDEhL6xN9d94+u17K7xU2d33j1yd6QKBgQC4\nI84ZsSVTaDLdQUcigmUw2kpqyHB1Wt47+V9NsYlEjv1C+fH/23DwpLhlJ6rXQLlI\nqMUMPNlZmEr1LGAsyNENvdRC5sOUHntKj4YqSqovg40eD8v2lQwkdPMEOzkVlHZP\nnCm61L0K3iP+z7G4PvKk6hOvs5sKrYtRQpywqhbazQKBgDr0UjEr2vX7R1AlF265\nq7L5XULHX0NGDg0nNc9bsckIXl97LL809tjFOsQDwhVsmKQDBc/NUcoI8W6KSrHZ\n0I5T+yMCZOzaITaqBCJY+regu9WE+CfoEni6hJ0sDWJVAMxubw88E2+iAq7Dnzqr\nvObuB8qcdP518rywcX995D4A\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-rtu4u@biofeedback-9824c.iam.gserviceaccount.com",
    client_id: "114662101372248368767",
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

