var express = require('express');
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require('mongoose');
var configDB = require('./config/database');

var app = express();
var PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect(configDB.MONGODB_URI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

var schema = new mongoose.Schema({
    title: String,
    description: String,
    saved: Boolean
});
var mongoHeadlines = mongoose.model('mongoHeadlines', schema);

// var routes = require("./controllers/controller.js");
app.get("/", function(req, res) {
    mongoHeadlines.find({}, function(err, data) {
        if (err) {
            return res.status(500).end();
        }
  
        res.render("index", { articles: data });
        });
  });

// app.use("/", routes);
app.get("/api/articles", function(req, res) {
    request("https://www.reddit.com/r/webdev", function(error, response, html) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $("p.title").each(function(i, element) {

            // Save the text of the element in a "title" variable
            var title = $(element).text();

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");

            // Save these results in an object that we'll push into the results array we defined earlier
            mongoHeadlines.create({
                title: title,
                description: link,
                saved: false
            });
        });

        res.send("Scrape Complete");
    });
});

app.get("/saved", function(req, res) {

    mongoHeadlines.find({saved: true}, function(err, data) {
        if (err) {
            return res.status(500).end();
        }
    
        res.render("saved-articles", { articles: data });
    });
});

app.post("/api/articles/:id", function(req, res) {
    var id = req.params.id;

    mongoHeadlines.findById(id, function (err, article) {
        if (err) return handleError(err);
        
        article.saved = true;
        article.save(function (err, savedArticle) {
            if (err) return handleError(err);
            res.send(savedArticle);
        });
    });
});

app.delete("/api/articles/:id", function(req, res) {
    var id = req.params.id;

    mongoHeadlines.findById(id, function (err, article) {
        if (err) return handleError(err);
        
        article.saved = false;
        article.save(function (err, removedArticle) {
            if (err) return handleError(err);
            res.send(removedArticle);
        });
    });
});

app.listen(PORT);
