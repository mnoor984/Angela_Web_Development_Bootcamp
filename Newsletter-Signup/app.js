// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");

const port = 3000;
const app = express();

app.use(express.static("public"));  // So that styles.css and images can be rendered by the users browser.
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req,res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req,res) {
  console.log(req.body);
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  // JavaScript Data Object
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  // Turn data object into a string that is in the format of a JSON
  const jsonData = JSON.stringify(data);

  const url = "https://us14.api.mailchimp.com/3.0/lists/3f4aebe1f4";
  const options = {
    method: "POST",
    auth: "omar1:22a69ef9dd0bd5db89f9ea34c1d41c63-us14"
  };

  const request = https.request(url,options, function(response) {

    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function (data) {
    console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();

}); // end of app.post("/", function(req,res) {..

app.post("/failure", function(req,res) {
  res.redirect("/"); // redirects to the home route which triggers app.get("/", function(req,res) {
});

// dynamic port that heroku will define on the go. process object is defined by heroku.
// App will work both on heroku and on our local system.
app.listen(process.env.PORT || port, function() {
  console.log("Server is up and running on port " + port);
});
