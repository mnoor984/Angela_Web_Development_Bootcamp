//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// Because our module is local and has not installed using NPM,
// then the way we access it is a little different.
const date = require(__dirname + "/date.js");

const port = 3000;

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

// This line of code tells our app which is generated using Express
// to use EJS as its view engine.
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res) {
  let day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});
});

app.post("/", function(req,res) {

  let item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }

  res.redirect("/");
});

app.get("/work", function(req,res) {
  res.render("list",{listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req,res) {
  res.render("about");
});

app.listen(port,function(){
  console.log("Server is up and listening on port " + port);
});
