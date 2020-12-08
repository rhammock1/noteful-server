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

  notesRouter
    .route('/:noteId')
    .all((req, res, next) => {
        const db = req.app.get('db');
    notesService.getById(db, req.params.noteId)
      .then(note => {
        if(!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note;
        next();
      })
      .catch(next)
    })
    .get((req, res, next) => {
      res.status(200).json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
    const db = req.app.get('db');
    notesService.deleteNote(
      db, req.params.noteId
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next);
  })
  module.exports = notesRouter