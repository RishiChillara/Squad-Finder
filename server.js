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
var circlesRef = db.ref("Circles");


io.on('connection', function(client) {

  console.log('Client connected...');

    client.on('createCircleClicked', function(data) {
		//create circle
		var userArr = data.usersAdd.replace(/\s/g,'').split(',');
		userArr.push(data.userName);
		var users = JSON.stringify(userArr);

		circlesRef.update({
			[data.circle]: {
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

		client.emit('createCircleSuccess',{'circle_name' : data.circle})

  });


  client.on('updatePosition',function(data){

		var i = data.userName.indexOf("@");
		var userID = data.userName.substring(0,i)

		usersRef.child(userID).update({
			lat: data.lat,
			long: data.lng
		})

		client.emit('locationUpdateSuccess')
  });

	client.on('createEventClicked', function(data){

		class Location {
			constructor(locname, loclat, loclong) {
				this.name = locname;
				this.lat = loclat;
				this.long = loclong;
			}
		}

        var krach = new Location("Krach Leadership Center", 40.427270, -86.916160);
        var hicks = new Location("John W. Hicks Undergraduate Library", 40.424380, -86.912780);
        var wlpl = new Location("West Lafayette Public Library", 40.424380, -86.907450);
		var star = new Location("Starbucks", 40.452911, -86.915314);
		var walc = new Location("Wilmeth Active Learning Center", 40.428080, -86.913760);


		var locations = [];

    locations.push(hicks);
		locations.push(walc);
		locations.push(krach);
		locations.push(wlpl);
		locations.push(star);



		var userLocations = [];
		var lats = [];
		var longs = [];


		function getLat(ID){

			usersRef.child(ID + "/lat").on("value", function(snapshot) {
				var lat = snapshot.val();
				lats.push(lat);


			});
		}

		function getLong(ID) {

			usersRef.child(ID + "/long").on("value",function(snapshot) {
				var long = snapshot.val();
				longs.push(long);
			});


		}

		//lopp through everyone in circle and add locations to array
		//
		usersRef.child(data.userName.substring(0,data.userName.indexOf("@"))
		+ "/circles").on("value", function(snapshot) {
			var circName = snapshot.val();

			circlesRef.child(circName).on("value", function(snapshot) {

				var eventParticpants = snapshot.val().circle_partipants;
				var obj = JSON.parse(eventParticpants);


				for(var c = 0; c < obj.length; c++) {

					var ID = obj[c].substring(0,obj[c].indexOf("@"));

					getLat(ID);
					getLong(ID)

					userLocations.push(new Location(ID,lats[c],longs[c]));
				}
			  });

		  });


		  console.log(userLocations);


		function findAverage(userLocations){

			var latitudeSum = 0;
			var longitudeSum = 0;
		   var latTitArray = []
		   var longTitArray = []


		   for(var x = 0; x < userLocations.length; x++){
			   latTitArray[x] = userLocations[x].lat;
			   longTitArray[x] = userLocations[x].long;
		   }

		   for(var i = 0; i <  userLocations.length; i++){
			   latitudeSum = latTitArray[i] + latitudeSum;
			   longitudeSum = longTitArray[i] + longitudeSum;
		   }

		   var latAvg = (latitudeSum/userLocations.length);
		   var longAvg = (longitudeSum/userLocations.length);


		var result = new Location("result",latAvg,longAvg);

		return result;


		}

		function findStudyCenter(result, locations){

			var distances = [];
			var cLat = result.lat;
			var cLong = result.long;
			for (var i=0; i<locations.length; i++){

				var sLat = (locations[i].lat);
				var sLong = (locations[i].long);

				var d = Math.sqrt(Math.pow((cLat-sLat),2)+Math.pow((cLong-sLong),2));
				distances[i]=d;
			}
			var g = 1000.00;
			var arrIndex=0;
			for (var j =0; j<distances.length; j++){
				if (distances[j]<g){
					g = distances[j];
					arrIndex=j;
				}
			}

			return locations[arrIndex];
		}

		if(userLocations.length != 0){
			var final;
			if(data.actType == "eat"){
			final = new Location("Windsor Dining Hall", 0, 0);
			} else {
			final = findStudyCenter(findAverage(userLocations),locations);
			}
		console.log(final.name);
		client.emit("resultMade",{'result': final.name})


		}



	});



});
