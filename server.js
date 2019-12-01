// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 

app.use(express.static(__dirname)); 
//redirect / to our index.html file
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});


var admin = require("firebase-admin");
var firebase = require('firebase');
var serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://launchpad-f189d.firebaseio.com"
});

var db = firebase.database();
var usersRef = db.ref("users");
var circles = db.ref("Circles");


io.on('connection', function(client) { 

  console.log('Client connected...'); 
  
    client.on('createCircleClicked', function(data) {
		//create circle
		var randomID = '_' + Math.random().toString(36).substr(2, 9);
		var userArr = data.usersAdd.replace(/\s/g,'').split(',');
		var users = JSON.stringify(userArr);

		circles.set({
			[randomID]: {
			circle_name: data.circle,
			circle_partipants: users
			}
		});

		// add creator of circle
		var i = data.userName.indexOf("@");
		var userID = data.userName.substring(0,i)
		usersRef.child(userID).update({circles: data.circle})

		// add circle members 
		for(var i = 0; i < userArr.length;i++) {
			
			var userIDtoAdd = userArr[i].substring(0,userArr[i].indexOf("@"))
			usersRef.child(userIDtoAdd).update({circles: data.circle})

		}

        client.emit('createCircleSuccess')
  });
  
  client.on('updatePosition',function(data){

		var i = data.userName.indexOf("@");
		var userID = data.userName.substring(0,i)
		
		usersRef.set({
		[userID]: {
			lat: data.lat,
			long: data.lng
		}
		});

		client.emit('locationUpdateSuccess')
  });

	

});