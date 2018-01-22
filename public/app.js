

var config = {
  apiKey: "AIzaSyA0Q7m1gULd67FSmRGaoP6UUtV-zlmMcJc",
  authDomain: "althea-locator.firebaseapp.com",
  databaseURL: "https://althea-locator.firebaseio.com",
  projectId: "althea-locator",
  storageBucket: "althea-locator.appspot.com",
  messagingSenderId: "569457338008"
};

firebase.initializeApp(config);

var map;
var geocoder;
var address = null;
var countryFlag = 0;

var userData = {
  country: null,
  email: null,
  lat: null,
  lng: null
}


function initMap() {
  // Initialize blank map with markers
  resetView();

  geocoder = new google.maps.Geocoder();

  submitBtn.addEventListener("click", function() {

    // console.log(country.value);

    
    geocodeAddress(geocoder, map);
  });
}

function readFromFirebase(){
  // Query data base for stored locations
  var fireDataBase = firebase.database().ref().child("Country/");

  fireDataBase.on("child_added", function(snapshot){
    var storedData = snapshot.val();
    var keys = Object.keys(storedData);

    for(var i = 0; i < keys.length; i++){
      var k = keys[i];
      var storedLat = storedData[k].GPS_Coordinates.Latitude;
      var storedLng = storedData[k].GPS_Coordinates.Longitude;

      // Updates map with stored marker
      var marker = new google.maps.Marker({
        position: {lat: storedLat, lng: storedLng}
      });
      marker.setMap(map);
    }
  });
} 

// Convert address to Lat/ Lng
function geocodeAddress(geocoder, resultsMap) {
  geocoder.geocode({'address': address}, function(results, status) {
    console.log(results)
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      resultsMap.setZoom(14);
      var marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: resultsMap
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function setCountryFlag(){
  countryFlag = 1; 
 }

function hideDiv(hide){
  var elemHide = document.getElementsByClassName(hide);
  for(var i = 0; i < elemHide.length; i++){
    elemHide[i].style.display = "none";
  }
}

function showDiv(trig){
  console.log(country)
  hideDiv("hidden_form");
  var elemTrig = document.getElementById(trig);
  if(elemTrig.value == "CA"){
    document.getElementById("user_ca_state_form").style.display = "block";
    countryFlag = 2; 
  }else if(elemTrig.value == "MX"){
    document.getElementById("user_mx_state_form").style.display = "block";
    countryFlag = 3; 
  }else if(elemTrig.value == "US"){
    document.getElementById("user_us_state_form").style.display = "block";
    countryFlag = 1; 
  }else{
    countryFlag = 0;
  }
}

function resetView(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 15, lng: 0},
    zoom: 2,
  });
  readFromFirebase()
}