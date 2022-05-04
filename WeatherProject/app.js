//jshint esversion:6
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
var port = 3000;

// This is just the necessary code for us to be able to start parsing through
// the body of the post request.
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req,res) {

  res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req,res) {
  const query = req.body.cityName;
  const apiKey = "6c60852725f522c56e53cb56cf3efea5";
  const unit = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;

  https.get(url, function(response) {
    console.log(response.statusCode);

    response.on("data", function(data) {
      const weatherData = JSON.parse(data);
      const city = weatherData.name;
      const temp = weatherData.main.temp;
      const weatherDescription = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = " http://openweathermap.org/img/wn/" + icon + "@2x.png";

      // -------------------------------------------
      // const object = {
      //   name: "Angela",
      //   favouriteFood: "Ramen"
      // };
      // console.log(JSON.stringify(object));
      // console.log(typeof(JSON.stringify(object)));
      // -------------------------------------------

      res.write("<p>The weather is currently " + weatherDescription + "</p>");
      res.write("<h1>The temperature in " + city + " is " + temp + " degrees celsius!</h1>");
      res.write("<img src=" + imageURL + ">");
      res.send();

    });
  });
});



app.listen(port, function() {
  console.log("Server is running on port " + port);
});
