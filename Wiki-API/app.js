const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

// Set our view engine to use EJS as our templating engine
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB");

const articleSchema = {
  title: "String",
  content: "String"
}

const Article = mongoose.model("Article",articleSchema);

// ---------------------------------------------------
app.route('/articles')
  .get((req, res) => {
    Article.find({}, function(err ,foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function(err) {
      if(!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete((req, res) => {
    Article.deleteMany({}, function(err) {
      if(!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });

  });

  // ----

  app.route("/articles/:articleTitle")
  .get((req, res) => {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if(!err) {
        if (foundArticle) {
          res.send(foundArticle);
        } else {
          res.send("Article with the specific name not found!");
        }
      } else {
        res.send(err);
      }
    });
  })

  .put((req, res) => {
    Article.replaceOne(
      {title: req.params.articleTitle},
      req.body,
      function(err) {
        if(!err) {
          res.send("Successfully updated article");
        } else {
          console.log(err);
        }
      }
    );
  })

  .patch((req, res) => {
    Article.update(
      {title: req.params.articleTitle},
      {$set: req.body},
      function(err) {
        if(!err) {
          res.send("Successfully patched article");
        } else {
          console.log(err);
        }
      }
    );
  })

  .delete((req, res) => {
    Article.deleteOne({title: req.params.articleTitle}, function(err) {
      if(!err) {
        res.send("Successfully deleted specific article.");
      } else {
        res.send(err);
      }
    });
  });
// ---------------------------------------------------

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
