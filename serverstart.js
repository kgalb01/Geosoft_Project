/**
 * Aufgabe 6, Geosoft 1, SoSe 2022
 * @author Arne Wilberg, matr.Nr.: 513722
 * @author Kieran Galbraith, matr.Nr.: 453493
 */

//****various Linter configs****
// jshint esversion: 6
// jshint browser: true
// jshint node: true
// jshint -W097

var ObjectId = require('mongodb').ObjectID;
const mongodb = require('mongodb');
const express = require('express');
let bodyParser = require('body-parser');

const app = express()
const port = 5000;

/**
 * @function to connect to the mongoDB database
 */

(async () => {

  try {
    // connecting to mongodb via standard port 27017
    app.locals.dbConnection = await mongodb.MongoClient.connect('mongodb://localhost:27017', {
      useNewUrlParser: true
    });
    // defining what collection to use (here: locations, which will automatically be created by mongoDB and can be inspected locally via MongoDBCompass)
    app.locals.db = await app.locals.dbConnection.db('locations');
    console.log('Using db: ' + app.locals.db.databaseName);
  } catch (error) {
    console.dir(error);
    setTimeout(connectMongoDB, 5000);
  }

})();


app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/leaflet-draw', express.static(__dirname + '/node_modules/leaflet-draw/dist'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/save-input', bodyParser.json());
app.use('/delete-input', bodyParser.json());
app.use('/update-input', bodyParser.json());
app.use('/item', bodyParser.json());


// sending mountainMap to / if reqeusted to be the main index
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/mountainMap.html');
});

// sending locationcreator to be the linked website for the navigation to work if requested
app.get('/locationcreator.html', (req, res) => {
  res.sendFile(__dirname + '/locationcreator.html');
});

// sending locationcreator to be the linked website for the navigation to work if requested
app.get('/impressum.html', (req, res) => {
  res.sendFile(__dirname + '/impressum.html');
});


/**
 * @source http://mongodb.github.io/node-mongodb-native/3.1/tutorials/crud/
 * @source https://www.w3schools.com/nodejs/nodejs_mongodb.asp
*/

// handler for getting items
app.get('/item', (req, res) => {
  // Search for all stored items in the mongoDB 
  app.locals.db.collection('items').find({}).toArray((error, result) => {
    if (error) {
      console.dir(error);
    }
    res.json(result);
  });
});

// adding data to the given database
app.post('/save-input', (req, res) => {
  console.log('POST', req.body);
  app.locals.db.collection('items').insertOne(req.body);
});

// deleting data to the given database
// via https://www.w3schools.com/nodejs/nodejs_mongodb_delete.asp
app.delete('/delete-input', (req, res) => {
  app.locals.db.collection('items').deleteOne({
    '_id': ObjectId(req.body._id)
  });
});

// updating names stored in the given database
// via https://www.w3schools.com/nodejs/nodejs_mongodb_update.asp
app.put('/update-input', (req, res) => {
  app.locals.db.collection('items').updateOne({
    '_id': ObjectId(req.body._id)
  }, {
    $set: {
      'properties.name': req.body.properties.name
    }
  });
});

// listen on port 5000
app.listen(port,
  () => console.log(`Example app
      listening at http://localhost:${port}`));