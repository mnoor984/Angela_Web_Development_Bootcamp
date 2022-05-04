//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
/*
Note: We dont need to require passport-local, because it is going to be
one of those dependencies that will be needed by passport-local-mongoose
*/
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
// Use and initialize the passport package.
app.use(passport.initialize());
// Use passport for dealing with the sessions (Use passport to manage our sessions)
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

// That is what we are going to use to hash and salt our passwords,
// and to save our users into our MongoDB database.
// (Set up userSchema to use passport local mongoose as a plugin)
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

// going to be the local strategy to authenticate users using
// their username and password.
passport.use(User.createStrategy());
// Only necessary when using sessions.
// (Set up passport serialize and deserialize our user)
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req,res) {
  res.render("home");
});

app.get("/auth/google",
  // When we hit up Google, we are oging to tell them that what we want is the user's
  // profile and this includes their email as well as their user ID on Google.
  passport.authenticate("google", { scope: ["profile"] })
);

// Authenticate locally and save login session.
app.get("/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

app.get("/login", function(req,res) {
  res.render("login");
});

app.get("/register", function(req,res) {
  res.render("register");
});

app.get("/secrets", function(req,res) {
  User.find({secret: {$ne: null}}, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/submit", function(req,res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req,res) {
  const submittedSecret = req.body.secret;

  console.log(req.user);

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function() {
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function(req,res) {
  // passport method.
  // Essentially de-authenticating our user and ending that user session.
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req,res) {

  User.register({username: req.body.username, active: false}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect("/register");
    } else {
      // Authenticating user and setting up a logged-in session for them.
      // Callback triggered only if authentication is successful.
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  })

});

app.post('/login', passport.authenticate('local', {
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

app.listen(3000, function() {
  console.log("Server started on port 3000.")
});
