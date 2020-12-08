const express = require('express');
const foldersService = require('./folders-service');
const xss = require('xss');
const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = function(folder) {
  return {
  id: folder.id,
  folder_name: xss(folder.folder_name),
}

}
foldersRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db')
    foldersService.getAllFolders(db)
      .then(folders => {
        res.json(folders.map(serializeFolder))
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
        res.folder = folder;
        next();
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.status(200).json(serializeFolder(res.folder))
    .catch(next)
  })
  module.exports = foldersRouter;