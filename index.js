// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
  
    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
   
  });

 
		var map, infoWindow;
		
		function initMap() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 17
		});
		infoWindow = new google.maps.InfoWindow;

		// Try HTML5 geolocation.
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

		
			infoWindow.setPosition(pos);
			infoWindow.setContent('Your Location');
			infoWindow.open(map);

			map.setCenter(pos);
			}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
			});
		} else {
			// Browser doesn't support Geolocation
			handleLocationError(false, infoWindow, map.getCenter());
		}
		}

		function handleLocationError(browserHasGeolocation, infoWindow, pos) {
		infoWindow.setPosition(pos);
		infoWindow.setContent(browserHasGeolocation ?
								'Error: The Geolocation service failed.' :
								'Error: Your browser doesn\'t support geolocation.');
		infoWindow.open(map);
		}


	var socket = io.connect();

	// SOCKETS
	socket.on('connect', function() {

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			if (navigator.geolocation) {

				navigator.geolocation.getCurrentPosition(function(position) {

				data = {
					userName: user.email,
					lat: position.coords.latitude,
					lng: position.coords.longitude 
				}

				socket.emit('updatePosition',data);	

				});
			}

			var logoutelem = document.getElementsByClassName('logged-out');

			for (var i = 0; i < logoutelem.length; i ++) {
				logoutelem[i].style.display = 'none';
			}

			var loginelem = document.getElementsByClassName('logged-in');

			for (var i = 0; i < loginelem.length; i ++) {
				loginelem[i].style.display = 'block';
			}

			document.getElementById("userName").innerHTML = user.email;	

		} else {

			var appBanners = document.getElementsByClassName('logged-in');
			
			for (var i = 0; i < appBanners.length; i ++) {
			appBanners[i].style.display = 'none';
			}

			var visibileElem = document.getElementsByClassName('logged-out');

			for (var i = 0; i < visibileElem.length; i++) {
			visibileElem[i].style.display = 'block';
			}
		}
	});

});

	//send message on add Circle
	function addCircles(e){
		e.preventDefault();

		const addForm = document.querySelector('#addCircles-form');
		const circleName = addForm['circlename'].value;
		const userstooAdd = addForm['users-add'].value;
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				var data = {
					userName: user.email,
					circle: circleName, 
					usersAdd: userstooAdd}
				socket.emit('createCircleClicked',data);
			} else {
			  // No user is signed in.
			}
		  });
		
	}

	function createMeeting(e){
		e.preventDefault();
		firebase.auth().onAuthStateChanged(function(user) {
		const addForm = document.querySelector('#createEvent-form');
		const type = addForm['activityType'].value;


			if (user) {
				var data = {
					userName: user.email,
				actType: type}

				socket.emit('createEventClicked',data);
			} 
		  });
		
	}

	//Client Confirmaiton on Add circle
	socket.on('createCircleSuccess', function(data) {
		console.log("Circle Made")
		console.log(data);
		const addForm = document.querySelector('#addCircles-form');
		const modal = document.querySelector('#modal-addcircles');
		M.Modal.getInstance(modal).close();
		addForm.reset();
		document.getElementById("circleCreateEvent").innerHTML = "Circle: " + data.circle_name;

		var myLatLng = {lat: 40.425008, lng: -86.912764}; //HICKS Undergraduate Library
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: 'Safi Q'
			  });

			  var myLatLng = {lat: 40.427777, lng: -86.916951}; //Lawson Computer Science Building
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: 'Andy Yoo'
			  });

			  var myLatLng2 = {lat: 40.428404, lng: -86.912907};
			var marker1 = new google.maps.Marker({
				position: myLatLng2,
				map: map,
				title: 'Advait M'
			  });
			  var myLatLng3 = {lat: 40.428544, lng: -86.920816};
			var marker2 = new google.maps.Marker({
				position: myLatLng3,
				map: map,
				title: 'Isha S'
			  });


	})

	socket.on('locationUpdateSuccess',function() {
		console.log("location updated")


	})

	socket.on("resultMade",function(data) {
		document.getElementById("result").innerHTML = "Meet up at " + data.result;

	})

	
