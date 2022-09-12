/**
 * Geosoft 1 Project, SoSe 2022
 * @author Arne Wilberg, matr.Nr.: 513722
 * @author Kieran Galbraith, matr.Nr.: 453493
 */

//****various Linter configs****
// jshint esversion: 6
// jshint browser: true
// jshint node: true
// jshint -W097

var meta = document.createElement('meta');
meta.authorname = "author";
meta.content = "Authors: Arne Wilberg, Kieran Galbraith";
document.head.appendChild(meta);
var meta = document.createElement('meta');
meta.description = "description";
meta.content = "This website lets you set your own location for getting information about mountains on the main page. This can be done by entering an Adress, using your browser location or maring a location on the leaflet map via leaflet draw";
document.head.appendChild(meta);

// button for submitting the updates of a user-point's coordinates
document.getElementById('updateButton');

var userLocation;
var properties;

// creating a map for the user to create points
var map = L.map('locationCreatorMap', {
  drawControl: false
}).setView([50.84784, 4.35276], 7);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// adding drawcontrol and only enabling points and polygons
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  draw: {
  },
  edit: {
    featureGroup: drawnItems
  }
});

// adding drawControl
map.addControl(drawControl);

// adding the drawn points to map via event
map.on('draw:created', function (e) {

  var type = e.layerType,
    layer = e.layer;
  userLocation = (layer.getLatLng());
  if (type === 'marker') {
    map.on('click', function (e) {}),
      layer.bindPopup('Your marker position: ' + layer.getLatLng()).openPopup();
  }

  geocodedMarker = drawnItems.addLayer(layer);
  inputLocation = [userLocation.lng, userLocation.lat];
  properties = {
    "kind_of_input": "marker"
  };
  JSONconvertion(inputLocation, properties);
});

/**
 * @function forwardGeocoding
 * @desc forward geocoding from an adress to coordinates with the MapBox Geocoding API 
 * @additional you can use your own MapBox access token, get yours here by registering: https://www.mapbox.com/
 * or just use the standard one from the source!
 * @source: https://docs.mapbox.com/api/search/geocoding/
 */
var geocodedAdress = [];
var userAdressInput = "";
var geocodedMarker;

async function forwardGeocoding() {

  var name = document.getElementById('name').value;
  var elev = document.getElementById('elev').value;
  var url = document.getElementById('url').value;
  // fill in your MapBox access token here (or use this standard key):
  var access_token = "pk.eyJ1Ijoiam9udGhubW0iLCJhIjoiY2w0bG0yMWhxMHJrMTNjbW54MHE0bnl5bCJ9.YhVs13HNWHkrQs8WHwETrw";

  userAdressInput = name + ': ' + elev + ' Meters' + ', ' + url;
  var resource = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + name + ".json?&access_token=" + access_token;
  const response = await fetch(resource);
  const data = await response.json();
  if (geocodedMarker != undefined) {
    geocodedMarker.remove();
  }
  geocodedAdress = data;
  geocodedAdress = geocodedAdress.features[0].geometry.coordinates;
  geocodingInputMapping();
}

/**
 * @function geocodingInputMapping
 * @desc displaying User Input adress on the draw Map, Mapbox
 */


function geocodingInputMapping() {
  geocodedMarker = L.marker([geocodedAdress[1], geocodedAdress[0]], {
    icon: positioning
  }).addTo(map);
  geocodedMarker.bindPopup(userAdressInput).openPopup();
  inputLocation = [geocodedMarker._latlng.lng, geocodedMarker._latlng.lat];
  properties = {
    "name": document.getElementById('name').value, "elevation": document.getElementById('elev').value, "url": document.getElementById('url').value,
    "kind_of_input": "adress"
  };
  JSONconvertion(inputLocation, properties);
}

/**
 * @function userLocationMapping
 * @desc sets a maker to the Browser location, after Button is clicked
 */
function userLocationMapping() {
  L.marker([inputLocation[1], inputLocation[0]], {
    icon: positioning
  }).addTo(map);
  properties = {
    "kind_of_input": "browser Location"
  };
  JSONconvertion(inputLocation, properties);
}

// styling for the icon for the positioning on the map
var positioning = L.icon({
  iconUrl: 'public/position.png',
  iconSize: [25, 25], // size of the icon
});

/**
 * @function JSONconvertion
 * @desc converts and sends the to JSON converted data of all positions to the server
 * @param storedCoordinates array that stores the coordinates
 * @param creationProperties stores the properties of an object about how it was created 
 */

var convertedJSON;

function JSONconvertion(storedCoordinates, creationProperties = {}) {
  convertedJSON = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": storedCoordinates
    },
    "properties": creationProperties
  };
  document.getElementById("result").innerHTML = JSON.stringify(convertedJSON);
  // post reqeuest to send the converted JSON objects to the server via /save-input
  fetch('/save-input', {
    method: 'post',
    body: JSON.stringify(convertedJSON),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

/**
 * @function displayDatabaseData
 * @desc calls the data stored in the MongoDB database by the user and makes it displayable
 */

var length;
async function displayDatabaseData() {

  let result = await promise();
  multipleOptionCheckboxList(result);
  length = result.length;
}

/**
 * @function promise
 * @desc /item request to the server
 */

function promise() {

  return new Promise(function (res, req) {
    $.ajax({
      url: "/item",
      success: function (result) {
        res(result);
      },
      error: function (err) {
        console.log(err);
      }
    });
  });
}

/**
 * @function multipleOptionCheckboxList
 * @desc this function is for creating a checkbox list for the user to select them on the location creator page
 * for example to update or delete them
 * @param result contains all database objects
 */

function multipleOptionCheckboxList(result) {
  document.getElementById('ul').innerHTML = '';
  // list of database content
  for (var i = 0; i < result.length; i++) {
    var ul = document.getElementById('ul');
    var li = document.createElement('li' + i);

    var checkbox = document.createElement('input');

    // checkbox type for multiple selection
    checkbox.type = "checkbox";
    checkbox.id = "checkboxid" + i;
    checkbox.value = JSON.stringify(result[i]);

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(JSON.stringify(result[i]), '<br/>'));
    ul.appendChild(li);
    ul.appendChild(document.createElement("br"));
    ul.appendChild(document.createElement("br"));
  }
}

/**
 * @function dataDeleter
 * @desc makes it possible for the user to delete one or multiple locations stored in the database
 */

function dataDeleter() {
  var value = [];
  var id = [];
  // checks which elements are checked
  for (var i = 0; i < length; i++) {
    if (document.getElementById("checkboxid" + i).checked) {
      value = document.getElementById("checkboxid" + i).value;
      value = JSON.parse(value);
      id = value._id;
      // server request - deleting checked item by _id
      fetch("/delete-input", {
        method: 'delete',
        body: JSON.stringify(value),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (res.ok) return res.json();
      }).then(displayDatabaseData());
    } else {
      console.log(i);
    }
  }
}

/**
 * @function nameUpdater
 * @desc makes it possible for the user to update the names of a location by choice in the database checklist
 */

var value = [];

function nameUpdater() {
  // textarea to update the names
  var id = [];
  var textfield;
  var div = document.getElementById("updateTextarea");

  textfield = document.createElement("textarea");
  textfield.id = 'update';
  textfield.style.width = '300px';

  // only the last checked location is taken if more then one location of the checklist ist choosen
  for (var i = 0; i < length; i++) {
    if (document.getElementById("checkboxid" + i).checked) {
      value = document.getElementById("checkboxid" + i).value;
      value = JSON.parse(value);
      id = value._id;
    }
  }
  div.appendChild(textfield);
  document.getElementById('update').value = value.properties.name;
  document.getElementById('updateButton').style.display = 'block';
}

/**
 * @function nameServerUpdater
 * @desc put request to the server with /update-input to initalize the updates made by the user in the database
 */

function nameServerUpdater() {
  var updatedValue = document.getElementById('update').value;
  value.properties.name = updatedValue;
  // server request to update the names in the database
  fetch("/update-input", {
    method: 'put',
    body: JSON.stringify(value),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.ok) return res.json();
  }).then(displayDatabaseData());
}
 