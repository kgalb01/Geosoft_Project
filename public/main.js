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
meta.content = "This website allows to save, edit and delete mountains in europe with their relevant information given by the user and to some extend Wikipedia";
document.head.appendChild(meta);

// global variables
var pointcloud = [];
var inputLocation = [];

/**
 * function twoPointDistance
 * @desc takes two geographic points and returns the distance between them. Uses the Haversine formula (http://www.movable-type.co.uk/scripts/latlong.html, https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula)
 * @param start array of [lon, lat] coordinates
 * @param end array of [lon, lat] coordinates
 * @returns the distance between 2 points on the surface of a sphere with earth's radius
 */
 function twoPointDistance(start, end) {
    //variable declarations
    var earthRadius; //the earth radius in meters
    var phi1;
    var phi2;
    var deltaLat;
    var deltaLong;

    var a;
    var c;
    var distance; //the distance in meters

    //function body
    earthRadius = 6371e3; //Radius
    phi1 = this.toRadians(start[1]); //latitude at starting point. in radians.
    phi2 = this.toRadians(end[1]); //latitude at end-point. in radians.
    deltaLat = this.toRadians(end[1] - start[1]); //difference in latitude at start- and end-point. in radians.
    deltaLong = this.toRadians(end[0] - start[0]); //difference in longitude at start- and end-point. in radians.

    a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = (earthRadius * c) / 1000;

    return distance.toFixed(3);
}


/**
 * toRadians
 * @public
 * @desc helping function, takes degrees and converts them to radians
 * @returns a radian value
 */
function toRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

/**
 * function tableClearer
 * @desc deletes all rows to clear the table so they dont add up
 * @source refresh function from Beispiellösung 02 
 * @param tableID id of the table that we want to clear
 */
function tableClearer() {
    var tableHeaderRowCount = 1;
    var table = document.getElementById('resultTable');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
}

/**
 * @function tableFiller
 * @desc prints all results into a html table: mountain details of all mountains are displayed
 */

function tableFiller(output) {

    for (let j = 0; j < output.length; j++) {
        document.getElementById("name" + j).innerHTML = output[j][0];
        document.getElementById("elevation" + j).innerHTML = output[j][1];
        document.getElementById("coordinates" + j).innerHTML = output[j][2];
        document.getElementById("wiki" + j).innerHTML = output[j][3];
    }
    output.length = 0;
}

/**
 * @function getLocation callback function
 * @desc gets the location of the user
 * source: https://www.w3schools.com/html/html5_geolocation.asp
 */

 function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      document.getElementById('browserLocation').innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  
  /**
   * @function showPosition
   * @desc user position to GeoJSON converting and calls userLocationMapping to show the position on the map
   * @param position JSON object of the user
   * @source: https://www.w3schools.com/html/html5_geolocation.asp
   */
  function showPosition(position) {
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
    inputLocation = userLocation.features[0].geometry.coordinates;
    userLocationMapping();
  }

