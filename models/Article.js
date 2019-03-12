/* eslint-disable linebreak-style */

// Require mongoose
const mongoose = require('mongoose');
// Connect with Note.js
const Note = require('./Note');
// Create Schema class
const { Schema } = mongoose;

// Create article schema
const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  notes: [{
    type: Schema.Types.ObjectId,
    ref: 'Note',
  }],
});

// Create the model
const Article = mongoose.model('Article', ArticleSchema);

// Export
module.exports = Article;
