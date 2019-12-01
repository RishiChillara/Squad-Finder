// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
  
    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
   
  });

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

	//Client Confirmaiton on Add circle
	socket.on('createCircleSuccess', function() {
		console.log("Circle Made")
		const addForm = document.querySelector('#addCircles-form');
		const modal = document.querySelector('#modal-addcircles');
		M.Modal.getInstance(modal).close();
		addForm.reset();
	})

	socket.on('locationUpdateSuccess',function() {
		console.log("location updated")
	})
