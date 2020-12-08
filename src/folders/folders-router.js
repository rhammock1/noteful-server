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

  module.exports = foldersRouter;