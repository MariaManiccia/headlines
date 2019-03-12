/* eslint-disable linebreak-style */

// Require mongoose
const mongoose = require('mongoose');
// Create a schema class
const { Schema } = mongoose;

// Create the Note schema
const NoteSchema = new Schema({
  body: {
    type: String,
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
  },
});

// Create the model
const Note = mongoose.model('Note', NoteSchema);

// Export
module.exports = Note;
