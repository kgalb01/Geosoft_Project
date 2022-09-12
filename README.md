# Geosoft_Project

</strong></h1>Project</strong></h1>
<h4>Authors:  Arne Wilberg, matr.Nr.: 513722 -  Kieran Galbraith, matr.Nr.: 453493</h4>

Die dockerisierte Anwendung ist unter

https://hub.docker.com/repository/docker/kgalb01/geosoft_project

zu finden.

<h2>Tutorial (copied from Task 6)</h2>

For the forward geocoding you need a MapBox access Token at var access_token = "access Token" in /public/locationcreationmap

Also, due to the large size of node_modules we did not upload them. Instead, if you clone the whole Geosoftware-1 repository you have to go to the terminal in VS-Code.<br>
To change the path to the Aufgabe6 folder type "cd Aufgabe6"
Then type "npm init" and confirm everything.
After that type "npm install package.json"

If the two steps above were successfull, you need to install <br>
express <br>
mongodb <br>
body-parser <br>
jquery <br>
axios <br>
for the app to work with "npm install ..."

To start the server, you then need to type: nodemon serverstart.js or nodemon start and then STRG+Click on the http://localhost:5000 url (given that node is installed and nodemon is set up)

<h2>Tutorial 2 (For docker-version)</h2>
Download Dockerhub <br>
Open cmd (or Terminal on MacOS) <br>
Type "docker login" <br>
Login with your account <br>
Type "docker pull kgalb01/geosoft_project" <br>
Wait for Dockerhub to successfully pull the repository <br>
If necessary change your current directory with "cd ...." to where the repository is saved <br>
In cmd Type "docker-compose up" <br>
Wait an eternity <br>
Given that everything worked STRG+Click on the http://localhost:5000 url (or http://localhost:8888 if you're interested in the database)
