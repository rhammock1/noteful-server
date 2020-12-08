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
        res.json(notes.map(note => serializeNote(note)))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, folder_id } = req.body;
    const db = req.app.get('db');
    const newNote = { title, content, folder_id };
    for(const [key, value] of Object.entries(newNote)) {
       if(value == null) {
      return res.status(400).json({
        error: {message: `Missing '${key}' in body` }
      })
    }
    }
    notesService.insertNote(
      db,
      newNote
    )
      .then(note => {
          res.status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      })
      .catch(next)
  })

  module.exports = notesRouter