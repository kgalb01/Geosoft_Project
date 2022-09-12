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

//Importing axios
//import axios from 'axios';
// const axios = require('axios').default;

// declaration of global variables
var datalength;
var access_token = "pk.eyJ1Ijoiam9udGhubW0iLCJhIjoiY2w0bG0yMWhxMHJrMTNjbW54MHE0bnl5bCJ9.YhVs13HNWHkrQs8WHwETrw"; //Mapbox access Token
var instructions = document.getElementById('instructions');
var geocoder = new MapboxGeocoder({
  accessToken: access_token
});

// creating a leaflet map for the mountains
var basemap = L.map('mountainMap', {
  center: [50.84784, 4.35276],
  zoom: 5
});
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1
}).addTo(basemap);

/**
 * @function getRoutingLocation
 * @desc Funktion, die im Browser eine Anfrage auf die geographische Position des Nutzers stellt
 * Quelle: https://www.w3schools.com/html/html5_geolocation.asp
 */
 function getRoutingLocation(){
    navigator.geolocation.getCurrentPosition(showRoutingPosition);
}

/**
 * @function showRoutingPosition
 * @desc Funktion um die in "getLocation()" abgefragte Position in validen GeoJSON anzuzeigen
 * wandelt die Position von Lat/Long Koordinaten mit Hilfe der "toGeoJSON()" Funktion um
 * Quelle: https://www.w3schools.com/html/html5_geolocation.asp (abgewandelt)
 * @param position Position des Nutzers
 */
function showRoutingPosition(position) {
  let userLocation = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [position.coords.longitude, position.coords.latitude]
      },
      "properties": {}
    }]
  };
  JSON.parse('{"userLocation":true}');
  userInputLocation = userLocation.features[0].geometry.coordinates;
  showUserLocationMapping();
  eventRoute();
}

/**
 * @function userLocationMapping
 * @desc sets a maker to the Browser location, after Button is clicked
 */
 function showUserLocationMapping() {
  L.marker([userInputLocation[1], userInputLocation[0]], {
    icon: positioning
  }).addTo(basemap);
  properties = {
    "kind_of_input": "browser Location"
  };
}


/**
 * @function displayDatabaseData
 * @desc calls the data stored in the MongoDB database by the user and makes it displayable
 */

async function displayDatabaseData() {
  let result = await promise();
  singleOptionSelectionList(result);
}

/**
 * @function promise
 * @desc /item request to the server with JQuery
 */

function promise() {

  return new Promise(function (res) {
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
 * @function singleOptionSelectionList
 * @desc this function is for creating a single option selection list (radio) for the user to choose one location for calculating the nearest bus stops
 */

function singleOptionSelectionList(result) {
  datalength = result.length;
  // list of database content
  for (var i = 0; i < result.length; i++) {
    var ul = document.getElementById('ul');
    var li = document.createElement('li' + i);

    var checkbox = document.createElement('input');
    // radio for single selection
    checkbox.type = "radio";
    checkbox.id = "checkboxid" + i;
    checkbox.value = JSON.stringify(result[i]);
    checkbox.name = "location";

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(JSON.stringify(result[i])));
    ul.appendChild(li);
    ul.appendChild(document.createElement("br"));
    ul.appendChild(document.createElement("br"));
  }
}

/**
 * @function pushMountains
 * @desc push information from the database into an array for better processing
 * 
 */
 
let outMount = [];
let outTable = [];

 async function pushMountains() {
  let result = await promise();
  for (let i = 0; i < result.length; i++) {
    tableWiki = await fetchWiki(result[i].properties.name);
    outTable.push(tableWiki.query.pages[0].extract);
  }
    for (let j = 0; j < result.length; j++){
      outMount.push([
        [result[j].properties.name],
        [result[j].properties.elevation],
        [result[j].geometry.coordinates],
        [outTable[j]]
    ]);
    }
  tableFiller(outMount);
}

/**
 * @function valueConverter
 * @desc calls pushMountains function to display the mountain information on the webpage with the checked database content
 * and if needed converts it to float values
 */

async function valueConverter() {
  var coordinatesStoredInDatabase;
  var elevStoredInDatabase;
  var nameStoredInDatabase;
  // checked item
  for (var i = 0; i < datalength; i++) {
      dbMountain = document.getElementById("checkboxid" + i).value;
      dbMountain = JSON.parse(dbMountain);
      coordinatesStoredInDatabase = dbMountain.geometry.coordinates;
      elevStoredInDatabase = dbMountain.properties.elevation;
      nameStoredInDatabase = dbMountain.properties.name;
      dbWikiData = await fetchWiki(nameStoredInDatabase);
      dbWikiOutput = dbWikiData.query.pages[0].extract;
      // string to float conversion if needed
      if (typeof coordinatesStoredInDatabase[0] === "string") {
        coordinatesStoredInDatabase = coordinatesStoredInDatabase[0];
        coordinatesStoredInDatabase = coordinatesStoredInDatabase.split(',');
        parseFloat(coordinatesStoredInDatabase[0]);
        parseFloat(coordinatesStoredInDatabase[1]);
        inputLocation = coordinatesStoredInDatabase;
        inputName = nameStoredInDatabase;
        inputElev = elevStoredInDatabase;
        inputURL = dbWikiOutput;
        mainMapUserInput(inputLocation, inputName, inputElev, inputURL);
        pushMountains();
      } else {
        inputLocation = dbMountain.geometry.coordinates;
        inputName = dbMountain.properties.name;
        inputElev = dbMountain.properties.elevation;
        inputURL = dbWikiOutput;
        mainMapUserInput(inputLocation, inputName, inputElev, inputURL);
        pushMountains();
      }
  }
}

/**
 * @function mainMapUserInput
 * @desc function for displaying the checked database content by the user on the map
 */

var mainMapMarker = [];
function mainMapUserInput(inputLocation, inputName, inputElev, inputURL) {
  //mainMapMarker.length = 0;
  mainMapMarker = L.marker([inputLocation[1], inputLocation[0]], {
    icon: positioning
  }).addTo(basemap);
  mainMapMarker.bindPopup(
  'Name: '+ inputName + '</br>' + 
  'Elevation: ' + inputElev + '</br>' +
  'Wiki: ' + inputURL).openPopup();
}

/**
 * @function fetchWiki
 * @desc fetches Wikipedia description of a mountain through API
 * More info on: mediawiki.org/wiki/API:Main_page/de
 * Source: https://www.youtube.com/watch?v=KlTrP6XYvEM&t
 */

function fetchWiki(param){
  const wikiEndpoint = 'https://de.wikipedia.org/w/api.php';
  const wikiParams = '?action=query'
  + "&prop=extracts" // The type of property being requested to the API ('extract')
  + "&exsentences=3" // Requests the first 3 sentences from Wiki
  + "&exlimit=1" 
  + "&titles=" + param //Tells the API which Wikipedia page to get an extract from
  + "&explaintext=1" //Tell the API to provide the content in plain text
  + "&format=json" // Requests the data as JSON Format
  + "&formatversion=2" // Makes JSON Properties easier to navigate
  + "&origin=*"; //Should prevent CORS errors

  const wikiLink = wikiEndpoint + wikiParams;
  //Ab hier wird npm axios benötigt!
  var wikiConfig = {
    timeout: 5000
  };
  async function getJSONResponse(url, config){
    const res = await axios.get(url, config);
    return res.data
  }
  return getJSONResponse(wikiLink, wikiConfig).then(result => {
    return result;
  }).catch(error => {
    console.log("an error has occured: " + error);
    return null;
  });
}

/**
 * @function eventRoute
 * @desc Event, that triggers the search for a Route, the user has to press "Database Data" and then klick on one of the mountains, then press the "show me the route" button
 * the "show me the route" button first fetches the position of the user and then triggers another function that computes the route
 */
function eventRoute(){
  //removeRoute(); // overwrite any existing layers
  for (var i = 0; i < datalength; i++){
    if (document.getElementById("checkboxid" + i).checked){
      value = document.getElementById("checkboxid" + i).value;
      value = JSON.parse(value);
      mountainCoords = value.geometry.coordinates;
      getRoute(userInputLocation, mountainCoords);
    }
  }
}

/**
 * @function getRoute
 * @desc Function, that makes direction request through ajax
 */
function getRoute(beginning, end){
  var mapbox_token = 'pk.eyJ1Ijoiam9udGhubW0iLCJhIjoiY2w0bG0yMWhxMHJrMTNjbW54MHE0bnl5bCJ9.YhVs13HNWHkrQs8WHwETrw'
  var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + beginning + ';' + end +'?geometries=geojson&steps=true&access_token=' + mapbox_token;
  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', url, true);
  req.onload = function() {
    var jsonResponse = req.response;
    var distance = jsonResponse.routes[0].distance*0.001;
    var duration = jsonResponse.routes[0].duration/60;
    var steps = jsonResponse.routes[0].legs[0].steps;
    var coords = jsonResponse.routes[0].geometry;
    steps.forEach(function(step){
      instructions.insertAdjacentHTML('beforeend', '<p>' + step.maneuver.instruction + '</p>');
    });
    instructions.insertAdjacentHTML('beforeend', '<p>' +  'Distance: ' + distance.toFixed(2) + ' km<br>Duration: ' + duration.toFixed(2) + ' minutes' + '</p>');
    L.geoJSON(coords, {color:"#1db7dd", width:8, opacity:0.8}).addTo(basemap);
  };
  req.send();
}



/**
 * @function addRoute
 * @desc function to add the computed route to the map
 * because for some reason "addSource" and "addLayer" didn't work we decided to show the route via a lot of markers on the map
 */
 function addRoute(coords) {
}



/**
 * @function removeRoute
 * @desc removes the route from the map
 */
function removeRoute(){
    basemap.removeLayer('route');
    basemap.removeSource('route');
    instrunction.innerHTML = '';
}

// styling for the icon for the positioning on the map
var positioning = L.icon({
  iconUrl: 'public/position.png',
  iconSize: [25, 25], // size of the icon
});