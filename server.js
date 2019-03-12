/* eslint-disable linebreak-style */
/* eslint-disable func-names */
/* eslint-disable no-console */

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');

// Scraping tools
const request = require('request');
const cheerio = require('cheerio');

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Define port
const port = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Use morgan and body parser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false,
}));

// Make public a static dir
app.use(express.static('public'));

// Set Handlebars.
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, '/views/layouts/partials'),
}));
app.set('view engine', 'handlebars');

// Connecting with our models
const Note = require('./models/Note.js');
const Article = require('./models/Article.js');

// Database configuration with mongoose
// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

// Show any mongoose errors
db.on('error', (error) => {
  console.log('Mongoose Error: ', error);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', () => {
  console.log('Mongoose connection successful.');
});

// Routes
// ======

// GET requests to render Handlebars pages
app.get('/', (req, res) => {
  Article.find({
    saved: false,
  }, (error, data) => {
    const hbsObject = {
      article: data,
    };
    console.log(hbsObject);
    res.render('home', hbsObject);
  });
});

app.get('/saved', (req, res) => {
  Article.find({
    saved: true,
  }).populate('notes').exec((error, articles) => {
    const hbsObject = {
      article: articles,
    };
    res.render('saved', hbsObject);
  });
});

// A GET route for scraping the echoJS website
app.get('/scrape', (req, res) => {
  console.log('scrape it now');
  // First, we grab the body of the html with axios
  axios.get('https://www.npr.org/').then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('h3.title').each((i, element) => {
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).text();
      result.summary = $(element).parent().next().find('p').text();
      result.link = $(element).parent().attr('href');
      console.log(result);

      // Create a new Article using the `result` object built from scraping
      Article.create(result)
        .then((dbArticle) => {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch((err) => {
          // If an error occurred, log it
          console.log(err);
        });
    });
  });
});

// This will get the articles we scraped from the mongoDB
app.get('/articles', (req, res) => {
  // Grab every doc in the Articles array
  Article.find({}, (error, doc) => {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get('/articles/:id', (req, res) => {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({
    _id: req.params.id,
  })
  // ..and populate all of the notes associated with it
    .populate('note')
  // now, execute our query
    .exec((error, doc) => {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
});


// Save an article
app.post('/articles/save/:id', (req, res) => {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({
    _id: req.params.id,
  }, {
    saved: true,
  })
  // Execute the above query
    .exec((err, doc) => {
      // Log any errors
      if (err) {
        console.log(err);
      } else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Delete an article
app.post('/articles/delete/:id', (req, res) => {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({
    _id: req.params.id,
  }, {
    saved: false,
    notes: [],
  })
  // Execute the above query
    .exec((err, doc) => {
      // Log any errors
      if (err) {
        console.log(err);
      } else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});


// Create a new note
app.post('/notes/save/:id', (req, res) => {
  // Create a new note and pass the req.body to the entry
  const newNote = new Note({
    body: req.body.text,
    article: req.params.id,
  });
  console.log(req.body);
  // And save the new note the db
  newNote.save((error, note) => {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's notes
      Article.findOneAndUpdate({
        _id: req.params.id,
      }, {
        $push: {
          notes: note,
        },
      })
      // Execute the above query
        .exec((err) => {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            // Or send the note to the browser
            res.send(note);
          }
        });
    }
  });
});

// Delete a note
app.delete('/notes/delete/:note_id/:article_id', (req, res) => {
  // Use the note id to find and delete it
  Note.findOneAndRemove({
    _id: req.params.note_id,
  }, (err) => {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      Article.findOneAndUpdate({
        _id: req.params.article_id,
      }, {
        $pull: {
          notes: req.params.note_id,
        },
      })
      // Execute the above query
        .exec((err) => {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            // Or send the note to the browser
            res.send('Note Deleted');
          }
        });
    }
  });
});

// Listen on port
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
