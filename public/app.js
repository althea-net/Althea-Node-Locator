// @ts-check

var Module = (function () {
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

  var emailAddr = document.getElementById("user_email_input");
  var firstName = document.getElementById("user_fname_input");
  var lastName = document.getElementById("user_lname_input");
  var country = document.getElementById("user_country_menu");
  var city = document.getElementById("user_city_input");
  var zipCode = document.getElementById("user_zip_code_input");

  function initMap() {
    // Initialize blank map with markers
    resetView();

    geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {
      address = city.value + " " + zipCode.value + " " + country.value;
      geocodeAddress(geocoder, map);
    });
  };

  function resetView() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 15,
        lng: 0
      },
      zoom: 2,
    });
    readFromFirebase()
  };

  // Convert address to Lat/ Lng
  function geocodeAddress(geocoder, resultsMap) {
    geocoder.geocode({
      'address': address
    }, function (results, status) {
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
  };

  function readFromFirebase() {
    // Query data base for stored locations
    var fireDataBase = firebase.database().ref().child("Country/");

    fireDataBase.on("child_added", function (snapshot) {
      var storedData = snapshot.val();
      var keys = Object.keys(storedData);

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var storedLat = storedData[k].GPS_Coordinates.Latitude;
        var storedLng = storedData[k].GPS_Coordinates.Longitude;

        // Updates map with stored marker
        var marker = new google.maps.Marker({
          position: {
            lat: storedLat,
            lng: storedLng
          }
        });
        marker.setMap(map);
      }
    });
  };

  return {
    initMap: initMap,
    resetView: resetView
  };

})();