const express = require('express');
const path = require('path');
const notesService = require('./notes-service');
const xss = require('xss');
const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = function(note) {
  return {
  id: note.id,
  title: xss(note.title),
  folder_id: note.folder_id,
  content: xss(note.content),
  date_published: note.date_published,
  }
};

notesRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db')
    notesService.getAllNotes(db)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })

  module.exports = notesRouter