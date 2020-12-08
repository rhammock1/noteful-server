const express = require('express');
const foldersService = require('./folders-service');
const xss = require('xss');
const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db')
    foldersService.getAllFolders(db)
      .then(folders => {
        folders.forEach(folder => {
          xss(folder.folder_name)
        })
        res.status(200).json(folders)
      })
      .catch(next)
  })

foldersRouter
  .route('/:folderId')
  .all((req, res, next) => {
    const db = req.app.get('db');
    foldersService.getById(db, req.params.folderId)
      .then(folder => {
        if(!folder) {
          return res.status(404).json({
            error: { message: `Article doesn't exist` }
          })
        }
        res.article = article;
        next();
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.status(200).json({
      id: res.folder.id,
      folder_name: xss(res.folder.folder_name)
    })
    .catch(next)
  })
  module.exports = foldersRouter;